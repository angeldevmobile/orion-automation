import { Router } from 'express';
import { DecisionController } from '../controllers/decisionController.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
const decisionController = new DecisionController();
router.use(authenticate);
// Solo rutas por ID específico
router.get('/:decisionId', decisionController.getDecisionById.bind(decisionController));
router.patch('/:decisionId', decisionController.updateDecisionStatus.bind(decisionController));
export default router;
//# sourceMappingURL=decisionRoutes.js.map