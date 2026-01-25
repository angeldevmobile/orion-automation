import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-muted-foreground">Para todos: desarrolladores, creativos y equipos</span>
          </div>

          {/* Main headline */}
          <h1 
            className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            IA que entiende tus{' '}
            <span className="text-primary">proyectos reales</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Analiza proyectos, documentos y datos. Chatea naturalmente o usa flujos guiados. 
            Produce resultados estructurados y accionables.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button variant="glow" size="xl" asChild className="group min-w-[200px]">
              <Link to="/new-project">
                Crear proyecto
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="min-w-[200px]">
              <Link to="/chat">
                <Play className="mr-2 h-5 w-5" />
                Probar chat gratis
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
