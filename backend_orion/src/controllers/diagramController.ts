import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { DiagramService } from '../services/diagramService.js';
import { AdvancedDiagramService } from '../services/advancedDiagramService.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DiagramController {
  private diagramService = new DiagramService();
  private advancedDiagramService = new AdvancedDiagramService();

  /**
   * POST /api/diagrams/project/:projectId/generate
   * Genera diagramas usando IA + renderizado profesional
   */
  async generateDiagrams(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user?.id;  
      const { type = 'architecture' } = req.body;

      if (!userId || !projectId) {
        return res.status(401).json({ success: false, error: 'No autenticado o proyecto no especificado' });
      }

      // 1. Verificar proyecto
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }

      // 2. Obtener análisis
      const analysis = await prisma.analysis.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
      if (!analysis) {
        return res.status(400).json({
          success: false,
          error: 'El proyecto no tiene análisis. Ejecuta un análisis primero.',
        });
      }

      // 3. Obtener archivos del proyecto para contexto de la IA
      const filesContent = await this.getProjectFiles(projectId, analysis);

      // 4. Directorio de salida
      const outputDir = path.join(__dirname, '../../output/diagrams', projectId);
      await fs.mkdir(outputDir, { recursive: true });

      // ═══════════════════════════════════════════════════
      // 5. IA GENERA TODO (DiagramService)
      // ═══════════════════════════════════════════════════

      // 5a. Mermaid via IA
      const mermaidCode = await this.diagramService.generateArchitectureDiagram(
        project.name,
        project.type,
        filesContent
      );

      // 5b. D2 via IA
      const d2Code = await this.diagramService.generateD2Diagram(
        project.name,
        project.type,
        filesContent
      );

      // 5c. Isoflow JSON via IA
      const isoflowModel = await this.diagramService.generateIsoflowModel(
        project.name,
        project.type,
        filesContent
      );

      // ═══════════════════════════════════════════════════
      // 6. RENDERIZAR IMÁGENES (AdvancedDiagramService)
      // ═══════════════════════════════════════════════════

      // 6a. Mermaid → PNG (Kroki)
      const mermaidPngPath = path.join(outputDir, 'architecture_mermaid.png');
      await this.advancedDiagramService.generateMermaidImage(mermaidCode, mermaidPngPath).catch(err => {
        console.warn('⚠️ No se pudo generar PNG Mermaid:', err.message);
      });

      // 6b. D2 → PNG (Kroki)
      const d2PngPath = path.join(outputDir, 'architecture_d2.png');
      await this.advancedDiagramService.generateD2Diagram(d2Code, d2PngPath).catch(err => {
        console.warn('⚠️ No se pudo generar PNG D2:', err.message);
      });

      // 6c. Isoflow → HTML interactivo
      const isoHtmlPath = path.join(outputDir, 'architecture_isometric.html');
      await this.advancedDiagramService.generateIsoflowHTML(isoflowModel, isoHtmlPath);

      // 6d. Isoflow → JSON
      const isoJsonPath = path.join(outputDir, 'architecture_isoflow.json');
      await this.advancedDiagramService.saveIsoflowModel(isoflowModel, isoJsonPath);

      // 6e. Isoflow → PNG (Puppeteer)
      const isoPngPath = path.join(outputDir, 'architecture_isometric.png');
      await this.advancedDiagramService.generateIsoflowImage(isoflowModel, isoPngPath).catch(err => {
        console.warn('No se pudo generar PNG isométrico:', err.message);
      });

      // ═══════════════════════════════════════════════════
      // 7. GUARDAR ARTEFACTOS EN BD
      // ═══════════════════════════════════════════════════

      await this.saveArtifact(analysis.id, 'architecture_mermaid.md', 'mermaid', mermaidCode,
        'Diagrama Mermaid de arquitectura generado por IA');

      await this.saveArtifact(analysis.id, 'architecture_d2.d2', 'd2', d2Code,
        'Diagrama D2 de arquitectura generado por IA');

      await this.saveArtifact(analysis.id, 'architecture_isoflow.json', 'isoflow',
        JSON.stringify(isoflowModel, null, 2),
        'Modelo isométrico de arquitectura generado por IA');

      // 8. Historial
      await prisma.actionHistory.create({
        data: {
          projectId,
          analysisId: analysis.id,
          actionType: 'diagram_generation',
          actionDescription: `Diagramas de arquitectura generados por IA (${type})`,
          status: 'completed',
          result: {
            diagramTypes: ['mermaid', 'd2', 'isoflow'],
            nodesCount: isoflowModel.nodes.length,
            edgesCount: isoflowModel.edges.length,
            generatedBy: 'claude-ai',
          },
        },
      });

      // 9. Respuesta
      res.json({
        success: true,
        data: {
          mermaid: mermaidCode,
          d2: d2Code,
          isoflow: isoflowModel,
          images: {
            mermaidPng: `/api/diagrams/project/${projectId}/image/mermaid`,
            d2Png: `/api/diagrams/project/${projectId}/image/d2`,
            isometricPng: `/api/diagrams/project/${projectId}/isometric/image`,
            isometricHtml: `/api/diagrams/project/${projectId}/isometric/html`,
          },
        },
      });

    } catch (error) {
      console.error('Error generando diagramas:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error generando diagramas',
      });
    }
  }

  /**
   * GET /api/diagrams/project/:projectId
   */
  async getProjectDiagrams(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user?.id;  // ← CAMBIO 3: era req.userId

      if (!userId || !projectId) {
        return res.status(401).json({ success: false, error: 'No autenticado' });
      }

      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }

      const analysis = await prisma.analysis.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });
      if (!analysis) {
        return res.json({ success: true, data: [] });
      }

      const diagrams = await prisma.artifact.findMany({
        where: { analysisId: analysis.id, type: 'diagram' },
        orderBy: { createdAt: 'desc' },
      });

      const mapped = diagrams.map((d) => {
        const metadata = d.metadata as Record<string, unknown>;
        return {
          id: d.id,
          name: d.name,
          format: metadata?.format || 'unknown',
          content: d.content,
          description: metadata?.description || '',
          createdAt: d.createdAt.toISOString(),
        };
      });

      res.json({ success: true, data: mapped });
    } catch (error) {
      console.error('Error obteniendo diagramas:', error);
      res.status(500).json({ success: false, error: 'Error obteniendo diagramas' });
    }
  }

  /**
   * GET /api/diagrams/project/:projectId/isometric/image
   */
  async getIsometricImage(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'Proyecto no especificado' });
      }

      const pngPath = path.join(__dirname, '../../output/diagrams', projectId, 'architecture_isometric.png');
      try {
        await fs.access(pngPath);
        return res.sendFile(path.resolve(pngPath));
      } catch {
        return res.status(404).json({ success: false, error: 'Imagen PNG no encontrada. Genera los diagramas primero.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error obteniendo imagen' });
    }
  }

  /**
   * GET /api/diagrams/project/:projectId/isometric/html
   */
  async getIsometricHTML(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      if (!projectId) {
        return res.status(400).json({ success: false, error: 'Proyecto no especificado' });
      }

      const htmlPath = path.join(__dirname, '../../output/diagrams', projectId, 'architecture_isometric.html');
      try {
        await fs.access(htmlPath);
        const html = await fs.readFile(htmlPath, 'utf-8');
        return res.type('html').send(html);
      } catch {
        return res.status(404).json({ success: false, error: 'HTML no encontrado. Genera los diagramas primero.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error obteniendo HTML' });
    }
  }

  /**
   * GET /api/diagrams/project/:projectId/image/:format
   * Sirve imágenes PNG de Mermaid o D2
   */
  async getDiagramImage(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const format = req.params.format as string; // 'mermaid' | 'd2'

      if (!projectId || !format) {
        return res.status(400).json({ success: false, error: 'Parámetros incompletos' });
      }

      const fileName = format === 'mermaid' ? 'architecture_mermaid.png' : 'architecture_d2.png';
      const imgPath = path.join(__dirname, '../../output/diagrams', projectId, fileName);

      try {
        await fs.access(imgPath);
        return res.sendFile(path.resolve(imgPath));
      } catch {
        return res.status(404).json({ success: false, error: `Imagen ${format} no encontrada` });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error obteniendo imagen' });
    }
  }

  // ═══════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════

  /**
   * Obtiene archivos del proyecto para dar contexto a la IA
   */
  private async getProjectFiles(
    projectId: string,
    analysis: { result: string | null }
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    // Intentar desde CodeIndex
    const codeIndex = await prisma.codeIndex.findUnique({
      where: { projectId },
    });

    if (codeIndex?.indexData) {
      try {
        const indexData = codeIndex.indexData as Record<string, unknown>;
        if (indexData.files && Array.isArray(indexData.files)) {
          for (const file of indexData.files.slice(0, 15)) {
            const f = file as { path?: string; name?: string; content?: string };
            const name = f.path || f.name || 'unknown';
            const content = f.content || '';
            if (content) {
              files[name] = content.slice(0, 1000);
            }
          }
        }
      } catch {
        // Ignorar errores de parsing
      }
    }

    // Complementar con resultado del análisis
    if (analysis.result) {
      try {
        const result = typeof analysis.result === 'string'
          ? JSON.parse(analysis.result)
          : analysis.result;
        files['__analysis_result.json'] = JSON.stringify(result, null, 2).slice(0, 2000);
      } catch {
        files['__analysis_result.txt'] = String(analysis.result).slice(0, 2000);
      }
    }

    // Si no hay archivos, dar contexto mínimo
    if (Object.keys(files).length === 0) {
      files['__project_info.txt'] = `Project: ${projectId}\nType: unknown\nNo files indexed.`;
    }

    return files;
  }

  /**
   * Guarda o actualiza un artefacto de diagrama
   */
  private async saveArtifact(
    analysisId: string,
    name: string,
    format: string,
    content: string,
    description: string
  ): Promise<void> {
    const existing = await prisma.artifact.findFirst({
      where: { analysisId, name },
      select: { id: true },
    });

    await prisma.artifact.upsert({
      where: { id: existing?.id || crypto.randomUUID() },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        analysisId,
        name,
        type: 'diagram',
        content,
        status: 'generated',
        metadata: { format, description, generatedBy: 'claude-ai' },
      },
    });
  }
}