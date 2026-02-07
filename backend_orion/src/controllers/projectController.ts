import type { Request, Response } from 'express';
import { ProjectsService } from '../services/projectService.js';
import { prisma } from '../config/database.js';

const projectsService = new ProjectsService();

export class ProjectsController {
  async getUserProjects(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const projects = await projectsService.getUserProjects(userId);

      res.json({
        success: true,
        data: projects
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      const project = await projectsService.getProjectById(id, userId);

      res.json({
        success: true,
        data: project
      });
    } catch (error: unknown) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const { name, description, type, settings } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Name and type are required'
        });
      }

      const project = await projectsService.createProject(userId, {
        name,
        description,
        type,
        settings
      });

      res.status(201).json({
        success: true,
        data: project
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      await projectsService.updateProject(id, userId, req.body);

      res.json({
        success: true,
        message: 'Project updated'
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      await projectsService.deleteProject(id, userId);

      res.json({
        success: true,
        message: 'Project deleted'
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProjectStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      const stats = await projectsService.getProjectStats(id, userId);

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

  async addProjectSource(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      const source = await projectsService.addProjectSource(id, userId, req.body);

      res.status(201).json({
        success: true,
        data: source
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async uploadFiles(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.id as string;
      const userId = req.user.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      const sources = await projectsService.uploadProjectFiles(projectId, userId, files);

      res.status(201).json({
        success: true,
        data: {
          filesUploaded: files.length,
          sources
        }
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProjectFiles(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.id as string;
      const userId = req.user.id;

      const files = await projectsService.getProjectFiles(projectId, userId);

      res.json({
        success: true,
        data: files
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const projectId = req.params.id as string;
      const fileId = req.params.fileId as string;
      const userId = req.user.id;

      await projectsService.deleteProjectFile(fileId, projectId, userId);

      res.json({
        success: true,
        message: 'File deleted'
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener historial de acciones del proyecto
  async getProjectActions(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const id = req.params.id as string;
      const userId = req.user.id;

      // Verificar que el proyecto pertenece al usuario
      const project = await prisma.project.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Proyecto no encontrado',
        });
      }

      // Obtener historial de acciones
      const actions = await prisma.actionHistory.findMany({
        where: { projectId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          actionType: true,
          actionDescription: true,
          status: true,
          result: true,
          createdAt: true,
        },
      });

      // Mapear a formato esperado por el frontend
      const formattedActions = actions.map((action) => ({
        id: action.id,
        actionType: action.actionType,
        description: action.actionDescription,
        status: action.status,
        result: action.result,
        createdAt: action.createdAt.toISOString(),
      }));

      return res.json({
        success: true,
        data: formattedActions,
      });
    } catch (error) {
      console.error('Error fetching project actions:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener historial de acciones',
      });
    }
  }
}