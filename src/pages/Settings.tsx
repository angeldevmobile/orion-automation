import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [language, setLanguage] = useState('es');

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Personaliza tu experiencia en Nexus AI</p>
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
                <Button variant="outline" size="sm">Cambiar</Button>
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
                <Button variant="destructive" size="sm">Eliminar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
