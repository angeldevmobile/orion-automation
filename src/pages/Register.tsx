import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Sparkles, Github, Mail, Check, X, ArrowRight, Zap, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { register } from "@/services/orionApi";

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

const features = [
  { icon: Zap, title: "Rápido y potente", description: "IA que procesa en segundos" },
  { icon: Shield, title: "100% Seguro", description: "Tus datos están protegidos" },
  { icon: Users, title: "Colaborativo", description: "Trabaja en equipo fácilmente" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones.",
        variant: "destructive",
      });
      return;
    }

    // Validar requisitos de contraseña
    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    if (!allRequirementsMet) {
      toast({
        title: "Contraseña débil",
        description: "La contraseña debe cumplir todos los requisitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ 
        email, 
        password, 
        fullName: name 
      });

      if (!result.success || !result.data?.token) {
        toast({
          title: "Error al registrar",
          description: result.error || "No se pudo crear la cuenta.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Guarda el token y usuario en localStorage
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
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
      title: `Registro con ${provider}`,
      description: "Funcionalidad próximamente disponible.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary to-primary/80 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl animate-bounce-soft" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-primary-foreground/5 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: "0.5s" }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary-foreground/30 rounded-full animate-bounce-soft"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary-foreground/10">
              <Sparkles className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">Orion AI</span>
          </Link>
          
          {/* Hero text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight animate-fade-in">
                Comienza tu viaje con inteligencia artificial
              </h1>
              <p className="text-xl text-primary-foreground/80 max-w-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
                Crea tu cuenta gratis y descubre el poder de Orion AI.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 hover:bg-primary-foreground/15 transition-all hover:translate-x-2"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shadow-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{feature.title}</div>
                    <div className="text-sm text-primary-foreground/70">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom badge */}
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex -space-x-3">
              {["GZ", "MC", "JL", "AR"].map((initials, i) => (
                <div 
                  key={i}
                  className="h-10 w-10 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center text-xs font-semibold shadow-md"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold">+10,000</span>
              <span className="text-primary-foreground/70"> profesionales ya confían en nosotros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative overflow-y-auto">
        {/* Background decoration for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Orion AI</span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-3xl font-bold mb-2">Crear cuenta</h2>
            <p className="text-muted-foreground">
              Únete y potencia tus proyectos con IA
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
            >
              <Mail className="h-5 w-5" />
              Continuar con Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base"
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
              <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-base bg-accent/30 border-border/50 focus:border-primary focus:bg-background transition-all"
              />
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
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
              
              {/* Password requirements */}
              {password && (
                <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-accent/30 rounded-lg">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        req.test(password) ? "text-green-500" : "text-muted-foreground"
                      )}
                    >
                      {req.test(password) ? (
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

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={cn(
                  "h-12 text-base bg-accent/30 border-border/50 focus:border-primary focus:bg-background transition-all",
                  confirmPassword && password !== confirmPassword && "border-destructive focus:border-destructive"
                )}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg animate-fade-in" style={{ animationDelay: "0.45s" }}>
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Acepto los{" "}
                <Link to="/terms" className="text-primary hover:underline font-medium">
                  términos de servicio
                </Link>{" "}
                y la{" "}
                <Link to="/privacy" className="text-primary hover:underline font-medium">
                  política de privacidad
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gap-2 mt-2 animate-fade-in group"
              style={{ animationDelay: "0.5s" }}
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.55s" }}>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}