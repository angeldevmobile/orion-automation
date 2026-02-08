import type { ProjectSource } from '@prisma/client';
export interface CodeIndex {
    projectId: string;
    timestamp: Date;
    stats: {
        totalFiles: number;
        totalLines: number;
        languages: Record<string, number>;
    };
    structure: {
        controllers: string[];
        services: string[];
        routes: string[];
        models: string[];
        utils: string[];
        configs: string[];
    };
    dependencies: {
        runtime: string[];
        dev: string[];
    };
    riskSignals: string[];
    complexity: {
        avgFileSize: number;
        maxFileSize: number;
        deepestNesting: number;
    };
}
export declare class CodeScannerService {
    private readonly EXCLUDED_PATTERNS;
    scanProject(sources: ProjectSource[]): Promise<CodeIndex>;
    private filterRelevantFiles;
    private classifyFile;
    private extractDependencies;
    private detectRiskSignals;
}
//# sourceMappingURL=codeScanner.d.ts.map