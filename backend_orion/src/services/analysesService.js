import { prisma } from '../config/database.js';
import { AnalysisOrchestratorService, orchestratorEmitter } from './analyses/analysesOrchestrator.js';
export const analysisProgressEmitter = orchestratorEmitter;
function normalizeAnalysisResult(result) {
    const data = result;
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
    orchestrator = new AnalysisOrchestratorService();
    /**
     * Análisis NUEVO: Rápido, basado en índice estructural
     * Usa CodeScanner + Claude por dimensiones
     */
    async analyzeProject(projectId, userId) {
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
    async analyzeProjectDeep(projectId, userId, deepFiles) {
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
    async getProjectAnalyses(projectId, userId, limit = 50) {
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
    async getAnalysisById(id, userId) {
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
    async createAnalysis(userId, data) {
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
                risks: (data.risks ?? []),
                assumptions: (data.assumptions ?? []),
                nextSteps: (data.nextSteps ?? []),
                artifacts: (data.artifacts ?? []),
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
    async getAnalysisStats(projectId, userId) {
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
//# sourceMappingURL=analysesService.js.map