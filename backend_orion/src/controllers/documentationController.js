import { PrismaClient } from '@prisma/client';
import { DocumentationService } from '../services/documentationService.js';
import { DocumentExportService } from '../services/documentExportService.js';
import * as fs from 'fs/promises';
const prisma = new PrismaClient();
const documentationService = new DocumentationService();
const documentExportService = new DocumentExportService();
export class DocumentationController {
    async generateDocumentation(req, res) {
        try {
            const { projectId, documentTypes } = req.body;
            const userId = req.user?.id;
            if (!projectId || !documentTypes || !Array.isArray(documentTypes)) {
                return res.status(400).json({
                    success: false,
                    error: 'projectId y documentTypes son requeridos',
                });
            }
            if (typeof projectId !== 'string' || typeof userId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'IDs inválidos',
                });
            }
            const project = await prisma.project.findFirst({
                where: { id: projectId, userId: userId },
                include: { projectSources: true },
            });
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Proyecto no encontrado',
                });
            }
            const analysis = await prisma.analysis.create({
                data: {
                    projectId: projectId,
                    objective: 'Generar documentación técnica con IA',
                    responseType: 'documentation',
                    modelUsed: 'claude-sonnet-4-20250514',
                },
            });
            const artifacts = [];
            const startTime = Date.now();
            for (const docType of documentTypes) {
                const content = await this.generateDocContentWithAI(project, docType);
                const artifact = await prisma.artifact.create({
                    data: {
                        analysisId: analysis.id,
                        name: this.getDocumentName(docType),
                        type: 'documentation',
                        content,
                        status: 'generated',
                        metadata: {
                            docType,
                            projectName: project.name,
                            generatedAt: new Date().toISOString(),
                            generatedBy: 'claude-ai',
                        },
                    },
                });
                artifacts.push(artifact);
            }
            const durationMs = Date.now() - startTime;
            await prisma.analysis.update({
                where: { id: analysis.id },
                data: {
                    result: `Documentación generada exitosamente: ${artifacts.length} documento(s)`,
                    artifacts: artifacts.map((a) => ({
                        id: a.id,
                        name: a.name,
                        type: a.type,
                    })),
                    durationMs,
                },
            });
            await prisma.actionHistory.create({
                data: {
                    projectId: projectId,
                    analysisId: analysis.id,
                    actionType: 'documentation_generated',
                    actionDescription: `Generada documentación: ${artifacts.map((a) => a.name).join(', ')}`,
                    status: 'completed',
                    result: { artifactIds: artifacts.map((a) => a.id) },
                },
            });
            return res.json({
                success: true,
                data: artifacts,
                meta: {
                    analysisId: analysis.id,
                    count: artifacts.length,
                    durationMs,
                },
            });
        }
        catch (error) {
            console.error('Error generando documentación:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al generar documentación',
            });
        }
    }
    // Obtener documentación de un proyecto
    async getProjectDocumentation(req, res) {
        try {
            const projectIdParam = req.params.projectId;
            const userId = req.user?.id;
            if (typeof userId !== 'string') {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado',
                });
            }
            const projectId = Array.isArray(projectIdParam)
                ? projectIdParam[0]
                : projectIdParam;
            if (!projectId || typeof projectId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'projectId inválido',
                });
            }
            const project = await prisma.project.findFirst({
                where: { id: projectId, userId: userId },
            });
            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Proyecto no encontrado',
                });
            }
            const artifacts = await prisma.artifact.findMany({
                where: {
                    type: 'documentation',
                    analysis: {
                        projectId: projectId,
                    },
                },
                include: {
                    analysis: {
                        select: { id: true, createdAt: true, objective: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            return res.json({
                success: true,
                data: artifacts,
            });
        }
        catch (error) {
            console.error('Error obteniendo documentación:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener documentación',
            });
        }
    }
    // Descargar un documento
    async downloadDocument(req, res) {
        try {
            const artifactIdParam = req.params.artifactId;
            const userId = req.user?.id;
            const format = req.query.format === 'pdf' ? 'pdf' : 'md'; // Soporte para PDF
            if (typeof userId !== 'string') {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado',
                });
            }
            const artifactId = Array.isArray(artifactIdParam)
                ? artifactIdParam[0]
                : artifactIdParam;
            if (!artifactId || typeof artifactId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'artifactId inválido',
                });
            }
            const artifact = await prisma.artifact.findFirst({
                where: {
                    id: artifactId,
                    analysis: {
                        project: { userId: userId },
                    },
                },
            });
            if (!artifact) {
                return res.status(404).json({
                    success: false,
                    error: 'Documento no encontrado',
                });
            }
            if (format === 'pdf') {
                // Generar PDF temporal
                const tempPath = `/tmp/${artifact.name.replace('.md', '')}_${Date.now()}.pdf`;
                await documentExportService.markdownToPDF(artifact.content, tempPath);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${artifact.name.replace('.md', '.pdf')}"`);
                const pdfBuffer = await fs.readFile(tempPath);
                return res.send(pdfBuffer);
            }
            else {
                res.setHeader('Content-Type', 'text/markdown');
                res.setHeader('Content-Disposition', `attachment; filename="${artifact.name}"`);
                return res.send(artifact.content);
            }
        }
        catch (error) {
            console.error('Error descargando documento:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al descargar documento',
            });
        }
    }
    async generateDocContentWithAI(project, docType) {
        switch (docType) {
            case 'readme':
                return await documentationService.generateReadme(project);
            case 'architecture':
                return await documentationService.generateArchitecture(project);
            case 'api':
                return await documentationService.generateApiDocs(project);
            case 'contributing':
                return await documentationService.generateContributing(project);
            default:
                return '# Documentación\n\nTipo de documento no soportado.';
        }
    }
    getDocumentName(docType) {
        const names = {
            readme: 'README.md',
            api: 'API_DOCUMENTATION.md',
            architecture: 'ARCHITECTURE.md',
            contributing: 'CONTRIBUTING.md',
        };
        return names[docType] || 'DOCUMENT.md';
    }
}
//# sourceMappingURL=documentationController.js.map