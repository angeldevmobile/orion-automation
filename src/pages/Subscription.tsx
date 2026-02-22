import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpCircle,
  Loader2,
  ExternalLink,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/use-subscription';

export default function SubscriptionSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loginDemo } = useAuth();
  const { subscription, loading: subLoading, refetch } = useSubscription();
  
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const planDetails = {
    free: {
      name: 'Gratis',
      color: 'bg-gray-500',
      icon: Zap,
      price: '$0'
    },
    pro: {
      name: 'Pro',
      color: 'bg-blue-500',
      icon: Zap,
      price: '$29/mes'
    },
    team: {
      name: 'Equipo',
      color: 'bg-purple-500',
      icon: Zap,
      price: '$79/mes'
    }
  };

  const statusDetails = {
    active: {
      label: 'Activa',
      color: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-400',
      icon: CheckCircle
    },
    trialing: {
      label: 'Periodo de prueba',
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-400',
      icon: Zap
    },
    canceled: {
      label: 'Cancelada',
      color: 'bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-400',
      icon: AlertCircle
    },
    past_due: {
      label: 'Pago pendiente',
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      icon: AlertCircle
    }
  };

  if (subLoading || !subscription) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const currentPlan = planDetails[subscription.plan];
  const currentStatus = statusDetails[subscription.status];
  const StatusIcon = currentStatus.icon;

  const handleManageBilling = async () => {
    if (subscription.plan === 'free') {
      navigate('/pricing');
      return;
    }

    setPortalLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '🔄 Redirigiendo...',
        description: 'Te llevamos al portal de facturación'
      });

      // Aquí irá la llamada real al backend
      // const response = await api.post('/payments/create-portal-session');
      // window.location.href = response.data.url;
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo abrir el portal de facturación'
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Cambiar el plan a free
      loginDemo('free');
      
      toast({
        title: '✅ Suscripción cancelada',
        description: 'Tu plan ha sido cancelado. Tienes acceso hasta el final del periodo.',
      });
      
      setCancelDialogOpen(false);
      refetch();
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cancelar la suscripción'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setPortalLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: '✅ Suscripción reactivada',
        description: 'Tu suscripción ha sido reactivada exitosamente.',
      });
      
      refetch();
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo reactivar la suscripción'
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Suscripción y facturación</h1>
        <p className="text-muted-foreground">
          Administra tu plan, facturación y métodos de pago
        </p>
      </div>

      {/* Estado de la Suscripción */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${currentPlan.color} flex items-center justify-center`}>
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Plan {currentPlan.name}</CardTitle>
                <CardDescription>{currentPlan.price}</CardDescription>
              </div>
            </div>
            <Badge className={currentStatus.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {currentStatus.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alertas según el estado */}
          {subscription.status === 'trialing' && subscription.trialEnd && (
            <Alert className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-500" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                Tu periodo de prueba termina el {formatDate(subscription.trialEnd)}.
                No se te cobrará hasta entonces.
              </AlertDescription>
            </Alert>
          )}

          {subscription.status === 'past_due' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tu último pago falló. Por favor actualiza tu método de pago para evitar
                la suspensión del servicio.
              </AlertDescription>
            </Alert>
          )}

          {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
            <Alert className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                Tu suscripción se cancelará el {formatDate(subscription.currentPeriodEnd)}.
                Puedes reactivarla en cualquier momento.
              </AlertDescription>
            </Alert>
          )}

          {/* Información de la suscripción */}
          <div className="grid md:grid-cols-2 gap-4 pt-4">
            {subscription.status !== 'canceled' && subscription.currentPeriodEnd && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Próxima facturación</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(subscription.currentPeriodEnd)}
                  </div>
                </div>
              </div>
            )}

            {subscription.plan !== 'free' && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Método de pago</div>
                  <div className="text-sm text-muted-foreground">
                    •••• •••• •••• 4242
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-4">
            {subscription.plan === 'free' ? (
              <Button onClick={handleUpgrade} variant="hero" size="lg">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Mejorar a Pro
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  variant="outline"
                  size="lg"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Administrar facturación
                    </>
                  )}
                </Button>

                {subscription.cancelAtPeriodEnd ? (
                  <Button 
                    onClick={handleReactivateSubscription}
                    disabled={portalLoading}
                    variant="hero"
                    size="lg"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Reactivar suscripción
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setCancelDialogOpen(true)}
                    variant="outline"
                    size="lg"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar suscripción
                  </Button>
                )}
              </>
            )}

            {subscription.plan !== 'team' && subscription.plan !== 'free' && (
              <Button onClick={handleUpgrade} variant="outline" size="lg">
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Mejorar a Equipo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparación de Planes */}
      <Card>
        <CardHeader>
          <CardTitle>Comparar planes</CardTitle>
          <CardDescription>
            Ve qué incluye cada plan y encuentra el mejor para ti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Característica</th>
                  <th className="text-center py-3 px-2">Gratis</th>
                  <th className="text-center py-3 px-2 bg-primary/5">Pro</th>
                  <th className="text-center py-3 px-2">Equipo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Proyectos', free: '2', pro: 'Ilimitados', team: 'Ilimitados' },
                  { feature: 'Análisis IA', free: 'Básico', pro: 'Avanzado', team: 'Avanzado' },
                  { feature: 'Memoria', free: '✗', pro: '✓', team: '✓ Compartida' },
                  { feature: 'Miembros', free: '1', pro: '1', team: '10' },
                  { feature: 'Soporte', free: 'Email', pro: '24/7', team: 'Dedicado' },
                ].map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-3 px-2 font-medium">{row.feature}</td>
                    <td className="py-3 px-2 text-center text-sm">{row.free}</td>
                    <td className="py-3 px-2 text-center text-sm font-semibold bg-primary/5">
                      {row.pro}
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-semibold">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {subscription.plan !== 'team' && (
            <div className="mt-6 text-center">
              <Button onClick={() => navigate('/pricing')} variant="outline">
                Ver todos los detalles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facturación y uso */}
      {subscription.plan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de facturación</CardTitle>
            <CardDescription>
              Tus últimas facturas y recibos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2026-02-01', amount: '$29.00', status: 'Pagado' },
                { date: '2026-01-01', amount: '$29.00', status: 'Pagado' },
              ].map((invoice, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(invoice.date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Plan {currentPlan.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{invoice.amount}</div>
                      <Badge variant="secondary" className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={handleManageBilling}
            >
              Ver historial completo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Cancelación */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar suscripción?</DialogTitle>
            <DialogDescription>
              Lamentamos que quieras irte. Tu suscripción seguirá activa hasta el final del periodo de facturación.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                Perderás acceso a todas las características premium el {formatDate(subscription.currentPeriodEnd)}
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">Lo que perderás:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Proyectos ilimitados</li>
                <li>• Análisis avanzado con IA</li>
                <li>• Memoria contextual</li>
                <li>• Generación de artefactos</li>
                <li>• Soporte prioritario 24/7</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Mantener suscripción
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar cancelación'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}