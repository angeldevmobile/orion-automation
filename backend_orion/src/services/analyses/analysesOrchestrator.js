import { prisma } from '../../config/database.js';
import { CodeScannerService } from './codeScanner.js';
import { CodeIndexService } from './codeIndexService.js';
import { GPTService } from '../gptService.js';
import { ClaudeService } from './dimensionAnalyses.js';
import { DeepCodeAnalysisService } from './deepCodeAnalysis.js';
import { EventEmitter } from 'events';
export const orchestratorEmitter = new EventEmitter();
export class AnalysisOrchestratorService {
    scanner = new CodeScannerService();
    indexService = new CodeIndexService();
    gpt = new GPTService();
    claude = new ClaudeService();
    deepAnalysis = new DeepCodeAnalysisService();
    emitProgress(projectId, status, message, progress, suggestedFiles) {
        orchestratorEmitter.emit('progress', {
            projectId,
            status,
            message,
            progress,
            suggestedFiles
        });
    }
    async analyzeProject(projectId, userId, deepFiles) {
        const startTime = Date.now();
        try {
            const project = await prisma.project.findFirst({
                where: { id: projectId, userId },
                include: { projectSources: { where: { sourceType: 'file' } } }
            });
            if (!project)
                throw new Error('Project not found');
            this.emitProgress(projectId, 'queued', 'Análisis iniciado', 0);
            // 1. Escanear código
            this.emitProgress(projectId, 'scanning', 'Escaneando archivos...', 10);
            const codeIndex = await this.scanner.scanProject(project.projectSources);
            // 2. Guardar índice
            this.emitProgress(projectId, 'indexing', 'Indexando estructura...', 20);
            await this.indexService.save(projectId, codeIndex);
            // 3. GPT: Análisis estructural rápido
            this.emitProgress(projectId, 'gpt_structural', 'Analizando estructura con GPT...', 30);
            const [structuralAnalysis, ...dimensionAnalyses] = await Promise.all([
                this.gpt.analyzeStructure(codeIndex),
                this.gpt.analyzeDimension(codeIndex, 'architecture'),
                this.gpt.analyzeDimension(codeIndex, 'security'),
                this.gpt.analyzeDimension(codeIndex, 'performance'),
                this.gpt.analyzeDimension(codeIndex, 'quality')
            ]);
            const [architecture, security, performance, quality] = dimensionAnalyses;
            const suggestedFilePaths = structuralAnalysis.suggestedFiles.map(f => f.path);
            this.emitProgress(projectId, 'claude_dimensions', `GPT sugiere ${suggestedFilePaths.length} archivos para análisis profundo`, 60, suggestedFilePaths);
            // 4. Análisis profundo (OPCIONAL)
            let deepResults = [];
            if (deepFiles && deepFiles.length > 0) {
                this.emitProgress(projectId, 'analyzing_deep', `Claude analizando ${deepFiles.length} archivos en profundidad...`, 70);
                try {
                    const deepAnalysisResults = await this.deepAnalysis.analyzeFiles(deepFiles);
                    deepResults = deepAnalysisResults.map(result => ({
                        file: result.file,
                        issues: result.issues.map(issue => ({
                            severity: issue.severity,
                            category: issue.category,
                            description: `[${result.file}${issue.line ? `:${issue.line}` : ''}] ${issue.description}`,
                            location: issue.line ? `${result.file}:${issue.line}` : result.file,
                            suggestion: issue.suggestion
                        }))
                    }));
                    console.log(`Claude - Análisis profundo: ${deepResults.reduce((sum, r) => sum + r.issues.length, 0)} issues`);
                }
                catch (error) {
                    console.error('Error en análisis profundo (continuando):', error);
                }
            }
            this.emitProgress(projectId, 'merging', 'Consolidando resultados...', 90);
            // 5. Merge de resultados
            const allIssues = [
                ...architecture.issues
                    .filter(issue => issue.description && issue.description.trim())
                    .map(issue => ({ ...issue, category: 'architecture' })),
                ...security.issues
                    .filter(issue => issue.description && issue.description.trim())
                    .map(issue => ({ ...issue, category: 'security' })),
                ...performance.issues
                    .filter(issue => issue.description && issue.description.trim())
                    .map(issue => ({ ...issue, category: 'performance' })),
                ...quality.issues
                    .filter(issue => issue.description && issue.description.trim())
                    .map(issue => ({ ...issue, category: 'quality' })),
                ...deepResults.flatMap(r => r.issues)
            ].sort((a, b) => {
                const order = { critical: 4, high: 3, medium: 2, low: 1 };
                return order[b.severity] - order[a.severity];
            });
            const mergedResult = {
                summary: this.buildSummary(codeIndex, structuralAnalysis, [architecture, security, performance, quality], deepResults),
                issues: allIssues,
                suggestions: structuralAnalysis.suggestedFiles.map(file => ({
                    category: 'deep_analysis',
                    description: `Analizar ${file.path}: ${file.reason}`,
                    priority: file.priority,
                    estimatedImpact: 'Análisis profundo recomendado'
                })),
                metrics: {
                    codeQuality: quality.score,
                    maintainability: architecture.score,
                    performance: performance.score,
                    security: security.score
                },
                recommendations: [
                    ...architecture.recommendations,
                    ...security.recommendations,
                    ...performance.recommendations,
                    ...quality.recommendations
                ].filter(rec => rec && typeof rec === 'string' && rec.trim()),
                artifacts: this.generateArtifacts(codeIndex, [architecture, security, performance, quality]),
                decisions: this.generateDecisions(allIssues)
            };
            this.emitProgress(projectId, 'completed', 'Análisis completado', 100);
            const durationMs = Date.now() - startTime;
            console.log(`Hybrid analysis completed in ${durationMs}ms (GPT + ${deepFiles?.length || 0} files with Claude)`);
            return mergedResult;
        }
        catch (error) {
            this.emitProgress(projectId, 'error', `Error: ${error}`, 0);
            throw error;
        }
    }
    buildSummary(index, structural, analyses, deepResults) {
        const deepIssuesCount = deepResults.reduce((sum, r) => sum + r.issues.length, 0);
        return `## Análisis Híbrido Completado

**Entendimiento del Proyecto (GPT):**
${structural.understanding}

**Tipo:** ${structural.projectType}  
**Stack:** ${structural.techStack.join(', ')}  
**Complejidad:** ${structural.complexity}

**Métricas:**
- Archivos: ${index.stats.totalFiles}
- Líneas: ${index.stats.totalLines}

**Scores (GPT):**
${analyses.map(a => `- ${a.dimension}: ${a.score}/100`).join('\n')}

**Issues encontrados:** ${analyses.reduce((sum, a) => sum + a.issues.length, 0) + deepIssuesCount}
${deepResults.length > 0 ? `  - Análisis profundo (Claude): ${deepIssuesCount} issues en ${deepResults.length} archivos` : ''}

**Recomendaciones:** ${analyses.reduce((sum, a) => sum + a.recommendations.length, 0)}`;
    }
    /**
     * Genera artefactos basados en el análisis
     */
    generateArtifacts(index, analyses) {
        const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);
        if (totalIssues < 3) {
            return [];
        }
        const artifacts = [];
        // Artefacto 1: Checklist
        const checklist = `# Checklist de Mejoras

## Prioridad Crítica
${analyses.flatMap(a => a.issues.filter(i => i.severity === 'critical')
            .map(i => `- [ ] **[${a.dimension}]** ${i.description}`)).join('\n') || '- No hay issues críticos'}

## Prioridad Alta
${analyses.flatMap(a => a.issues.filter(i => i.severity === 'high')
            .map(i => `- [ ] **[${a.dimension}]** ${i.description}`)).slice(0, 10).join('\n') || '- No hay issues de alta prioridad'}

## Recomendaciones Generales
${analyses.flatMap(a => a.recommendations.map(r => `- [ ] ${r}`)).slice(0, 10).join('\n')}

---
**Total de tareas:** ${totalIssues + analyses.reduce((sum, a) => sum + a.recommendations.length, 0)}
`;
        artifacts.push({
            name: 'checklist-mejoras.md',
            type: 'checklist',
            description: 'Lista de tareas prioritarias para mejorar el proyecto',
            content: checklist
        });
        // Artefacto 2: Plan de acción
        const plan = `# Plan de Acción - Mejoras del Proyecto

## Resumen Ejecutivo
- **Archivos analizados:** ${index.stats.totalFiles}
- **Líneas de código:** ${index.stats.totalLines.toLocaleString()}
- **Issues críticos:** ${analyses.flatMap(a => a.issues).filter(i => i.severity === 'critical').length}
- **Issues de alta prioridad:** ${analyses.flatMap(a => a.issues).filter(i => i.severity === 'high').length}

## Métricas de Calidad
${analyses.map(a => `- **${a.dimension}:** ${a.score}/100`).join('\n')}

## Fase 1: Crítico (Implementar inmediatamente)
${analyses.flatMap(a => a.issues.filter(i => i.severity === 'critical')
            .map(i => `
### ${i.description.split(':')[0] || i.description.slice(0, 50)}
- **Dimensión:** ${a.dimension}
- **Problema:** ${i.description}
- **Solución:** ${i.suggestion || 'Revisar manualmente'}
- **Esfuerzo estimado:** 2-5 días
`)).join('\n') || 'No hay issues críticos.'}

## Fase 2: Alta Prioridad (2-4 semanas)
${analyses.flatMap(a => a.issues.filter(i => i.severity === 'high')
            .map(i => `- **[${a.dimension}]** ${i.description}`)).slice(0, 8).join('\n') || 'No hay issues de alta prioridad.'}

## Fase 3: Mejoras Continuas (4+ semanas)
${analyses.flatMap(a => a.recommendations).slice(0, 10).map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
        artifacts.push({
            name: 'plan-accion.md',
            type: 'plan',
            description: 'Plan de acción priorizado con roadmap de implementación',
            content: plan
        });
        return artifacts;
    }
    /**
     * Genera decisiones basadas en issues críticos
     */
    generateDecisions(issues) {
        const criticalAndHigh = issues.filter(i => i && (i.severity === 'critical' || i.severity === 'high') && i.description);
        return criticalAndHigh.slice(0, 5).map(issue => ({
            title: issue.description.split('.')[0] || issue.description.slice(0, 60),
            category: issue.category || 'general',
            description: issue.description,
            pros: [
                'Mejora la calidad y estabilidad del código',
                'Reduce riesgos técnicos y de seguridad',
                issue.suggestion ? `Solución clara: ${issue.suggestion.slice(0, 100)}` : 'Facilita el mantenimiento futuro'
            ].filter(Boolean),
            cons: [
                'Requiere tiempo de desarrollo e implementación',
                'Puede necesitar refactorización de código existente',
                'Requiere testing exhaustivo post-implementación'
            ],
            recommendation: (issue.severity === 'critical' ? 'high_priority' : 'medium_priority'),
            estimatedEffort: issue.severity === 'critical' ? '3-5 días' : '1-3 días'
        }));
    }
}
//# sourceMappingURL=analysesOrchestrator.js.map