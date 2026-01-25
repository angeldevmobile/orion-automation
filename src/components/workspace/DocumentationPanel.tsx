import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	FileText,
	FileCode,
	BookOpen,
	Download,
	Eye,
	Loader2,
	CheckCircle2,
	FolderOpen,
	Sparkles,
	AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
	generateDocumentation,
	downloadDocumentation,
	type DocumentationArtifact,
} from "@/services/orionApi";

interface DocumentOption {
	id: string;
	label: string;
	description: string;
	icon: React.ElementType;
	selected: boolean;
}

const defaultDocOptions: DocumentOption[] = [
	{
		id: "readme",
		label: "README.md",
		description: "Documentación principal del proyecto",
		icon: FileText,
		selected: true,
	},
	{
		id: "api",
		label: "API_DOCS.md",
		description: "Documentación de endpoints y servicios",
		icon: FileCode,
		selected: true,
	},
	{
		id: "architecture",
		label: "ARCHITECTURE.md",
		description: "Diagrama y explicación de arquitectura",
		icon: FolderOpen,
		selected: false,
	},
	{
		id: "contributing",
		label: "CONTRIBUTING.md",
		description: "Guía para contribuidores",
		icon: BookOpen,
		selected: false,
	},
];

interface GeneratedDoc {
	id: string;
	name: string;
	status: "pending" | "generating" | "completed" | "error";
	preview?: string;
	artifactId?: string;
}

interface DocumentationPanelProps {
	projectId: string;
}

