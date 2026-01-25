import { Router } from 'express';
import { AnalysesController } from '../controllers/analysesController.js';
import { ArtifactController } from '../controllers/artifactController.js';
import { DecisionController } from '../controllers/decisionController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { analysisProgressEmitter } from '../services/analysesService.js';
import jwt from 'jsonwebtoken';

const router = Router();
const analysesController = new AnalysesController();
const artifactController = new ArtifactController();
const decisionController = new DecisionController();

// SSE para progreso (sin autenticación para evitar conflictos con EventSource)
router.get('/project/:projectId/analyze/progress', (req, res) => {
  const projectId = req.params.projectId;
  const token = req.query.token as string;

  // Validar token manualmente
  if (!token) {
    res.status(401).json({ error: 'Token required' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'orion-secret-key-2025');
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  interface ProgressEvent {
    projectId: string;
    [key: string]: unknown;
  }

  const progressHandler = (progress: ProgressEvent) => {
    if (progress.projectId === projectId) {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    }
  };

  analysisProgressEmitter.on('progress', progressHandler);

  req.on('close', () => {
    analysisProgressEmitter.off('progress', progressHandler);
    res.end();
  });
});

// Resto de rutas con authenticate
router.use(authenticate);

// POST /api/analyses/project/:projectId/analyze - Análisis rápido (estructural)
router.post('/project/:projectId/analyze', (req, res) => analysesController.analyzeWithClaude(req, res));

// POST /api/analyses/project/:projectId/analyze-deep - Análisis profundo (con archivos específicos)
router.post('/project/:projectId/analyze-deep', (req, res) => analysesController.analyzeDeep(req, res));

// GET /api/analyses/project/:projectId - Get all analyses for a project
router.get('/project/:projectId', (req, res) => analysesController.getProjectAnalyses(req, res));

// GET /api/analyses/project/:projectId/stats - Get analysis statistics for a project
router.get('/project/:projectId/stats', (req, res) => analysesController.getAnalysisStats(req, res));

// Artefactos de un análisis
router.get('/:analysisId/artifacts', artifactController.getAnalysisArtifacts.bind(artifactController));

// Decisiones de un análisis
router.get('/:analysisId/decisions', decisionController.getAnalysisDecisions.bind(decisionController));

// GET /api/analyses/:id - Get analysis by ID (debe ir al final para evitar conflictos)
router.get('/:id', (req, res) => analysesController.getAnalysisById(req, res));

// POST /api/analyses - Create new analysis
router.post('/', (req, res) => analysesController.createAnalysis(req, res));

export default router;