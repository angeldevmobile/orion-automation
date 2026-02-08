import type { Request, Response } from 'express';
export declare class AnalysesController {
    getProjectAnalyses(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAnalysisById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createAnalysis(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    analyzeWithClaude(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    analyzeDeep(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAnalysisStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=analysesController.d.ts.map