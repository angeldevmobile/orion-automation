import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ArtifactController {
  // Obtener artefactos de un análisis
  async getAnalysisArtifacts(req: Request, res: Response) {
    try {
      const analysisId = req.params.analysisId as string;

      const artifacts = await prisma.artifact.findMany({
        where: { analysisId },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: artifacts,
      });
    } catch (error) {
      console.error('Error fetching artifacts:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener artefactos',
      });
    }
  }
}