import { Router } from 'express';
import authRoutes from './authRoutes.js';
import conversationsRoutes from './conversationRoutes.js';
import projectsRoutes from './projectRoutes.js';
import analysesRoutes from './analysesRoutes.js';
import decisionRoutes from './decisionRoutes.js';
import artifactRoutes from './artifactRoutes.js';
import documentationRoutes from './documentationRoutes.js';
const router = Router();
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0'
    });
});
// API info
router.get('/', (req, res) => {
    res.json({
        message: 'Orion AI Automation API v1',
        status: 'running',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            conversations: {
                list: 'GET /api/conversations',
                get: 'GET /api/conversations/:id',
                create: 'POST /api/conversations',
                addMessage: 'POST /api/conversations/:id/messages',
                update: 'PATCH /api/conversations/:id',
                delete: 'DELETE /api/conversations/:id'
            },
            projects: {
                list: 'GET /api/projects',
                get: 'GET /api/projects/:id',
                create: 'POST /api/projects',
                update: 'PATCH /api/projects/:id',
                delete: 'DELETE /api/projects/:id',
                stats: 'GET /api/projects/:id/stats',
                addSource: 'POST /api/projects/:id/sources',
                upload: 'POST /api/projects/:id/upload',
                actions: 'GET /api/projects/:id/actions'
            },
            analyses: {
                listByProject: 'GET /api/analyses/project/:projectId',
                get: 'GET /api/analyses/:id',
                create: 'POST /api/analyses',
                analyze: 'POST /api/analyses/project/:projectId/analyze',
                stats: 'GET /api/analyses/project/:projectId/stats',
                artifacts: 'GET /api/analyses/:analysisId/artifacts',
                decisions: 'GET /api/analyses/:analysisId/decisions'
            },
            decisions: {
                get: 'GET /api/decisions/:decisionId',
                update: 'PATCH /api/decisions/:decisionId'
            },
            artifacts: {
                get: 'GET /api/artifacts/:artifactId',
                download: 'GET /api/artifacts/:artifactId/download'
            },
            documentation: {
                generate: 'POST /api/documentation/generate',
                listByProject: 'GET /api/documentation/project/:projectId',
                download: 'GET /api/documentation/:artifactId/download'
            }
        }
    });
});
// Mount routes
router.use('/auth', authRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/projects', projectsRoutes);
router.use('/analyses', analysesRoutes);
router.use('/decisions', decisionRoutes);
router.use('/artifacts', artifactRoutes);
router.use('/documentation', documentationRoutes);
export default router;
//# sourceMappingURL=indexRoutes.js.map