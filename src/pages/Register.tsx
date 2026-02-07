import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Github,
  Mail,
  Check,
  X,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Brain,
  Network,
  Bot,
  Cpu,
  User,
} from "lucide-react";
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
  {
    icon: Zap,
    title: "Automatización instantánea",
    description: "Workflows con IA que ejecutan en segundos",
  },
  {
    icon: Shield,
    title: "Seguridad empresarial",
    description: "Cifrado E2E y compliance integrado",
  },
  {
    icon: Users,
    title: "Colaboración en tiempo real",
    description: "Equipos trabajando con agentes IA",
  },
];

// Red neuronal SVG animada
function NeuralNetworkVisualization() {
  const nodes = [
    { x: 60, y: 80, delay: 0 },
    { x: 180, y: 50, delay: 0.3 },
    { x: 300, y: 100, delay: 0.6 },
    { x: 420, y: 60, delay: 0.2 },
    { x: 120, y: 180, delay: 0.9 },
    { x: 240, y: 160, delay: 1.2 },
    { x: 360, y: 190, delay: 0.4 },
    { x: 80, y: 280, delay: 0.7 },
    { x: 200, y: 260, delay: 1.0 },
    { x: 320, y: 290, delay: 0.5 },
    { x: 440, y: 270, delay: 0.8 },
    { x: 160, y: 360, delay: 1.1 },
    { x: 280, y: 380, delay: 0.3 },
    { x: 400, y: 350, delay: 0.6 },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 6],
    [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [6, 10],
    [7, 8], [8, 9], [9, 10], [7, 11], [8, 12], [9, 13],
    [10, 13], [11, 12], [12, 13],
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 500 440"
      fill="none"
      style={{ opacity: 0.45 }}
    >
      {connections.map(([from, to], i) => (
        <g key={`conn-${i}`}>
          <line
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="url(#regLineGrad)"
            strokeWidth="1"
            opacity="0.35"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.5;0.15"
              dur={`${2 + (i % 3)}s`}
              repeatCount="indefinite"
              begin={`${i * 0.12}s`}
            />
          </line>
          <circle r="2" fill="#a78bfa">
            <animateMotion
              dur={`${3 + (i % 2)}s`}
              repeatCount="indefinite"
              begin={`${i * 0.18}s`}
              path={`M${nodes[from].x},${nodes[from].y} L${nodes[to].x},${nodes[to].y}`}
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur={`${3 + (i % 2)}s`}
              repeatCount="indefinite"
              begin={`${i * 0.18}s`}
            />
          </circle>
        </g>
      ))}
      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <circle cx={node.x} cy={node.y} r="14" fill="#a78bfa" opacity="0.05">
            <animate
              attributeName="r"
              values="14;20;14"
              dur="3s"
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
          </circle>
          <circle
            cx={node.x}
            cy={node.y}
            r="8"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="1"
            opacity="0.25"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.45;0.15"
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
          </circle>
          <circle cx={node.x} cy={node.y} r="3" fill="#c4b5fd" opacity="0.8">
            <animate
              attributeName="r"
              values="2.5;4;2.5"
              dur="2s"
              repeatCount="indefinite"
              begin={`${node.delay}s`}
            />
          </circle>
        </g>
      ))}
      <defs>
        <linearGradient id="regLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 4 + Math.random() * 5,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(167, 139, 250, 0.4)`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

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

    const allRequirementsMet = passwordRequirements.every((req) =>
      req.test(password)
    );
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
        fullName: name,
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

      localStorage.setItem("token", result.data.token);
      localStorage.setItem("user", JSON.stringify(result.data.user));

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
      {/* ═══════════ Left Panel - Dark AI Showcase ═══════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo oscuro con gradientes violeta/indigo */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 80% 0%, rgba(124, 58, 237, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 100%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
              linear-gradient(180deg, #0a0a0f 0%, #0d0b1a 40%, #0f0a1e 70%, #0a0a12 100%)
            `,
          }}
        />

        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(167,139,250,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167,139,250,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Beams de luz */}
        <div
          className="absolute -top-20 right-0 w-[500px] h-[180px] rotate-[-20deg] opacity-[0.04]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.6) 50%, transparent 100%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-20 w-[400px] h-[140px] rotate-[-20deg] opacity-[0.03]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 50%, transparent 100%)`,
            filter: "blur(40px)",
          }}
        />

        {/* Red neuronal */}
        <NeuralNetworkVisualization />

        {/* Partículas */}
        <FloatingParticles />

        {/* Hexágonos isométricos */}
        <div className="absolute top-12 right-12 opacity-10">
          <svg width="100" height="116" viewBox="0 0 120 140" fill="none">
            <path
              d="M60 0 L120 35 L120 105 L60 140 L0 105 L0 35 Z"
              stroke="#a78bfa"
              strokeWidth="1"
              fill="none"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,600;600,0"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
        <div className="absolute bottom-20 left-8 opacity-[0.07]">
          <svg width="70" height="82" viewBox="0 0 120 140" fill="none">
            <path
              d="M60 0 L120 35 L120 105 L60 140 L0 105 L0 35 Z"
              stroke="#818cf8"
              strokeWidth="1"
              fill="none"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,600;600,0"
                dur="5s"
                repeatCount="indefinite"
                begin="1s"
              />
            </path>
          </svg>
        </div>

        {/* ─── Contenido ─── */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-violet-500/15 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl border border-violet-500/20">
                <Brain className="h-8 w-8 text-violet-400" />
              </div>
              <div className="absolute -inset-1 rounded-2xl border border-violet-500/15 animate-ping opacity-20" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Orion AI
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-violet-300/60 font-medium uppercase tracking-wider">
                  AI-Powered Platform
                </span>
              </div>
            </div>
          </Link>

          {/* Hero text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium border border-violet-500/20 text-violet-300">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Comienza gratis
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight animate-fade-in">
                <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                  Comienza tu viaje
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  con IA
                </span>
              </h1>
              <p
                className="text-base text-slate-400 max-w-md animate-fade-in leading-relaxed"
                style={{ animationDelay: "0.1s" }}
              >
                Crea tu cuenta y descubre el poder de la automatización
                inteligente con Orion AI.
              </p>
            </div>

            {/* Features */}
            <div
              className="space-y-3 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06] hover:bg-white/[0.06] hover:border-violet-500/20 transition-all duration-300 group cursor-default"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center shadow-lg border border-violet-500/15 group-hover:scale-105 transition-transform">
                    <feature.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white">
                      {feature.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {feature.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div
            className="flex items-center gap-3 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex -space-x-3">
              {["GZ", "MC", "JL", "AR"].map((initials, i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/25 to-indigo-500/15 border-2 border-[#0d0b1a] flex items-center justify-center text-xs font-semibold shadow-md text-violet-300"
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-white">+10,000</span>
              <span className="text-slate-500">
                {" "}
                profesionales ya confían en nosotros
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ Right Panel - Register Form (Dark) ═══════════ */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto"
        style={{
          background: `
            radial-gradient(ellipse at 80% 20%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 50%),
            linear-gradient(180deg, #09090b 0%, #0c0a14 50%, #09090b 100%)
          `,
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(167,139,250,1) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glows decorativos */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-violet-500/20 flex items-center justify-center shadow-lg shadow-violet-500/10 border border-violet-500/20">
                  <Brain className="h-8 w-8 text-violet-400" />
                </div>
                <div className="absolute -inset-0.5 rounded-2xl border border-violet-500/20 animate-ping opacity-20" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-white">Orion AI</span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    AI Platform
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Header */}
          <div
            className="text-center mb-8 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-400 rounded-full px-3 py-1 text-xs font-medium mb-4 border border-violet-500/15">
              <Sparkles className="h-3 w-3" />
              Crear cuenta gratis
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">
              Crear cuenta
            </h2>
            <p className="text-slate-500">
              Únete y potencia tus proyectos con IA
            </p>
          </div>

          {/* Social Login */}
          <div
            className="space-y-3 mb-6 animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-violet-500/30 hover:text-white transition-all duration-300"
              onClick={() => handleSocialLogin("Google")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 text-base bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-violet-500/30 hover:text-white transition-all duration-300"
              onClick={() => handleSocialLogin("GitHub")}
              disabled={isLoading}
            >
              <Github className="h-5 w-5" />
              Continuar con GitHub
            </Button>
          </div>

          {/* Divider */}
          <div
            className="relative my-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="border-t border-white/[0.06]" />
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-sm text-slate-600"
              style={{ backgroundColor: "#0a0a10" }}
            >
              o con email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: "0.25s" }}
            >
              <Label
                htmlFor="name"
                className="text-sm font-medium text-slate-400"
              >
                Nombre completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-base pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <Label
                htmlFor="email"
                className="text-sm font-medium text-slate-400"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
              </div>
            </div>

            <div
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: "0.35s" }}
            >
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-400"
              >
                Contraseña
              </Label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base pl-10 pr-12 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-600 hover:text-slate-400 hover:bg-white/[0.05]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                  {passwordRequirements.map((req, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs transition-colors",
                        req.test(password)
                          ? "text-emerald-400"
                          : "text-slate-600"
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

            <div
              className="space-y-2 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-400"
              >
                Confirmar contraseña
              </Label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={cn(
                    "h-12 text-base pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20 transition-all",
                    confirmPassword &&
                      password !== confirmPassword &&
                      "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                  )}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            <div
              className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06] animate-fade-in"
              style={{ animationDelay: "0.45s" }}
            >
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-0.5 border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-slate-500 leading-relaxed cursor-pointer"
              >
                Acepto los{" "}
                <Link
                  to="/terms"
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  términos de servicio
                </Link>{" "}
                y la{" "}
                <Link
                  to="/privacy"
                  className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  política de privacidad
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gap-2 mt-2 animate-fade-in group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
              style={{ animationDelay: "0.5s" }}
              disabled={isLoading || !acceptTerms}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creando cuenta con IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Crear cuenta gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          {/* Security note */}
          <div
            className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600 animate-fade-in"
            style={{ animationDelay: "0.53s" }}
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Protegido con cifrado de extremo a extremo
          </div>

          {/* Footer */}
          <p
            className="text-center text-slate-500 mt-6 animate-fade-in"
            style={{ animationDelay: "0.55s" }}
          >
            ¿Ya tienes una cuenta?{" "}
            <Link
              to="/login"
              className="text-violet-400 font-medium hover:text-violet-300 transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}