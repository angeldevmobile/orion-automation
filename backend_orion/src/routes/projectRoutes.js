import { Router } from 'express';
import { ProjectsController } from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/file.middleware.js';
const router = Router();
const projectsController = new ProjectsController();
// All routes require authentication
router.use(authenticate);
// GET /api/projects - Get all user projects
router.get('/', (req, res) => projectsController.getUserProjects(req, res));
// GET /api/projects/:id - Get project by ID
router.get('/:id', (req, res) => projectsController.getProjectById(req, res));
// POST /api/projects - Create new project
router.post('/', (req, res) => projectsController.createProject(req, res));
// PATCH /api/projects/:id - Update project
router.patch('/:id', (req, res) => projectsController.updateProject(req, res));
// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => projectsController.deleteProject(req, res));
// GET /api/projects/:id/stats - Get project statistics
router.get('/:id/stats', (req, res) => projectsController.getProjectStats(req, res));
// GET /api/projects/:id/actions - Get project action history
router.get('/:id/actions', (req, res) => projectsController.getProjectActions(req, res));
// POST /api/projects/:id/sources - Add source to project
router.post('/:id/sources', (req, res) => projectsController.addProjectSource(req, res));
// POST /api/projects/:id/upload - Upload files to project
router.post('/:id/upload', upload.array('files', 20), (req, res) => projectsController.uploadFiles(req, res));
// GET /api/projects/:id/files - Get project files
router.get('/:id/files', (req, res) => projectsController.getProjectFiles(req, res));
// DELETE /api/projects/:id/files/:fileId - Delete a file
router.delete('/:id/files/:fileId', (req, res) => projectsController.deleteFile(req, res));
export default router;
//# sourceMappingURL=projectRoutes.js.map