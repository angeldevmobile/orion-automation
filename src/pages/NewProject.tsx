import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { StepIndicator } from "@/components/new-project/StepIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  GitBranch,
  FileText,
  Database,
  Loader2,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectTypes } from "@/lib/mock-data";
import { createProject, uploadProjectFiles, analyzeProject } from "@/services/orionApi";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { number: 1, title: "Información" },
  { number: 2, title: "Fuente" },
  { number: 3, title: "Reglas" },
  { number: 4, title: "Análisis" },
];

const typeIcons = {
  code: GitBranch,
  documents: FileText,
  data: Database,
};

export default function NewProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<string>("code");
  const [sourceType, setSourceType] = useState<string>("upload");
  const [rules, setRules] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState({
    currentChunk: 0,
    totalChunks: 0,
    status: "idle" as "idle" | "processing" | "completed" | "error",
    message: "",
  });

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // GitHub repo state
  const [repoUrl, setRepoUrl] = useState("");

  const handleNext = () => {
    // Validaciones por paso
    if (currentStep === 1 && !projectName.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nombre para el proyecto.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (sourceType === "upload" && uploadedFiles.length === 0) {
        toast({
          title: "Sin archivos",
          description: "Por favor sube al menos un archivo.",
          variant: "destructive",
        });
        return;
      }
      if (sourceType === "github" && !repoUrl.trim()) {
        toast({
          title: "Campo requerido",
          description: "Por favor ingresa la URL del repositorio.",
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const allowedExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".py",
      ".java",
      ".zip",
      ".md",
      ".txt",
      ".json",
    ];
    const validFiles = files.filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return (
        allowedExtensions.includes(extension) || file.type === "application/zip"
      );
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Archivos no válidos",
        description:
          "Algunos archivos fueron omitidos. Solo se permiten archivos de código y .zip",
        variant: "destructive",
      });
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    toast({
      title: "Archivos agregados",
      description: `${validFiles.length} archivo(s) agregado(s) correctamente.`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress({
      currentChunk: 0,
      totalChunks: 0,
      status: "processing",
      message: "Iniciando análisis...",
    });

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "No autenticado",
        description: "Por favor inicia sesión primero.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const projectData = {
      name: projectName,
      type: projectType,
      description: `Proyecto ${projectType} - ${sourceType}`,
      settings: {
        sourceType,
        rules,
        repoUrl: sourceType === "github" ? repoUrl : undefined,
        filesCount: sourceType === "upload" ? uploadedFiles.length : undefined,
      },
    };

    let eventSource: EventSource | null = null;

    try {
      // 1. Crear proyecto
      const result = await createProject(projectData, token);

      if (!result.success || !result.data?.id) {
        throw new Error("Error al crear proyecto");
      }

      setCreatedProjectId(result.data.id);

      // 2. Subir archivos si hay
      if (sourceType === "upload" && uploadedFiles.length > 0) {
        setAnalysisProgress({
          currentChunk: 0,
          totalChunks: 0,
          status: "processing",
          message: "Subiendo archivos...",
        });
        await uploadProjectFiles(result.data.id, uploadedFiles, token);
      }

      // 3. Conectar a SSE para progreso (🆕 con token en query)
      eventSource = new EventSource(
        `http://localhost:3000/api/analyses/project/${result.data.id}/analyze/progress?token=${token}`
      );

      eventSource.onmessage = (event) => {
        const progress = JSON.parse(event.data);
        setAnalysisProgress(progress);
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };

      // 4. Iniciar análisis
      toast({
        title: "🤖 Claude está trabajando",
        description: "Analizando tu código en profundidad...",
      });

      const response = await analyzeProject(result.data.id, token);

      if (eventSource) eventSource.close();

      if (response.success) {
        setAnalysisComplete(true);
        setAnalysisProgress({
          currentChunk: 0,
          totalChunks: 0,
          status: "completed",
          message: "Análisis completado",
        });
        toast({
          title: "✅ Análisis completado",
          description: "Los resultados están listos para revisar",
        });
      } else {
        throw new Error(response.error || "Error en el análisis");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      if (eventSource) eventSource.close();
      setAnalysisProgress({
        currentChunk: 0,
        totalChunks: 0,
        status: "error",
        message: "Error en el análisis",
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo completar el análisis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenProject = () => {
    if (createdProjectId) {
      navigate(`/project/${createdProjectId}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Nuevo proyecto</h1>
          <p className="text-muted-foreground">
            Configura tu proyecto paso a paso
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* 🆕 Progress Bar durante análisis */}
        {analysisProgress.status === "processing" && currentStep === 4 && (
          <Card className="mb-6 border-primary/50">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <div>
                      <p className="font-medium">Analizando proyecto</p>
                      <p className="text-sm text-muted-foreground">
                        {analysisProgress.message}
                      </p>
                    </div>
                  </div>
                  {analysisProgress.totalChunks > 0 && (
                    <span className="text-sm font-medium">
                      {analysisProgress.currentChunk}/{analysisProgress.totalChunks}
                    </span>
                  )}
                </div>
                {analysisProgress.totalChunks > 0 && (
                  <Progress
                    value={
                      (analysisProgress.currentChunk / analysisProgress.totalChunks) * 100
                    }
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {analysisProgress.status === "completed" && !isAnalyzing && currentStep === 4 && (
          <Card className="mb-6 border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">Análisis completado</p>
                  <p className="text-sm text-muted-foreground">
                    Todos los chunks procesados exitosamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisProgress.status === "error" && currentStep === 4 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Error en análisis</p>
                  <p className="text-sm text-muted-foreground">
                    {analysisProgress.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Project Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    Nombre del proyecto
                  </Label>
                  <Input
                    id="name"
                    placeholder="mi-proyecto-api"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Tipo de proyecto
                  </Label>
                  <RadioGroup
                    value={projectType}
                    onValueChange={setProjectType}
                    className="grid gap-3">
                    {projectTypes.map((type) => {
                      const Icon =
                        typeIcons[type.value as keyof typeof typeIcons];
                      return (
                        <Label
                          key={type.value}
                          htmlFor={type.value}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                            projectType === type.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}>
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Source */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    ¿Cómo quieres conectar tu proyecto?
                  </Label>
                  <RadioGroup
                    value={sourceType}
                    onValueChange={setSourceType}
                    className="grid gap-3">
                    <Label
                      htmlFor="upload"
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        sourceType === "upload"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}>
                      <RadioGroupItem value="upload" id="upload" />
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Subir archivos</div>
                        <div className="text-sm text-muted-foreground">
                          Arrastra y suelta archivos o carpetas
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="github"
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                        sourceType === "github"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}>
                      <RadioGroupItem value="github" id="github" />
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Conectar repositorio</div>
                        <div className="text-sm text-muted-foreground">
                          GitHub, GitLab o Bitbucket
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                {sourceType === "upload" && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".js,.ts,.jsx,.tsx,.py,.java,.zip,.md,.txt,.json"
                    />
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                        isDragging
                          ? "border-primary bg-primary/5 scale-105"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      )}>
                      <Upload
                        className={cn(
                          "h-10 w-10 mx-auto mb-4 transition-colors",
                          isDragging ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <p className="text-sm text-muted-foreground mb-2">
                        {isDragging
                          ? "Suelta los archivos aquí"
                          : "Arrastra archivos aquí o haz clic para seleccionar"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Soporta: .js, .ts, .jsx, .tsx, .py, .java, .zip, .md,
                        .txt, .json
                      </p>
                    </div>

                    {/* Lista de archivos subidos */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Archivos seleccionados ({uploadedFiles.length})
                        </Label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(index);
                                }}
                                className="flex-shrink-0">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {sourceType === "github" && (
                  <div>
                    <Label htmlFor="repo-url">URL del repositorio</Label>
                    <Input
                      id="repo-url"
                      placeholder="https://github.com/usuario/repositorio"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Soporta: GitHub, GitLab, Bitbucket (repositorios públicos)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Rules */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="rules" className="text-base font-medium">
                    Reglas del proyecto (opcional)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define preferencias de estilo, restricciones y objetivos que
                    la IA debe considerar.
                  </p>
                  <Textarea
                    id="rules"
                    placeholder="Ejemplo:&#10;- Usar TypeScript estricto&#10;- Seguir convenciones de nombres camelCase&#10;- Evitar dependencias pesadas&#10;- Priorizar legibilidad sobre optimización"
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Analysis */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                {!isAnalyzing && !analysisComplete && (
                  <>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Proyecto configurado
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Todo listo para iniciar el análisis inteligente con Claude.
                    </p>
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleStartAnalysis}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Iniciar análisis con IA
                    </Button>
                  </>
                )}

                {isAnalyzing && !analysisComplete && (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
                    <h3 className="text-xl font-semibold mb-2">
                      Claude está analizando...
                    </h3>
                    <p className="text-muted-foreground">
                      Esto puede tomar algunos minutos
                    </p>
                  </>
                )}

                {analysisComplete && (
                  <>
                    <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                      <Check className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      ¡Análisis completado!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Tu proyecto ha sido analizado exitosamente con IA.
                    </p>
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleOpenProject}>
                      Ver resultados
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Navigation */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button variant="hero" onClick={handleNext}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
