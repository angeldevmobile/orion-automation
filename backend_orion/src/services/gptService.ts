import OpenAI from 'openai';
import type { CodeIndex } from './analyses/codeScanner.js';

if (!process.env.OPENAI_API_KEY) {
  console.warn('[GPTService] ADVERTENCIA: OPENAI_API_KEY no configurada. El análisis con GPT no funcionará.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GPTStructuralAnalysis {
  understanding: string;
  suggestedFiles: Array<{
    path: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  projectType: string;
  techStack: string[];
  complexity: 'low' | 'medium' | 'high';
}

interface DimensionAnalysis {
  dimension: string;
  score: number;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    location?: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

export class GPTService {
  /**
   * Análisis estructural rápido del índice
   * GPT entiende el proyecto y sugiere archivos clave
   */
  async analyzeStructure(index: CodeIndex): Promise<GPTStructuralAnalysis> {
    const prompt = `Analiza esta estructura de proyecto y sugiere qué archivos analizar en profundidad:

**ESTRUCTURA:**
- Controllers: ${index.structure.controllers.length} archivos
- Services: ${index.structure.services.length} archivos
- Routes: ${index.structure.routes.length} archivos
- Models: ${index.structure.models.length} archivos
- Config: ${index.structure.configs.length} archivos
- Utils: ${index.structure.utils.length} archivos

**ARCHIVOS CLAVE:**
${[
  ...index.structure.controllers.slice(0, 3),
  ...index.structure.services.slice(0, 3),
  ...index.structure.routes.slice(0, 2)
].join('\n')}

**DEPENDENCIAS:**
${index.dependencies.runtime.slice(0, 15).join(', ')}

**SEÑALES DE RIESGO:**
${index.riskSignals.slice(0, 10).join('\n')}

**TAREA:**
1. Identifica el tipo de proyecto (API REST, microservicio, monolito, etc.)
2. Detecta el tech stack principal
3. Evalúa complejidad general (low/medium/high)
4. Sugiere MÁXIMO 5 archivos prioritarios para análisis profundo

**CRITERIOS PARA SUGERIR ARCHIVOS:**
- Archivos con lógica de negocio crítica (controllers, services)
- Archivos con señales de riesgo (auth, payment, database)
- Archivos grandes (>500 líneas)
- Archivos con muchas dependencias

Responde SOLO en JSON:
\`\`\`json
{
  "understanding": "Descripción breve del proyecto en 2-3 líneas",
  "projectType": "API REST | Microservicio | Monolito | etc",
  "techStack": ["Node.js", "Express", "Prisma"],
  "complexity": "medium",
  "suggestedFiles": [
    {
      "path": "src/services/auth.service.ts",
      "reason": "Lógica de autenticación crítica",
      "priority": "high"
    }
  ]
}
\`\`\`

IMPORTANTE: Responde SOLO en español. No incluyas texto ni recomendaciones en inglés.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content || '{}';
      return this.parseStructuralResponse(content);
    } catch (error: unknown) {
      console.error('[GPTService] Error en analyzeStructure:', error);
      
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error('Límite de solicitudes a OpenAI alcanzado. Intente en unos minutos.');
        }
        if (error.status === 401) {
          throw new Error('API Key de OpenAI inválida o sin créditos.');
        }
      }

      // Retornar fallback en vez de fallar
      return {
        understanding: 'No se pudo analizar la estructura (error de API)',
        suggestedFiles: [],
        projectType: 'Unknown',
        techStack: [],
        complexity: 'medium'
      };
    }
  }

  /**
   * Análisis dimensional rápido (arquitectura, seguridad, etc.)
   * GPT hace evaluación general sin ver código
   */
  async analyzeDimension(
    index: CodeIndex,
    dimension: 'architecture' | 'security' | 'performance' | 'quality'
  ): Promise<DimensionAnalysis> {
    const prompts = {
      architecture: this.buildArchitecturePrompt(index),
      security: this.buildSecurityPrompt(index),
      performance: this.buildPerformancePrompt(index),
      quality: this.buildQualityPrompt(index)
    };

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompts[dimension] }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content || '{}';
      console.log(`[${dimension}] GPT Response:`, content);
      return this.parseDimensionResponse(content, dimension);
    } catch (error: unknown) {
      console.error(`[GPTService] Error en analyzeDimension (${dimension}):`, error);

      if (error instanceof OpenAI.APIError && error.status === 429) {
        throw new Error('Límite de solicitudes a OpenAI alcanzado. Intente en unos minutos.');
      }

      // Retornar fallback
      return {
        dimension,
        score: 0,
        issues: [{
          severity: 'low',
          description: `No se pudo analizar ${dimension} (error de API)`,
          suggestion: 'Reintentar el análisis más tarde'
        }],
        recommendations: [`Reintentar análisis de ${dimension} manualmente`]
      };
    }
  }

  private buildArchitecturePrompt(index: CodeIndex): string {
    return `Evalúa la arquitectura basándote en esta estructura:

**ESTRUCTURA:**
- Controllers: ${index.structure.controllers.length}
- Services: ${index.structure.services.length}
- Models: ${index.structure.models.length}

**SEÑALES:**
${index.riskSignals.slice(0, 5).join('\n')}

Evalúa (score 0-100):
1. Separación de responsabilidades
2. Patrones de diseño
3. Escalabilidad

Responde en formato JSON:
\`\`\`json
{
  "score": 75,
  "issues": [
    {
      "severity": "high",
      "description": "Descripción detallada del problema",
      "suggestion": "Cómo resolverlo"
    }
  ],
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2"
  ]
}
\`\`\`

IMPORTANTE: 
- Usa exactamente los campos: severity, description, suggestion
- severity debe ser: critical, high, medium, o low
- Responde SOLO en español`;
  }

  private buildSecurityPrompt(index: CodeIndex): string {
    return `Evalúa seguridad con estas señales:

**RIESGOS DETECTADOS:**
${index.riskSignals.filter(s => 
  s.includes('password') || 
  s.includes('token') || 
  s.includes('secret') ||
  s.includes('hardcoded')
).join('\n')}

**DEPENDENCIAS:**
${index.dependencies.runtime.slice(0, 10).join(', ')}

Evalúa (score 0-100):
1. Credenciales hardcodeadas
2. Validación de inputs
3. Dependencias vulnerables

Responde en formato JSON:
\`\`\`json
{
  "score": 60,
  "issues": [
    {
      "severity": "critical",
      "description": "Descripción del problema de seguridad",
      "suggestion": "Solución recomendada"
    }
  ],
  "recommendations": ["Recomendación 1"]
}
\`\`\`

IMPORTANTE: 
- Usa exactamente los campos: severity, description, suggestion
- severity debe ser: critical, high, medium, o low
- Responde SOLO en español`;
  }

  private buildPerformancePrompt(index: CodeIndex): string {
    return `Evalúa performance:

**MÉTRICAS:**
- Archivos: ${index.stats.totalFiles}
- Líneas: ${index.stats.totalLines}
- Archivo más grande: ${index.complexity.maxFileSize} bytes

**SEÑALES:**
${index.riskSignals.filter(s => 
  s.includes('Sequential') || 
  s.includes('await') ||
  s.includes('for')
).slice(0, 5).join('\n')}

Evalúa (score 0-100):
1. Operaciones secuenciales
2. Algoritmos ineficientes
3. Caching

Responde en formato JSON:
\`\`\`json
{
  "score": 70,
  "issues": [
    {
      "severity": "medium",
      "description": "Descripción del problema de performance",
      "suggestion": "Optimización sugerida"
    }
  ],
  "recommendations": ["Recomendación 1"]
}
\`\`\`

IMPORTANTE: 
- Usa exactamente los campos: severity, description, suggestion
- severity debe ser: critical, high, medium, o low
- Responde SOLO en español`;
  }

  private buildQualityPrompt(index: CodeIndex): string {
    const avgDeps = index.stats.totalFiles > 0 
      ? (index.dependencies.runtime.length / index.stats.totalFiles).toFixed(1)
      : '0';

    return `Evalúa calidad de código:

**MÉTRICAS:**
- Total archivos: ${index.stats.totalFiles}
- Tamaño promedio: ${index.complexity.avgFileSize} bytes
- Dependencias promedio: ${avgDeps} por archivo

**SEÑALES:**
${index.riskSignals.filter(s => 
  s.includes('long file') || 
  s.includes('Empty catch') ||
  s.includes('TODO')
).slice(0, 5).join('\n')}

Evalúa (score 0-100):
1. Legibilidad
2. Mantenibilidad
3. Code smells

Responde en formato JSON:
\`\`\`json
{
  "score": 65,
  "issues": [
    {
      "severity": "low",
      "description": "Descripción del problema de calidad",
      "suggestion": "Mejora sugerida"
    }
  ],
  "recommendations": ["Recomendación 1"]
}
\`\`\`

IMPORTANTE: 
- Usa exactamente los campos: severity, description, suggestion
- severity debe ser: critical, high, medium, o low
- Responde SOLO en español`;
  }

  private parseStructuralResponse(content: string): GPTStructuralAnalysis {
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonText);

      return {
        understanding: parsed.understanding || 'Proyecto analizado',
        suggestedFiles: Array.isArray(parsed.suggestedFiles) 
          ? parsed.suggestedFiles.slice(0, 5) 
          : [],
        projectType: parsed.projectType || 'Unknown',
        techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
        complexity: parsed.complexity || 'medium'
      };
    } catch (error) {
      console.error('Error parsing GPT structural response:', error);
      return {
        understanding: 'Error al analizar estructura',
        suggestedFiles: [],
        projectType: 'Unknown',
        techStack: [],
        complexity: 'medium'
      };
    }
  }

  private parseDimensionResponse(content: string, dimension: string): DimensionAnalysis {
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      const parsed = JSON.parse(jsonText);

      // Solo loguear en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${dimension}] Issues recibidos:`, JSON.stringify(parsed.issues, null, 2));
        console.log(`[${dimension}] Recommendations:`, JSON.stringify(parsed.recommendations, null, 2));
      }

      return {
        dimension,
        score: parsed.score || 70,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error(`Error parsing GPT ${dimension} response:`, error);
      console.log('Raw content:', content); // DEBUG
      return {
        dimension,
        score: 70,
        issues: [],
        recommendations: [`Review ${dimension} manually`]
      };
    }
  }
}