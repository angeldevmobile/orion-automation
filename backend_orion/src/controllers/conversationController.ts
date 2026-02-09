import type { Request, Response } from 'express';
import { ConversationsService } from '../services/conversacionsService.js';
import { ClaudeService, type ClaudeMessage } from '../services/claudeService.js';
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
      'text/javascript',
      'text/typescript',
      'text/html',
      'text/css',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

export const uploadMiddleware = upload.array('files', 5); // Máximo 5 archivos

// Tipo helper para los bloques de contenido
type ContentBlock = 
  | { type: 'text'; text: string }
  | { 
      type: 'image'; 
      source: { 
        type: 'base64'; 
        media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; 
        data: string 
      } 
    };

export class ConversationsController {
  async getUserConversations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

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
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

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
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const { title, projectId } = req.body;

      const conversation = await conversationsService.createConversation(userId, title, projectId);

      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error: unknown) {
      // Si es error de cuota, devolver 429
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('límite') ? 429 : 400;

      res.status(status).json({
        success: false,
        error: message
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      console.log('req.body:', req.body);
      console.log('req.files:', req.files);
      console.log('Content-Type:', req.headers['content-type']);

      const conversationId = req.params.id as string | undefined;
      const userId = req.user.id;
      const { message, projectId } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!message?.trim() && (!files || files.length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un mensaje o archivos'
        });
      }

      let conversationIdToUse: string;

      if (!conversationId) {
        const title = message?.slice(0, 50) || 'Conversación con archivos';
        const newConversation = await conversationsService.createConversation(userId, title, projectId);
        conversationIdToUse = newConversation.id;
      } else {
        conversationIdToUse = conversationId;
      }

      const userMessageMetadata = files && files.length > 0 ? {
        files: files.map(f => ({
          name: f.originalname,
          type: f.mimetype,
          size: f.size
        }))
      } : undefined;

      await conversationsService.addMessage(
        conversationIdToUse,
        userId,
        'user',
        message || '📎 Archivo adjunto',
        userMessageMetadata
      );

      const conversationWithMessages = await conversationsService.getConversationById(
        conversationIdToUse,
        userId
      );

      const claudeMessages: ClaudeMessage[] = [];

      for (const msg of conversationWithMessages.messages.slice(0, -1)) {
        claudeMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }

      if (files && files.length > 0) {
        const contentParts: ContentBlock[] = [];

        if (message?.trim()) {
          contentParts.push({
            type: 'text',
            text: message
          });
        }

        for (const file of files) {
          if (file.mimetype.startsWith('image/')) {
            const base64Data = file.buffer.toString('base64');
            const mediaType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
            
            contentParts.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              }
            });
          } else if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
            const textContent = file.buffer.toString('utf-8');
            contentParts.push({
              type: 'text',
              text: `\n\n--- Archivo: ${file.originalname} ---\n${textContent}\n--- Fin del archivo ---\n`
            });
          }
        }

        claudeMessages.push({
          role: 'user',
          content: contentParts
        });
      } else {
        claudeMessages.push({
          role: 'user',
          content: message
        });
      }

      let projectContext: string | undefined;
      if (conversationWithMessages.projectId && conversationWithMessages.project) {
        projectContext = `Proyecto: ${conversationWithMessages.project.name}\nDescripción: ${conversationWithMessages.project.description || 'Sin descripción'}`;
      }

      const assistantResponse = await claudeService.sendMessageWithContext(
        claudeMessages,
        projectContext
      );

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('límite') ? 429 : 500;

      res.status(status).json({
        success: false,
        error: message
      });
    }
  }

  async addMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

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
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

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
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

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

  async deleteMultipleConversations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere un array de IDs'
        });
      }

      if (ids.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Máximo 20 conversaciones por solicitud'
        });
      }

      const result = await conversationsService.deleteMultipleConversations(ids, userId);

      res.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStorageInfo(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'No autorizado' });
      }

      const userId = req.user.id;
      const storageInfo = await conversationsService.getStorageInfo(userId);

      res.json({
        success: true,
        data: storageInfo
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}