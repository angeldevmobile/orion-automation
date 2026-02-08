import type { Request, Response } from 'express';
export declare class DecisionController {
    getAnalysisDecisions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getDecisionById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateDecisionStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=decisionController.d.ts.map