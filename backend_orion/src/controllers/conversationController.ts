import type { Request, Response } from 'express';
import { ConversationsService } from '../services/conversacionsService.js';

const conversationsService = new ConversationsService();

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