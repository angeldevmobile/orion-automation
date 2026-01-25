import { prisma } from '../config/database.js';
import type { Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip'; 

interface CreateProjectData {
  name: string;
  description?: string;
  type: string;
  settings?: Prisma.InputJsonValue;
}

interface ProjectSourceData {
  sourceType: string;
  sourceName: string;
  sourceUrl?: string;
  branch?: string;
  accessToken?: string;
  metadata?: Prisma.InputJsonValue;
}

export class ProjectsService {
  async getUserProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            conversations: true,
            analyses: true,
            projectSources: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return projects;
  }

  async getProjectById(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        projectSources: true,
        _count: {
          select: {
            conversations: true,
            analyses: true
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async createProject(userId: string, data: CreateProjectData) {
    const project = await prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description ?? null, // <-- null en vez de undefined
        type: data.type,
        settings: data.settings ?? {} // Usa objeto vacío si no hay settings
      }
    });

    return project;
  }

  async updateProject(id: string, userId: string, data: Partial<CreateProjectData>) {
    const updateData: Prisma.ProjectUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.type) updateData.type = data.type;
    if (data.settings) updateData.settings = data.settings;

    const project = await prisma.project.updateMany({
      where: { id, userId },
      data: updateData
    });

    if (project.count === 0) {
      throw new Error('Project not found');
    }

    return { success: true };
  }

  async deleteProject(id: string, userId: string) {
    const project = await prisma.project.deleteMany({
      where: { id, userId }
    });

    if (project.count === 0) {
      throw new Error('Project not found');
    }

    return { success: true };
  }

  async addProjectSource(projectId: string, userId: string, data: ProjectSourceData) {
    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const source = await prisma.projectSource.create({
      data: {
        projectId,
        sourceType: data.sourceType,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl ?? null,
        branch: data.branch ?? null,
        accessToken: data.accessToken ?? null,
        metadata: data.metadata ?? {}
      }
    });

    return source;
  }

  async uploadProjectFiles(projectId: string, userId: string, files: Express.Multer.File[]) {
    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const allFiles: Express.Multer.File[] = [];

    // Procesar archivos ZIP
    for (const file of files) {
      if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
        try {
          const zip = new AdmZip(file.path);
          const zipEntries = zip.getEntries();

          // Crear directorio para archivos extraídos
          const extractDir = path.join(path.dirname(file.path), `${file.filename}_extracted`);
          if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir, { recursive: true });
          }

          // Extraer archivos del ZIP
          for (const entry of zipEntries) {
            if (!entry.isDirectory) {
              const extractedPath = path.join(extractDir, entry.entryName);
              const extractedDir = path.dirname(extractedPath);
              
              if (!fs.existsSync(extractedDir)) {
                fs.mkdirSync(extractedDir, { recursive: true });
              }

              zip.extractEntryTo(entry, extractedDir, false, true);

              // Agregar archivo extraído a la lista
              allFiles.push({
                ...file,
                path: extractedPath,
                originalname: entry.entryName,
                filename: path.basename(extractedPath),
                mimetype: 'application/octet-stream',
                size: entry.header.size
              } as Express.Multer.File);
            }
          }

          // Eliminar archivo ZIP original
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Error extracting ZIP:', error);
          throw new Error(`Error al procesar archivo ZIP: ${file.originalname}`);
        }
      } else {
        allFiles.push(file);
      }
    }

    // Crear registros de ProjectSource para cada archivo
    const sources = await Promise.all(
      allFiles.map(file => 
        prisma.projectSource.create({
          data: {
            projectId,
            sourceType: 'file',
            sourceName: file.originalname,
            sourceUrl: file.path,
            metadata: {
              filename: file.filename,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              uploadedAt: new Date().toISOString()
            }
          }
        })
      )
    );

    // Actualizar contador de archivos en el proyecto
    await prisma.project.update({
      where: { id: projectId },
      data: {
        fileCount: {
          increment: allFiles.length
        }
      }
    });

    return sources;
  }

  async getProjectFiles(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const files = await prisma.projectSource.findMany({
      where: { 
        projectId,
        sourceType: 'file'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return files;
  }

  async deleteProjectFile(fileId: string, projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const file = await prisma.projectSource.findFirst({
      where: {
        id: fileId,
        projectId
      }
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Eliminar archivo físico
    if (file.sourceUrl && fs.existsSync(file.sourceUrl)) {
      fs.unlinkSync(file.sourceUrl);
    }

    // Eliminar registro de la BD
    await prisma.projectSource.delete({
      where: { id: fileId }
    });

    // Actualizar contador
    await prisma.project.update({
      where: { id: projectId },
      data: {
        fileCount: {
          decrement: 1
        }
      }
    });

    return { success: true };
  }

  async getProjectStats(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            conversations: true,
            analyses: true,
            projectSources: true,
            actionHistory: true
          }
        },
        analyses: {
          select: {
            tokensUsed: true,
            durationMs: true
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const totalTokens = project.analyses.reduce((sum, a) => sum + a.tokensUsed, 0);
    const avgDuration = project.analyses.length > 0
      ? project.analyses.reduce((sum, a) => sum + (a.durationMs || 0), 0) / project.analyses.length
      : 0;

    return {
      projectId: project.id,
      name: project.name,
      conversationsCount: project._count.conversations,
      analysesCount: project._count.analyses,
      sourcesCount: project._count.projectSources,
      actionsCount: project._count.actionHistory,
      totalTokensUsed: totalTokens,
      avgAnalysisDuration: Math.round(avgDuration),
      fileCount: project.fileCount,
      issuesFound: project.issuesFound,
      lastAnalysisAt: project.lastAnalysisAt
    };
  }
}