import { Router } from 'express';
import { ConversationsController, uploadMiddleware } from '../controllers/conversationController.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
const conversationsController = new ConversationsController();
// All routes require authentication
router.use(authenticate);
// GET /api/conversations - Get all user conversations 
router.get('/', (req, res) => conversationsController.getUserConversations(req, res));
// GET /api/conversations/:id - Get conversation by ID with messages
router.get('/:id', (req, res) => conversationsController.getConversationById(req, res));
// POST /api/conversations - Create new conversation
router.post('/', (req, res) => conversationsController.createConversation(req, res));
// POST /api/conversations/send - Send message (creates conversation if needed) - CON UPLOAD
router.post('/send', uploadMiddleware, (req, res) => conversationsController.sendMessage(req, res));
// POST /api/conversations/:id/send - Send message to existing conversation - CON UPLOAD
router.post('/:id/send', uploadMiddleware, (req, res) => conversationsController.sendMessage(req, res));
// POST /api/conversations/:id/messages - Add message to conversation (manual)
router.post('/:id/messages', (req, res) => conversationsController.addMessage(req, res));
// PATCH /api/conversations/:id - Update conversation (title)
router.patch('/:id', (req, res) => conversationsController.updateConversation(req, res));
// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', (req, res) => conversationsController.deleteConversation(req, res));
export default router;
//# sourceMappingURL=conversationRoutes.js.map