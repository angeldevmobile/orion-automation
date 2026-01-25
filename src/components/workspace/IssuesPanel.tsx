import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  ShieldAlert,
  Bug,
  Zap,
  Loader2,
  Play,
  ChevronRight,
  FileCode,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'bug' | 'performance' | 'code-smell';
  file: string;
  line: number;
  suggestion?: string;
}

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'SQL Injection vulnerability',
    description: 'La consulta SQL utiliza concatenación de strings directa sin sanitizar inputs',
    severity: 'critical',
    category: 'security',
    file: 'src/services/userService.ts',
    line: 45,
    suggestion: 'Usar parámetros preparados o un ORM con escape automático',
  },
  {
    id: '2',
    title: 'Dependencia desactualizada con CVE conocido',
    description: 'lodash@4.17.15 tiene vulnerabilidades de seguridad conocidas',
    severity: 'high',
    category: 'security',
    file: 'package.json',
    line: 12,
    suggestion: 'Actualizar a lodash@4.17.21 o superior',
  },
  {
    id: '3',
    title: 'Memory leak en WebSocket handler',
    description: 'Los event listeners no se remueven al desconectar el cliente',
    severity: 'high',
    category: 'bug',
    file: 'src/handlers/websocket.ts',
    line: 78,
    suggestion: 'Implementar cleanup en el evento de desconexión',
  },
  {
    id: '4',
    title: 'Query N+1 en listado de usuarios',
    description: 'Se ejecutan queries individuales para cargar relaciones en un loop',
    severity: 'medium',
    category: 'performance',
    file: 'src/controllers/userController.ts',
    line: 23,
    suggestion: 'Usar eager loading o batch queries',
  },
  {
    id: '5',
    title: 'Código duplicado detectado',
    description: 'Función de validación idéntica en 3 archivos diferentes',
    severity: 'low',
    category: 'code-smell',
    file: 'src/utils/validators.ts',
    line: 15,
    suggestion: 'Extraer a una utilidad común compartida',
  },
];

const severityConfig = {
  critical: { color: 'bg-red-500', textColor: 'text-red-500', label: 'Crítico' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-500', label: 'Alto' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-500', label: 'Medio' },
  low: { color: 'bg-blue-500', textColor: 'text-blue-500', label: 'Bajo' },
};

const categoryConfig = {
  security: { icon: ShieldAlert, label: 'Seguridad', color: 'text-red-500' },
  bug: { icon: Bug, label: 'Bug', color: 'text-orange-500' },
  performance: { icon: Zap, label: 'Rendimiento', color: 'text-yellow-500' },
  'code-smell': { icon: AlertTriangle, label: 'Code Smell', color: 'text-blue-500' },
};

export function IssuesPanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setIssues([]);
    setSelectedIssue(null);

    // Simulate scanning
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIssues(mockIssues);
    setIsScanning(false);
  };

  const filteredIssues =
    activeCategory === 'all' ? issues : issues.filter((i) => i.category === activeCategory);

  const issuesByCategory = {
    security: issues.filter((i) => i.category === 'security').length,
    bug: issues.filter((i) => i.category === 'bug').length,
    performance: issues.filter((i) => i.category === 'performance').length,
    'code-smell': issues.filter((i) => i.category === 'code-smell').length,
  };

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Detectar Problemas
          </h2>
          <p className="text-muted-foreground mt-1">
            Analiza el código en busca de vulnerabilidades, bugs y problemas de rendimiento
          </p>
        </div>
        <Button onClick={handleScan} disabled={isScanning} className="gap-2">
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Escaneando...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Iniciar escaneo
            </>
          )}
        </Button>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div>
                <p className="font-medium">Escaneando proyecto...</p>
                <p className="text-sm text-muted-foreground">Analizando archivos y dependencias</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {issues.length > 0 && !isScanning && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                activeCategory === key && 'ring-2 ring-primary'
              )}
              onClick={() => setActiveCategory(key === activeCategory ? 'all' : key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg bg-accent', config.color)}>
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{issuesByCategory[key as keyof typeof issuesByCategory]}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Issues List */}
      {issues.length > 0 && !isScanning && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issues */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Problemas encontrados ({filteredIssues.length})
                </CardTitle>
                {(criticalCount > 0 || highCount > 0) && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    {criticalCount + highCount} críticos
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-auto">
              {filteredIssues.map((issue) => {
                const CategoryIcon = categoryConfig[issue.category].icon;
                return (
                  <div
                    key={issue.id}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      selectedIssue?.id === issue.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-1.5 h-full min-h-[60px] rounded-full shrink-0',
                          severityConfig[issue.severity].color
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon
                            className={cn('h-4 w-4', categoryConfig[issue.category].color)}
                          />
                          <span className="font-medium text-sm truncate">{issue.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {severityConfig[issue.severity].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileCode className="h-3 w-3" />
                            {issue.file}:{issue.line}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Issue Details */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Detalles del problema</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedIssue ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        className={cn(
                          severityConfig[selectedIssue.severity].color,
                          'text-white'
                        )}
                      >
                        {severityConfig[selectedIssue.severity].label}
                      </Badge>
                      <Badge variant="outline">
                        {categoryConfig[selectedIssue.category].label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{selectedIssue.title}</h3>
                    <p className="text-muted-foreground mt-2">{selectedIssue.description}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-accent/50 border border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <code className="font-mono">{selectedIssue.file}</code>
                      <span className="text-muted-foreground">línea {selectedIssue.line}</span>
                    </div>
                  </div>

                  {selectedIssue.suggestion && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Sugerencia de corrección</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedIssue.suggestion}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Ver archivo
                    </Button>
                    <Button className="flex-1 gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar resuelto
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Selecciona un problema para ver los detalles
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {issues.length === 0 && !isScanning && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Sin escaneos recientes</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Ejecuta un escaneo para detectar vulnerabilidades, bugs y problemas de rendimiento en tu código
            </p>
            <Button onClick={handleScan} className="gap-2">
              <Play className="h-4 w-4" />
              Iniciar escaneo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
