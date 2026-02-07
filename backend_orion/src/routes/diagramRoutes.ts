import { Router } from 'express';
import { DiagramController } from '../controllers/diagramController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const diagramController = new DiagramController();

// All routes require authentication
router.use(authenticate);

// POST /api/diagrams/project/:projectId/generate - Generar diagramas
router.post('/project/:projectId/generate', (req, res) => 
  diagramController.generateDiagrams(req, res)
);

// GET /api/diagrams/project/:projectId - Obtener diagramas existentes
router.get('/project/:projectId', (req, res) => 
  diagramController.getProjectDiagrams(req, res)
);

// GET /api/diagrams/project/:projectId/image/:format - PNG de Mermaid o D2
router.get('/project/:projectId/image/:format', (req, res) => 
  diagramController.getDiagramImage(req, res)
);

// GET /api/diagrams/project/:projectId/isometric/image - PNG isométrico
router.get('/project/:projectId/isometric/image', (req, res) => 
  diagramController.getIsometricImage(req, res)
);

// GET /api/diagrams/project/:projectId/isometric/html - HTML interactivo
router.get('/project/:projectId/isometric/html', (req, res) => 
  diagramController.getIsometricHTML(req, res)
);

export default router;