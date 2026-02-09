import { prisma } from '../config/database.js';
import type { Prisma } from '@prisma/client';

const MAX_CONVERSATIONS = 50; // Límite de conversaciones por usuario

export class ConversationsService {
  async getUserConversations(userId: string, projectId?: string) {
    const where: Prisma.ConversationWhereInput = { userId, isArchived: false };
    if (projectId) {
      where.projectId = projectId;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        _count: {
          select: { messages: true }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    return conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      projectId: conv.projectId,
      projectName: conv.project?.name,
      messageCount: conv._count.messages,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }));
  }

  async getConversationById(id: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        project: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  async createConversation(userId: string, title?: string, projectId?: string) {
    // Verificar cuota antes de crear
    const canCreate = await this.canCreateConversation(userId);
    if (!canCreate) {
      throw new Error(`Has alcanzado el límite de ${MAX_CONVERSATIONS} conversaciones. Elimina algunas para continuar.`);
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        projectId: projectId ?? null,
        title: title || 'New Conversation'
      }
    });

    return conversation;
  }

  async addMessage(
    conversationId: string,
    userId: string,
    role: string,
    content: string,
    metadata: Prisma.InputJsonValue = {}
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        metadata
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    return message;
  }

  async updateConversationTitle(id: string, userId: string, title: string) {
    const conversation = await prisma.conversation.updateMany({
      where: { id, userId },
      data: { title }
    });

    if (conversation.count === 0) {
      throw new Error('Conversation not found');
    }

    return { success: true };
  }

  async archiveConversation(id: string, userId: string) {
    const conversation = await prisma.conversation.updateMany({
      where: { id, userId },
      data: { isArchived: true }
    });

    if (conversation.count === 0) {
      throw new Error('Conversation not found');
    }

    return { success: true };
  }

  async deleteConversation(id: string, userId: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId }
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Con onDelete: Cascade en el schema, los mensajes se eliminan automáticamente
    await prisma.conversation.delete({
      where: { id }
    });

    return { success: true };
  }

  //Eliminar múltiples conversaciones
  async deleteMultipleConversations(ids: string[], userId: string) {
    // Verificar que pertenecen al usuario
    const conversations = await prisma.conversation.findMany({
      where: {
        id: { in: ids },
        userId
      },
      select: { id: true }
    });

    const validIds = conversations.map(c => c.id);

    if (validIds.length === 0) {
      throw new Error('No conversations found');
    }

    // Con onDelete: Cascade, los mensajes se eliminan automáticamente
    const result = await prisma.conversation.deleteMany({
      where: {
        id: { in: validIds }
      }
    });

    return {
      success: true,
      deletedCount: result.count,
      requestedCount: ids.length
    };
  }

  //Obtener información de almacenamiento
  async getStorageInfo(userId: string) {
    const [conversationCount, totalMessages] = await Promise.all([
      prisma.conversation.count({
        where: { userId, isArchived: false }
      }),
      prisma.message.count({
        where: {
          conversation: { userId }
        }
      })
    ]);

    const percentage = Math.round((conversationCount / MAX_CONVERSATIONS) * 100);

    return {
      used: conversationCount,
      limit: MAX_CONVERSATIONS,
      percentage: Math.min(percentage, 100),
      conversationCount,
      maxConversations: MAX_CONVERSATIONS,
      totalMessages,
      isFull: conversationCount >= MAX_CONVERSATIONS,
      isNearFull: percentage >= 80,
    };
  }

  async canCreateConversation(userId: string): Promise<boolean> {
    const count = await prisma.conversation.count({
      where: { userId, isArchived: false }
    });
    return count < MAX_CONVERSATIONS;
  }
}