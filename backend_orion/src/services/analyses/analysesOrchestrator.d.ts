import { EventEmitter } from 'events';
import type { AnalysisResult } from '../analysesService.js';
export declare const orchestratorEmitter: EventEmitter<any>;
export declare class AnalysisOrchestratorService {
    private scanner;
    private indexService;
    private gpt;
    private claude;
    private deepAnalysis;
    private emitProgress;
    analyzeProject(projectId: string, userId: string, deepFiles?: string[]): Promise<AnalysisResult>;
    private buildSummary;
    /**
     * Genera artefactos basados en el análisis
     */
    private generateArtifacts;
    /**
     * Genera decisiones basadas en issues críticos
     */
    private generateDecisions;
}
//# sourceMappingURL=analysesOrchestrator.d.ts.map