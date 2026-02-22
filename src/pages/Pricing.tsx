import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Users, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    price: '0',
    description: 'Para explorar y proyectos pequeños',
    icon: Zap,
    features: [
      '2 proyectos activos',
      'Análisis básico',
      'Historial de 7 días',
      '100 acciones/mes',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    variant: 'outline' as const,
    popular: false,
    priceId: null,
    highlight: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29',
    description: 'Para desarrolladores profesionales',
    icon: Sparkles,
    features: [
      'Proyectos ilimitados',
      'Análisis avanzado con IA',
      'Análisis profundo de archivos',
      'Historial ilimitado',
      'Acciones ilimitadas',
      'Generación de artefactos',
      'Memoria contextual por proyecto',
      'Exportación de análisis',
      'Soporte prioritario 24/7',
    ],
    cta: 'Comenzar prueba gratis',
    variant: 'hero' as const,
    popular: true,
    priceId: 'price_pro_monthly',
    highlight: '14 días gratis',
  },
  {
    id: 'team',
    name: 'Equipo',
    price: '79',
    description: 'Para equipos y organizaciones',
    icon: Users,
    features: [
      'Todo de Pro incluido',
      'Hasta 10 miembros del equipo',
      'Proyectos compartidos',
      'Memoria compartida entre equipo',
      'Roles y permisos personalizados',
      'SSO y autenticación avanzada',
      'Auditoría y logs completos',
      'API dedicada',
      'SLA garantizado 99.9%',
      'Gerente de cuenta dedicado',
    ],
    cta: 'Contactar ventas',
    variant: 'outline' as const,
    popular: false,
    priceId: 'price_team_monthly',
    highlight: '30 días gratis',
  },
];

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejarán en tu próxima facturación y se prorrateará el costo.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, American Express) a través de nuestro procesador de pagos seguro Stripe.'
  },
  {
    question: '¿Hay garantía de devolución?',
    answer: 'Sí, ofrecemos una garantía de devolución de 30 días sin preguntas. Si no estás satisfecho por cualquier razón, te reembolsamos el 100%.'
  },
  {
    question: '¿Los precios incluyen impuestos?',
    answer: 'Los precios mostrados no incluyen impuestos. Los impuestos aplicables (IVA, GST, etc.) se calcularán automáticamente según tu ubicación durante el checkout.'
  },
  {
    question: '¿Puedo cancelar mi suscripción?',
    answer: 'Por supuesto. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control. Seguirás teniendo acceso hasta el final de tu periodo de facturación.'
  },
  {
    question: '¿Qué incluye el periodo de prueba?',
    answer: 'Durante el periodo de prueba tendrás acceso completo a todas las características del plan. No se te cobrará nada hasta que termine la prueba.'
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();

  const handlePlanSelect = (plan: typeof plans[0]) => {
    // Si no está autenticado, hacer login demo
    if (!user) {
      loginDemo(plan.id as 'free' | 'pro' | 'team');
    }

    if (plan.id === 'free') {
      navigate('/new-project');
    } else {
      navigate(`/checkout?plan=${plan.id}&priceId=${plan.priceId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            🎉 Prueba Pro gratis por 14 días
          </Badge>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Planes basados en valor,<br />no en tokens
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que se adapte a tu flujo de trabajo. 
            Sin límites artificiales, solo productividad real.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors font-medium',
              billingCycle === 'monthly' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              'px-4 py-2 rounded-lg transition-colors font-medium relative',
              billingCycle === 'annual' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Anual
            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
              -20%
            </Badge>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billingCycle === 'annual' 
              ? (parseInt(plan.price) * 0.8 * 12).toFixed(0)
              : plan.price;
            const savings = billingCycle === 'annual' && plan.id !== 'free'
              ? (parseInt(plan.price) * 12 * 0.2).toFixed(0)
              : null;
            
            return (
              <Card 
                key={plan.id}
                className={cn(
                  'relative border-2 transition-all hover:shadow-xl',
                  plan.popular && 'border-primary shadow-2xl scale-105 md:scale-110'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-fit">
                    <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1">
                      ⭐ Más popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  
                  {plan.highlight && (
                    <Badge variant="secondary" className="mt-3">
                      {plan.highlight}
                    </Badge>
                  )}
                  
                  <div className="mt-6">
                    <span className="text-5xl font-bold">${price}</span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'annual' ? 'año' : 'mes'}
                    </span>
                  </div>
                  
                  {savings && (
                    <p className="text-sm text-green-600 dark:text-green-500 mt-2 font-medium">
                      Ahorra ${savings}/año
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant={plan.variant} 
                    className="w-full h-12 text-base font-semibold group"
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {plan.id === 'free' && (
                    <p className="text-xs text-center text-muted-foreground">
                      Sin tarjeta de crédito requerida
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            Comparación detallada de características
          </h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4 font-semibold">Característica</th>
                      <th className="text-center py-4 px-4 font-semibold">Gratis</th>
                      <th className="text-center py-4 px-4 font-semibold bg-primary/5">Pro</th>
                      <th className="text-center py-4 px-4 font-semibold">Equipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Proyectos activos', free: '2', pro: '∞ Ilimitado', team: '∞ Ilimitado' },
                      { feature: 'Análisis con IA', free: 'Básico', pro: 'Avanzado', team: 'Avanzado' },
                      { feature: 'Análisis profundo', free: '✗', pro: '✓', team: '✓' },
                      { feature: 'Memoria contextual', free: '✗', pro: '✓', team: '✓ Compartida' },
                      { feature: 'Generación de artefactos', free: '✗', pro: '✓', team: '✓' },
                      { feature: 'Historial', free: '7 días', pro: 'Ilimitado', team: 'Ilimitado' },
                      { feature: 'Acciones/mes', free: '100', pro: 'Ilimitadas', team: 'Ilimitadas' },
                      { feature: 'Miembros de equipo', free: '1', pro: '1', team: '10' },
                      { feature: 'Proyectos compartidos', free: '✗', pro: '✗', team: '✓' },
                      { feature: 'Roles y permisos', free: '✗', pro: '✗', team: '✓' },
                      { feature: 'SSO', free: '✗', pro: '✗', team: '✓' },
                      { feature: 'API dedicada', free: '✗', pro: '✗', team: '✓' },
                      { feature: 'Soporte', free: 'Email', pro: 'Prioritario 24/7', team: 'Dedicado + SLA' },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4 font-medium">{row.feature}</td>
                        <td className="py-4 px-4 text-center text-muted-foreground">{row.free}</td>
                        <td className="py-4 px-4 text-center font-semibold bg-primary/5">{row.pro}</td>
                        <td className="py-4 px-4 text-center font-semibold">{row.team}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">
            Preguntas frecuentes
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Necesitas algo personalizado?
              </h3>
              <p className="text-muted-foreground mb-6">
                Para empresas grandes, necesidades específicas o más de 10 miembros,
                contáctanos para crear un plan personalizado
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="hero" asChild>
                  <a href="mailto:sales@orion-ai.com">
                    Contactar ventas
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#" target="_blank">
                    Agendar demo
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Confiado por desarrolladores de todo el mundo
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-2xl font-bold">GitLab</div>
            <div className="text-2xl font-bold">Vercel</div>
            <div className="text-2xl font-bold">GitHub</div>
            <div className="text-2xl font-bold">Linear</div>
          </div>
        </div>
      </main>
    </div>
  );
}
