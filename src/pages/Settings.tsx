import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/theme/ThemeProvider';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Palette,
  Shield,
  Download,
  Trash2,
  User,
  KeyRound,
  Sparkles,
  Check,
  X,
  CreditCard,
  ArrowUpCircle,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { deleteAccount, changePassword } from '@/services/orionApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/use-subscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [language, setLanguage] = useState('es');

  // Change Password State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
  }

  const passwordRequirements: PasswordRequirement[] = [
    { label: "Al menos 8 caracteres", test: (p) => p.length >= 8 },
    { label: "Una letra mayúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Una letra minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Un número", test: (p) => /[0-9]/.test(p) },
  ];

  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('token');

  const handleDeleteAccount = async () => {
    if (!token) return;

    try {
      const result = await deleteAccount(token);

      if (result.success) {
        toast({
          title: "Cuenta eliminada",
          description: "Tu cuenta ha sido eliminada permanentemente.",
        });
        localStorage.clear();
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar la cuenta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    const allRequirementsMet = passwordRequirements.every((req) =>
      req.test(newPassword)
    );
    if (!allRequirementsMet) {
      toast({
        title: "Contraseña débil",
        description: "La contraseña nueva debe cumplir todos los requisitos.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Error",
        description: "La nueva contraseña no puede ser igual a la actual.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword({ currentPassword, newPassword }, token);

      if (result.success) {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada exitosamente. Por favor inicia sesión nuevamente.",
        });
        setIsChangePasswordOpen(false);
        localStorage.clear();
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo actualizar la contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  const planLabels: Record<string, string> = {
    free: 'Gratis',
    pro: 'Pro',
    team: 'Equipo'
  };

  const planColors: Record<string, string> = {
    free: 'bg-gray-500',
    pro: 'bg-blue-500',
    team: 'bg-purple-500'
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Personaliza tu experiencia en Orion AI</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Apariencia
              </CardTitle>
              <CardDescription>Personaliza el aspecto visual de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Tema</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          theme === option.value
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <Icon className={cn(
                          "h-6 w-6 transition-colors",
                          theme === option.value ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          theme === option.value ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Animaciones
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar transiciones y animaciones suaves
                  </p>
                </div>
                <Switch
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificaciones
              </CardTitle>
              <CardDescription>Controla cómo y cuándo recibes alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir alertas en el navegador
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Notificaciones por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir resúmenes y actualizaciones por correo
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Idioma y región
              </CardTitle>
              <CardDescription>Configura tu idioma y preferencias regionales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Idioma de la interfaz</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="pt">🇧🇷 Português</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscription - NUEVA SECCIÓN */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Suscripción y facturación
              </CardTitle>
              <CardDescription>Gestiona tu plan y métodos de pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan actual */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", subscription?.plan ? planColors[subscription.plan] : 'bg-gray-500')}>
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Plan {subscription?.plan ? planLabels[subscription.plan] : 'Gratis'}</p>
                      {subscription?.status === 'trialing' && (
                        <Badge variant="secondary" className="text-xs">
                          Periodo de prueba
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.plan === 'free' ? 'Plan gratuito' : 
                       subscription?.status === 'trialing' && subscription?.trialEnd ? 
                       `Prueba hasta el ${formatDate(subscription.trialEnd)}` :
                       subscription?.currentPeriodEnd ?
                       `Renovación el ${formatDate(subscription.currentPeriodEnd)}` :
                       'Plan activo'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/settings/subscription')}
                >
                  Ver detalles
                </Button>
              </div>

              {/* Próxima facturación */}
              {subscription?.plan !== 'free' && subscription?.currentPeriodEnd && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Próxima facturación</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${subscription.plan === 'pro' ? '29' : '79'}.00
                      </p>
                      <p className="text-xs text-muted-foreground">por mes</p>
                    </div>
                  </div>
                </>
              )}

              {/* Upgrade button si es free */}
              {subscription?.plan === 'free' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <ArrowUpCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Mejora tu plan</p>
                        <p className="text-sm text-muted-foreground">
                          Accede a funciones premium y análisis avanzados
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={() => navigate('/pricing')}
                    >
                      Mejorar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account & Security */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Cuenta y seguridad
              </CardTitle>
              <CardDescription>Gestiona tu cuenta y opciones de seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Perfil de usuario</p>
                    <p className="text-sm text-muted-foreground">Edita tu información personal</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contraseña</p>
                    <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Cambiar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña para actualizarla.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña actual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        {newPassword && (
                          <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-muted/30 rounded-lg border">
                            {passwordRequirements.map((req, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center gap-2 text-xs transition-colors",
                                  req.test(newPassword)
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
                                )}
                              >
                                {req.test(newPassword) ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                                {req.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Actualizando..." : "Actualizar contraseña"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Data */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Datos
              </CardTitle>
              <CardDescription>Exporta o elimina tus datos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Exportar datos</p>
                    <p className="text-sm text-muted-foreground">Descarga una copia de tus proyectos y conversaciones</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Exportar</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Eliminar cuenta</p>
                    <p className="text-sm text-muted-foreground">Esta acción es irreversible</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Eliminar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente tu cuenta
                        y removerá todos tus datos de nuestros servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Sí, eliminar cuenta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
