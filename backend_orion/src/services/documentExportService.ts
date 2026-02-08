import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { marked } from 'marked';
import { AdvancedDiagramService } from './advancedDiagramService.js';
import type { IsoflowModel } from './diagramService.js';

// Branding centralizado
const ORION_BRAND = 'Orion AI';
const ORION_VERSION = '2.0';
const ORION_COLOR_PRIMARY = '#6C3CE1';    // Púrpura Orion
const ORION_COLOR_SECONDARY = '#4A1FB8';  // Púrpura oscuro
const ORION_COLOR_ACCENT = '#A78BFA';     // Púrpura claro
const ORION_COLOR_DARK = '#1E1B4B';       // Azul oscuro
const ORION_COLOR_TEXT = '#1F2937';        // Gris oscuro texto
const ORION_COLOR_LIGHT = '#F5F3FF';      // Fondo claro

function getFormattedDate(): string {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  });
}

function getFullFormattedDate(): string {
  return new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

interface PDFExportOptions {
  mermaidCode?: string;
  d2Code?: string;
  title?: string;
  subtitle?: string;
  documentType?: 'readme' | 'architecture' | 'api' | 'contributing' | 'general';
  projectName?: string;
  author?: string;
  version?: string;
  showCoverPage?: boolean;
  showTableOfContents?: boolean;
  showHeaderFooter?: boolean;
  confidential?: boolean;
}

export class DocumentExportService {
  private advancedDiagram = new AdvancedDiagramService();

  /**
   * Convierte Markdown a PDF profesional con branding Orion AI
   */
  async markdownToPDF(
    markdown: string,
    outputPath: string,
    options?: PDFExportOptions
  ): Promise<void> {
    const outputDir = path.dirname(outputPath);
    const baseName = path.basename(outputPath, '.pdf');
    const currentDate = getFormattedDate();
    const fullDate = getFullFormattedDate();
    const year = getCurrentYear();

    // Asegurar que el directorio de salida existe
    await fs.mkdir(outputDir, { recursive: true });

    // Generar TODOS los diagramas encontrados como imágenes
    markdown = await this.processAllDiagrams(markdown, outputDir, baseName, options);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    try {
      const page = await browser.newPage();

      // Convertir markdown a HTML
      const htmlContent = await marked(markdown);

      // Determinar título y tipo de documento
      const docTitle = options?.title || options?.projectName || 'Documentación';
      const docSubtitle = options?.subtitle || this.getDocumentSubtitle(options?.documentType ?? 'general');
      const docVersion = options?.version || '1.0.0';
      const showCover = options?.showCoverPage !== false;
      const showTOC = options?.showTableOfContents !== false;
      const showHeaderFooter = options?.showHeaderFooter !== false;

      // Construir HTML completo con portada profesional
      const html = this.buildProfessionalHTML({
        htmlContent,
        docTitle,
        docSubtitle,
        docVersion,
        currentDate,
        fullDate,
        year,
        showCover,
        showTOC,
        author: options?.author,
        confidential: options?.confidential,
        documentType: options?.documentType,
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Esperar a que las imágenes y fuentes carguen completamente
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        );
      });

      // Espera adicional para renderizado completo
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generar PDF con header/footer profesional
      const pdfOptions: Parameters<typeof page.pdf>[0] = {
        path: outputPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: showHeaderFooter ? '2.5cm' : '2cm',
          right: '2cm',
          bottom: showHeaderFooter ? '2.5cm' : '2cm',
          left: '2cm',
        },
      };

      if (showHeaderFooter) {
        pdfOptions.displayHeaderFooter = true;
        pdfOptions.headerTemplate = `
          <div style="width: 100%; font-size: 8px; color: #6C3CE1; 
                      padding: 0 2cm; display: flex; justify-content: space-between; 
                      align-items: center; font-family: 'Segoe UI', Arial, sans-serif;">
            <span style="font-weight: 600;">${docTitle} — ${docSubtitle}</span>
            <span style="opacity: 0.7;">${ORION_BRAND} ${ORION_VERSION}</span>
          </div>`;
        pdfOptions.footerTemplate = `
          <div style="width: 100%; font-size: 8px; color: #6B7280; 
                      padding: 0 2cm; display: flex; justify-content: space-between; 
                      align-items: center; font-family: 'Segoe UI', Arial, sans-serif;
                      border-top: 1px solid #E5E7EB; padding-top: 5px;">
            <span>${options?.confidential ? 'CONFIDENCIAL — ' : ''}Generado por ${ORION_BRAND} | ${currentDate}</span>
            <span>Pagina <span class="pageNumber"></span> de <span class="totalPages"></span></span>
          </div>`;
      }

      await page.pdf(pdfOptions);

      console.log(`PDF generado exitosamente: ${outputPath}`);
    } finally {
      await browser.close();
    }
  }

  /**
   * Procesa y convierte TODOS los bloques de diagramas en el markdown a imágenes
   */
  private async processAllDiagrams(
    markdown: string,
    outputDir: string,
    baseName: string,
    options?: PDFExportOptions
  ): Promise<string> {
    let diagramIndex = 0;

    // Procesar bloques Mermaid embebidos en el markdown
    const mermaidBlocks = markdown.match(/```mermaid\n[\s\S]*?\n```/g) || [];
    for (const block of mermaidBlocks) {
      diagramIndex++;
      const mermaidCode = block.replace(/```mermaid\n/, '').replace(/\n```$/, '');
      const imagePath = path.join(outputDir, `${baseName}_mermaid_${diagramIndex}.png`);

      try {
        await this.advancedDiagram.generateMermaidImage(mermaidCode, imagePath, 'png');
        markdown = markdown.replace(
          block,
          `\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Diagrama de arquitectura</p>\n</div>\n`
        );
      } catch (error) {
        console.error(`Error generando diagrama Mermaid ${diagramIndex}:`, error);
        markdown = markdown.replace(
          block,
          `\n<div class="diagram-fallback"><p><em>Diagrama ${diagramIndex} - No se pudo renderizar la imagen. Codigo fuente disponible en el repositorio.</em></p></div>\n`
        );
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // Procesar bloques Isoflow embebidos (JSON del modelo isométrico)
    // ═══════════════════════════════════════════════════════════════
    const isoflowBlocks = markdown.match(/```isoflow\n[\s\S]*?\n```/g) || [];
    for (const block of isoflowBlocks) {
      diagramIndex++;
      const isoflowJson = block.replace(/```isoflow\n/, '').replace(/\n```$/, '');
      const imagePath = path.join(outputDir, `${baseName}_isoflow_${diagramIndex}.png`);

      try {
        const model: IsoflowModel = JSON.parse(isoflowJson);
        await this.advancedDiagram.generateIsoflowImage(model, imagePath, {
          width: 1920,
          height: 1080,
          format: 'png',
        });
        markdown = markdown.replace(
          block,
          `\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama Isométrico ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Vista isométrica de arquitectura</p>\n</div>\n`
        );
      } catch (error) {
        console.error(`Error generando diagrama Isoflow ${diagramIndex}:`, error);

        // Fallback: intentar convertir a Mermaid
        try {
          const model: IsoflowModel = JSON.parse(isoflowJson);
          const mermaidFallback = this.advancedDiagram.isoflowToMermaid(model);
          const fallbackPath = path.join(outputDir, `${baseName}_isoflow_fallback_${diagramIndex}.png`);
          await this.advancedDiagram.generateMermaidImage(mermaidFallback, fallbackPath, 'png');
          markdown = markdown.replace(
            block,
            `\n<div class="diagram-container">\n<img src="${fallbackPath}" alt="Diagrama ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Diagrama de arquitectura (vista simplificada)</p>\n</div>\n`
          );
        } catch (fallbackError) {
          console.error(`Error en fallback Mermaid para Isoflow ${diagramIndex}:`, fallbackError);
          markdown = markdown.replace(
            block,
            `\n<div class="diagram-fallback"><p><em>Diagrama ${diagramIndex} - No se pudo renderizar el diagrama isométrico. Codigo fuente disponible en el repositorio.</em></p></div>\n`
          );
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // Procesar bloques D2 → Convertir a Mermaid (D2 no soportado 
    // correctamente en Kroki para el contenido generado por IA)
    // ═══════════════════════════════════════════════════════════════
    const d2Blocks = markdown.match(/```d2\n[\s\S]*?\n```/g) || [];
    for (const block of d2Blocks) {
      diagramIndex++;
      const d2Code = block.replace(/```d2\n/, '').replace(/\n```$/, '');
      const imagePath = path.join(outputDir, `${baseName}_d2_${diagramIndex}.png`);

      try {
        // Intentar parsear como modelo Isoflow (la IA a veces genera JSON con etiqueta d2)
        const parsed = JSON.parse(d2Code);
        if (parsed.nodes && parsed.edges) {
          // Es un modelo Isoflow disfrazado de D2 → renderizar como isométrico
          console.log(`Bloque D2 ${diagramIndex} detectado como modelo Isoflow, renderizando como isométrico...`);
          await this.advancedDiagram.generateIsoflowImage(parsed as IsoflowModel, imagePath, {
            width: 1920,
            height: 1080,
            format: 'png',
          });
          markdown = markdown.replace(
            block,
            `\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama Isométrico ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Vista isométrica de arquitectura</p>\n</div>\n`
          );
          continue;
        }
      } catch {
        // No es JSON, es código D2 real → intentar con Kroki
      }

      try {
        await this.advancedDiagram.generateD2Diagram(d2Code, imagePath, 'png');
        markdown = markdown.replace(
          block,
          `\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama D2 ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Vista de arquitectura profesional</p>\n</div>\n`
        );
      } catch (error) {
        console.error(`Error generando diagrama D2 ${diagramIndex}:`, error);

        // Fallback: convertir D2 a Mermaid básico
        try {
          console.log(`Intentando fallback: D2 → Mermaid para diagrama ${diagramIndex}...`);
          const mermaidCode = this.d2ToMermaidFallback(d2Code);
          const fallbackPath = path.join(outputDir, `${baseName}_d2_fallback_${diagramIndex}.png`);
          await this.advancedDiagram.generateMermaidImage(mermaidCode, fallbackPath, 'png');
          markdown = markdown.replace(
            block,
            `\n<div class="diagram-container">\n<img src="${fallbackPath}" alt="Diagrama ${diagramIndex}" />\n<p class="diagram-caption">Figura ${diagramIndex}: Diagrama de arquitectura (vista alternativa)</p>\n</div>\n`
          );
        } catch (fallbackError) {
          console.error(`Error en fallback D2→Mermaid ${diagramIndex}:`, fallbackError);
          markdown = markdown.replace(
            block,
            `\n<div class="diagram-fallback"><p><em>Diagrama ${diagramIndex} - No se pudo renderizar la imagen D2. Codigo fuente disponible en el repositorio.</em></p></div>\n`
          );
        }
      }
    }

    // Procesar diagramas pasados como opciones (compatibilidad hacia atrás)
    if (options?.mermaidCode && !mermaidBlocks.length) {
      diagramIndex++;
      const imagePath = path.join(outputDir, `${baseName}_mermaid_opt.png`);
      try {
        await this.advancedDiagram.generateMermaidImage(options.mermaidCode, imagePath, 'png');
        markdown += `\n\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama de Arquitectura" />\n<p class="diagram-caption">Diagrama de Arquitectura del Sistema</p>\n</div>\n`;
      } catch (error) {
        console.error('Error generando diagrama Mermaid desde opciones:', error);
      }
    }

    if (options?.d2Code && !d2Blocks.length) {
      diagramIndex++;
      const imagePath = path.join(outputDir, `${baseName}_d2_opt.png`);
      try {
        // Intentar como Isoflow primero
        const parsed = JSON.parse(options.d2Code);
        if (parsed.nodes && parsed.edges) {
          await this.advancedDiagram.generateIsoflowImage(parsed as IsoflowModel, imagePath, {
            width: 1920,
            height: 1080,
            format: 'png',
          });
        } else {
          await this.advancedDiagram.generateD2Diagram(options.d2Code, imagePath, 'png');
        }
        markdown += `\n\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama Profesional" />\n<p class="diagram-caption">Vista de Arquitectura Profesional</p>\n</div>\n`;
      } catch {
        try {
          await this.advancedDiagram.generateD2Diagram(options.d2Code, imagePath, 'png');
          markdown += `\n\n<div class="diagram-container">\n<img src="${imagePath}" alt="Diagrama D2 Profesional" />\n<p class="diagram-caption">Vista de Arquitectura Profesional</p>\n</div>\n`;
        } catch (error) {
          console.error('Error generando diagrama D2 desde opciones:', error);
        }
      }
    }

    return markdown;
  }

  /**
   * Convierte código D2 básico a Mermaid como fallback
   * Parsea la sintaxis D2 común: `a -> b: label`
   */
  private d2ToMermaidFallback(d2Code: string): string {
    const lines = d2Code.split('\n').filter(l => l.trim());
    let mermaid = 'graph TB\n';

    const nodeLabels = new Map<string, string>();
    const edges: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Ignorar comentarios y líneas de estilo D2
      if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.includes('.style.')) {
        continue;
      }

      // Detectar conexiones: a -> b: label  o  a -- b: label
      const edgeMatch = trimmed.match(/^([\w.-]+)\s*(->|--|<->)\s*([\w.-]+)(?:\s*:\s*(.+))?$/);
      if (edgeMatch) {
        const from = edgeMatch[1];
        const arrowType = edgeMatch[2];
        const to = edgeMatch[3];
        const label = edgeMatch[4];

        if (from && arrowType && to) {
          const fromId = from.replace(/[.-]/g, '_');
          const toId = to.replace(/[.-]/g, '_');

          if (!nodeLabels.has(fromId)) nodeLabels.set(fromId, from);
          if (!nodeLabels.has(toId)) nodeLabels.set(toId, to);

          const arrow = arrowType === '--' ? '---' : '-->';
          const labelStr = label ? `|${label.trim()}|` : '';
          edges.push(`    ${fromId} ${arrow}${labelStr} ${toId}`);
        }
        continue;
      }

      // Detectar definiciones de nodo: a: "Label"
      const nodeMatch = trimmed.match(/^([\w.-]+)\s*:\s*"?([^"{}]+)"?\s*(?:\{|$)/);
      if (nodeMatch) {
        const id = nodeMatch[1];
        const label = nodeMatch[2];

        if (id && label) {
          const nodeId = id.replace(/[.-]/g, '_');
          nodeLabels.set(nodeId, label.trim());
        }
      }
    }

    // Generar nodos
    for (const [id, label] of nodeLabels) {
      mermaid += `    ${id}["${label}"]\n`;
    }

    // Generar edges
    for (const edge of edges) {
      mermaid += edge + '\n';
    }

    // Si no se generó nada útil, devolver diagrama mínimo
    if (nodeLabels.size === 0) {
      mermaid = 'graph TB\n    A["Diagrama no disponible"]\n';
    }

    return mermaid;
  }

  /**
   * Construye el HTML profesional completo con portada, TOC y estilos Orion AI
   */
  private buildProfessionalHTML(params: {
    htmlContent: string;
    docTitle: string;
    docSubtitle: string;
    docVersion: string;
    currentDate: string;
    fullDate: string;
    year: number;
    showCover: boolean;
    showTOC: boolean;
    author?: string | undefined;
    confidential?: boolean | undefined;
    documentType?: string | undefined;
  }): string {
    const {
      htmlContent,
      docTitle,
      docSubtitle,
      docVersion,
      currentDate,
      fullDate,
      year,
      showCover,
      showTOC,
      author,
      confidential,
      documentType,
    } = params;

    const coverPage = showCover
      ? this.buildCoverPage({
          docTitle,
          docSubtitle,
          docVersion,
          fullDate,
          year,
          author,
          confidential,
          documentType,
        })
      : '';

    const tocSection = showTOC
      ? `<div class="toc-page">
          <h1 class="toc-title">Tabla de Contenidos</h1>
          <div class="toc-note">
            <p><em>Consulte la tabla de contenidos dentro del documento para navegacion detallada.</em></p>
          </div>
        </div>`
      : '';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="${ORION_BRAND} ${ORION_VERSION}">
  <meta name="author" content="${author || ORION_BRAND}">
  <title>${docTitle} - ${docSubtitle}</title>
  <style>
    /* ============================================
       ORION AI - Professional Document Styles
       Version: ${ORION_VERSION}
       ============================================ */

    /* --- Google Fonts Import --- */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Merriweather:wght@300;400;700&display=swap');

    /* --- Page Configuration --- */
    @page {
      size: A4;
      margin: 0;
    }

    @page :first {
      margin: 0;
    }

    /* --- Base Styles --- */
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10.5pt;
      line-height: 1.7;
      color: ${ORION_COLOR_TEXT};
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* --- Cover Page --- */
    .cover-page {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, ${ORION_COLOR_DARK} 0%, ${ORION_COLOR_SECONDARY} 50%, ${ORION_COLOR_PRIMARY} 100%);
      color: white;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      padding: 3cm;
    }

    .cover-page::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -30%;
      width: 80%;
      height: 200%;
      background: radial-gradient(ellipse, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
      transform: rotate(-15deg);
    }

    .cover-page::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, ${ORION_COLOR_ACCENT}, ${ORION_COLOR_PRIMARY}, ${ORION_COLOR_ACCENT});
    }

    .cover-logo {
      font-size: 16pt;
      font-weight: 300;
      letter-spacing: 8px;
      text-transform: uppercase;
      color: ${ORION_COLOR_ACCENT};
      margin-bottom: 60px;
      z-index: 1;
      opacity: 0.9;
    }

    .cover-logo span {
      font-weight: 700;
      color: white;
    }

    .cover-title {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 32pt;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 20px;
      z-index: 1;
      max-width: 80%;
    }

    .cover-subtitle {
      font-size: 16pt;
      font-weight: 300;
      text-align: center;
      color: ${ORION_COLOR_ACCENT};
      margin-bottom: 60px;
      z-index: 1;
      letter-spacing: 2px;
    }

    .cover-divider {
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${ORION_COLOR_ACCENT}, transparent);
      margin-bottom: 40px;
      z-index: 1;
    }

    .cover-meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      z-index: 1;
      font-size: 10pt;
      color: rgba(255, 255, 255, 0.7);
    }

    .cover-meta .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cover-meta .meta-label {
      color: ${ORION_COLOR_ACCENT};
      font-weight: 600;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 1px;
    }

    .cover-confidential {
      position: absolute;
      top: 40px;
      right: 40px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #FCA5A5;
      padding: 6px 16px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 4px;
      z-index: 1;
    }

    .cover-footer {
      position: absolute;
      bottom: 30px;
      text-align: center;
      font-size: 8pt;
      color: rgba(255, 255, 255, 0.4);
      z-index: 1;
    }

    /* --- Table of Contents Page --- */
    .toc-page {
      page-break-after: always;
      padding: 2cm;
    }

    .toc-title {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 22pt;
      color: ${ORION_COLOR_PRIMARY};
      border-bottom: 3px solid ${ORION_COLOR_PRIMARY};
      padding-bottom: 12px;
      margin-bottom: 30px;
      page-break-before: avoid !important;
    }

    .toc-note {
      background: ${ORION_COLOR_LIGHT};
      border-left: 4px solid ${ORION_COLOR_PRIMARY};
      padding: 15px 20px;
      border-radius: 0 8px 8px 0;
      color: #6B7280;
      font-size: 9.5pt;
    }

    /* --- Document Content --- */
    .document-content {
      padding: 0 0.5cm;
    }

    /* --- Headings --- */
    h1 {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 22pt;
      font-weight: 700;
      color: ${ORION_COLOR_DARK};
      border-bottom: 3px solid ${ORION_COLOR_PRIMARY};
      padding-bottom: 12px;
      margin-top: 40px;
      margin-bottom: 20px;
      page-break-before: always;
      page-break-after: avoid;
    }

    h1:first-child,
    .document-content > h1:first-child {
      page-break-before: avoid;
    }

    h2 {
      font-family: 'Inter', sans-serif;
      font-size: 16pt;
      font-weight: 700;
      color: ${ORION_COLOR_SECONDARY};
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 8px;
      margin-top: 35px;
      margin-bottom: 15px;
      page-break-after: avoid;
    }

    h3 {
      font-family: 'Inter', sans-serif;
      font-size: 13pt;
      font-weight: 600;
      color: ${ORION_COLOR_PRIMARY};
      margin-top: 25px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    h4 {
      font-family: 'Inter', sans-serif;
      font-size: 11pt;
      font-weight: 600;
      color: #4B5563;
      margin-top: 20px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h5, h6 {
      font-family: 'Inter', sans-serif;
      font-size: 10.5pt;
      font-weight: 600;
      color: #6B7280;
      margin-top: 15px;
      margin-bottom: 8px;
    }

    /* --- Paragraphs --- */
    p {
      margin: 10px 0;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }

    /* --- Links --- */
    a {
      color: ${ORION_COLOR_PRIMARY};
      text-decoration: none;
      font-weight: 500;
    }

    a:hover {
      text-decoration: underline;
    }

    /* --- Tables --- */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      font-size: 9.5pt;
      page-break-inside: auto;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      overflow: hidden;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th {
      background: linear-gradient(135deg, ${ORION_COLOR_PRIMARY}, ${ORION_COLOR_SECONDARY});
      color: white;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
    }

    td {
      padding: 10px 16px;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: top;
    }

    tr:nth-child(even) {
      background-color: #F9FAFB;
    }

    tr:hover {
      background-color: ${ORION_COLOR_LIGHT};
    }

    tr:last-child td {
      border-bottom: none;
    }

    /* --- Code Blocks --- */
    code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 9pt;
      background-color: #F3F4F6;
      color: ${ORION_COLOR_SECONDARY};
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    pre {
      background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
      color: #E5E7EB;
      padding: 20px 24px;
      border-radius: 10px;
      overflow-x: auto;
      font-size: 9pt;
      line-height: 1.6;
      margin: 20px 0;
      page-break-inside: avoid;
      border: 1px solid #374151;
      position: relative;
    }

    pre::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 16px;
      width: 10px;
      height: 10px;
      background: #EF4444;
      border-radius: 50%;
      box-shadow: 18px 0 0 #F59E0B, 36px 0 0 #10B981;
    }

    pre code {
      background: none;
      color: #E5E7EB;
      padding: 0;
      font-weight: 400;
      display: block;
      margin-top: 10px;
    }

    /* --- Blockquotes --- */
    blockquote {
      border-left: 4px solid ${ORION_COLOR_PRIMARY};
      background: ${ORION_COLOR_LIGHT};
      padding: 16px 24px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
      color: #4B5563;
      font-style: italic;
      page-break-inside: avoid;
    }

    blockquote p {
      margin: 5px 0;
    }

    /* --- Lists --- */
    ul, ol {
      margin: 12px 0;
      padding-left: 28px;
    }

    li {
      margin: 6px 0;
      line-height: 1.6;
    }

    li > ul, li > ol {
      margin: 4px 0;
    }

    /* --- Images & Diagrams --- */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 30px auto;
      page-break-inside: avoid;
      border-radius: 10px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .diagram-container {
      page-break-inside: avoid;
      margin: 30px 0;
      text-align: center;
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .diagram-container img {
      margin: 10px auto;
      box-shadow: none;
      border: none;
      border-radius: 0;
    }

    .diagram-caption {
      font-size: 9pt;
      color: #6B7280;
      font-style: italic;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #F3F4F6;
    }

    .diagram-fallback {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
      color: #92400E;
      font-size: 9.5pt;
    }

    /* --- Horizontal Rules --- */
    hr {
      border: none;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${ORION_COLOR_ACCENT}, transparent);
      margin: 40px 0;
    }

    /* --- Badges (shields.io) --- */
    div[align="center"] img {
      display: inline-block;
      margin: 4px;
      box-shadow: none;
      border: none;
      border-radius: 4px;
    }

    div[align="center"] {
      margin: 20px 0;
    }

    /* --- Strong & Emphasis --- */
    strong {
      font-weight: 700;
      color: ${ORION_COLOR_DARK};
    }

    em {
      font-style: italic;
      color: #4B5563;
    }

    /* --- Definition Lists --- */
    dt {
      font-weight: 600;
      color: ${ORION_COLOR_SECONDARY};
      margin-top: 12px;
    }

    dd {
      margin-left: 20px;
      margin-bottom: 8px;
    }

    /* --- Print-specific --- */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .cover-page {
        height: 100vh;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      table {
        page-break-inside: auto;
      }

      h1, h2, h3, h4 {
        page-break-after: avoid;
      }

      img, .diagram-container {
        page-break-inside: avoid;
      }
    }

    /* --- Utility Classes --- */
    .text-center { text-align: center; }
    .text-muted { color: #9CA3AF; }
    .text-small { font-size: 9pt; }
    .mt-0 { margin-top: 0; }
    .mb-0 { margin-bottom: 0; }
    .no-break { page-break-inside: avoid; }
  </style>
</head>
<body>
  ${coverPage}
  ${tocSection}
  <div class="document-content">
    ${htmlContent}
  </div>
</body>
</html>`;
  }

  /**
   * Construye la portada profesional del documento
   */
  private buildCoverPage(params: {
    docTitle: string;
    docSubtitle: string;
    docVersion: string;
    fullDate: string;
    year: number;
    author?: string | undefined;
    confidential?: boolean | undefined;
    documentType?: string | undefined;
  }): string {
    const { docTitle, docSubtitle, docVersion, fullDate, year, author, confidential, documentType } = params;

    const docTypeIcon = this.getDocumentTypeLabel(documentType ?? 'general');

    return `
    <div class="cover-page">
      ${confidential ? '<div class="cover-confidential">CONFIDENCIAL</div>' : ''}
      
      <div class="cover-logo"><span>ORION</span> AI</div>
      
      <div class="cover-title">${docTitle}</div>
      
      <div class="cover-subtitle">${docSubtitle}</div>
      
      <div class="cover-divider"></div>
      
      <div class="cover-meta">
        <div class="meta-item">
          <span class="meta-label">Tipo</span>
          <span>${docTypeIcon}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Version</span>
          <span>${docVersion}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Fecha</span>
          <span>${fullDate}</span>
        </div>
        ${author ? `<div class="meta-item"><span class="meta-label">Autor</span><span>${author}</span></div>` : ''}
      </div>
      
      <div class="cover-footer">
        &copy; ${year} ${ORION_BRAND} ${ORION_VERSION} &mdash; Documentacion generada automaticamente
      </div>
    </div>`;
  }

  /**
   * Obtiene el subtítulo según el tipo de documento
   */
  private getDocumentSubtitle(documentType: string): string {
    const subtitles: Record<string, string> = {
      readme: 'Documentacion Tecnica del Proyecto',
      architecture: 'Documento de Arquitectura de Software (SAD)',
      api: 'Documentacion de API REST',
      contributing: 'Guia de Contribucion al Proyecto',
      general: 'Documentacion General',
    };
    const result = subtitles[documentType];
    return result !== undefined ? result : 'Documentacion General';
  }

  /**
   * Obtiene la etiqueta del tipo de documento para la portada
   */
  private getDocumentTypeLabel(documentType: string): string {
    const labels: Record<string, string> = {
      readme: 'README / Documentacion Tecnica',
      architecture: 'Arquitectura de Software (SAD)',
      api: 'Especificacion de API REST',
      contributing: 'Guia de Contribucion',
      general: 'Documentacion General',
    };
    const result = labels[documentType];
    return result !== undefined ? result : 'Documentacion General';
  }

  /**
   * Convierte Markdown a HTML estilizado para vista previa web
   */
  async markdownToHTML(markdown: string): Promise<string> {
    const htmlContent = await marked(markdown);
    const currentDate = getFormattedDate();
    const year = getCurrentYear();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="generator" content="${ORION_BRAND} ${ORION_VERSION}">
  <title>Vista Previa - ${ORION_BRAND}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.7;
      color: ${ORION_COLOR_TEXT};
      background: #F9FAFB;
    }

    .preview-header {
      background: linear-gradient(135deg, ${ORION_COLOR_DARK}, ${ORION_COLOR_PRIMARY});
      color: white;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .preview-header .brand {
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 3px;
    }

    .preview-header .brand span { font-weight: 700; }

    .preview-header .meta {
      font-size: 12px;
      opacity: 0.7;
    }

    .preview-content {
      max-width: 900px;
      margin: 40px auto;
      background: white;
      padding: 48px 56px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    h1 { font-size: 28px; color: ${ORION_COLOR_DARK}; border-bottom: 3px solid ${ORION_COLOR_PRIMARY}; padding-bottom: 12px; margin: 32px 0 16px; }
    h2 { font-size: 22px; color: ${ORION_COLOR_SECONDARY}; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin: 28px 0 12px; }
    h3 { font-size: 18px; color: ${ORION_COLOR_PRIMARY}; margin: 24px 0 10px; }
    h4 { font-size: 15px; color: #4B5563; margin: 18px 0 8px; }

    p { margin: 10px 0; }
    a { color: ${ORION_COLOR_PRIMARY}; }

    table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; border-radius: 8px; overflow: hidden; }
    th { background: linear-gradient(135deg, ${ORION_COLOR_PRIMARY}, ${ORION_COLOR_SECONDARY}); color: white; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 14px; border-bottom: 1px solid #E5E7EB; }
    tr:nth-child(even) { background: #F9FAFB; }

    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: #F3F4F6; color: ${ORION_COLOR_SECONDARY}; padding: 2px 6px; border-radius: 4px; }
    pre { background: #1F2937; color: #E5E7EB; padding: 20px; border-radius: 10px; overflow-x: auto; font-size: 13px; margin: 16px 0; }
    pre code { background: none; color: #E5E7EB; padding: 0; }

    blockquote { border-left: 4px solid ${ORION_COLOR_PRIMARY}; background: ${ORION_COLOR_LIGHT}; padding: 14px 20px; margin: 16px 0; border-radius: 0 8px 8px 0; }

    img { max-width: 100%; border-radius: 8px; margin: 16px auto; display: block; }
    hr { border: none; height: 2px; background: linear-gradient(90deg, transparent, ${ORION_COLOR_ACCENT}, transparent); margin: 32px 0; }
    ul, ol { padding-left: 24px; margin: 10px 0; }
    li { margin: 4px 0; }

    .preview-footer {
      text-align: center;
      padding: 24px;
      color: #9CA3AF;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="preview-header">
    <div class="brand"><span>ORION</span> AI</div>
    <div class="meta">Vista Previa | ${currentDate}</div>
  </div>
  <div class="preview-content">
    ${htmlContent}
  </div>
  <div class="preview-footer">
    &copy; ${year} ${ORION_BRAND} ${ORION_VERSION} &mdash; Documentacion generada automaticamente
  </div>
</body>
</html>`;
  }
}