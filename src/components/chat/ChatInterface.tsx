import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { MarkdownMessage } from './markdownMessage';
import { FileAttachment, type AttachedFile } from './FileAttachment';
import { StorageDisk } from './StorageDisk';
import { StorageManager } from './StorageManager';
import { StorageFullBanner } from './StorageFullBanner';
import { useChatStorage } from '@/hooks/storageHistory';
import { API_CONFIG, getApiUrl, getAuthHeaders, getAuthHeadersForUpload } from '@/config/apiConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: AttachedFile[];
}

interface ChatInterfaceProps {
  conversationId?: string | null;
  onConversationCreated?: (id: string) => void;
}

interface MessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '¡Hola! 👋 Soy Orion AI, tu asistente inteligente especializado en desarrollo de software y automatización. Puedo ayudarte con:\n\n• Análisis y optimización de código\n• Arquitectura de software\n• Debugging y resolución de problemas\n• Documentación técnica\n• Code reviews y mejores prácticas\n• Automatización de procesos\n\n¿En qué puedo ayudarte hoy?',
    timestamp: new Date(),
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
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

export function ChatInterface({ conversationId, onConversationCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [sendingFiles, setSendingFiles] = useState<AttachedFile[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    storageInfo,
    conversations: storageConversations,
    isLoading: isLoadingStorage,
    showStorageManager,
    setShowStorageManager,
    fetchStorageData,
    deleteConversation,
    deleteMultipleConversations,
    canCreateConversation,
  } = useChatStorage();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_CONFIG.endpoints.conversationById(id)), {
        headers: getAuthHeaders(token || '')
      });
      
      if (!response.ok) throw new Error('Failed to load conversation');
      
      const result = await response.json();
      
      if (result.success && result.data.messages) {
        const loadedMessages = result.data.messages.map((msg: MessageResponse) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
        }));
        
        setMessages(loadedMessages);
        setCurrentConversationId(id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la conversación',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      loadConversation(conversationId);
    } else if (!conversationId && currentConversationId && conversationId !== undefined) {
      setMessages(initialMessages);
      setCurrentConversationId(null);
    }
  }, [conversationId, currentConversationId, loadConversation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Archivo demasiado grande',
          description: `${file.name} excede el límite de 10MB`,
          variant: 'destructive',
        });
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast({
          title: 'Tipo de archivo no permitido',
          description: `${file.name} no es un tipo de archivo soportado`,
          variant: 'destructive',
        });
        return;
      }

      const fileId = Date.now().toString() + Math.random();
      let fileType: AttachedFile['type'] = 'other';
      
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type.startsWith('text/') || file.type === 'application/json') {
        fileType = 'document';
      }

      const attachedFile: AttachedFile = {
        id: fileId,
        file,
        type: fileType,
      };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachedFile.preview = e.target?.result as string;
          setAttachedFiles(prev => [...prev, attachedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles(prev => [...prev, attachedFile]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    if (!currentConversationId && !canCreateConversation()) {
      toast({
        title: 'Almacenamiento lleno',
        description: 'Has alcanzado el límite de conversaciones. Elimina algunas para continuar.',
        variant: 'destructive',
      });
      setShowStorageManager(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() || '📎 Archivo adjunto',
      timestamp: new Date(),
      attachments: attachedFiles,
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    const messageFiles = attachedFiles;
    setSendingFiles(attachedFiles);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const endpoint = currentConversationId
        ? API_CONFIG.endpoints.conversationSendMessage(currentConversationId)
        : API_CONFIG.endpoints.sendMessage;

      const formData = new FormData();
      formData.append('message', messageContent);
      
      messageFiles.forEach((attachedFile) => {
        formData.append('files', attachedFile.file);
      });

      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeadersForUpload(token || ''),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }
      if (!currentConversationId && result.data.conversationId) {
        setCurrentConversationId(result.data.conversationId);
        onConversationCreated?.(result.data.conversationId);
        // Refrescar datos de almacenamiento
        fetchStorageData();
      }

      const aiMessage: Message = {
        id: result.data.message.id,
        role: 'assistant',
        content: result.data.message.content,
        timestamp: new Date(result.data.message.createdAt),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo enviar el mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });
      
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setSendingFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Explicar código', icon: '💡' },
    { label: 'Generar función', icon: '⚡' },
    { label: 'Revisar código', icon: '🔍' },
    { label: 'Documentar API', icon: '📄' },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Chat con Orion AI</h2>
              <p className="text-xs text-muted-foreground">Tu asistente de desarrollo y automatización</p>
            </div>
          </div>
          {/* Indicador de disco compacto en el header */}
          <StorageDisk
            storageInfo={storageInfo}
            onClick={() => setShowStorageManager(true)}
            compact
          />
        </div>
      </div>

      {/* Banner de almacenamiento lleno/casi lleno */}
      <StorageFullBanner
        storageInfo={storageInfo}
        onManageStorage={() => setShowStorageManager(true)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-7xl mx-auto px-2">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-fade-in",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Avatar className={cn(
                  "h-8 w-8 shrink-0",
                  message.role === 'assistant' ? 'bg-primary/10' : 'bg-secondary'
                )}>
                  <AvatarFallback className={cn(
                    message.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                  )}>
                    {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <Card className={cn(
                  "p-4 shadow-sm transition-all duration-200",
                  "max-w-[85%] w-fit",
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                    : 'bg-card rounded-2xl rounded-tl-sm'
                )}>
                  {message.attachments && message.attachments.length > 0 && (
                    <FileAttachment 
                      files={message.attachments} 
                      onRemove={() => {}}
                    />
                  )}
                  {message.role === 'assistant' ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={cn(
                    "text-[10px] mt-2 opacity-60",
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-3 bg-card rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analizando{sendingFiles.length > 0 ? ' archivos...' : '...'}</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 max-w-7xl mx-auto animate-fade-in">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="rounded-full text-xs hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                onClick={() => setInput(action.label)}
              >
                <span className="mr-1.5">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card shrink-0">
        <div className="max-w-7xl mx-auto">
          {attachedFiles.length > 0 && (
            <FileAttachment files={attachedFiles} onRemove={handleRemoveFile} />
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(',')}
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={storageInfo.isFull && !currentConversationId 
                ? "Almacenamiento lleno — libera espacio primero" 
                : "Escribe tu mensaje..."
              }
              className="flex-1 rounded-full px-4 py-5 bg-background border-border focus-visible:ring-primary transition-all duration-200"
              disabled={isLoading || (storageInfo.isFull && !currentConversationId)}
            />
            <Button
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || (storageInfo.isFull && !currentConversationId)}
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Orion AI puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>

      {/* ✅ Modal de gestión de almacenamiento */}
      <StorageManager
        open={showStorageManager}
        onOpenChange={setShowStorageManager}
        storageInfo={storageInfo}
        conversations={storageConversations}
        isLoading={isLoadingStorage}
        onDelete={deleteConversation}
        onDeleteMultiple={deleteMultipleConversations}
        onRefresh={fetchStorageData}
        onConversationSelect={(id) => {
          loadConversation(id);
        }}
        activeConversationId={currentConversationId}
      />
    </div>
  );
}
