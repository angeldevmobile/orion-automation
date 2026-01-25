import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Chat() {
  const [activeChat, setActiveChat] = useState<string | null>("1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setActiveChat(null);
    setChatKey(prev => prev + 1);
  };

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setChatKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex w-full overflow-hidden">
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="fixed top-20 left-4 z-50 bg-card shadow-lg border border-border"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <ChatHistory 
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                activeChat={activeChat}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden lg:flex transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-72" : "w-0"
        )}>
          {sidebarOpen && (
            <div className="w-72 animate-fade-in">
              <ChatHistory 
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                activeChat={activeChat}
              />
            </div>
          )}
        </div>

        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute left-72 top-20 z-50 h-8 w-8 rounded-full bg-card shadow-md border border-border transition-all duration-300"
          style={{ left: sidebarOpen ? '17rem' : '0.5rem' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Chat Interface */}
        <div className="flex-1 w-full">
          <ChatInterface key={chatKey} />
        </div>
      </main>
    </div>
  );
}
