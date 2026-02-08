import { prisma } from '../config/database.js';
export class ConversationsService {
    async getUserConversations(userId, projectId) {
        const where = { userId, isArchived: false };
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
            createdAt: conv.createdAt
        }));
    }
    async getConversationById(id, userId) {
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
    async createConversation(userId, title, projectId) {
        const conversation = await prisma.conversation.create({
            data: {
                userId,
                projectId: projectId ?? null, // <-- aquí el cambio
                title: title || 'New Conversation'
            }
        });
        return conversation;
    }
    async addMessage(conversationId, userId, role, content, metadata = {}) {
        // Verificar que la conversación pertenece al usuario
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, userId }
        });
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        // Crear mensaje
        const message = await prisma.message.create({
            data: {
                conversationId,
                role,
                content,
                metadata
            }
        });
        // Actualizar lastMessageAt
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });
        return message;
    }
    async updateConversationTitle(id, userId, title) {
        const conversation = await prisma.conversation.updateMany({
            where: { id, userId },
            data: { title }
        });
        if (conversation.count === 0) {
            throw new Error('Conversation not found');
        }
        return { success: true };
    }
    async archiveConversation(id, userId) {
        const conversation = await prisma.conversation.updateMany({
            where: { id, userId },
            data: { isArchived: true }
        });
        if (conversation.count === 0) {
            throw new Error('Conversation not found');
        }
        return { success: true };
    }
    async deleteConversation(id, userId) {
        const conversation = await prisma.conversation.deleteMany({
            where: { id, userId }
        });
        if (conversation.count === 0) {
            throw new Error('Conversation not found');
        }
        return { success: true };
    }
}
//# sourceMappingURL=conversacionsService.js.map