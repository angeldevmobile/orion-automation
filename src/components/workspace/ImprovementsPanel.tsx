import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  Loader2,
  Wand2,
  Zap,
  Shield,
  Code2,
  Boxes,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Improvement {
  id: string;
  title: string;
  description: string;
  category: 'architecture' | 'performance' | 'security' | 'code-quality';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  details: string[];
  codeExample?: {
    before: string;
    after: string;
  };
}

const mockImprovements: Improvement[] = [
  {
    id: '1',
    title: 'Implementar patrón Repository',
    description: 'Abstraer el acceso a datos para mejorar testabilidad y mantenibilidad',
    category: 'architecture',
    impact: 'high',
    effort: 'medium',
    details: [
      'Crear interfaces para cada repositorio',
      'Implementar repositorios concretos para cada entidad',
      'Inyectar dependencias en los servicios',
      'Facilita el testing con mocks',
    ],
    codeExample: {
      before: `// userService.ts
async function getUser(id: string) {
  return await db.query('SELECT * FROM users WHERE id = ?', [id]);
}`,
      after: `// userRepository.ts
interface IUserRepository {
  findById(id: string): Promise<User>;
}

class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}`,
    },
  },
  {
    id: '2',
    title: 'Implementar caching con Redis',
    description: 'Reducir latencia y carga en base de datos con cache distribuido',
    category: 'performance',
    impact: 'high',
    effort: 'medium',
    details: [
      'Configurar cliente Redis',
      'Implementar estrategia de cache-aside',
      'Definir TTLs apropiados por tipo de dato',
      'Invalidar cache en operaciones de escritura',
    ],
  },
  {
    id: '3',
    title: 'Agregar rate limiting',
    description: 'Proteger endpoints contra abuso y ataques DDoS',
    category: 'security',
    impact: 'high',
    effort: 'low',
    details: [
      'Implementar middleware de rate limiting',
      'Configurar límites por endpoint y usuario',
      'Usar Redis para almacenar contadores',
      'Retornar headers informativos (X-RateLimit-*)',
    ],
  },
  {
    id: '4',
    title: 'Migrar a TypeScript strict mode',
    description: 'Habilitar todas las verificaciones estrictas de TypeScript',
    category: 'code-quality',
    impact: 'medium',
    effort: 'high',
    details: [
      'Habilitar strictNullChecks',
      'Agregar tipos explícitos donde falten',
      'Resolver errores de compilación',
      'Mejorar inferencia de tipos',
    ],
  },
  {
    id: '5',
    title: 'Optimizar consultas N+1',
    description: 'Usar eager loading para reducir consultas a la base de datos',
    category: 'performance',
    impact: 'medium',
    effort: 'low',
    details: [
      'Identificar consultas N+1 con logging',
      'Implementar eager loading con JOINs',
      'Usar batch queries donde sea posible',
      'Considerar GraphQL DataLoader',
    ],
  },
];

const categoryConfig = {
  architecture: { icon: Boxes, label: 'Arquitectura', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  performance: { icon: Zap, label: 'Rendimiento', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  security: { icon: Shield, label: 'Seguridad', color: 'text-red-500', bg: 'bg-red-500/10' },
  'code-quality': { icon: Code2, label: 'Calidad', color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const impactConfig = {
  high: { label: 'Alto impacto', color: 'bg-green-500' },
  medium: { label: 'Impacto medio', color: 'bg-yellow-500' },
  low: { label: 'Bajo impacto', color: 'bg-gray-500' },
};

const effortConfig = {
  low: { label: 'Bajo esfuerzo', color: 'text-green-500' },
  medium: { label: 'Esfuerzo medio', color: 'text-yellow-500' },
  high: { label: 'Alto esfuerzo', color: 'text-red-500' },
};

export function ImprovementsPanel() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setImprovements([]);

    for (let i = 0; i <= 100; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setProgress(i);
    }

    setImprovements(mockImprovements);
    setIsAnalyzing(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            Proponer Mejoras
          </h2>
          <p className="text-muted-foreground mt-1">
            Analiza el código y obtén sugerencias inteligentes para mejorar tu proyecto
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Analizar proyecto
            </>
          )}
        </Button>
      </div>

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
              <div>
                <p className="font-medium">Analizando patrones y estructura...</p>
                <p className="text-sm text-muted-foreground">
                  Identificando oportunidades de mejora
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Category Summary */}
      {improvements.length > 0 && !isAnalyzing && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = improvements.filter((i) => i.category === key).length;
            return (
              <Card key={key} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                      <config.icon className={cn('h-5 w-5', config.color)} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Improvements List */}
      {improvements.length > 0 && !isAnalyzing && (
        <div className="space-y-4">
          {improvements.map((improvement) => {
            const CategoryIcon = categoryConfig[improvement.category].icon;
            const isExpanded = expandedId === improvement.id;
            const isSaved = savedIds.has(improvement.id);

            return (
              <Card
                key={improvement.id}
                className={cn(
                  'border-border transition-all',
                  isExpanded && 'ring-1 ring-primary'
                )}
              >
                <CardContent className="p-0">
                  {/* Header */}
                  <div
                    className="p-4 cursor-pointer flex items-start gap-4"
                    onClick={() => toggleExpand(improvement.id)}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg shrink-0',
                        categoryConfig[improvement.category].bg
                      )}
                    >
                      <CategoryIcon
                        className={cn('h-5 w-5', categoryConfig[improvement.category].color)}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{improvement.title}</h3>
                        {isSaved && (
                          <Bookmark className="h-4 w-4 text-primary fill-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{improvement.description}</p>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              impactConfig[improvement.impact].color
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            {impactConfig[improvement.impact].label}
                          </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span
                          className={cn('text-xs', effortConfig[improvement.effort].color)}
                        >
                          {effortConfig[improvement.effort].label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {categoryConfig[improvement.category].label}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-border">
                      <div className="pt-4 space-y-4">
                        {/* Steps */}
                        <div>
                          <h4 className="font-medium text-sm mb-3">Pasos de implementación</h4>
                          <div className="space-y-2">
                            {improvement.details.map((detail, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-muted-foreground">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Code Example */}
                        {improvement.codeExample && (
                          <div>
                            <h4 className="font-medium text-sm mb-3">Ejemplo de código</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                  <span className="text-red-500">●</span> Antes
                                </div>
                                <pre className="text-xs bg-accent/50 p-3 rounded-lg overflow-auto font-mono">
                                  {improvement.codeExample.before}
                                </pre>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                  <span className="text-green-500">●</span> Después
                                </div>
                                <pre className="text-xs bg-accent/50 p-3 rounded-lg overflow-auto font-mono">
                                  {improvement.codeExample.after}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ThumbsUp className="h-4 w-4" />
                              Útil
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ThumbsDown className="h-4 w-4" />
                              No aplica
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(improvement.id);
                              }}
                              className={cn(isSaved && 'border-primary text-primary')}
                            >
                              <Bookmark
                                className={cn('h-4 w-4 mr-1', isSaved && 'fill-primary')}
                              />
                              {isSaved ? 'Guardada' : 'Guardar'}
                            </Button>
                            <Button size="sm" className="gap-1">
                              Implementar
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {improvements.length === 0 && !isAnalyzing && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Descubre oportunidades de mejora</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Analiza tu proyecto para obtener sugerencias inteligentes de arquitectura,
              rendimiento, seguridad y calidad de código
            </p>
            <Button onClick={handleAnalyze} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Analizar proyecto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
