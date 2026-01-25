import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Hexagon, Menu, X, MessageCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLanding = location.pathname === '/';
  
  const navLinks = [
    { to: '/dashboard', label: 'Proyectos' },
    { to: '/chat', label: 'Chat', icon: MessageCircle },
    { to: '/pricing', label: 'Planes' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg group">
          <Hexagon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.5} />
          <span>Orion AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-medium transition-all duration-200 hover:text-primary flex items-center gap-1.5",
                location.pathname === link.to
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          {isLanding ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">Crear cuenta</Link>
              </Button>
            </>
          ) : (
            <Button variant="hero" asChild>
              <Link to="/new-project">Nuevo proyecto</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            ))}
            <Link
              to="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="outline" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/register">Crear cuenta</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
