import type { Prisma } from '@prisma/client';
export declare class ConversationsService {
    getUserConversations(userId: string, projectId?: string): Promise<{
        id: string;
        title: string;
        projectId: string;
        projectName: string;
        messageCount: number;
        lastMessageAt: Date;
        createdAt: Date;
    }[]>;
    getConversationById(id: string, userId: string): Promise<{
        project: {
            name: string;
            id: string;
            description: string;
        };
        messages: {
            id: string;
            createdAt: Date;
            role: string;
            conversationId: string;
            content: string;
            metadata: Prisma.JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        title: string;
        isArchived: boolean;
        lastMessageAt: Date | null;
    }>;
    createConversation(userId: string, title?: string, projectId?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string | null;
        title: string;
        isArchived: boolean;
        lastMessageAt: Date | null;
    }>;
    addMessage(conversationId: string, userId: string, role: string, content: string, metadata?: Prisma.InputJsonValue): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        conversationId: string;
        content: string;
        metadata: Prisma.JsonValue;
    }>;
    updateConversationTitle(id: string, userId: string, title: string): Promise<{
        success: boolean;
    }>;
    archiveConversation(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    deleteConversation(id: string, userId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=conversacionsService.d.ts.map