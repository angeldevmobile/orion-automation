import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { marked } from 'marked';
import { AdvancedDiagramService } from './advancedDiagramService.js'; 

export class DocumentExportService {
  private advancedDiagram = new AdvancedDiagramService();

  /**
   * Convierte Markdown a PDF con diagramas de alta calidad
   */
  async markdownToPDF(
    markdown: string,
    outputPath: string,
    options?: {
      mermaidCode?: string;
      d2Code?: string;
    }
  ): Promise<void> {
    const outputDir = path.dirname(outputPath);
    const baseName = path.basename(outputPath, '.pdf');

    // Generar diagramas como imágenes de alta calidad
    if (options?.mermaidCode) {
      const imagePath = path.join(outputDir, `${baseName}_mermaid.png`);
      
      try {
        await this.advancedDiagram.generateMermaidImage(
          options.mermaidCode,
          imagePath,
          'png'
        );

        // Reemplazar TODOS los bloques Mermaid por imagen
        markdown = markdown.replace(
          /```mermaid\n[\s\S]*?\n```/g,
          `![Diagrama de Arquitectura](${imagePath})`
        );
      } catch (error) {
        console.error('❌ Error generando diagrama Mermaid:', error);
      }
    }

    if (options?.d2Code) {
      const imagePath = path.join(outputDir, `${baseName}_d2.png`);
      
      try {
        await this.advancedDiagram.generateD2Diagram(
          options.d2Code,
          imagePath,
          'png'
        );

        // Reemplazar TODOS los bloques D2 por imagen
        markdown = markdown.replace(
          /```d2\n[\s\S]*?\n```/g,
          `![Diagrama D2 Profesional](${imagePath})`
        );
      } catch (error) {
        console.error('❌ Error generando diagrama D2:', error);
      }
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      // Convertir markdown a HTML
      const htmlContent = await marked(markdown);

      // HTML template con estilo profesional
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { 
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: avoid;
    }
    h2 {
      color: #34495e;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 5px;
      margin-top: 30px;
    }
    h3 {
      color: #546e7a;
      margin-top: 20px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #3498db;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      border-left: 4px solid #3498db;
    }
    pre code {
      background: none;
      padding: 0;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 30px auto;
      page-break-inside: avoid;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin: 20px 0;
      color: #555;
      font-style: italic;
    }
    ul, ol {
      margin: 15px 0;
      padding-left: 30px;
    }
    li {
      margin: 8px 0;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Esperar a que las imágenes carguen
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generar PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '2cm',
          right: '2cm',
          bottom: '2cm',
          left: '2cm',
        },
      });

      console.log(`✅ PDF generado: ${outputPath}`);
    } finally {
      await browser.close();
    }
  }

  /**
   * Convierte Markdown a HTML para vista previa
   */
  async markdownToHTML(markdown: string): Promise<string> {
    const html = await marked(markdown);
    return html;
  }
}