import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Mail, Sparkles, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword } from "@/services/orionApi"; 

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await forgotPassword(email); // <-- Llama al backend

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "No se pudo enviar el email.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      toast({
        title: "Email enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
    } catch (error) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar al servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      <Card className="w-full max-w-md relative animate-scale-in shadow-2xl border-border/50 backdrop-blur-sm">
        {/* Logo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-bounce-soft">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>

        <CardHeader className="pt-16 text-center">
          <CardTitle className="text-2xl font-bold animate-fade-in">
            {isSubmitted ? "¡Email enviado!" : "Recuperar contraseña"}
          </CardTitle>
          <CardDescription className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            {isSubmitted
              ? "Hemos enviado las instrucciones a tu email"
              : "Ingresa tu email para recibir instrucciones"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSubmitted ? (
            <div className="flex flex-col items-center gap-4 py-6 animate-scale-in">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un email a:
                </p>
                <p className="font-medium">{email}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Si no lo encuentras, revisa tu carpeta de spam.
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                <Mail className="h-4 w-4" />
                Enviar a otro email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2 animate-fade-in hover:scale-105 transition-transform"
                style={{ animationDelay: "200ms" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Enviar instrucciones
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center animate-fade-in" style={{ animationDelay: "250ms" }}>
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
