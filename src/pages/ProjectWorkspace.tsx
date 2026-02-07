import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { AIResponsePanel } from "@/components/workspace/AIResponsePanel";
import { DocumentationPanel } from "@/components/workspace/DocumentationPanel";
import { ImprovementsPanel } from "@/components/workspace/ImprovementsPanel";
import { IssuesPanel } from "@/components/workspace/IssuesPanel";
import { DiagramsPanel } from "@/components/workspace/DiagramPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
 DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  History,
  Download,
  Eye,
  Copy,
  Check,
  Box,
} from "lucide-react";
import { mockActionHistory } from "@/lib/mock-data";
import {
  getProjectAnalyses,
  getUserProjects,
  getAnalysisArtifacts,
  getAnalysisDecisions,
  getProjectActions,
  updateDecisionStatus,
  type Project,
  type AnalysisResult,
  type Artifact,
  type Decision,
  type ActionItem,
} from "@/services/orionApi";

interface AnalysisResponse {
  id: string;
  result: string | AnalysisResult;
}
import { useToast } from "@/hooks/use-toast";

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<string | null>("analyze");
  const [activeTab, setActiveTab] = useState("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null,
  );
  const [isArtifactDialogOpen, setIsArtifactDialogOpen] = useState(false);
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);

  // Nuevos estados para datos reales
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null,
  );

  const loadProjectData = useCallback(async () => {
    if (!id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "No autenticado",
        description: "Por favor inicia sesión",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Cargar proyecto
      const projectsResponse = await getUserProjects(token);
      if (projectsResponse.success) {
        const foundProject = projectsResponse.data.find(
          (p: Project) => p.id === id,
        );
        if (foundProject) {
          setProject(foundProject);
        } else {
          throw new Error("Proyecto no encontrado");
        }
      }

      // 2. Cargar análisis
      const analysisResponse = await getProjectAnalyses(id, token);
      if (
        analysisResponse.success &&
        analysisResponse.data &&
        analysisResponse.data.length > 0
      ) {
        const latestAnalysis = analysisResponse.data[0] as AnalysisResponse;
        const analysisId = latestAnalysis.id;
        setCurrentAnalysisId(analysisId);

        const result =
          typeof latestAnalysis.result === "string"
            ? JSON.parse(latestAnalysis.result)
            : latestAnalysis.result;
        setAnalysisData(result);

        // 3. Cargar artefactos
        const artifactsResponse = await getAnalysisArtifacts(analysisId, token);
        if (artifactsResponse.success) {
          setArtifacts(artifactsResponse.data);
        }

        // 4. Cargar decisiones
        const decisionsResponse = await getAnalysisDecisions(analysisId, token);
        if (decisionsResponse.success) {
          setDecisions(decisionsResponse.data || []);
        }
      }

      // 5. Cargar historial de acciones del proyecto
      const actionsResponse = await getProjectActions(id, token);
      if (actionsResponse.success) {
        setActions(actionsResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo cargar el proyecto",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleActionClick = (actionId: string) => {
    setActiveAction(actionId);
  };

  const handleViewArtifact = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setIsArtifactDialogOpen(true);
  };

  const handleDownloadArtifact = (artifact: Artifact) => {
    const blob = new Blob([artifact.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Descarga iniciada",
      description: `${artifact.name} se ha descargado correctamente`,
    });
  };

  const handleCopyContent = async (artifactId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedArtifactId(artifactId);
      toast({
        title: "Copiado",
        description: "Contenido copiado al portapapeles",
      });
      setTimeout(() => setCopiedArtifactId(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el contenido",
        variant: "destructive",
      });
    }
  };

  const handleDecisionStatusChange = async (
    decisionId: string,
    status: "confirmed" | "rejected",
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await updateDecisionStatus(decisionId, status, token);
    if (response.success) {
      toast({
        title: "Decisión actualizada",
        description: `La decisión ha sido ${
          status === "confirmed" ? "confirmada" : "rechazada"
        }`,
      });
      // Recargar decisiones
      if (currentAnalysisId) {
        const decisionsResponse = await getAnalysisDecisions(
          currentAnalysisId,
          token,
        );
        if (decisionsResponse.success) {
          setDecisions(decisionsResponse.data || []);
        }
      }
    } else {
      toast({
        title: "Error",
        description: "No se pudo actualizar la decisión",
        variant: "destructive",
      });
    }
  };

  const renderActionContent = () => {
    switch (activeAction) {
      case "docs":
        return (
          <ScrollArea className="h-full">
            <div className="p-6">
              <DocumentationPanel projectId={id} />
            </div>
          </ScrollArea>
        );
      case "diagrams":
        return (
          <ScrollArea className="h-full">
            <div className="p-6">
              <DiagramsPanel projectId={id} />
            </div>
          </ScrollArea>
        );
      case "issues":
        return (
          <ScrollArea className="h-full">
            <div className="p-6">
              <IssuesPanel />
            </div>
          </ScrollArea>
        );
      case "improve":
        return (
          <ScrollArea className="h-full">
            <div className="p-6">
              <ImprovementsPanel />
            </div>
          </ScrollArea>
        );
      case "analyze":
      default:
        return (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col">
            <div className="border-b border-border bg-card px-6">
              <TabsList className="h-12 bg-transparent gap-1">
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:bg-accent">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger
                  value="analysis-issues"
                  className="data-[state=active]:bg-accent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Problemas ({analysisData?.issues.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="suggestions"
                  className="data-[state=active]:bg-accent">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Sugerencias ({analysisData?.suggestions.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="recommendations"
                  className="data-[state=active]:bg-accent">
                  <Brain className="h-4 w-4 mr-2" />
                  Recomendaciones
                </TabsTrigger>
                <TabsTrigger
                  value="artifacts"
                  className="data-[state=active]:bg-accent">
                  <FileText className="h-4 w-4 mr-2" />
                  Artefactos ({artifacts.length})
                </TabsTrigger>
                <TabsTrigger
                  value="decisions"
                  className="data-[state=active]:bg-accent">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Decisiones ({decisions.length})
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-accent">
                  <History className="h-4 w-4 mr-2" />
                  Historial ({actions.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="summary" className="mt-0">
                  <AIResponsePanel response={analysisData} />
                </TabsContent>

                {/* 🔄 RENOMBRADO: issues → analysis-issues */}
                <TabsContent value="analysis-issues" className="mt-0">
                  <div className="space-y-4">
                    {!analysisData?.issues || analysisData.issues.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            ¡Excelente trabajo!
                          </h3>
                          <p className="text-muted-foreground">
                            No se encontraron problemas
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      analysisData.issues
                        .filter(issue => issue && issue.severity && issue.description)
                        .map((issue, index) => (
                          <Card key={index} className="border-destructive/30">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant="destructive"
                                      className="text-xs">
                                      {issue.severity?.toUpperCase() || 'UNKNOWN'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {issue.category || 'general'}
                                    </Badge>
                                  </div>
                                  <p className="font-medium mb-2">
                                    {issue.description}
                                  </p>
                                  {issue.location && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                      📍 {issue.location}
                                    </p>
                                  )}
                                  <div className="bg-accent/50 p-3 rounded-lg mt-3">
                                    <p className="text-xs font-medium mb-1 text-primary">
                                      💡 Sugerencia:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {issue.suggestion || 'Sin sugerencias disponibles'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="mt-0">
                  <div className="space-y-4">
                    {!analysisData?.suggestions || analysisData.suggestions.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No hay sugerencias disponibles
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      analysisData.suggestions
                        .filter(suggestion => suggestion && suggestion.description)
                        .map((suggestion, index) => (
                          <Card key={index} className="border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {suggestion.category || 'general'}
                                    </Badge>
                                    <Badge
                                      variant={
                                        suggestion.priority === "high"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs">
                                      {suggestion.priority?.toUpperCase() || 'MEDIUM'}
                                    </Badge>
                                  </div>
                                  <p className="font-medium mb-2">
                                    {suggestion.description}
                                  </p>
                                  {suggestion.estimatedImpact && (
                                    <div className="bg-primary/5 p-3 rounded-lg">
                                      <p className="text-xs font-medium mb-1">
                                        📊 Impacto estimado:
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {suggestion.estimatedImpact}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Recomendaciones de IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!analysisData?.recommendations || analysisData.recommendations.length === 0 ? (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No hay recomendaciones disponibles
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {analysisData.recommendations
                            .filter(rec => rec && typeof rec === 'string' && rec.trim())
                            .map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border">
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="artifacts" className="mt-0">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Artefactos generados por IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!artifacts || artifacts.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No hay artefactos generados
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {artifacts.map((artifact) => (
                            <div
                              key={artifact.id}
                              className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">
                                  {artifact.type === "diagram" ? (
                                    <FileText className="h-5 w-5 text-chart-1" />
                                  ) : artifact.type === "documentation" ? (
                                    <FileText className="h-5 w-5 text-primary" />
                                  ) : artifact.type === "checklist" ? (
                                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-sm font-medium">
                                      {artifact.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs">
                                      {artifact.type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {(
                                      artifact.metadata as {
                                        description?: string;
                                      }
                                    )?.description || "Sin descripción"}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        artifact.createdAt,
                                      ).toLocaleString("es-ES")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-primary/10 text-primary border-primary/20">
                                  {artifact.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewArtifact(artifact)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadArtifact(artifact)
                                  }>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="decisions" className="mt-0">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Decisiones técnicas sugeridas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!decisions || decisions.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No hay decisiones pendientes
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {decisions.map((decision) => {
                            const metadata = decision.metadata as {
                              pros?: string[];
                              cons?: string[];
                              recommendation?: string;
                              estimatedEffort?: string;
                            };

                            return (
                              <div
                                key={decision.id}
                                className="p-4 rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold">
                                      {decision.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs">
                                        {decision.category}
                                      </Badge>
                                      {decision.impact && (
                                        <Badge
                                          variant={
                                            decision.impact === "high"
                                              ? "destructive"
                                              : decision.impact === "medium"
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs">
                                          Impacto: {decision.impact}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={
                                      decision.status === "confirmed"
                                        ? "default"
                                        : decision.status === "rejected"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className={
                                      decision.status === "confirmed"
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : decision.status === "rejected"
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : "bg-muted text-muted-foreground"
                                    }>
                                    {decision.status === "confirmed"
                                      ? "Confirmada"
                                      : decision.status === "rejected"
                                      ? "Rechazada"
                                      : "Pendiente"}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4">
                                  {decision.description}
                                </p>

                                {/* Pros y Cons */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  {metadata.pros &&
                                    metadata.pros.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                        ✅ Ventajas
                                      </p>
                                      <ul className="space-y-1">
                                        {metadata.pros.map((pro, idx) => (
                                          <li
                                            key={idx}
                                            className="text-xs text-muted-foreground pl-4 relative">
                                            <span className="absolute left-0">
                                              •
                                            </span>
                                            {pro}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {metadata.cons &&
                                    metadata.cons.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                        ⚠️ Desventajas
                                      </p>
                                      <ul className="space-y-1">
                                        {metadata.cons.map((con, idx) => (
                                          <li
                                            key={idx}
                                            className="text-xs text-muted-foreground pl-4 relative">
                                            <span className="absolute left-0">
                                              •
                                            </span>
                                            {con}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>

                                {/* Esfuerzo estimado */}
                                {metadata.estimatedEffort && (
                                  <div className="bg-accent/30 p-3 rounded-lg mb-4">
                                    <p className="text-xs font-medium mb-1">
                                      ⏱️ Esfuerzo estimado:
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {metadata.estimatedEffort}
                                    </p>
                                  </div>
                                )}

                                {/* Botones de acción */}
                                {decision.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() =>
                                        handleDecisionStatusChange(
                                          decision.id,
                                          "confirmed",
                                        )
                                      }>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Confirmar decisión
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleDecisionStatusChange(
                                          decision.id,
                                          "rejected",
                                        )
                                      }>
                                      Rechazar
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Historial de acciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!actions || actions.length === 0 ? (
                        <div className="text-center py-8">
                          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No hay acciones registradas
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {actions.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                              <CheckCircle2
                                className={`h-5 w-5 shrink-0 ${
                                  item.status === "completed"
                                    ? "text-primary"
                                    : item.status === "running"
                                    ? "text-chart-1"
                                    : "text-destructive"
                                }`}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {item.description}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(item.createdAt).toLocaleString(
                                      "es-ES",
                                    )}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {item.actionType}
                                  </Badge>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                Ver
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Proyectos
            </Link>
          </Button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Proyecto no encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                El proyecto que buscas no existe o no tienes acceso
              </p>
              <Button asChild>
                <Link to="/dashboard">Volver al dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No analysis state
  if (!analysisData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Proyectos
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-semibold">{project.name}</span>
            <Badge variant="outline" className="text-xs">
              Sin análisis
            </Badge>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sin análisis disponible
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Este proyecto aún no ha sido analizado con IA
              </p>
              <Button asChild>
                <Link to="/dashboard">Volver al dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Proyectos
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="font-semibold">{project.name}</span>
          <Badge
            variant="outline"
            className="text-xs bg-primary/10 text-primary border-primary/20">
            Analizado
          </Badge>
        </div>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/project/${id}/settings`}>
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar
          project={{
            id: project.id,
            name: project.name,
            type: project.type as "code" | "documents" | "data",
            status: "ready",
            lastAnalysis: project.updatedAt,
            description: project.description || "",
            filesCount: 0,
            issuesFound: analysisData?.issues.length || 0,
          }}
          actionHistory={mockActionHistory}
          onActionClick={handleActionClick}
          activeAction={activeAction}
          analysisData={analysisData}
        />

        <main className="flex-1 overflow-hidden">{renderActionContent()}</main>
      </div>

      <Dialog
        open={isArtifactDialogOpen}
        onOpenChange={setIsArtifactDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedArtifact?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedArtifact && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Metadata */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Badge variant="outline">{selectedArtifact.type}</Badge>
                <Badge variant="outline">{selectedArtifact.status}</Badge>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyContent(
                      selectedArtifact.id,
                      selectedArtifact.content,
                    )
                  }>
                  {copiedArtifactId === selectedArtifact.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadArtifact(selectedArtifact)}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>

              {/* Contenido */}
              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-4">
                  {selectedArtifact.type === "diagram" ? (
                    // Renderizar diagrama Mermaid
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap">
                        {selectedArtifact.content}
                      </pre>
                      <div className="mt-4 p-3 bg-accent/50 rounded border border-border">
                        <p className="text-xs text-muted-foreground">
                          💡 Este diagrama usa sintaxis Mermaid. Copia el
                          contenido y pégalo en
                          <a
                            href="https://mermaid.live"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline">
                            mermaid.live
                          </a>
                          para visualizarlo.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Renderizar markdown/texto
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedArtifact.content}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
