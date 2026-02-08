import type { Request, Response } from 'express';
export declare class DiagramController {
    private diagramService;
    private advancedDiagramService;
    /**
     * POST /api/diagrams/project/:projectId/generate
     * Genera diagramas usando IA + renderizado profesional
     */
    generateDiagrams(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/diagrams/project/:projectId
     */
    getProjectDiagrams(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/diagrams/project/:projectId/isometric/image
     */
    getIsometricImage(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    /**
     * GET /api/diagrams/project/:projectId/isometric/html
     */
    getIsometricHTML(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/diagrams/project/:projectId/image/:format
     * Sirve imágenes PNG de Mermaid o D2
     */
    getDiagramImage(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    /**
     * Obtiene archivos del proyecto para dar contexto a la IA
     */
    private getProjectFiles;
    /**
     * Guarda o actualiza un artefacto de diagrama
     */
    private saveArtifact;
}
//# sourceMappingURL=diagramController.d.ts.map