import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Gratis',
    price: '0',
    description: 'Para explorar y proyectos pequeños',
    features: [
      '2 proyectos activos',
      'Análisis básico',
      'Historial de 7 días',
      '100 acciones/mes',
    ],
    cta: 'Empezar gratis',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: '29',
    description: 'Para desarrolladores profesionales',
    features: [
      'Proyectos ilimitados',
      'Análisis avanzado y completo',
      'Historial ilimitado',
      'Acciones ilimitadas',
      'Generación de artefactos',
      'Memoria por proyecto',
      'Soporte prioritario',
    ],
    cta: 'Comenzar prueba',
    variant: 'hero' as const,
    popular: true,
  },
  {
    name: 'Equipo',
    price: '79',
    description: 'Para equipos y organizaciones',
    features: [
      'Todo de Pro',
      'Hasta 10 miembros',
      'Proyectos compartidos',
      'Memoria compartida',
      'Roles y permisos',
      'SSO y seguridad avanzada',
      'SLA garantizado',
    ],
    cta: 'Contactar ventas',
    variant: 'outline' as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Planes basados en valor, no en tokens
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que se adapte a tu flujo de trabajo. Sin límites artificiales.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={cn(
                'relative border-border',
                plan.popular && 'border-primary shadow-lg scale-105'
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Más popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.variant} className="w-full" asChild>
                  <Link to="/new-project">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            ¿Necesitas algo personalizado?{' '}
            <a href="#" className="text-primary hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
