import { Upload, Cog, Sparkles, FileCode } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Conecta tu proyecto',
    description: 'Sube archivos, conecta un repositorio o importa documentos.',
  },
  {
    icon: Cog,
    step: '02',
    title: 'Define las reglas',
    description: 'Configura estilo, restricciones y objetivos específicos.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Ejecuta acciones',
    description: 'Analiza, genera documentación, detecta problemas con un clic.',
  },
  {
    icon: FileCode,
    step: '04',
    title: 'Obtén resultados',
    description: 'Recibe decisiones estructuradas, razonamiento y artefactos.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 md:text-4xl">
            Cómo funciona
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Un flujo guiado que te lleva desde la conexión hasta resultados accionables.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px bg-border" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-4 relative">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
