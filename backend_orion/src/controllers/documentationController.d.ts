import type { Request, Response } from 'express';
export declare class DocumentationController {
    generateDocumentation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProjectDocumentation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    downloadDocument(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    private generateDocContentWithAI;
    private getDocumentName;
}
//# sourceMappingURL=documentationController.d.ts.map