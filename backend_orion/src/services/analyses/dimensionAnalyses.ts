import Anthropic from '@anthropic-ai/sdk';
import type { CodeIndex } from './codeScanner.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export class ClaudeService {
  async analyzeArchitecture(index: CodeIndex): Promise<DimensionAnalysis> {
    const prompt = `Analiza la arquitectura de este proyecto basándote en su estructura:

**ESTRUCTURA:**
- Controllers: ${index.structure.controllers.length}
- Services: ${index.structure.services.length}
- Routes: ${index.structure.routes.length}
- Models: ${index.structure.models.length}

**DEPENDENCIAS:**
${index.dependencies.runtime.slice(0, 10).join(', ')}

**SEÑALES DE RIESGO:**
${index.riskSignals.slice(0, 5).join('\n')}

Evalúa:
1. Separación de responsabilidades
2. Patrones aplicados
3. Escalabilidad
4. Acoplamiento

Responde SOLO con JSON:
\`\`\`json
{
  "score": 75,
  "issues": [{"severity":"high","description":"...","suggestion":"..."}],
  "recommendations": ["rec1", "rec2"]
}
\`\`\``;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = this.extractTextFromResponse(response);
    return this.parseResponse(textContent, 'architecture');
  }

  async analyzeSecurity(index: CodeIndex): Promise<DimensionAnalysis> {
    const prompt = `Analiza la seguridad basándote en estas señales:

**SEÑALES DE RIESGO:**
${index.riskSignals.join('\n')}

**DEPENDENCIAS:**
${index.dependencies.runtime.join(', ')}

Busca:
1. Vulnerabilidades conocidas
2. Credenciales hardcodeadas
3. Validación de inputs
4. Dependencias desactualizadas

Responde SOLO JSON con score, issues y recommendations.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = this.extractTextFromResponse(response);
    return this.parseResponse(textContent, 'security');
  }

  async analyzePerformance(index: CodeIndex): Promise<DimensionAnalysis> {
    const prompt = `Analiza performance con estos datos:

**COMPLEJIDAD:**
- Archivos: ${index.stats.totalFiles}
- Líneas totales: ${index.stats.totalLines}
- Archivo más grande: ${index.complexity.maxFileSize} bytes

**SEÑALES:**
${index.riskSignals.filter(s => s.includes('Sequential') || s.includes('await')).join('\n')}

Evalúa:
1. Llamadas secuenciales vs paralelas
2. Caching
3. Optimización de algoritmos

Responde SOLO JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = this.extractTextFromResponse(response);
    return this.parseResponse(textContent, 'performance');
  }

  async analyzeQuality(index: CodeIndex): Promise<DimensionAnalysis> {
    const prompt = `Analiza calidad de código:

**MÉTRICAS:**
- Total archivos: ${index.stats.totalFiles}
- Tamaño promedio: ${index.complexity.avgFileSize} bytes
- Lenguajes: ${Object.keys(index.stats.languages).join(', ')}

**SEÑALES:**
${index.riskSignals.filter(s => s.includes('long file') || s.includes('Empty catch')).join('\n')}

Evalúa:
1. Legibilidad
2. Mantenibilidad
3. Code smells
4. Documentación

Responde SOLO JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const textContent = this.extractTextFromResponse(response);
    return this.parseResponse(textContent, 'quality');
  }

  private extractTextFromResponse(response: Anthropic.Messages.Message): string {
    const firstBlock = response.content[0];
    
    if (!firstBlock) {
      throw new Error('No content in Claude response');
    }

    if (firstBlock.type === 'text') {
      return firstBlock.text;
    }

    throw new Error(`Unexpected content type: ${firstBlock.type}`);
  }

  private parseResponse(text: string, dimension: string): DimensionAnalysis {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      
      const parsed = JSON.parse(jsonText);

      return {
        dimension,
        score: parsed.score || 70,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error(`Error parsing ${dimension} response:`, error);
      return {
        dimension,
        score: 70,
        issues: [],
        recommendations: [`Review ${dimension} manually`]
      };
    }
  }
}