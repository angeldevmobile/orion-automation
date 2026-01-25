import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationData {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt: string;
}

interface ChatHistoryProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  activeChat: string | null;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export function ChatHistory({ onNewChat, onSelectChat, activeChat }: ChatHistoryProps) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const formatted = result.data.map((conv: ConversationData) => ({
          id: conv.id,
          title: conv.title,
          lastMessage: `${conv.messageCount} mensajes`,
          timestamp: new Date(conv.lastMessageAt || conv.createdAt),
        }));
        
        setChats(formatted);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleDeleteChat = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setChats(chats.filter((chat) => chat.id !== id));
        toast({
          title: 'Conversación eliminada',
          description: 'La conversación se eliminó correctamente',
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la conversación',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewChat} 
          className="w-full gap-2 animate-fade-in"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          Nuevo Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Cargando conversaciones...
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No hay conversaciones aún.
              <br />
              <span className="text-xs">Comienza una nueva conversación arriba 👆</span>
            </div>
          ) : (
            chats.map((chat, index) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-accent/50",
                  activeChat === chat.id && "bg-accent",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTimestamp(chat.timestamp)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {isLoading ? 'Cargando...' : `${chats.length} conversaciones`}
        </p>
      </div>
    </div>
  );
}
