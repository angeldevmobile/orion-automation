import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardInput, AcceptedCards } from '@/components/target/CardTarget';
import { 
  Lock, 
  Check, 
  ArrowLeft,
  Sparkles,
  Users,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const planDetails = {
  pro: {
    name: 'Pro',
    price: 29,
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    features: [
      'Proyectos ilimitados',
      'Análisis avanzado con IA',
      'Memoria contextual',
      'Generación de artefactos',
      'Soporte prioritario 24/7'
    ],
    trial: 14
  },
  team: {
    name: 'Equipo',
    price: 79,
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    features: [
      'Todo de Pro incluido',
      'Hasta 10 miembros',
      'Proyectos compartidos',
      'SSO y seguridad avanzada',
      'SLA garantizado'
    ],
    trial: 30
  }
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();
  const { toast } = useToast();
  
  const planId = searchParams.get('plan') as 'pro' | 'team' | null;
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState<string>('unknown');

  useEffect(() => {
    if (!planId || !planDetails[planId]) {
      navigate('/pricing');
      return;
    }

    if (!user) {
      loginDemo(planId);
    }
  }, [planId, user, navigate, loginDemo]);

  if (!planId || !planDetails[planId]) {
    return null;
  }

  const plan = planDetails[planId];
  const Icon = plan.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: '🎉 ¡Suscripción activada!',
        description: `Bienvenido al plan ${plan.name}. Tienes ${plan.trial} días de prueba gratis.`,
      });

      loginDemo(planId);
      navigate('/new-project');
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo procesar el pago. Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-6xl py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/pricing')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a planes
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Finalizar suscripción</h1>
              <p className="text-muted-foreground">
                Completa tu información de pago para activar tu plan {plan.name}
              </p>
            </div>

            <Alert className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>{plan.trial} días de prueba gratis</strong> - No se te cobrará hoy.
                Cancela en cualquier momento.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Información de pago
                  </CardTitle>
                  <CardDescription>
                    Tus datos están protegidos con encriptación SSL
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de tarjeta</Label>
                    <CardInput
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      onCardTypeChange={setCardType}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Fecha de expiración</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        placeholder="123"
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                    <Input
                      id="cardName"
                      placeholder="Juan Pérez"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                    <Lock className="h-4 w-4" />
                    <span>Procesado de forma segura por Stripe</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
                variant="hero"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Iniciar prueba gratis de {plan.trial} días
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al continuar, aceptas nuestros{' '}
                <a href="#" className="underline">términos de servicio</a> y{' '}
                <a href="#" className="underline">política de privacidad</a>
              </p>
            </form>
          </div>

          {/* Order Summary - sin cambios */}
          <div className="space-y-6">
            <Card className={cn(plan.bgColor, 'border-2')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <Icon className={cn("h-6 w-6", plan.color)} />
                  </div>
                  <div>
                    <CardTitle>Plan {plan.name}</CardTitle>
                    <CardDescription>Facturación mensual</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Plan {plan.name} (mensual)</span>
                    <span className="font-semibold">${plan.price}.00</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Prueba gratis ({plan.trial} días)</span>
                    <span className="text-green-600 font-medium">-${plan.price}.00</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total hoy</span>
                    <span className="text-2xl font-bold text-green-600">$0.00</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Después del periodo de prueba: ${plan.price}/mes
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Incluye:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold text-sm">Pago seguro</div>
                    <div className="text-xs text-muted-foreground">SSL 256-bit</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-sm">Cancela cuando quieras</div>
                    <div className="text-xs text-muted-foreground">Sin compromisos</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Garantía de devolución:</strong> Si no estás satisfecho en los
                primeros 30 días, te devolvemos el 100% de tu dinero.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    </div>
  );
}