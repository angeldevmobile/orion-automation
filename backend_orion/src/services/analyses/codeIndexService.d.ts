import type { CodeIndex } from './codeScanner.js';
export declare class CodeIndexService {
    save(projectId: string, index: CodeIndex): Promise<void>;
    get(projectId: string): Promise<CodeIndex | null>;
    shouldReindex(projectId: string, maxAgeMinutes?: number): Promise<boolean>;
}
//# sourceMappingURL=codeIndexService.d.ts.map