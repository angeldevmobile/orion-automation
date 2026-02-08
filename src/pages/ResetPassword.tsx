import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Lock, Sparkles, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/orionApi";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Redirigir si no hay token
    useEffect(() => {
        if (!token) {
            toast({
                title: "Error",
                description: "Token inválido o no encontrado.",
                variant: "destructive",
            });
            navigate("/login");
        }
    }, [token, navigate, toast]);

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

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            if (!token) return;

            const result = await resetPassword(token, password);

            if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || "No se pudo restablecer la contraseña.",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            setIsSuccess(true);
            toast({
                title: "¡Éxito!",
                description: "Tu contraseña ha sido actualizada correctamente.",
            });

            // Redirigir al login después de unos segundos
            setTimeout(() => {
                navigate("/login");
            }, 3000);

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

    if (!token) return null;

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
                        {isSuccess ? "¡Contraseña actualizada!" : "Nueva contraseña"}
                    </CardTitle>
                    <CardDescription className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                        {isSuccess
                            ? "Ya puedes iniciar sesión con tu nueva contraseña"
                            : "Ingresa tu nueva contraseña a continuación"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isSuccess ? (
                        <div className="flex flex-col items-center gap-4 py-6 animate-scale-in">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                            <Button
                                className="mt-4 w-full"
                                onClick={() => navigate("/login")}
                            >
                                Ir a Iniciar Sesión
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
                                <Label htmlFor="password">Nueva Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10 transition-all focus:scale-[1.02]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 animate-fade-in" style={{ animationDelay: "200ms" }}>
                                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pr-10 transition-all focus:scale-[1.02]"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gap-2 animate-fade-in hover:scale-105 transition-transform"
                                style={{ animationDelay: "250ms" }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Actualizar contraseña
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>

                {!isSuccess && (
                    <CardFooter className="justify-center animate-fade-in" style={{ animationDelay: "300ms" }}>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Cancelar
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
