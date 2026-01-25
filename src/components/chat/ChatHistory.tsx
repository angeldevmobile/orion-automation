import { useState } from "react";
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

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive?: boolean;
}

interface ChatHistoryProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  activeChat: string | null;
}

const mockChatHistory: ChatSession[] = [
  {
    id: "1",
    title: "Análisis de arquitectura",
    lastMessage: "El proyecto tiene una estructura modular...",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    title: "Optimización de rendimiento",
    lastMessage: "Recomiendo implementar lazy loading...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "3",
    title: "Revisión de seguridad",
    lastMessage: "He detectado 3 vulnerabilidades...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4",
    title: "Documentación API",
    lastMessage: "La documentación generada incluye...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "5",
    title: "Migración de base de datos",
    lastMessage: "El plan de migración está listo...",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

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
  const [chats, setChats] = useState<ChatSession[]>(mockChatHistory);

  const handleDeleteChat = (id: string) => {
    setChats(chats.filter((chat) => chat.id !== id));
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
          {chats.map((chat, index) => (
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
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {chats.length} conversaciones
        </p>
      </div>
    </div>
  );
}
