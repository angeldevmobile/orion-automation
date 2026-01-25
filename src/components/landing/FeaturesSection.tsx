import { 
  GitBranch, 
  FileText, 
  Database, 
  Brain, 
  Shield, 
  Zap,
  Layers,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'Comprensión de proyectos',
    description: 'Entiende la estructura completa de tu código, no solo fragmentos aislados.',
  },
  {
    icon: Layers,
    title: 'Memoria por proyecto',
    description: 'Mantiene contexto y aprende las reglas específicas de cada proyecto.',
  },
  {
    icon: Target,
    title: 'Resultados estructurados',
    description: 'Decisiones, razonamiento, riesgos y acciones claras. No texto genérico.',
  },
  {
    icon: GitBranch,
    title: 'Integración con repos',
    description: 'Conecta directamente con GitHub, GitLab o sube tus archivos.',
  },
  {
    icon: FileText,
    title: 'Generación de artefactos',
    description: 'Crea y actualiza documentación, reportes y código automáticamente.',
  },
  {
    icon: Shield,
    title: 'Detección de problemas',
    description: 'Identifica vulnerabilidades, deuda técnica y patrones problemáticos.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-card/50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">
            Una herramienta profesional, no un chat
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Diseñada para flujos de trabajo reales. Acciones primero, conversación después.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-background hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
