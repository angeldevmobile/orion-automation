import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Sparkles, Github, Mail, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/orionApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (!result.success || !result.data?.token) {
        toast({
          title: "Error de autenticación",
          description: result.error || "Credenciales incorrectas.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Guarda el token y usuario en localStorage
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });

      setIsLoading(false);
      navigate("/dashboard");
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar al servidor.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: `Login con ${provider}`,
      description: "Funcionalidad próximamente disponible.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-foreground/10 rounded-full blur-2xl animate-bounce-soft" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">Orion AI</span>
          </Link>
          
          {/* Hero text */}
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight animate-fade-in">
              Potencia tu trabajo con inteligencia artificial
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Únete a miles de profesionales que ya están automatizando sus flujos de trabajo.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 pt-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-primary-foreground/70">Usuarios activos</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">500K+</div>
                <div className="text-sm text-primary-foreground/70">Proyectos creados</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm text-primary-foreground/70">Uptime</div>
              </div>
            </div>
          </div>
          
          {/* Testimonial */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-primary-foreground/10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <p className="text-primary-foreground/90 italic mb-4 text-lg">
              "Orion AI transformó completamente la forma en que gestionamos nuestros proyectos. Es increíblemente intuitivo."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold text-lg shadow-md">
                GZ
              </div>
              <div>
                <div className="font-semibold text-lg">Gabriel Zapata</div>
                <div className="text-sm text-primary-foreground/70">CEO, Orion AI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        </div>

        <div className="w-full max-w-md relative">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Orion AI</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h2>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base hover:bg-accent/50 hover:border-primary/50 transition-all"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
            >
              <Mail className="h-5 w-5" />
              Continuar con Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base hover:bg-accent/50 hover:border-primary/50 transition-all"
              onClick={() => handleSocialLogin("GitHub")}
              disabled={isLoading}
            >
              <Github className="h-5 w-5" />
              Continuar con GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
              o con email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base bg-accent/30 border-border/50 focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base pr-12 bg-accent/30 border-border/50 focus:border-primary focus:bg-background transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-accent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gap-2 mt-2 animate-fade-in group"
              style={{ animationDelay: "0.35s" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Crear cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
