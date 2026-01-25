import { Router } from 'express';
import { ArtifactController } from '../controllers/artifactController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const artifactController = new ArtifactController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/analyses/:analysisId/artifacts - Obtener artefactos de un análisis
router.get(
  '/:analysisId/artifacts',
  artifactController.getAnalysisArtifacts.bind(artifactController)
);

export default router;