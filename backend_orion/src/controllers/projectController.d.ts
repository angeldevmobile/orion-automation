import type { Request, Response } from 'express';
export declare class ProjectsController {
    getUserProjects(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProjectById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createProject(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProject(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProject(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProjectStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    addProjectSource(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    uploadFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProjectFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteFile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProjectActions(req: Request, res: Response): Promise<Response>;
}
//# sourceMappingURL=projectController.d.ts.map