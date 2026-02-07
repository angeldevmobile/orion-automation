import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  FileText,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Clock,
  Check,
  Loader2,
  XCircle,
  GitBranch,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project, ActionHistoryItem } from '@/lib/mock-data';
import type { AnalysisResult } from '@/services/orionApi';

const actions = [
  { id: 'analyze', label: 'Analizar proyecto', icon: Search, description: 'Análisis completo de estructura y código' },
  { id: 'diagrams', label: 'Diagramas de arquitectura', icon: Box, description: 'Diagramas isométricos 3D, Mermaid y D2' },
  { id: 'docs', label: 'Generar documentación', icon: FileText, description: 'Crear docs técnicos automáticamente' },
  { id: 'issues', label: 'Detectar problemas', icon: AlertTriangle, description: 'Vulnerabilidades y deuda técnica' },
  { id: 'improve', label: 'Proponer mejoras', icon: Lightbulb, description: 'Sugerencias de optimización' },
  { id: 'ask', label: 'Preguntar a la IA', icon: MessageSquare, description: 'Consulta específica sobre el proyecto' },
];

const statusIcons = {
  completed: Check,
  running: Loader2,
  failed: XCircle,
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

interface WorkspaceSidebarProps {
  project: Project;
  actionHistory: ActionHistoryItem[];
  onActionClick: (actionId: string) => void;
  activeAction: string | null;
  analysisData: AnalysisResult | null;
}

export function WorkspaceSidebar({ 
  project, 
  actionHistory, 
  onActionClick, 
  activeAction,
  analysisData 
}: WorkspaceSidebarProps) {
  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col h-[calc(100vh-4rem)]">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Project Summary */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{project.filesCount} archivos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {analysisData ? 'Analizado' : 'Listo'}
                </Badge>
                {project.issuesFound > 0 && (
                  <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                    {project.issuesFound} problemas
                  </Badge>
                )}
              </div>
              
              {/* Stats from analysis */}
              {analysisData && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Problemas:</span>
                      <span className="ml-1 font-medium text-destructive">
                        {analysisData.issues.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sugerencias:</span>
                      <span className="ml-1 font-medium text-primary">
                        {analysisData.suggestions.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Calidad:</span>
                      <span className={cn(
                        "ml-1 font-medium",
                        analysisData.metrics.codeQuality >= 80 ? "text-green-500" :
                        analysisData.metrics.codeQuality >= 60 ? "text-yellow-500" :
                        "text-red-500"
                      )}>
                        {analysisData.metrics.codeQuality}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
              Acciones
            </h3>
            <div className="space-y-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant={activeAction === action.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start h-auto py-3 px-3',
                    activeAction === action.id && 'ring-1 ring-primary'
                  )}
                  onClick={() => onActionClick(action.id)}
                >
                  <action.icon className="h-4 w-4 mr-3 shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action History */}
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
              Historial
            </h3>
            <div className="space-y-2">
              {actionHistory.map((item) => {
                const StatusIcon = statusIcons[item.status];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <StatusIcon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        item.status === 'completed' && 'text-primary',
                        item.status === 'running' && 'text-chart-1 animate-spin',
                        item.status === 'failed' && 'text-destructive'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
