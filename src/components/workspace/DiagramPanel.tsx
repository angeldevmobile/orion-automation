import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Download,
  Maximize2,
  Image,
  Code2,
  Box,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  generateDiagrams,
  getProjectDiagrams,
  getIsometricDiagramImage,
  getIsometricDiagramHTML,
} from "@/services/orionApi";
import { useToast } from "@/hooks/use-toast";

interface DiagramData {
  id: string;
  type: string;
  format: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface DiagramsPanelProps {
  projectId?: string;
}

export function DiagramsPanel({ projectId }: DiagramsPanelProps) {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("isometric");
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);
  const [isometricImageUrl, setIsometricImageUrl] = useState<string | null>(null);
  const [isometricHTML, setIsometricHTML] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [d2Code, setD2Code] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  // Cargar diagramas existentes
  useEffect(() => {
    if (projectId && token) {
      loadDiagrams();
    }
  }, [projectId]);

  const loadDiagrams = async () => {
    if (!projectId || !token) return;

    try {
      const response = await getProjectDiagrams(projectId, token);
      if (response.success && response.data) {
        const diagramsData = response.data as DiagramData[];
        setDiagrams(diagramsData);

        // Separar por formato (el backend devuelve "format", no "type")
        const mermaid = diagramsData.find((d) => d.format === "mermaid" || d.type === "mermaid");
        const d2 = diagramsData.find((d) => d.format === "d2" || d.type === "d2");

        if (mermaid) setMermaidCode(mermaid.content);
        if (d2) setD2Code(d2.content);
      }

      // Cargar imagen isométrica
      const imageUrl = await getIsometricDiagramImage(projectId, token);
      if (imageUrl) setIsometricImageUrl(imageUrl);

      // Cargar HTML isométrico
      const html = await getIsometricDiagramHTML(projectId, token);
      if (html) setIsometricHTML(html);
    } catch (error) {
      console.error("Error loading diagrams:", error);
    }
  };

  const handleGenerateDiagrams = async () => {
    if (!projectId || !token) return;

    setIsGenerating(true);
    try {
      toast({
        title: "🏗️ Generando diagramas",
        description: "La IA está creando diagramas de arquitectura...",
      });

      const response = await generateDiagrams(projectId, token, "isometric");

      if (response.success) {
        toast({
          title: "✅ Diagramas generados",
          description: "Diagramas isométricos, Mermaid y D2 listos",
        });
        await loadDiagrams();
      } else {
        throw new Error(response.error || "Error generando diagramas");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudieron generar los diagramas",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!isometricImageUrl) return;

    const a = document.createElement("a");
    a.href = isometricImageUrl;
    a.download = `architecture_isometric.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Descarga iniciada",
      description: "Imagen isométrica descargada",
    });
  };

  const handleCopyCode = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(type);
      toast({ title: "Copiado", description: `Código ${type} copiado` });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo copiar",
        variant: "destructive",
      });
    }
  };

  const handleOpenMermaidLive = (code: string) => {
    const encoded = btoa(JSON.stringify({ code, mermaid: { theme: "dark" } }));
    window.open(`https://mermaid.live/edit#base64:${encoded}`, "_blank");
  };

  const hasAnyDiagram = isometricImageUrl || isometricHTML || mermaidCode || d2Code;

  return (
    <div className="space-y-6">
      {/* Header con botón de generar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            Diagramas de Arquitectura
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Diagramas isométricos 3D, Mermaid y D2 generados por IA
          </p>
        </div>
        <Button
          onClick={handleGenerateDiagrams}
          disabled={isGenerating}
          variant="default"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              {hasAnyDiagram ? (
                <RefreshCw className="h-4 w-4 mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {hasAnyDiagram ? "Regenerar" : "Generar diagramas"}
            </>
          )}
        </Button>
      </div>

      {/* Estado vacío */}
      {!hasAnyDiagram && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sin diagramas generados</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Genera diagramas de arquitectura isométricos profesionales con IA.
              Incluye vista 3D interactiva, Mermaid y D2.
            </p>
            <Button onClick={handleGenerateDiagrams} disabled={isGenerating}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generar diagramas con IA
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isGenerating && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Generando diagramas de arquitectura...
            </h3>
            <p className="text-sm text-muted-foreground">
              La IA analiza tu código y genera diagramas isométricos, Mermaid y D2.
              Esto puede tomar 30-60 segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs de diagramas */}
      {hasAnyDiagram && !isGenerating && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="isometric" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Isométrico 3D
            </TabsTrigger>
            <TabsTrigger value="mermaid" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Mermaid
            </TabsTrigger>
            <TabsTrigger value="d2" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              D2
            </TabsTrigger>
          </TabsList>

          {/* ═══════ TAB: ISOMÉTRICO ═══════ */}
          <TabsContent value="isometric" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Box className="h-5 w-5 text-primary" />
                    Diagrama Isométrico de Arquitectura
                    <Badge variant="outline" className="ml-2 text-xs">
                      Isoflow
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isometricImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadImage}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PNG
                      </Button>
                    )}
                    {isometricHTML && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsFullscreen(true)}
                      >
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Fullscreen
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Imagen PNG isométrica */}
                {isometricImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-black/90">
                    <img
                      src={isometricImageUrl}
                      alt="Isometric Architecture Diagram"
                      className="w-full h-auto min-h-[400px] object-contain"
                    />
                  </div>
                )}

                {/* HTML interactivo (iframe) */}
                {isometricHTML && !isometricImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <iframe
                      ref={iframeRef}
                      srcDoc={isometricHTML}
                      className="w-full h-[600px] border-0"
                      title="Isometric Architecture Diagram"
                      sandbox="allow-scripts"
                    />
                  </div>
                )}

                {/* Mostrar ambos si están disponibles */}
                {isometricHTML && isometricImageUrl && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullscreen(true)}
                      className="w-full"
                    >
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Abrir versión interactiva (HTML)
                    </Button>
                  </div>
                )}

                {!isometricImageUrl && !isometricHTML && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Box className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No se generó diagrama isométrico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ TAB: MERMAID ═══════ */}
          <TabsContent value="mermaid" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Code2 className="h-5 w-5 text-primary" />
                    Diagrama Mermaid
                    <Badge variant="outline" className="ml-2 text-xs">
                      2D
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {mermaidCode && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(mermaidCode, "mermaid")}
                        >
                          {copiedId === "mermaid" ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedId === "mermaid" ? "Copiado" : "Copiar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMermaidLive(mermaidCode)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Mermaid Live
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {mermaidCode ? (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px] overflow-y-auto">
                      {mermaidCode}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Code2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No se generó diagrama Mermaid</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════ TAB: D2 ═══════ */}
          <TabsContent value="d2" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Image className="h-5 w-5 text-primary" />
                    Diagrama D2
                    <Badge variant="outline" className="ml-2 text-xs">
                      Profesional
                    </Badge>
                  </CardTitle>
                  {d2Code && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(d2Code, "d2")}
                    >
                      {copiedId === "d2" ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedId === "d2" ? "Copiado" : "Copiar"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {d2Code ? (
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px] overflow-y-auto">
                      {d2Code}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No se generó diagrama D2</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog fullscreen para HTML interactivo */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              Diagrama Isométrico Interactivo
              <Badge variant="outline" className="text-xs">
                Isoflow
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {isometricHTML && (
            <iframe
              srcDoc={isometricHTML}
              className="w-full flex-1 border-0"
              style={{ height: "calc(95vh - 60px)" }}
              title="Isometric Architecture Diagram - Fullscreen"
              sandbox="allow-scripts"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}