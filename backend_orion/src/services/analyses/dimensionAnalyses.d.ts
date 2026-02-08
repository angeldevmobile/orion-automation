import type { CodeIndex } from './codeScanner.js';
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
export declare class ClaudeService {
    analyzeArchitecture(index: CodeIndex): Promise<DimensionAnalysis>;
    analyzeSecurity(index: CodeIndex): Promise<DimensionAnalysis>;
    analyzePerformance(index: CodeIndex): Promise<DimensionAnalysis>;
    analyzeQuality(index: CodeIndex): Promise<DimensionAnalysis>;
    private extractTextFromResponse;
    private parseResponse;
}
export {};
//# sourceMappingURL=dimensionAnalyses.d.ts.map