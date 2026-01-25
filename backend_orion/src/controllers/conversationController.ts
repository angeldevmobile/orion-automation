import type { Request, Response } from 'express';
import { ConversationsService } from '../services/conversacionsService.js';
import { ClaudeService } from '../services/claudeService.js';
import multer from 'multer';

const conversationsService = new ConversationsService();
const claudeService = new ClaudeService();

// Configurar multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/json',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

export const uploadMiddleware = upload.array('files', 5); // Máximo 5 archivos

export class ConversationsController {
  async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const projectId = req.query.projectId as string;

      const conversations = await conversationsService.getUserConversations(userId, projectId);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getConversationById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user.id;

      const conversation = await conversationsService.getConversationById(id, userId);

      res.json({
        success: true,
        data: conversation
      });
    } catch (error: unknown) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createConversation(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { title, projectId } = req.body;

      const conversation = await conversationsService.createConversation(userId, title, projectId);

      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const conversationId = req.params.id as string | undefined;
      const userId = req.user.id;
      const { message, projectId } = req.body;

      if (!message?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      let conversationIdToUse: string;

      // Si no hay conversationId, crear una nueva conversación
      if (!conversationId) {
        const title = message.slice(0, 50);
        const newConversation = await conversationsService.createConversation(userId, title, projectId);
        conversationIdToUse = newConversation.id;
      } else {
        conversationIdToUse = conversationId;
      }

      // Guardar mensaje del usuario
      await conversationsService.addMessage(
        conversationIdToUse,
        userId,
        'user',
        message
      );

      // Obtener conversación completa con mensajes y proyecto
      const conversationWithMessages = await conversationsService.getConversationById(
        conversationIdToUse,
        userId
      );

      const claudeMessages = conversationWithMessages.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Obtener contexto del proyecto si existe
      let projectContext: string | undefined;
      if (conversationWithMessages.projectId && conversationWithMessages.project) {
        projectContext = `Proyecto: ${conversationWithMessages.project.name}\nDescripción: ${conversationWithMessages.project.description || 'Sin descripción'}`;
      }

      // Obtener respuesta de Claude
      const assistantResponse = await claudeService.sendMessageWithContext(
        claudeMessages,
        projectContext
      );

      // Guardar respuesta del asistente
      const assistantMessage = await conversationsService.addMessage(
        conversationIdToUse,
        userId,
        'assistant',
        assistantResponse
      );

      res.status(200).json({
        success: true,
        data: {
          conversationId: conversationIdToUse,
          message: assistantMessage
        }
      });
    } catch (error: unknown) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addMessage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user.id;
      const { role, content, metadata } = req.body;

      if (!role || !content) {
        return res.status(400).json({
          success: false,
          error: 'Role and content are required'
        });
      }

      const message = await conversationsService.addMessage(id, userId, role, content, metadata);

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateConversation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user.id;
      const { title } = req.body;

      await conversationsService.updateConversationTitle(id, userId, title);

      res.json({
        success: true,
        message: 'Conversation updated'
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = req.user.id;

      await conversationsService.deleteConversation(id, userId);

      res.json({
        success: true,
        message: 'Conversation deleted'
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}