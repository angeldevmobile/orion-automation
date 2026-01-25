import { Router } from 'express';
import { ConversationsController } from '../controllers/conversationController.js';
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

// POST /api/conversations/:id/messages - Add message to conversation
router.post('/:id/messages', (req, res) => conversationsController.addMessage(req, res));

// PATCH /api/conversations/:id - Update conversation (title)
router.patch('/:id', (req, res) => conversationsController.updateConversation(req, res));

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', (req, res) => conversationsController.deleteConversation(req, res));

export default router;