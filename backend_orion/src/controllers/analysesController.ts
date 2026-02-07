import type { Request, Response } from 'express';
import { AnalysesService } from '../services/analysesService.js';

const analysesService = new AnalysesService();

export class AnalysesController {
  async getProjectAnalyses(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.projectId as string;
      const userId = req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const analyses = await analysesService.getProjectAnalyses(projectId, userId, limit);

      res.json({
        success: true,
        data: analyses
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAnalysisById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      const analysis = await analysesService.getAnalysisById(id, userId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: unknown) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createAnalysis(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const {
        projectId,
        objective,
        contextUsed,
        reasoning,
        result,
        risks,
        assumptions,
        nextSteps,
        artifacts,
        responseType,
        tokensUsed,
        modelUsed,
        durationMs
      } = req.body;

      if (!projectId || !objective) {
        return res.status(400).json({
          success: false,
          error: 'ProjectId and objective are required'
        });
      }

      const analysis = await analysesService.createAnalysis(userId, {
        projectId,
        objective,
        contextUsed,
        reasoning,
        result,
        risks,
        assumptions,
        nextSteps,
        artifacts,
        responseType,
        tokensUsed,
        modelUsed,
        durationMs
      });

      res.status(201).json({
        success: true,
        data: analysis
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async analyzeWithClaude(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.projectId as string;
      const userId = req.user.id;

      console.log(`Iniciando análisis para proyecto ${projectId}`);

      const result = await analysesService.analyzeProject(projectId, userId);

      console.log(`Análisis completado: ${result.issues.length} issues, ${result.suggestions.length} sugerencias`);

      res.json({
        success: true,
        data: result,
        message: 'Análisis completado exitosamente'
      });
    } catch (error: unknown) {
      console.error('Error en análisis:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al analizar el proyecto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      });
    }
  }

  async analyzeDeep(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.projectId as string;
      const { deepFiles } = req.body;
      const userId = req.user.id;

      // Validar que deepFiles sea un array
      if (deepFiles && !Array.isArray(deepFiles)) {
        return res.status(400).json({
          success: false,
          error: 'deepFiles debe ser un array de rutas'
        });
      }

      // Validar límite de archivos
      if (deepFiles && deepFiles.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'Máximo 5 archivos para análisis profundo'
        });
      }

      console.log(`Iniciando análisis profundo para proyecto ${projectId} con ${deepFiles?.length || 0} archivos`);

      const result = await analysesService.analyzeProjectDeep(
        projectId, 
        userId, 
        deepFiles || []
      );

      console.log(`Análisis profundo completado: ${result.issues.length} issues encontrados`);

      res.json({
        success: true,
        data: result,
        message: 'Análisis profundo completado exitosamente'
      });
    } catch (error: unknown) {
      console.error('Error en análisis profundo:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al analizar el proyecto';
      const errorStack = error instanceof Error ? error.stack : undefined;

      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      });
    }
  }

  async getAnalysisStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.projectId as string;
      const userId = req.user.id;

      const stats = await analysesService.getAnalysisStats(projectId, userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}