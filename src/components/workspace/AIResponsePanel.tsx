import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Target,
	Brain,
	AlertTriangle,
	CheckCircle2,
	AlertCircle,
	Minus,
} from "lucide-react";
import type { AnalysisResult } from "@/services/orionApi";

/* =======================
   Types
======================= */

type MetricValue = number | Record<string, number>;

interface AnalysisMetrics {
	codeQuality?: MetricValue;
	maintainability?: MetricValue;
	performance?: MetricValue;
	security?: MetricValue;
}

/* =======================
   Helpers visuales
======================= */

const getSeverityColor = (severity: string) => {
	switch (severity) {
		case "critical":
			return "bg-red-500/10 text-red-500 border-red-500/20";
		case "high":
			return "bg-orange-500/10 text-orange-500 border-orange-500/20";
		case "medium":
			return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
		case "low":
			return "bg-blue-500/10 text-blue-500 border-blue-500/20";
		default:
			return "bg-gray-500/10 text-gray-500 border-gray-500/20";
	}
};

const getSeverityIcon = (severity: string) => {
	switch (severity) {
		case "critical":
			return AlertCircle;
		case "high":
			return AlertTriangle;
		case "medium":
			return AlertCircle;
		case "low":
			return Minus;
		default:
			return Minus;
	}
};

const getMetricColor = (value: number) => {
	if (value >= 80) return "text-green-500";
	if (value >= 60) return "text-yellow-500";
	return "text-red-500";
};

/* =======================
   Helpers de normalización
======================= */

// 🔐 Normaliza severidad (NUNCA undefined)
const normalizeSeverity = (severity: unknown): string => {
	if (typeof severity !== "string") return "low";
	return severity.toLowerCase();
};

// Convierte cualquier cosa a string seguro
const toStringValue = (value: unknown): string => {
	if (value == null) return "";
	if (typeof value === "string")
		return value.replace(/\[object Object\]/gi, "N/A");
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);

	if (Array.isArray(value)) {
		return value.map(toStringValue).join("\n");
	}

	if (typeof value === "object") {
		return Object.entries(value)
			.map(([k, v]) => `${k.replace(/_/g, " ")}: ${toStringValue(v)}`)
			.join("\n");
	}

	return String(value);
};

// Convierte métricas number | object → number 0–100
const getMetricValue = (metric: unknown): number => {
	if (typeof metric === "number") return metric;

	if (typeof metric === "object" && metric !== null) {
		const values = Object.values(metric).filter(
			(v): v is number => typeof v === "number"
		);
		if (values.length === 0) return 0;
		return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
	}

	return 0;
};

const normalizeRecommendations = (recs: unknown): string[] => {
	if (!Array.isArray(recs)) return [];
	return recs.map(toStringValue).filter((r) => r.trim().length > 0);
};

/* =======================
   Component
======================= */

interface AIResponsePanelProps {
	response: AnalysisResult | null;
}

export function AIResponsePanel({ response }: AIResponsePanelProps) {
	if (!response) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">
						No hay análisis disponible
					</p>
				</CardContent>
			</Card>
		);
	}

	const metrics: AnalysisMetrics = response.metrics ?? {};

	const codeQuality = getMetricValue(metrics.codeQuality);
	const maintainability = getMetricValue(metrics.maintainability);
	const performance = getMetricValue(metrics.performance);
	const security = getMetricValue(metrics.security);

	const recommendations = normalizeRecommendations(
		response.recommendations
	);

	// Limpia el resumen: elimina asteriscos, hashes y muestra como párrafos
	const cleanSummary = (summary: string) =>
		summary
			.replace(/[*#]/g, "") // elimina asteriscos y hashes
			.split(/\r?\n/)
			.filter(line => line.trim().length > 0)
			.map(line => line.trim());

	return (
		<div className="space-y-6">
			{/* ===== Resumen ===== */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Brain className="h-4 w-4 text-primary" />
						Resumen del análisis
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					{response.summary ? (
						<div className="space-y-2">
							{cleanSummary(String(response.summary)).map((line, idx) => (
								<p key={idx}>{line}</p>
							))}
						</div>
					) : (
						"Sin resumen disponible"
					)}
				</CardContent>
			</Card>

			{/* ===== Métricas ===== */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-4 w-4 text-primary" />
						Métricas de calidad
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{[
						{ label: "Calidad de código", value: codeQuality },
						{ label: "Mantenibilidad", value: maintainability },
						{ label: "Performance", value: performance },
						{ label: "Seguridad", value: security },
					].map(({ label, value }) => (
						<div key={label}>
							<div className="flex justify-between mb-1">
								<span className="text-sm">{label}</span>
								<span
									className={`text-sm font-bold ${getMetricColor(
										value
									)}`}>
									{value}%
								</span>
							</div>
							<Progress value={value} className="h-2" />
						</div>
					))}
				</CardContent>
			</Card>

			{/* ===== Issues ===== */}
			{response.issues?.length > 0 && (
				<Card className="bg-destructive/5 border-destructive/30">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-4 w-4" />
							Problemas encontrados ({response.issues.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{response.issues.slice(0, 3).map((issue, i) => {
							const severity = normalizeSeverity(issue.severity);
							const Icon = getSeverityIcon(severity);

							return (
								<div
									key={i}
									className="p-3 border rounded-lg bg-card">
									<div className="flex gap-3">
										<Icon className="h-4 w-4 mt-1" />
										<div>
											<Badge
												className={getSeverityColor(
													severity
												)}
												variant="outline">
												{severity.toUpperCase()}
											</Badge>
											{/* Solo etiqueta, sin saltos ni markdown */}
											<Badge variant="outline" className="ml-2">
												{toStringValue(issue.description)}
											</Badge>
										</div>
									</div>
								</div>
							);
						})}
					</CardContent>
				</Card>
			)}

			{/* ===== Recomendaciones ===== */}
			{recommendations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 text-primary" />
							Recomendaciones
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{recommendations.map((rec, i) => (
								<Badge key={i} variant="outline" className="text-sm">
									{rec}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
