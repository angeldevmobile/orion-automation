import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/apiConfig';

export interface StorageInfo {
  used: number;
  limit: number;
  percentage: number;
  conversationCount: number;
  maxConversations: number;
  totalMessages: number;
  isFull: boolean;
  isNearFull: boolean;
}

export interface StorageConversation {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
}

interface ApiConversation {
  id: string;
  title?: string;
  messageCount?: number;
  createdAt: string;
  updatedAt?: string;
  lastMessageAt?: string;
  projectName?: string;
  _count?: {
    messages: number;
  };
}

const MAX_CONVERSATIONS = 50;

export function useChatStorage() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    limit: MAX_CONVERSATIONS,
    percentage: 0,
    conversationCount: 0,
    maxConversations: MAX_CONVERSATIONS,
    totalMessages: 0,
    isFull: false,
    isNearFull: false,
  });
  const [conversations, setConversations] = useState<StorageConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);

  const getToken = (): string | null => localStorage.getItem('token');

  const fetchStorageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      // Fetch conversaciones y storage info en paralelo
      const [convResponse, storageResponse] = await Promise.all([
        fetch(getApiUrl(API_CONFIG.endpoints.conversations), {
          headers: getAuthHeaders(token),
        }),
        fetch(getApiUrl(API_CONFIG.endpoints.storage), {
          headers: getAuthHeaders(token),
        }),
      ]);

      // Procesar conversaciones
      if (convResponse.ok) {
        const convResult = await convResponse.json();
        if (convResult.success && convResult.data) {
          const convos: StorageConversation[] = convResult.data.map((conv: ApiConversation) => ({
            id: conv.id,
            title: conv.title || 'Sin título',
            messageCount: conv.messageCount || conv._count?.messages || 0,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt || conv.lastMessageAt || conv.createdAt,
            projectName: conv.projectName,
          }));
          setConversations(convos);
        }
      }

      // Procesar storage info del backend
      if (storageResponse.ok) {
        const storageResult = await storageResponse.json();
        if (storageResult.success && storageResult.data) {
          setStorageInfo(storageResult.data);
        }
      } else {
        // Fallback: calcular desde conversaciones locales
        const count = conversations.length;
        const percentage = Math.round((count / MAX_CONVERSATIONS) * 100);
        setStorageInfo(prev => ({
          ...prev,
          used: count,
          percentage,
          conversationCount: count,
          isFull: count >= MAX_CONVERSATIONS,
          isNearFull: percentage >= 80,
        }));
      }
    } catch (error) {
      console.error('Error fetching storage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) return false;

      const response = await fetch(
        getApiUrl(API_CONFIG.endpoints.conversationById(conversationId)),
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) throw new Error('Failed to delete conversation');

      // Actualizar estado local
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setStorageInfo(prev => {
        const newCount = Math.max(0, prev.conversationCount - 1);
        const newPercentage = Math.round((newCount / MAX_CONVERSATIONS) * 100);
        return {
          ...prev,
          used: newCount,
          percentage: newPercentage,
          conversationCount: newCount,
          isFull: false,
          isNearFull: newPercentage >= 80,
        };
      });

      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }, []);

  const deleteMultipleConversations = useCallback(async (ids: string[]): Promise<number> => {
    try {
      const token = getToken();
      if (!token) return 0;

      const response = await fetch(
        getApiUrl(API_CONFIG.endpoints.bulkDeleteConversations),
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) throw new Error('Failed to bulk delete');

      const result = await response.json();
      const deletedCount = result.data?.deletedCount || 0;

      // Actualizar estado local
      const deletedIds = new Set(ids);
      setConversations(prev => prev.filter(c => !deletedIds.has(c.id)));
      setStorageInfo(prev => {
        const newCount = Math.max(0, prev.conversationCount - deletedCount);
        const newPercentage = Math.round((newCount / MAX_CONVERSATIONS) * 100);
        return {
          ...prev,
          used: newCount,
          percentage: newPercentage,
          conversationCount: newCount,
          isFull: newCount >= MAX_CONVERSATIONS,
          isNearFull: newPercentage >= 80,
        };
      });

      return deletedCount;
    } catch (error) {
      console.error('Error bulk deleting conversations:', error);
      // Fallback: borrar uno por uno
      let deletedCount = 0;
      for (const id of ids) {
        const success = await deleteConversation(id);
        if (success) deletedCount++;
      }
      return deletedCount;
    }
  }, [deleteConversation]);

  const canCreateConversation = useCallback((): boolean => {
    return !storageInfo.isFull;
  }, [storageInfo.isFull]);

  useEffect(() => {
    fetchStorageData();
  }, [fetchStorageData]);

  return {
    storageInfo,
    conversations,
    isLoading,
    showStorageManager,
    setShowStorageManager,
    fetchStorageData,
    deleteConversation,
    deleteMultipleConversations,
    canCreateConversation,
  };
}