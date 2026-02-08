import type { CodeIndex } from './analyses/codeScanner.js';
interface GPTStructuralAnalysis {
    understanding: string;
    suggestedFiles: Array<{
        path: string;
        reason: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    projectType: string;
    techStack: string[];
    complexity: 'low' | 'medium' | 'high';
}
interface DimensionAnalysis {
    dimension: string;
    score: number;
    issues: Array<{
        severity: 'critical' | 'high' | 'medium' | 'low';
        description: string;
        location?: string;
        suggestion: string;
    }>;
    recommendations: string[];
}
export declare class GPTService {
    /**
     * Análisis estructural rápido del índice
     * GPT entiende el proyecto y sugiere archivos clave
     */
    analyzeStructure(index: CodeIndex): Promise<GPTStructuralAnalysis>;
    /**
     * Análisis dimensional rápido (arquitectura, seguridad, etc.)
     * GPT hace evaluación general sin ver código
     */
    analyzeDimension(index: CodeIndex, dimension: 'architecture' | 'security' | 'performance' | 'quality'): Promise<DimensionAnalysis>;
    private buildArchitecturePrompt;
    private buildSecurityPrompt;
    private buildPerformancePrompt;
    private buildQualityPrompt;
    private parseStructuralResponse;
    private parseDimensionResponse;
}
export {};
//# sourceMappingURL=gptService.d.ts.map