export function DocumentationPanel({ projectId }: DocumentationPanelProps) {
	const [docOptions, setDocOptions] =
		useState<DocumentOption[]>(defaultDocOptions);
	const [isGenerating, setIsGenerating] = useState(false);
	const [progress, setProgress] = useState(0);
	const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
	const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
	const { toast } = useToast();

	const handleToggleOption = (id: string) => {
		setDocOptions((prev) =>
			prev.map((opt) =>
				opt.id === id ? { ...opt, selected: !opt.selected } : opt,
			),
		);
	};

	const handleGenerate = async () => {
		const token = localStorage.getItem("token");

		if (!token) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "No hay sesión activa",
			});
			return;
		}

		const selected = docOptions.filter((opt) => opt.selected);
		if (selected.length === 0) return;

		setIsGenerating(true);
		setProgress(0);
		setGeneratedDocs(
			selected.map((opt) => ({
				id: opt.id,
				name: opt.label,
				status: "pending",
			})),
		);

		// Simulador de progreso
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 90) return prev; // Detener en 90% hasta que termine
				return prev + 10;
			});
		}, 500);

		try {
			// Iniciar generación
			setProgress(10);

			// Actualizar estado a "generating"
			setGeneratedDocs((prev) =>
				prev.map((doc) => ({ ...doc, status: "generating" })),
			);

			setProgress(20);

			const documentTypes = selected.map((opt) => opt.id);

			setProgress(30);

			const response = await generateDocumentation(
				{
					projectId,
					documentTypes,
				},
				token,
			);

			setProgress(70);

			if (response.success && response.data) {
				const artifacts = response.data;

				setProgress(85);

				// Mapear artefactos a documentos generados
				const docs: GeneratedDoc[] = artifacts.map(
					(artifact: DocumentationArtifact) => {
						const docType = documentTypes.find((type) => {
							const docName = artifact.name.toLowerCase();
							return docName.includes(type.toLowerCase());
						});

						return {
							id: docType || artifact.id,
							name: artifact.name,
							status: "completed" as const,
							preview: artifact.content,
							artifactId: artifact.id,
						};
					},
				);

				setGeneratedDocs(docs);
				setProgress(100);

				toast({
					title: "✅ Documentación generada",
					description: `Se generaron ${artifacts.length} documento(s) exitosamente.`,
				});
			} else {
				throw new Error(response.error || "Error al generar documentación");
			}
		} catch (error: unknown) {
			console.error("Error generando documentación:", error);

			clearInterval(progressInterval);
			setProgress(0);

			setGeneratedDocs((prev) =>
				prev.map((doc) => ({
					...doc,
					status: "error",
				})),
			);

			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al generar documentación. Intenta nuevamente.";

			toast({
				variant: "destructive",
				title: "Error",
				description: errorMessage,
			});
		} finally {
			clearInterval(progressInterval);
			setIsGenerating(false);
		}
	};

	const handleDownload = async (artifactId: string, name: string, format: "md" | "pdf" = "md") => {
		const token = localStorage.getItem("token");

		if (!token) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "No hay sesión activa",
			});
			return;
		}

		try {
			// Cambia la URL para incluir el formato
			const blob = await downloadDocumentation(artifactId, token, format);

			// Crear enlace de descarga
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", format === "pdf" ? name.replace(".md", ".pdf") : name);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			toast({
				title: "Descarga exitosa",
				description: `${name} descargado correctamente.`,
			});
		} catch (error) {
			console.error("Error descargando documento:", error);
			toast({
				variant: "destructive",
				title: "❌ Error",
				description: "Error al descargar el documento",
			});
		}
	};

	const selectedCount = docOptions.filter((opt) => opt.selected).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold flex items-center gap-2">
						<Sparkles className="h-6 w-6 text-primary" />
						Generar Documentación
					</h2>
					<p className="text-muted-foreground mt-1">
						Crea documentación técnica automáticamente basada en el análisis del
						código
					</p>
				</div>
				<Button
					onClick={handleGenerate}
					disabled={isGenerating || selectedCount === 0}
					className="gap-2">
					{isGenerating ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Generando...
						</>
					) : (
						<>
							<FileText className="h-4 w-4" />
							Generar ({selectedCount})
						</>
					)}
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Document Selection */}
				<Card className="border-border">
					<CardHeader>
						<CardTitle className="text-base">
							Selecciona los documentos
						</CardTitle>
						<CardDescription>
							Elige qué documentación quieres generar para tu proyecto
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{docOptions.map((option) => (
							<div
								key={option.id}
								className={cn(
									"flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer",
									option.selected
										? "border-primary/50 bg-primary/5"
										: "border-border hover:border-muted-foreground/30",
								)}
								onClick={() => handleToggleOption(option.id)}>
								<Checkbox
									checked={option.selected}
									onCheckedChange={() => handleToggleOption(option.id)}
									className="mt-0.5"
								/>
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<option.icon className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-sm">{option.label}</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{option.description}
									</p>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				{/* Generation Progress / Results */}
				<Card className="border-border">
					<CardHeader>
						<CardTitle className="text-base">Documentos generados</CardTitle>
						<CardDescription>
							{generatedDocs.length === 0
								? "Los documentos aparecerán aquí después de generarlos"
								: `${
										generatedDocs.filter((d) => d.status === "completed").length
								  } de ${generatedDocs.length} completados`}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isGenerating && (
							<div className="mb-4">
								<div className="flex items-center justify-between text-sm mb-2">
									<span className="text-muted-foreground">
										Generando con IA...
									</span>
									<span className="font-medium">{Math.round(progress)}%</span>
								</div>
								<Progress value={progress} className="h-2" />
							</div>
						)}

						{generatedDocs.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
								<p className="text-muted-foreground text-sm">
									Selecciona documentos y haz clic en "Generar"
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{generatedDocs.map((doc) => (
									<div
										key={doc.id}
										className={cn(
											"flex items-center justify-between p-3 rounded-lg border transition-all",
											doc.status === "completed"
												? "border-primary/30 bg-primary/5"
												: doc.status === "error"
												? "border-destructive/30 bg-destructive/5"
												: "border-border",
										)}>
										<div className="flex items-center gap-3">
											{doc.status === "pending" && (
												<div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
											)}
											{doc.status === "generating" && (
												<Loader2 className="h-5 w-5 text-primary animate-spin" />
											)}
											{doc.status === "completed" && (
												<CheckCircle2 className="h-5 w-5 text-primary" />
											)}
											{doc.status === "error" && (
												<AlertCircle className="h-5 w-5 text-destructive" />
											)}
											<span className="font-mono text-sm">{doc.name}</span>
										</div>
										{doc.status === "completed" && (
											<div className="flex items-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setSelectedPreview(
															doc.id === selectedPreview ? null : doc.id,
														)
													}>
													<Eye className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDownload(doc.artifactId!, doc.name, "md")
													}>
													<Download className="h-4 w-4" />
													<span className="ml-1 text-xs">MD</span>
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleDownload(doc.artifactId!, doc.name, "pdf")
													}>
													<Download className="h-4 w-4" />
													<span className="ml-1 text-xs">PDF</span>
												</Button>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Preview Panel */}
			{selectedPreview && (
				<Card className="border-border">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-base flex items-center gap-2">
								<Eye className="h-4 w-4" />
								Vista previa:{" "}
								{generatedDocs.find((d) => d.id === selectedPreview)?.name}
							</CardTitle>
							<Badge variant="outline">Markdown</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<ScrollArea className="h-96">
							<pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-accent/30 p-4 rounded-lg">
								{generatedDocs.find((d) => d.id === selectedPreview)?.preview}
							</pre>
						</ScrollArea>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
