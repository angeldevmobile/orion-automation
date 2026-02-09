import { prisma } from '../config/database.js';
import type { Prisma } from '@prisma/client';
import { AnalysisOrchestratorService, orchestratorEmitter } from './analyses/analysesOrchestrator.js';

export const analysisProgressEmitter = orchestratorEmitter;

interface RiskItem {
  description: string;
  severity: string;
  mitigation?: string;
}

interface AssumptionItem {
  description: string;
  validated: boolean;
}

interface NextStepItem {
  action: string;
  priority: string;
  status?: string;
}

interface ArtifactItem {
  name: string;
  type: string;
  path?: string;
}

interface CreateAnalysisData {
  projectId: string;
  objective: string;
  contextUsed: string | null | undefined;
  reasoning: string | null | undefined;
  result: string | null | undefined;
  risks: RiskItem[] | null | undefined;
  assumptions: AssumptionItem[] | null | undefined;
  nextSteps: NextStepItem[] | null | undefined;
  artifacts: ArtifactItem[] | null | undefined;
  responseType: string | null | undefined;
  tokensUsed: number | null | undefined;
  modelUsed: string | null | undefined;
  durationMs: number | null | undefined;
}

export interface GeneratedArtifact {
  name: string;
  type: 'documentation' | 'diagram' | 'checklist' | 'plan' | 'report';
  description: string;
  content: string;
}

export interface DecisionItem {
  title: string;
  category: string;
  description: string;
  pros: string[];
  cons: string[];
  recommendation: 'high_priority' | 'medium_priority' | 'low_priority';
  estimatedEffort: string;
}

export interface AnalysisResult {
  summary: string;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
    location?: string;
    suggestion: string;
  }>;
  suggestions: Array<{
    category: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }>;
  metrics: {
    codeQuality: number;
    maintainability: number;
    performance: number;
    security: number;
  };
  recommendations: string[];
  artifacts: GeneratedArtifact[];
  decisions: DecisionItem[];
}

function normalizeAnalysisResult(result: Partial<AnalysisResult> | unknown): AnalysisResult {
  const data = result as Partial<AnalysisResult>;
  return {
    summary: data.summary ?? "",
    issues: Array.isArray(data.issues) ? data.issues : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    metrics: data.metrics ?? { codeQuality: 0, maintainability: 0, performance: 0, security: 0 },
    recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
    artifacts: Array.isArray(data.artifacts) ? data.artifacts : [],
    decisions: Array.isArray(data.decisions) ? data.decisions : [],
  };
}

export class AnalysesService {
  private orchestrator = new AnalysisOrchestratorService();

  /**
   * Análisis Rápido, basado en índice estructural
   * Usa CodeScanner + Claude por dimensiones
   */
  async analyzeProject(projectId: string, userId: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    // Delegar al orchestrator
    let result = await this.orchestrator.analyzeProject(projectId, userId);
    result = normalizeAnalysisResult(result);

    // Guardar en BD
    await this.createAnalysis(userId, {
      projectId,
      objective: 'Análisis por dimensiones (rápido)',
      contextUsed: 'Índice estructural del proyecto',
      reasoning: result.summary,
      result: JSON.stringify(result),
      risks: result.issues.map(i => ({
        description: i.description,
        severity: i.severity,
        mitigation: i.suggestion
      })),
      assumptions: result.recommendations.map(r => ({
        description: r,
        validated: false
      })),
      nextSteps: result.suggestions.map(s => ({
        action: s.description,
        priority: s.priority,
        status: 'pending'
      })),
      artifacts: [],
      responseType: 'dimensional_analysis',
      tokensUsed: 20000, // Estimado
      modelUsed: 'claude-sonnet-4-20250514',
      durationMs: Date.now() - startTime
    });

    return result;
  }

  /**
   * Análisis profundo (estructural + archivos específicos)
   */
  async analyzeProjectDeep(
    projectId: string,
    userId: string,
    deepFiles: string[]
  ): Promise<AnalysisResult> {
    const startTime = Date.now();

    if (deepFiles.length > 5) {
      throw new Error('Máximo 5 archivos para análisis profundo');
    }

    // Delegar al orchestrator con archivos específicos
    let result = await this.orchestrator.analyzeProject(projectId, userId, deepFiles);
    result = normalizeAnalysisResult(result);

    // Guardar en BD
    await this.createAnalysis(userId, {
      projectId,
      objective: `Análisis profundo (${deepFiles.length} archivos)`,
      contextUsed: deepFiles.length > 0
        ? `Índice + archivos: ${deepFiles.join(', ')}`
        : 'Solo índice estructural',
      reasoning: result.summary,
      result: JSON.stringify(result),
      risks: result.issues.map(i => ({
        description: i.description,
        severity: i.severity,
        mitigation: i.suggestion
      })),
      assumptions: result.recommendations.map(r => ({
        description: r,
        validated: false
      })),
      nextSteps: result.suggestions.map(s => ({
        action: s.description,
        priority: s.priority,
        status: 'pending'
      })),
      artifacts: [],
      responseType: 'deep_analysis',
      tokensUsed: 30000 + (deepFiles.length * 5000), // Estimado
      modelUsed: 'claude-sonnet-4-20250514',
      durationMs: Date.now() - startTime
    });

    return result;
  }

  // Métodos CRUD (mantener tal cual)
  async getProjectAnalyses(projectId: string, userId: string, limit = 50) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const analyses = await prisma.analysis.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return analyses;
  }

  async getAnalysisById(id: string, userId: string) {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id,
        project: { userId }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        actionHistory: true
      }
    });

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    return analysis;
  }

  async createAnalysis(userId: string, data: CreateAnalysisData) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const analysis = await prisma.analysis.create({
      data: {
        projectId: data.projectId,
        objective: data.objective,
        contextUsed: data.contextUsed ?? null,
        reasoning: data.reasoning ?? null,
        result: data.result ?? null,
        risks: (data.risks ?? []) as unknown as Prisma.JsonArray,
        assumptions: (data.assumptions ?? []) as unknown as Prisma.JsonArray,
        nextSteps: (data.nextSteps ?? []) as unknown as Prisma.JsonArray,
        artifacts: (data.artifacts ?? []) as unknown as Prisma.JsonArray,
        responseType: data.responseType ?? null,
        tokensUsed: data.tokensUsed ?? 0,
        modelUsed: data.modelUsed ?? null,
        durationMs: data.durationMs ?? null
      }
    });

    await prisma.project.update({
      where: { id: data.projectId },
      data: { lastAnalysisAt: new Date() }
    });

    return analysis;
  }

  async getAnalysisStats(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const stats = await prisma.analysis.aggregate({
      where: { projectId },
      _count: { id: true },
      _sum: { tokensUsed: true },
      _avg: { durationMs: true }
    });

    const modelStats = await prisma.analysis.groupBy({
      by: ['modelUsed'],
      where: { projectId },
      _count: { id: true }
    });

    return {
      totalAnalyses: stats._count.id,
      totalTokens: stats._sum.tokensUsed || 0,
      avgDuration: Math.round(stats._avg.durationMs || 0),
      modelUsage: modelStats
    };
  }
}