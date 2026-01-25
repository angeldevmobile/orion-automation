import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '¡Hola! 👋 Soy Nexus AI, tu asistente inteligente. Puedo ayudarte con cualquier pregunta, analizar documentos, escribir contenido, o simplemente conversar. ¿En qué puedo ayudarte hoy?',
    timestamp: new Date(),
  },
];

const sampleResponses = [
  "He analizado tu consulta. Basándome en el contexto, te recomendaría considerar las siguientes opciones...",
  "¡Excelente pregunta! Déjame explicarte paso a paso cómo funciona esto...",
  "Entiendo lo que necesitas. Aquí tienes una respuesta detallada con ejemplos prácticos...",
  "He procesado tu solicitud. Aquí está el resultado con los puntos más importantes destacados...",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Explicar algo', icon: '💡' },
    { label: 'Escribir texto', icon: '✍️' },
    { label: 'Resumir documento', icon: '📄' },
    { label: 'Generar ideas', icon: '🎯' },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Chat con Nexus AI</h2>
            <p className="text-xs text-muted-foreground">Tu asistente inteligente personal</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
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
                "p-3 max-w-[80%] shadow-sm transition-all duration-200",
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                  : 'bg-card rounded-2xl rounded-tl-sm'
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
                  <span className="text-sm">Pensando...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2 max-w-3xl mx-auto animate-fade-in">
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
      <div className="p-4 border-t border-border bg-card">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 rounded-full px-4 py-5 bg-background border-border focus-visible:ring-primary transition-all duration-200"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Nexus AI puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>
  );
}
