import type { Prisma } from '@prisma/client';
export declare const analysisProgressEmitter: import("node:events")<any>;
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
export declare class AnalysesService {
    private orchestrator;
    /**
     * Análisis NUEVO: Rápido, basado en índice estructural
     * Usa CodeScanner + Claude por dimensiones
     */
    analyzeProject(projectId: string, userId: string): Promise<AnalysisResult>;
    /**
     * Análisis profundo (estructural + archivos específicos)
     */
    analyzeProjectDeep(projectId: string, userId: string, deepFiles: string[]): Promise<AnalysisResult>;
    getProjectAnalyses(projectId: string, userId: string, limit?: number): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        projectId: string;
        objective: string;
        contextUsed: string | null;
        reasoning: string | null;
        risks: Prisma.JsonValue;
        assumptions: Prisma.JsonValue;
        nextSteps: Prisma.JsonValue;
        artifacts: Prisma.JsonValue;
        responseType: string | null;
        tokensUsed: number;
        modelUsed: string | null;
        durationMs: number | null;
    }[]>;
    getAnalysisById(id: string, userId: string): Promise<{
        project: {
            name: string;
            id: string;
        };
        actionHistory: {
            result: Prisma.JsonValue;
            id: string;
            createdAt: Date;
            status: string;
            projectId: string;
            analysisId: string | null;
            actionType: string;
            actionDescription: string;
        }[];
    } & {
        result: string | null;
        id: string;
        createdAt: Date;
        projectId: string;
        objective: string;
        contextUsed: string | null;
        reasoning: string | null;
        risks: Prisma.JsonValue;
        assumptions: Prisma.JsonValue;
        nextSteps: Prisma.JsonValue;
        artifacts: Prisma.JsonValue;
        responseType: string | null;
        tokensUsed: number;
        modelUsed: string | null;
        durationMs: number | null;
    }>;
    createAnalysis(userId: string, data: CreateAnalysisData): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        projectId: string;
        objective: string;
        contextUsed: string | null;
        reasoning: string | null;
        risks: Prisma.JsonValue;
        assumptions: Prisma.JsonValue;
        nextSteps: Prisma.JsonValue;
        artifacts: Prisma.JsonValue;
        responseType: string | null;
        tokensUsed: number;
        modelUsed: string | null;
        durationMs: number | null;
    }>;
    getAnalysisStats(projectId: string, userId: string): Promise<{
        totalAnalyses: number;
        totalTokens: number;
        avgDuration: number;
        modelUsage: (Prisma.PickEnumerable<Prisma.AnalysisGroupByOutputType, "modelUsed"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
}
export {};
//# sourceMappingURL=analysesService.d.ts.map