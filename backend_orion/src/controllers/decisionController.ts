import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Decision {
  id?: string;
  status?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface RawDecision {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  impact?: string;
  status?: string;
  metadata?: {
    pros?: string[];
    cons?: string[];
    recommendation?: string;
    estimatedEffort?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export class DecisionController {
  // Obtener decisiones de un análisis (desde el JSON result)
  async getAnalysisDecisions(req: Request, res: Response) {
    try {
      const analysisId = req.params.analysisId as string;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
      }

      const analysis = await prisma.analysis.findFirst({
        where: {
          id: analysisId,
          project: { userId }
        },
        select: {
          id: true,
          result: true
        }
      });

      if (!analysis) {
        return res.status(404).json({
          success: false,
          error: 'Análisis no encontrado',
        });
      }

      let decisions = [];
      if (analysis.result) {
        try {
          const parsedResult = typeof analysis.result === 'string' 
            ? JSON.parse(analysis.result) 
            : analysis.result;
          
          const rawDecisions = parsedResult.decisions || [];
          decisions = rawDecisions.map((decision: RawDecision, index: number) => ({
            id: decision.id || `${analysisId}-${index}`,
            title: decision.title || 'Sin título',
            description: decision.description || '',
            category: decision.category || 'general',
            impact: decision.impact || 'medium',
            status: decision.status || 'pending',
            metadata: {
              pros: Array.isArray(decision.metadata?.pros) ? decision.metadata.pros : [],
              cons: Array.isArray(decision.metadata?.cons) ? decision.metadata.cons : [],
              recommendation: decision.metadata?.recommendation || '',
              estimatedEffort: decision.metadata?.estimatedEffort || ''
            },
            createdAt: decision.createdAt || new Date().toISOString(),
            updatedAt: decision.updatedAt || new Date().toISOString()
          }));
        } catch (error) {
          console.error('Error parsing analysis result:', error);
        }
      }

      return res.json({
        success: true,
        data: decisions,
      });
    } catch (error) {
      console.error('Error fetching decisions:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener decisiones',
      });
    }
  }

  async getDecisionById(req: Request, res: Response) {
    try {
      const decisionId = req.params.decisionId as string;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
      }

      // Buscar en qué análisis está esta decisión
      const analyses = await prisma.analysis.findMany({
        where: {
          project: { userId }
        },
        select: {
          id: true,
          result: true,
          project: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      let foundDecision = null;
      let analysisContext = null;

      for (const analysis of analyses) {
        if (analysis.result) {
          try {
            const parsedResult = typeof analysis.result === 'string' 
              ? JSON.parse(analysis.result) 
              : analysis.result;
            
            const decisions = parsedResult.decisions || [];
            const decision = decisions.find((d: Decision, index: number) => 
              (d.id === decisionId || `${analysis.id}-${index}` === decisionId)
            );

            if (decision) {
              foundDecision = {
                ...decision,
                metadata: {
                  pros: Array.isArray(decision.metadata?.pros) ? decision.metadata.pros : [],
                  cons: Array.isArray(decision.metadata?.cons) ? decision.metadata.cons : [],
                  recommendation: decision.metadata?.recommendation || '',
                  estimatedEffort: decision.metadata?.estimatedEffort || ''
                }
              };
              analysisContext = {
                analysisId: analysis.id,
                projectId: analysis.project.id,
                projectName: analysis.project.name
              };
              break;
            }
          } catch (error) {
            console.error('Error parsing result:', error);
          }
        }
      }

      if (!foundDecision) {
        return res.status(404).json({
          success: false,
          error: 'Decisión no encontrada',
        });
      }

      return res.json({
        success: true,
        data: {
          ...foundDecision,
          ...analysisContext
        },
      });
    } catch (error) {
      console.error('Error fetching decision:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al obtener decisión',
      });
    }
  }

  async updateDecisionStatus(req: Request, res: Response) {
    try {
      const decisionId = req.params.decisionId as string;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado',
        });
      }

      if (!['pending', 'confirmed', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
      }

      // Buscar el análisis que contiene esta decisión
      const analyses = await prisma.analysis.findMany({
        where: {
          project: { userId }
        }
      });

      let updatedAnalysis = null;

      for (const analysis of analyses) {
        if (analysis.result) {
          try {
            const parsedResult = typeof analysis.result === 'string' 
              ? JSON.parse(analysis.result) 
              : analysis.result;
            
            const decisions = parsedResult.decisions || [];
            const decisionIndex = decisions.findIndex((d: Decision, index: number) => 
              (d.id === decisionId || `${analysis.id}-${index}` === decisionId)
            );

            if (decisionIndex !== -1) {
              // Actualizar el estado de la decisión
              decisions[decisionIndex] = {
                ...decisions[decisionIndex],
                status,
                updatedAt: new Date().toISOString()
              };

              parsedResult.decisions = decisions;

              // Guardar el resultado actualizado
              updatedAnalysis = await prisma.analysis.update({
                where: { id: analysis.id },
                data: {
                  result: JSON.stringify(parsedResult)
                }
              });

              return res.json({
                success: true,
                data: decisions[decisionIndex],
              });
            }
          } catch (error) {
            console.error('Error parsing result:', error);
          }
        }
      }

      return res.status(404).json({
        success: false,
        error: 'Decisión no encontrada',
      });
    } catch (error) {
      console.error('Error updating decision:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al actualizar decisión',
      });
    }
  }
}