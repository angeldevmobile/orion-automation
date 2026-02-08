import { Router } from 'express';
import { DocumentationController } from '../controllers/documentationController.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
const documentationController = new DocumentationController();
// Todas las rutas requieren autenticación
router.use(authenticate);
// Generar documentación
router.post('/generate', documentationController.generateDocumentation.bind(documentationController));
// Obtener documentación de un proyecto
router.get('/project/:projectId', documentationController.getProjectDocumentation.bind(documentationController));
// Descargar documento
router.get('/:artifactId/download', documentationController.downloadDocument.bind(documentationController));
export default router;
//# sourceMappingURL=documentationRoutes.js.map