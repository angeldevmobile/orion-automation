export interface DeepAnalysisResult {
    file: string;
    issues: Array<{
        line?: number;
        severity: 'critical' | 'high' | 'medium' | 'low';
        category: 'security' | 'performance' | 'logic' | 'quality';
        description: string;
        codeSnippet?: string;
        suggestion: string;
    }>;
    summary: string;
    complexity: number;
    warnings: string[];
    linesAnalyzed: number;
    chunksProcessed: number;
}
export declare class DeepCodeAnalysisService {
    analyzeFiles(filePaths: string[]): Promise<DeepAnalysisResult[]>;
    private analyzeFile;
    private chunkContentByLines;
    private buildDeepPrompt;
    private parseDeepResponse;
    private calculateComplexity;
}
//# sourceMappingURL=deepCodeAnalysis.d.ts.map