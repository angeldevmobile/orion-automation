import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// LÍMITES OPTIMIZADOS
const MAX_FILE_SIZE = 100000; 
const MAX_LINES_PER_CHUNK = 2000;

export interface DeepAnalysisResult {
  file: string;
  issues: Array<{
    line?: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'security' | 'performance' | 'logic' | 'quality';
    description: string;
    codeSnippet?: string;
    suggestion: string;
  }>;
  summary: string;
  complexity: number;
  warnings: string[];
  linesAnalyzed: number; // NUEVO: Para tracking
  chunksProcessed: number; // NUEVO: Para debugging
}

export class DeepCodeAnalysisService {
  async analyzeFiles(
    filePaths: string[]
  ): Promise<DeepAnalysisResult[]> {
    const results: DeepAnalysisResult[] = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.analyzeFile(filePath);
        results.push(result);
      } catch (error) {
        console.error(`Error analyzing ${filePath}:`, error);
        
        results.push({
          file: filePath,
          issues: [],
          summary: 'Error al analizar archivo',
          complexity: 0,
          warnings: [`No se pudo analizar: ${error}`],
          linesAnalyzed: 0,
          chunksProcessed: 0
        });
      }
    }

    return results;
  }

  private async analyzeFile(filePath: string): Promise<DeepAnalysisResult> {
    // Leer archivo
    let content = await fs.readFile(filePath, 'utf-8');
    const originalLines = content.split('\n').length;

    // Validar tamaño ANTES de procesar
    if (content.length > MAX_FILE_SIZE) {
      console.warn(`Archivo ${filePath} muy grande (${content.length} bytes), truncando...`);
      content = content.substring(0, MAX_FILE_SIZE);
    }

    // Dividir en chunks inteligentes
    const chunks = this.chunkContentByLines(content, MAX_LINES_PER_CHUNK);
    console.log(`${filePath}: ${originalLines} líneas → ${chunks.length} chunks`);

    const allIssues: DeepAnalysisResult['issues'] = [];
    let summary = '';
    let totalLinesAnalyzed = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;

      const chunkLines = chunk.content.split('\n').length;
      totalLinesAnalyzed += chunkLines;

      console.log(`🔍 Analizando chunk ${i + 1}/${chunks.length} (${chunkLines} líneas)...`);

      const prompt = this.buildDeepPrompt(
        filePath, 
        chunk.content, 
        chunk.startLine,
        i + 1, 
        chunks.length
      );

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const parsed = this.parseDeepResponse(response, chunk.startLine);
      allIssues.push(...parsed.issues);
      
      if (i === 0) {
        summary = parsed.summary;
      }

      // Delay entre chunks para evitar rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      file: filePath,
      issues: allIssues,
      summary,
      complexity: this.calculateComplexity(content),
      warnings: originalLines > MAX_FILE_SIZE / 50 
        ? [`Archivo parcialmente analizado: ${totalLinesAnalyzed}/${originalLines} líneas`]
        : [],
      linesAnalyzed: totalLinesAnalyzed,
      chunksProcessed: chunks.length
    };
  }

  // NUEVO: Chunking por líneas (más preciso)
  private chunkContentByLines(
    content: string, 
    maxLinesPerChunk: number
  ): Array<{ content: string; startLine: number }> {
    const lines = content.split('\n');
    const chunks: Array<{ content: string; startLine: number }> = [];
    
    let currentChunk: string[] = [];
    let currentStartLine = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      currentChunk.push(line);

      // Si alcanzamos el límite o es la última línea
      if (currentChunk.length >= maxLinesPerChunk || i === lines.length - 1) {
        chunks.push({
          content: currentChunk.join('\n'),
          startLine: currentStartLine
        });
        
        currentStartLine += currentChunk.length;
        currentChunk = [];
      }
    }

    return chunks;
  }

  private buildDeepPrompt(
    filePath: string, 
    content: string,
    startLine: number,
    chunkIndex: number, 
    totalChunks: number
  ): string {
    const endLine = startLine + content.split('\n').length - 1;

    return `Analiza en profundidad este código (parte ${chunkIndex}/${totalChunks} de ${filePath}, líneas ${startLine}-${endLine}):

\`\`\`
${content}
\`\`\`

**BUSCA ESPECÍFICAMENTE:**

1. **BUGS Y ERRORES LÓGICOS**
   - Condiciones incorrectas
   - Off-by-one errors
   - Race conditions
   - Null/undefined no manejados

2. **SEGURIDAD**
   - SQL injection
   - XSS vulnerabilities
   - Insecure crypto
   - Hardcoded secrets
   - Missing input validation

3. **PERFORMANCE**
   - Algoritmos ineficientes (O(n²) evitables)
   - Queries N+1
   - Memory leaks
   - Blocking operations

4. **EDGE CASES**
   - Arrays vacíos
   - Valores negativos/cero
   - Strings vacíos
   - Casos límite no contemplados

**FORMATO DE RESPUESTA (JSON):**

\`\`\`json
{
  "summary": "Resumen breve de este fragmento",
  "issues": [
    {
      "line": 45,
      "severity": "critical",
      "category": "security",
      "description": "Descripción detallada del problema encontrado",
      "codeSnippet": "db.query('SELECT * FROM users WHERE id = ' + userId)",
      "suggestion": "Usar prepared statements: db.query('SELECT * FROM users WHERE id = ?', [userId])"
    }
  ]
}
\`\`\`

**IMPORTANTE:**
- Usa números de línea RELATIVOS a este chunk (línea 1 = línea ${startLine} del archivo)
- Solo reporta issues REALES, no teóricos
- Prioriza critical/high sobre medium/low
- Máximo 10 issues más importantes
- Cada issue DEBE tener "description" y "suggestion" completos y detallados
- Responde SOLO en español. No incluyas texto en inglés.`;
  }

  private parseDeepResponse(
    response: Anthropic.Messages.Message,
    startLine: number
  ): {
    summary: string;
    issues: DeepAnalysisResult['issues'];
  } {
    try {
      const text = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';

      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

      const parsed = JSON.parse(jsonText);

      return {
        summary: parsed.summary || 'Análisis completado',
        issues: Array.isArray(parsed.issues) 
          ? parsed.issues
              .filter((i: unknown) => i && typeof i === 'object' && 'description' in i)
              .map((issue: DeepAnalysisResult['issues'][0]) => ({
                ...issue,
                // Ajustar número de línea al archivo completo
                line: issue.line ? startLine + issue.line - 1 : undefined
              }))
          : []
      };
    } catch (error) {
      console.error('Error parsing deep analysis response:', error);
      return {
        summary: 'Error al parsear respuesta',
        issues: []
      };
    }
  }

  private calculateComplexity(content: string): number {
    const ifCount = (content.match(/\bif\b/g) || []).length;
    const forCount = (content.match(/\bfor\b/g) || []).length;
    const whileCount = (content.match(/\bwhile\b/g) || []).length;
    const caseCount = (content.match(/\bcase\b/g) || []).length;

    return ifCount + forCount + whileCount + caseCount + 1;
  }
}