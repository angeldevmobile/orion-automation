import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl text-secondary-foreground">
            Empieza a trabajar con IA que entiende
          </h2>
          <p className="text-secondary-foreground/80 text-lg mb-8">
            Crea tu primer proyecto en minutos. Sin configuración compleja.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/new-project">
              Crear proyecto gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
