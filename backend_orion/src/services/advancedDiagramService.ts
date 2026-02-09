import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import pako from 'pako';
import puppeteer from 'puppeteer';
import type { IsoflowModel } from './diagramService.js';

export class AdvancedDiagramService {
  /**
   * Genera diagrama usando Kroki con Mermaid (PNG de alta calidad)
   */
  async generateMermaidImage(
    mermaidCode: string,
    outputPath: string,
    format: 'png' | 'svg' = 'png'
  ): Promise<void> {
    try {
      const compressed = pako.deflate(mermaidCode, { level: 9 });
      const encoded = Buffer.from(compressed)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const url = `https://kroki.io/mermaid/${format}/${encoded}`;

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      await fs.writeFile(outputPath, response.data);
      console.log(`Diagrama Mermaid generado: ${outputPath}`);
    } catch (error) {
      console.error('Error generando diagrama Mermaid con Kroki:', error);
      await this.generateMermaidInk(mermaidCode, outputPath);
    }
  }

  /**
   * Fallback: Mermaid.ink (método alternativo)
   */
  private async generateMermaidInk(
    mermaidCode: string,
    outputPath: string
  ): Promise<void> {
    try {
      const encoded = Buffer.from(mermaidCode).toString('base64');
      const url = `https://mermaid.ink/img/${encoded}`;

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });

      await fs.writeFile(outputPath, response.data);
      console.log(`Diagrama Mermaid.ink generado: ${outputPath}`);
    } catch (error) {
      console.error('Error generando diagrama Mermaid.ink:', error);
      throw new Error('No se pudo generar el diagrama Mermaid');
    }
  }

  /**
   * Genera diagrama profesional usando D2 (con iconos y estilo avanzado)
   */
  async generateD2Diagram(
    d2Code: string,
    outputPath: string,
    format: 'png' | 'svg' = 'png'
  ): Promise<void> {
    try {
      const compressed = pako.deflate(d2Code, { level: 9 });
      const encoded = Buffer.from(compressed)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const url = `https://kroki.io/d2/${format}/${encoded}`;

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
      });

      await fs.writeFile(outputPath, response.data);
      console.log(`Diagrama D2 generado: ${outputPath}`);
    } catch (error) {
      console.error('Error generando diagrama D2:', error);
      throw new Error('No se pudo generar el diagrama D2');
    }
  }

  /**
   * Genera diagrama usando PlantUML (alternativa adicional)
   */
  async generatePlantUMLDiagram(
    plantUMLCode: string,
    outputPath: string,
    format: 'png' | 'svg' = 'png'
  ): Promise<void> {
    try {
      const compressed = pako.deflate(plantUMLCode, { level: 9 });
      const encoded = Buffer.from(compressed)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const url = `https://kroki.io/plantuml/${format}/${encoded}`;

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 12000,
      });

      await fs.writeFile(outputPath, response.data);
      console.log(`Diagrama PlantUML generado: ${outputPath}`);
    } catch (error) {
      console.error('Error generando diagrama PlantUML:', error);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════
  // ISOFLOW — Renderizado isométrico real + PNG
  // ═══════════════════════════════════════════════════════

  /**
   * Guarda modelo Isoflow como JSON (importable por FossFLOW)
   */
  async saveIsoflowModel(
    model: IsoflowModel,
    outputPath: string
  ): Promise<void> {
    await fs.writeFile(outputPath, JSON.stringify(model, null, 2), 'utf-8');
    console.log(`Modelo Isoflow JSON guardado: ${outputPath}`);
  }

  /**
   * Genera HTML con Isoflow embebido
   */
  async generateIsoflowHTML(
    model: IsoflowModel,
    outputPath: string
  ): Promise<void> {
    const html = this.buildIsoflowHTML(model);
    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(`Isoflow HTML generado: ${outputPath}`);
  }

  /**
   * Genera imagen PNG del diagrama isométrico
   */
  async generateIsoflowImage(
    model: IsoflowModel,
    outputPath: string,
    options: {
      width?: number;
      height?: number;
      format?: 'png' | 'jpeg';
      quality?: number;
    } = {}
  ): Promise<void> {
    const {
      width = 1920,
      height = 1080,
      format = 'png',
      quality = 100,
    } = options;

    const html = this.buildIsoflowHTML(model);

    let browser;
    try {
      console.log('Iniciando Puppeteer para renderizar Isoflow...');

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 2 });

      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      await page.waitForSelector('#iso-render-complete', { timeout: 15000 }).catch(() => {
        console.log('Timeout esperando render completo, capturando igualmente...');
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const screenshotOptions = {
        path: outputPath,
        type: format,
        fullPage: false,
        clip: { x: 0, y: 0, width, height },
        ...(format === 'jpeg' ? { quality } : {}),
      } as const;

      await page.screenshot(screenshotOptions);

      console.log(`Diagrama isométrico PNG generado: ${outputPath}`);
    } catch (error) {
      console.error('Error generando imagen Isoflow:', error);
      const htmlFallbackPath = outputPath.replace(/\.(png|jpeg|jpg)$/, '.html');
      await fs.writeFile(htmlFallbackPath, html, 'utf-8');
      console.log(`Fallback: HTML guardado en ${htmlFallbackPath}`);
      throw new Error(`No se pudo generar la imagen isométrica: ${error}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // SVG ISOMÉTRICOS 3D — Mismos iconos que Interfaz DiagramBlock.tsx (Front)
  // ═══════════════════════════════════════════════════════

  /**
   * Genera un icono SVG isométrico 3D para un tipo de componente.
   * Estos son los MISMOS iconos usados en el frontend DiagramBlock.tsx
   */
  private getIsoSVGIcon(type: string, color: string): string {
    const c = color;
    const cM = color + '80'; // mid opacity

    const icons: Record<string, string> = {
      // ── Server rack (isometric box with drive bays + LEDs) ──
      server: `<svg viewBox="0 0 80 90" width="70" height="78">
        <polygon points="10,55 40,70 40,30 10,15" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <polygon points="40,70 70,55 70,15 40,30" fill="${c}15" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,15 40,0 70,15 40,30" fill="${c}35" stroke="${cM}" stroke-width="1"/>
        <rect x="43" y="34" width="22" height="4" rx="0.5" fill="${c}50" stroke="${cM}" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>
        <rect x="43" y="40" width="22" height="4" rx="0.5" fill="${c}50" stroke="${cM}" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>
        <rect x="43" y="46" width="22" height="4" rx="0.5" fill="${c}50" stroke="${cM}" stroke-width="0.5" transform="skewY(-26.5) translate(0, 48)"/>
        <circle cx="48" cy="40" r="1.5" fill="${c}" opacity="0.9"><animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="53" cy="38" r="1.5" fill="#22c55e" opacity="0.7"/>
      </svg>`,

      // ── Client / Laptop (isometric) ──
      client: `<svg viewBox="0 0 80 70" width="72" height="63">
        <polygon points="15,10 45,0 70,12 40,22" fill="${c}30" stroke="${cM}" stroke-width="1"/>
        <polygon points="18,12 43,3 65,13 40,22" fill="${c}60" stroke="${c}" stroke-width="0.5"/>
        <polygon points="21,13 43,5 62,14 40,21" fill="${c}20"/>
        <polygon points="10,45 40,58 70,45 40,32" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,45 40,58 40,62 10,49" fill="${c}15" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="40,58 70,45 70,49 40,62" fill="${c}10" stroke="${cM}" stroke-width="0.5"/>
        <line x1="15" y1="22" x2="40" y2="32" stroke="${cM}" stroke-width="1"/>
        <circle cx="30" cy="44" r="0.8" fill="${cM}"/><circle cx="34" cy="42" r="0.8" fill="${cM}"/>
        <circle cx="38" cy="44" r="0.8" fill="${cM}"/><circle cx="42" cy="42" r="0.8" fill="${cM}"/>
        <circle cx="46" cy="44" r="0.8" fill="${cM}"/><circle cx="50" cy="42" r="0.8" fill="${cM}"/>
      </svg>`,

      // ── Browser ──
      browser: `<svg viewBox="0 0 80 70" width="72" height="63">
        <polygon points="5,15 40,0 75,15 40,30" fill="${c}30" stroke="${cM}" stroke-width="1"/>
        <polygon points="5,15 40,30 40,60 5,45" fill="${c}20" stroke="${cM}" stroke-width="1"/>
        <polygon points="40,30 75,15 75,45 40,60" fill="${c}12" stroke="${cM}" stroke-width="1"/>
        <line x1="5" y1="22" x2="40" y2="37" stroke="${cM}" stroke-width="0.8"/>
        <line x1="40" y1="37" x2="75" y2="22" stroke="${cM}" stroke-width="0.8"/>
        <circle cx="10" cy="18" r="1.5" fill="#ef4444" opacity="0.7"/>
        <circle cx="15" cy="16" r="1.5" fill="#eab308" opacity="0.7"/>
        <circle cx="20" cy="14" r="1.5" fill="#22c55e" opacity="0.7"/>
        <line x1="12" y1="28" x2="30" y2="36" stroke="${c}40" stroke-width="0.8" stroke-dasharray="3,2"/>
        <line x1="12" y1="33" x2="28" y2="40" stroke="${c}40" stroke-width="0.8" stroke-dasharray="3,2"/>
        <line x1="12" y1="38" x2="25" y2="43" stroke="${c}40" stroke-width="0.5" stroke-dasharray="3,2"/>
      </svg>`,

      // ── Database (isometric cylinder) ──
      database: `<svg viewBox="0 0 70 80" width="64" height="73">
        <ellipse cx="35" cy="60" rx="28" ry="10" fill="${c}20" stroke="${cM}" stroke-width="1"/>
        <rect x="7" y="20" width="56" height="40" fill="${c}18" stroke="none"/>
        <line x1="7" y1="20" x2="7" y2="60" stroke="${cM}" stroke-width="1"/>
        <line x1="63" y1="20" x2="63" y2="60" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="35" cy="20" rx="28" ry="10" fill="${c}35" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="35" cy="32" rx="28" ry="8" fill="none" stroke="${c}30" stroke-width="0.5" stroke-dasharray="3,3"/>
        <ellipse cx="35" cy="46" rx="28" ry="9" fill="none" stroke="${c}30" stroke-width="0.5" stroke-dasharray="3,3"/>
        <line x1="20" y1="28" x2="50" y2="28" stroke="${c}40" stroke-width="1" stroke-dasharray="4,2"/>
        <line x1="18" y1="42" x2="52" y2="42" stroke="${c}40" stroke-width="1" stroke-dasharray="4,2"/>
        <ellipse cx="35" cy="20" rx="18" ry="5" fill="${c}15" stroke="none"/>
      </svg>`,

      // ── Cloud ──
      cloud: `<svg viewBox="0 0 80 60" width="72" height="54">
        <ellipse cx="30" cy="35" rx="22" ry="14" fill="${c}20" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="50" cy="32" rx="20" ry="12" fill="${c}18" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="40" cy="25" rx="18" ry="12" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="25" cy="28" rx="14" ry="10" fill="${c}22" stroke="${cM}" stroke-width="0.8"/>
        <ellipse cx="55" cy="28" rx="12" ry="9" fill="${c}22" stroke="${cM}" stroke-width="0.8"/>
        <ellipse cx="38" cy="28" rx="12" ry="6" fill="${c}10" stroke="none"/>
        <path d="M36,38 L40,33 L44,38" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6"/>
        <line x1="40" y1="33" x2="40" y2="44" stroke="${c}" stroke-width="1.5" opacity="0.4"/>
      </svg>`,

      // ── API / Diamond with arrows ──
      api: `<svg viewBox="0 0 80 70" width="70" height="62">
        <polygon points="40,5 70,25 40,45 10,25" fill="${c}25" stroke="${cM}" stroke-width="1.2"/>
        <polygon points="10,25 40,45 40,55 10,35" fill="${c}15" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="40,45 70,25 70,35 40,55" fill="${c}10" stroke="${cM}" stroke-width="0.8"/>
        <path d="M28,22 L40,16 L52,22" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6"/>
        <path d="M28,30 L40,36 L52,30" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6"/>
        <circle cx="40" cy="26" r="3" fill="${c}" opacity="0.5"/>
        <circle cx="40" cy="26" r="1.5" fill="${c}" opacity="0.8"/>
      </svg>`,

      // ── Service (gear) ──
      service: `<svg viewBox="0 0 80 80" width="68" height="68">
        <polygon points="40,5 58,14 65,32 58,50 40,59 22,50 15,32 22,14" fill="${c}22" stroke="${cM}" stroke-width="1"/>
        <polygon points="38,2 42,2 44,8 36,8" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="60,11 63,14 58,18 55,15" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="67,30 67,34 62,35 62,31" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="60,49 63,52 58,54 55,51" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="38,58 42,58 44,62 36,62" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="17,49 20,52 18,54 15,51" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="13,30 13,34 18,35 18,31" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="17,11 20,14 18,18 15,15" fill="${c}30" stroke="${cM}" stroke-width="0.5"/>
        <circle cx="40" cy="32" r="12" fill="${c}15" stroke="${cM}" stroke-width="0.8"/>
        <circle cx="40" cy="32" r="6" fill="${c}30" stroke="${c}" stroke-width="1"/>
        <circle cx="40" cy="32" r="2" fill="${c}" opacity="0.7"/>
        <polygon points="40,59 22,50 22,54 40,63 58,54 58,50" fill="${c}10" stroke="${cM}" stroke-width="0.5"/>
      </svg>`,

      // ── Cache (hexagon + lightning) ──
      cache: `<svg viewBox="0 0 70 80" width="62" height="70">
        <polygon points="35,5 60,18 60,52 35,65 10,52 10,18" fill="${c}18" stroke="${cM}" stroke-width="1"/>
        <polygon points="38,15 25,40 33,40 28,58 48,30 38,30 44,15" fill="${c}" opacity="0.5"/>
        <polygon points="38,15 25,40 33,40 28,58 48,30 38,30 44,15" fill="none" stroke="${c}" stroke-width="1" opacity="0.8"/>
        <ellipse cx="35" cy="38" rx="14" ry="16" fill="${c}08"/>
      </svg>`,

      // ── Queue (stacked envelopes) ──
      queue: `<svg viewBox="0 0 80 70" width="70" height="62">
        <polygon points="15,45 40,55 65,45 40,35" fill="${c}18" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="15,45 40,55 40,60 15,50" fill="${c}12" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="40,55 65,45 65,50 40,60" fill="${c}08" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="15,35 40,45 65,35 40,25" fill="${c}25" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="15,35 40,45 40,50 15,40" fill="${c}15" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="40,45 65,35 65,40 40,50" fill="${c}10" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="15,25 40,35 65,25 40,15" fill="${c}35" stroke="${c}" stroke-width="1"/>
        <polygon points="15,25 40,35 40,40 15,30" fill="${c}20" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="40,35 65,25 65,30 40,40" fill="${c}12" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="15,25 40,15 40,22" fill="${c}15" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="65,25 40,15 40,22" fill="${c}10" stroke="${cM}" stroke-width="0.5"/>
      </svg>`,

      // ── Storage (hard drive) ──
      storage: `<svg viewBox="0 0 80 60" width="72" height="54">
        <polygon points="10,20 40,8 70,20 40,32" fill="${c}30" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,20 40,32 40,45 10,33" fill="${c}20" stroke="${cM}" stroke-width="1"/>
        <polygon points="40,32 70,20 70,33 40,45" fill="${c}12" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="38" cy="18" rx="10" ry="4" fill="none" stroke="${c}50" stroke-width="0.8"/>
        <ellipse cx="38" cy="18" rx="5" ry="2" fill="${c}30" stroke="${c}60" stroke-width="0.8"/>
        <circle cx="38" cy="18" r="1.5" fill="${c}" opacity="0.6"/>
        <line x1="38" y1="18" x2="50" y2="14" stroke="${c}80" stroke-width="1"/>
        <circle cx="50" cy="14" r="1" fill="${c}" opacity="0.7"/>
        <circle cx="60" cy="27" r="1.5" fill="${c}" opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/></circle>
      </svg>`,

      // ── CDN (globe) ──
      cdn: `<svg viewBox="0 0 70 70" width="62" height="62">
        <circle cx="35" cy="32" r="24" fill="${c}15" stroke="${cM}" stroke-width="1"/>
        <ellipse cx="35" cy="32" rx="24" ry="8" fill="none" stroke="${c}25" stroke-width="0.7"/>
        <ellipse cx="35" cy="22" rx="18" ry="5" fill="none" stroke="${c}20" stroke-width="0.5"/>
        <ellipse cx="35" cy="42" rx="18" ry="5" fill="none" stroke="${c}20" stroke-width="0.5"/>
        <ellipse cx="35" cy="32" rx="8" ry="24" fill="none" stroke="${c}25" stroke-width="0.7"/>
        <ellipse cx="35" cy="32" rx="16" ry="24" fill="none" stroke="${c}20" stroke-width="0.5"/>
        <circle cx="22" cy="26" r="2.5" fill="${c}" opacity="0.6"/>
        <circle cx="48" cy="28" r="2.5" fill="${c}" opacity="0.6"/>
        <circle cx="35" cy="40" r="2.5" fill="${c}" opacity="0.6"/>
        <line x1="22" y1="26" x2="35" y2="40" stroke="${c}" stroke-width="0.5" opacity="0.3"/>
        <line x1="48" y1="28" x2="35" y2="40" stroke="${c}" stroke-width="0.5" opacity="0.3"/>
        <line x1="22" y1="26" x2="48" y2="28" stroke="${c}" stroke-width="0.5" opacity="0.3"/>
      </svg>`,

      // ── User / Person ──
      person: `<svg viewBox="0 0 60 80" width="52" height="70">
        <circle cx="30" cy="18" r="10" fill="${c}30" stroke="${cM}" stroke-width="1"/>
        <circle cx="30" cy="16" r="7" fill="${c}20" stroke="none"/>
        <path d="M14,42 Q14,30 30,28 Q46,30 46,42 L46,50 Q46,55 30,58 Q14,55 14,50 Z" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <path d="M18,34 Q30,30 42,34" fill="none" stroke="${c}40" stroke-width="0.8"/>
        <rect x="26" y="38" width="8" height="6" rx="1" fill="${c}50" stroke="${c}" stroke-width="0.5"/>
      </svg>`,

      // ── Gateway (shield + lock) ──
      gateway: `<svg viewBox="0 0 70 80" width="62" height="70">
        <path d="M35,8 L58,18 L58,42 Q58,60 35,70 Q12,60 12,42 L12,18 Z" fill="${c}20" stroke="${cM}" stroke-width="1.2"/>
        <path d="M35,16 L50,23 L50,40 Q50,54 35,62 Q20,54 20,40 L20,23 Z" fill="${c}12" stroke="${c}40" stroke-width="0.8"/>
        <rect x="29" y="36" width="12" height="10" rx="2" fill="${c}40" stroke="${c}" stroke-width="0.8"/>
        <path d="M31,36 L31,30 Q31,24 35,24 Q39,24 39,30 L39,36" fill="none" stroke="${c}" stroke-width="1.2"/>
        <circle cx="35" cy="41" r="1.5" fill="${c}" opacity="0.8"/>
      </svg>`,

      // ── Lock (same as gateway but smaller) ──
      lock: `<svg viewBox="0 0 70 80" width="62" height="70">
        <path d="M35,8 L58,18 L58,42 Q58,60 35,70 Q12,60 12,42 L12,18 Z" fill="${c}20" stroke="${cM}" stroke-width="1.2"/>
        <path d="M35,16 L50,23 L50,40 Q50,54 35,62 Q20,54 20,40 L20,23 Z" fill="${c}12" stroke="${c}40" stroke-width="0.8"/>
        <rect x="29" y="36" width="12" height="10" rx="2" fill="${c}40" stroke="${c}" stroke-width="0.8"/>
        <path d="M31,36 L31,30 Q31,24 35,24 Q39,24 39,30 L39,36" fill="none" stroke="${c}" stroke-width="1.2"/>
        <circle cx="35" cy="41" r="1.5" fill="${c}" opacity="0.8"/>
      </svg>`,

      // ── Load Balancer (scale) ──
      loadbalancer: `<svg viewBox="0 0 80 70" width="70" height="62">
        <polygon points="40,55 55,62 40,68 25,62" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <rect x="38" y="25" width="4" height="30" fill="${c}20" stroke="${cM}" stroke-width="0.8"/>
        <line x1="12" y1="25" x2="68" y2="25" stroke="${c}" stroke-width="2" opacity="0.6"/>
        <polygon points="12,25 22,22 22,30 12,33" fill="${c}25" stroke="${cM}" stroke-width="0.8"/>
        <polygon points="58,22 68,25 68,33 58,30" fill="${c}25" stroke="${cM}" stroke-width="0.8"/>
        <path d="M30,18 L40,10 L50,18" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>
        <line x1="40" y1="10" x2="40" y2="25" stroke="${c}" stroke-width="1" opacity="0.4" stroke-dasharray="3,2"/>
      </svg>`,

      // ── Firewall (brick wall + flame) ──
      firewall: `<svg viewBox="0 0 80 70" width="70" height="62">
        <polygon points="10,20 40,8 70,20 40,32" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,20 40,32 40,55 10,43" fill="${c}18" stroke="${cM}" stroke-width="1"/>
        <polygon points="40,32 70,20 70,43 40,55" fill="${c}12" stroke="${cM}" stroke-width="1"/>
        <line x1="10" y1="28" x2="40" y2="40" stroke="${c}30" stroke-width="0.5"/>
        <line x1="40" y1="40" x2="70" y2="28" stroke="${c}30" stroke-width="0.5"/>
        <line x1="10" y1="36" x2="40" y2="48" stroke="${c}30" stroke-width="0.5"/>
        <line x1="40" y1="48" x2="70" y2="36" stroke="${c}30" stroke-width="0.5"/>
        <path d="M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z" fill="${c}" opacity="0.5">
          <animate attributeName="d" values="M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z;M35,13 Q31,7 35,2 Q38,7 41,4 Q39,10 43,13 Q40,11 38,13 Z;M35,12 Q32,8 35,3 Q37,7 40,5 Q38,10 42,12 Q40,10 38,12 Z" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>`,

      // ── Microservice (hexagon) ──
      microservice: `<svg viewBox="0 0 70 80" width="62" height="70">
        <polygon points="35,5 60,18 60,52 35,65 10,52 10,18" fill="${c}22" stroke="${cM}" stroke-width="1.2"/>
        <polygon points="35,12 52,22 52,46 35,56 18,46 18,22" fill="${c}12" stroke="${c}40" stroke-width="0.8"/>
        <circle cx="35" cy="34" r="8" fill="${c}25" stroke="${c}" stroke-width="1"/>
        <circle cx="35" cy="34" r="3" fill="${c}" opacity="0.6"/>
        <line x1="35" y1="26" x2="35" y2="22" stroke="${c}" stroke-width="1" opacity="0.5"/>
        <line x1="35" y1="42" x2="35" y2="46" stroke="${c}" stroke-width="1" opacity="0.5"/>
        <line x1="27" y1="34" x2="22" y2="34" stroke="${c}" stroke-width="1" opacity="0.5"/>
        <line x1="43" y1="34" x2="48" y2="34" stroke="${c}" stroke-width="1" opacity="0.5"/>
      </svg>`,

      // ── Container (box with handle) ──
      container: `<svg viewBox="0 0 80 80" width="68" height="68">
        <polygon points="10,50 40,65 70,50 40,35" fill="${c}20" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,25 40,40 40,65 10,50" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <polygon points="40,40 70,25 70,50 40,65" fill="${c}15" stroke="${cM}" stroke-width="1"/>
        <polygon points="10,25 40,10 70,25 40,40" fill="${c}35" stroke="${cM}" stroke-width="1"/>
        <line x1="20" y1="18" x2="50" y2="18" stroke="${c}" stroke-width="2.5" opacity="0.6" stroke-linecap="round"/>
        <line x1="15" y1="32" x2="32" y2="40" stroke="${c}30" stroke-width="0.5"/>
        <line x1="15" y1="38" x2="32" y2="46" stroke="${c}30" stroke-width="0.5"/>
      </svg>`,

      // ── Lambda (function icon) ──
      lambda: `<svg viewBox="0 0 70 80" width="62" height="70">
        <polygon points="35,5 60,18 60,52 35,65 10,52 10,18" fill="${c}18" stroke="${cM}" stroke-width="1"/>
        <text x="35" y="42" text-anchor="middle" font-size="30" font-weight="bold" fill="${c}" opacity="0.7" font-family="serif">λ</text>
        <polygon points="35,65 10,52 10,56 35,69 60,56 60,52" fill="${c}10" stroke="${cM}" stroke-width="0.5"/>
      </svg>`,

      // ── Monitor (screen with chart) ──
      monitor: `<svg viewBox="0 0 70 70" width="62" height="62">
        <polygon points="10,15 55,5 65,22 20,32" fill="${c}25" stroke="${cM}" stroke-width="1"/>
        <polygon points="14,17 53,8 61,22 22,30" fill="${c}12" stroke="${c}40" stroke-width="0.5"/>
        <polyline points="18,26 28,22 35,24 42,17 50,19 57,14" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.7"/>
        <circle cx="28" cy="22" r="1.5" fill="${c}" opacity="0.8"/>
        <circle cx="42" cy="17" r="1.5" fill="${c}" opacity="0.8"/>
        <circle cx="57" cy="14" r="1.5" fill="${c}" opacity="0.8"/>
        <polygon points="32,32 42,38 42,42 32,36" fill="${c}20" stroke="${cM}" stroke-width="0.5"/>
        <polygon points="25,42 45,48 50,46 30,40" fill="${c}20" stroke="${cM}" stroke-width="0.8"/>
      </svg>`,

      // ── Default (isometric cube) ──
      default: `<svg viewBox="0 0 70 80" width="62" height="70">
        <polygon points="5,40 35,55 35,25 5,10" fill="${c}22" stroke="${cM}" stroke-width="1"/>
        <polygon points="35,55 65,40 65,10 35,25" fill="${c}15" stroke="${cM}" stroke-width="1"/>
        <polygon points="5,10 35,0 65,10 35,25" fill="${c}30" stroke="${cM}" stroke-width="1"/>
        <line x1="35" y1="25" x2="35" y2="55" stroke="${c}" stroke-width="0.8" opacity="0.3"/>
        <line x1="12" y1="22" x2="28" y2="30" stroke="${c}30" stroke-width="0.5" stroke-dasharray="2,2"/>
        <line x1="12" y1="30" x2="28" y2="38" stroke="${c}30" stroke-width="0.5" stroke-dasharray="2,2"/>
      </svg>`,
    };

    return icons[type?.toLowerCase()] || icons.default;
  }

  /**
   * Genera una plataforma isométrica diamante SVG
   */
  private getIsoPlatformSVG(color: string, w: number = 120, h: number = 32): string {
    const hw = w / 2;
    const hh = h / 2;
    const depth = 12;
    return `<svg viewBox="0 0 ${w} ${h + depth}" width="${w}" height="${h + depth}">
      <polygon points="${hw},0 ${w},${hh} ${hw},${h} 0,${hh}" fill="${color}12" stroke="${color}30" stroke-width="1"/>
      <polygon points="0,${hh} ${hw},${h} ${hw},${h + depth} 0,${hh + depth}" fill="${color}08" stroke="${color}20" stroke-width="0.5"/>
      <polygon points="${hw},${h} ${w},${hh} ${w},${hh + depth} ${hw},${h + depth}" fill="${color}05" stroke="${color}15" stroke-width="0.5"/>
      <polygon points="${hw},4 ${w - 8},${hh} ${hw},${h - 4} 8,${hh}" fill="${color}06" stroke="none"/>
    </svg>`;
  }

  /**
   * Construye el HTML completo que renderiza el diagrama isométrico 3D
   * con SVG icons reales (mismos que DiagramBlock.tsx del frontend)
   */
  private buildIsoflowHTML(model: IsoflowModel): string {
    // Color palette por tipo
    const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
      person:       { bg: '#0c1929', border: '#3b82f6', glow: 'rgba(59,130,246,0.35)' },
      client:       { bg: '#0c1929', border: '#3b82f6', glow: 'rgba(59,130,246,0.35)' },
      browser:      { bg: '#0c1929', border: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
      server:       { bg: '#0c1f15', border: '#22c55e', glow: 'rgba(34,197,94,0.35)' },
      service:      { bg: '#1f0c1f', border: '#a855f7', glow: 'rgba(168,85,247,0.35)' },
      database:     { bg: '#1f150c', border: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
      cache:        { bg: '#0c1f1f', border: '#06b6d4', glow: 'rgba(6,182,212,0.35)' },
      queue:        { bg: '#1f0c15', border: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
      storage:      { bg: '#151f0c', border: '#84cc16', glow: 'rgba(132,204,22,0.35)' },
      cdn:          { bg: '#0c151f', border: '#0ea5e9', glow: 'rgba(14,165,233,0.35)' },
      cloud:        { bg: '#0f1629', border: '#818cf8', glow: 'rgba(129,140,248,0.35)' },
      api:          { bg: '#0c1929', border: '#38bdf8', glow: 'rgba(56,189,248,0.35)' },
      gateway:      { bg: '#1a0c29', border: '#c084fc', glow: 'rgba(192,132,252,0.35)' },
      lock:         { bg: '#290c0c', border: '#f87171', glow: 'rgba(248,113,113,0.35)' },
      loadbalancer: { bg: '#0c2920', border: '#34d399', glow: 'rgba(52,211,153,0.35)' },
      firewall:     { bg: '#290c0c', border: '#f87171', glow: 'rgba(248,113,113,0.35)' },
      monitor:      { bg: '#29200c', border: '#fbbf24', glow: 'rgba(251,191,36,0.35)' },
      microservice: { bg: '#0f1629', border: '#818cf8', glow: 'rgba(129,140,248,0.35)' },
      container:    { bg: '#1f150c', border: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
      lambda:       { bg: '#1f150c', border: '#f97316', glow: 'rgba(249,115,22,0.35)' },
      default:      { bg: '#0f172a', border: '#64748b', glow: 'rgba(100,116,139,0.25)' },
    };

    const getColor = (type: string) => TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.default;

    // Pre-generate all node SVGs
    const nodesJson = JSON.stringify(model.nodes.map((n, i) => ({
      id: n.id,
      name: n.label,
      type: n.type || n.icon || 'default',
      description: n.description || '',
      x: n.position?.x ?? (i % 4),
      y: n.position?.y ?? Math.floor(i / 4),
      group: n.group || '',
      iconSvg: this.getIsoSVGIcon(n.type || n.icon || 'default', getColor(n.type || n.icon || 'default').border),
      platformSvg: this.getIsoPlatformSVG(getColor(n.type || n.icon || 'default').border, 160, 40),
      color: getColor(n.type || n.icon || 'default'),
    })));

    const edgesJson = JSON.stringify(model.edges.map(e => ({
      from: e.from,
      to: e.to,
      label: e.label || '',
      color: e.style?.color || '',
      animated: e.style?.animated || false,
      dashed: e.style?.strokeDash ? true : false,
    })));

    const groupsJson = JSON.stringify(model.groups || []);
    const colorsJson = JSON.stringify(TYPE_COLORS);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${model.name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { 
      width:100%; height:100%; overflow:hidden;
      background: #0a0e1a;
      font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
      user-select: none;
    }

    #iso-grid {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }

    #canvas {
      position: absolute;
      top: 0; left: 0;
      cursor: grab;
      transform-origin: 0 0;
      z-index: 1;
    }
    #canvas.grabbing { cursor: grabbing; }

    .iso-node {
      position: absolute;
      width: 200px;
      text-align: center;
      cursor: grab;
      z-index: 10;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
      transition: filter 0.3s ease;
    }
    .iso-node:active { cursor: grabbing; }
    .iso-node:hover {
      z-index: 20;
      filter: drop-shadow(0 8px 30px rgba(0,0,0,0.6));
    }
    .iso-node:hover .iso-platform { opacity: 0.95; }
    .iso-node:hover .iso-object { transform: translateY(-6px); }

    .iso-platform-wrap {
      position: relative;
      width: 200px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .iso-platform {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.75;
      transition: opacity 0.3s;
    }

    .iso-object {
      position: relative;
      z-index: 2;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }

    .iso-label-box {
      margin-top: 4px;
      opacity: 0.9;
      transition: all 0.3s ease;
    }
    .iso-label-name {
      color: #e2e8f0;
      font-weight: 700;
      font-size: 12.5px;
      line-height: 1.3;
    }
    .iso-label-desc {
      color: #64748b;
      font-size: 10px;
      line-height: 1.3;
      margin-top: 2px;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .iso-label-badge {
      display: inline-block;
      margin-top: 5px;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 2px 10px;
      border-radius: 4px;
      border: 1px solid;
    }

    .iso-nametag {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15,23,42,0.9);
      border: 1px solid rgba(100,116,139,0.3);
      border-radius: 4px;
      padding: 3px 10px;
      white-space: nowrap;
      z-index: 30;
      backdrop-filter: blur(6px);
    }
    .iso-nametag-text {
      color: #cbd5e1;
      font-size: 11px;
      font-weight: 600;
    }
    .iso-nametag-line {
      position: absolute;
      bottom: -16px;
      left: 50%;
      width: 1px;
      height: 16px;
      background: rgba(100,116,139,0.4);
    }
    .iso-nametag-dot {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(100,116,139,0.6);
    }

    .edge-label {
      position: absolute;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      color: #94a3b8;
      background: rgba(15,23,42,0.85);
      border: 1px solid rgba(71,85,105,0.4);
      pointer-events: none;
      white-space: nowrap;
      backdrop-filter: blur(8px);
      transform: translate(-50%, -50%);
      z-index: 8;
    }

    #edges-svg {
      position: absolute;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 5;
      overflow: visible;
    }

    @keyframes flowDash { to { stroke-dashoffset: -24; } }
    .edge-line-animated { animation: flowDash 2s linear infinite; }

    .controls {
      position: fixed;
      bottom: 16px; left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 4px;
      background: rgba(10,14,26,0.9);
      border: 1px solid rgba(71,85,105,0.3);
      border-radius: 10px;
      padding: 5px 8px;
      z-index: 50;
      backdrop-filter: blur(16px);
    }
    .ctrl-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(71,85,105,0.2);
      border-radius: 6px;
      background: transparent;
      color: #64748b;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ctrl-btn:hover { background: rgba(51,65,85,0.4); color: #e2e8f0; }
    .ctrl-sep { width:1px; background:rgba(71,85,105,0.2); margin:4px 2px; }
    .zoom-display {
      color: #475569;
      font-size: 11px;
      display: flex;
      align-items: center;
      padding: 0 6px;
      font-variant-numeric: tabular-nums;
      min-width: 40px;
      justify-content: center;
    }

    .stats-bar {
      position: fixed;
      bottom: 16px; left: 16px;
      display: flex; gap: 14px;
      z-index: 50;
    }
    .stat-item {
      display: flex; align-items: center; gap: 5px;
      color: #334155;
      font-size: 10.5px;
    }
    .stat-dot { width: 5px; height: 5px; border-radius: 50%; }

    .legend {
      position: fixed;
      top: 16px; right: 16px;
      background: rgba(10,14,26,0.88);
      border: 1px solid rgba(71,85,105,0.25);
      border-radius: 10px;
      padding: 12px 16px;
      z-index: 50;
      backdrop-filter: blur(16px);
    }
    .legend-title {
      color: #475569;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .legend-item { display: flex; align-items: center; gap: 8px; margin: 5px 0; }
    .legend-color {
      width: 18px; height: 12px;
      border-radius: 2px;
      border: 1px solid;
      flex-shrink: 0;
    }
    .legend-label { color: #94a3b8; font-size: 11px; }

    .diagram-title {
      position: fixed;
      top: 16px; left: 16px;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .diagram-title-text {
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .title-badge {
      font-size: 8.5px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .iso-node { animation: fadeInUp 0.6s ease-out backwards; }
  </style>
</head>
<body>
  <svg id="iso-grid" width="100%" height="100%">
    <defs>
      <pattern id="isoGrid" width="56" height="32" patternUnits="userSpaceOnUse">
        <line x1="0" y1="16" x2="28" y2="0" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
        <line x1="28" y1="0" x2="56" y2="16" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
        <line x1="0" y1="16" x2="28" y2="32" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
        <line x1="28" y1="32" x2="56" y2="16" stroke="rgba(99,102,241,0.06)" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#isoGrid)"/>
  </svg>

  <div id="canvas">
    <svg id="edges-svg"></svg>
  </div>

  <div class="controls">
    <button class="ctrl-btn" id="zoomIn" title="Zoom in">+</button>
    <span class="zoom-display" id="zoomDisplay">100%</span>
    <button class="ctrl-btn" id="zoomOut" title="Zoom out">−</button>
    <div class="ctrl-sep"></div>
    <button class="ctrl-btn" id="fitBtn" title="Fit to view">⊡</button>
    <button class="ctrl-btn" id="resetBtn" title="Reset view">↺</button>
  </div>

  <script>
    var NODES = ${nodesJson};
    var EDGES = ${edgesJson};
    var TYPE_COLORS = ${colorsJson};

    var zoom = 1, panX = 0, panY = 0;
    var isPanning = false, panStartX = 0, panStartY = 0;
    var draggingNode = null, dragOffsetX = 0, dragOffsetY = 0;

    var SPACING_X = 280, SPACING_Y = 220;
    var NODE_W = 200, NODE_H = 180;
    var canvas = document.getElementById('canvas');
    var svg = document.getElementById('edges-svg');

    var nodeState = NODES.map(function(n, i) {
      return {
        id: n.id,
        name: n.name,
        type: n.type,
        description: n.description,
        px: 120 + n.x * SPACING_X,
        py: 120 + n.y * SPACING_Y,
        iconSvg: n.iconSvg,
        platformSvg: n.platformSvg,
        color: n.color,
      };
    });

    function getColor(type) {
      return TYPE_COLORS[type] || TYPE_COLORS['default'];
    }

    // ═══ Create nodes ═══
    nodeState.forEach(function(n, i) {
      var c = n.color;
      var el = document.createElement('div');
      el.className = 'iso-node';
      el.dataset.idx = i;
      el.style.left = n.px + 'px';
      el.style.top = n.py + 'px';
      el.style.animationDelay = (i * 0.1) + 's';

      el.innerHTML = 
        '<div class="iso-nametag">' +
          '<span class="iso-nametag-text">' + n.name + '</span>' +
          '<div class="iso-nametag-line"></div>' +
          '<div class="iso-nametag-dot" style="background:' + c.border + '80;"></div>' +
        '</div>' +
        '<div class="iso-object">' + n.iconSvg + '</div>' +
        '<div class="iso-platform">' + n.platformSvg + '</div>' +
        '<div class="iso-label-box">' +
          (n.description ? '<div class="iso-label-desc">' + n.description + '</div>' : '') +
          '<div class="iso-label-badge" style="color:' + c.border + '; border-color:' + c.border + '40; background:' + c.border + '12;">' + n.type.toUpperCase() + '</div>' +
        '</div>';

      el.addEventListener('mouseenter', function() {
        el.style.filter = 'drop-shadow(0 12px 40px ' + c.glow + ')';
      });
      el.addEventListener('mouseleave', function() {
        el.style.filter = 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))';
      });

      canvas.appendChild(el);
    });

    // ═══ Render edges ═══
    function renderEdges() {
      var W = 5000, H = 5000;
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      svg.style.width = W + 'px';
      svg.style.height = H + 'px';

      var html = '<defs>';
      var usedColors = {};
      EDGES.forEach(function(e) {
        var fromNode = nodeState.find(function(n) { return n.id === e.from; });
        if (!fromNode) return;
        var ec = e.color || fromNode.color.border;
        if (!usedColors[ec]) {
          usedColors[ec] = true;
          html += '<marker id="arr-' + ec.replace('#','') + '" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 1, 8 4, 0 7" fill="' + ec + '" opacity="0.7"/></marker>';
        }
      });
      html += '<filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      html += '</defs>';

      var labelsDiv = document.getElementById('edge-labels');
      if (labelsDiv) labelsDiv.remove();
      var newLabels = document.createElement('div');
      newLabels.id = 'edge-labels';
      newLabels.style.position = 'absolute';
      newLabels.style.top = '0';
      newLabels.style.left = '0';
      newLabels.style.pointerEvents = 'none';
      newLabels.style.zIndex = '8';
      canvas.appendChild(newLabels);

      EDGES.forEach(function(e) {
        var fromNode = nodeState.find(function(n) { return n.id === e.from; });
        var toNode = nodeState.find(function(n) { return n.id === e.to; });
        if (!fromNode || !toNode) return;

        var x1 = fromNode.px + NODE_W / 2;
        var y1 = fromNode.py + 90;
        var x2 = toNode.px + NODE_W / 2;
        var y2 = toNode.py + 90;
        var ec = e.color || fromNode.color.border;
        var markerId = 'arr-' + ec.replace('#','');

        var dx = x2 - x1;
        var dy = y2 - y1;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var tension = Math.min(dist * 0.3, 120);

        var cx1, cy1, cx2, cy2;
        if (Math.abs(dy) > Math.abs(dx)) {
          cx1 = x1; cy1 = y1 + (dy > 0 ? tension : -tension);
          cx2 = x2; cy2 = y2 - (dy > 0 ? tension : -tension);
        } else {
          cx1 = x1 + (dx > 0 ? tension : -tension); cy1 = y1;
          cx2 = x2 - (dx > 0 ? tension : -tension); cy2 = y2;
        }

        var pathD = 'M' + x1 + ',' + y1 + ' C' + cx1 + ',' + cy1 + ' ' + cx2 + ',' + cy2 + ' ' + x2 + ',' + y2;

        html += '<path d="' + pathD + '" fill="none" stroke="' + ec + '" stroke-width="8" opacity="0.04" filter="url(#edgeGlow)"/>';
        html += '<path d="' + pathD + '" fill="none" stroke="' + ec + '" stroke-width="2" opacity="0.45" stroke-dasharray="6,4" marker-end="url(#' + markerId + ')" class="edge-line-animated"/>';
        html += '<circle r="3" fill="' + ec + '" opacity="0.7"><animateMotion dur="' + (2 + Math.random() * 2) + 's" repeatCount="indefinite" path="' + pathD + '"/></circle>';
        html += '<circle r="2" fill="' + ec + '" opacity="0.4"><animateMotion dur="' + (2.5 + Math.random() * 2) + 's" repeatCount="indefinite" begin="-1s" path="' + pathD + '"/></circle>';

        if (e.label) {
          var lx = (x1 + x2) / 2;
          var ly = (y1 + y2) / 2 - 8;
          var label = document.createElement('div');
          label.className = 'edge-label';
          label.style.left = lx + 'px';
          label.style.top = ly + 'px';
          label.textContent = e.label;
          newLabels.appendChild(label);
        }
      });

      svg.innerHTML = html;
    }

    renderEdges();

    // ═══ Transform ═══
    function applyTransform() {
      canvas.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
      document.getElementById('zoomDisplay').textContent = Math.round(zoom * 100) + '%';
    }

    // ═══ Pan ═══
    document.addEventListener('mousedown', function(e) {
      var nodeEl = e.target.closest('.iso-node');
      if (nodeEl && e.button === 0) {
        var idx = parseInt(nodeEl.dataset.idx);
        draggingNode = idx;
        var rect = nodeEl.getBoundingClientRect();
        dragOffsetX = (e.clientX - rect.left) / zoom;
        dragOffsetY = (e.clientY - rect.top) / zoom;
        nodeEl.style.zIndex = 100;
        e.preventDefault();
        return;
      }
      if (e.button === 0 && !nodeEl) {
        isPanning = true;
        panStartX = e.clientX - panX;
        panStartY = e.clientY - panY;
        canvas.classList.add('grabbing');
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (draggingNode !== null) {
        var newPx = (e.clientX - panX) / zoom - dragOffsetX;
        var newPy = (e.clientY - panY) / zoom - dragOffsetY;
        nodeState[draggingNode].px = newPx;
        nodeState[draggingNode].py = newPy;
        var el = document.querySelectorAll('.iso-node')[draggingNode];
        el.style.left = newPx + 'px';
        el.style.top = newPy + 'px';
        renderEdges();
        return;
      }
      if (isPanning) {
        panX = e.clientX - panStartX;
        panY = e.clientY - panStartY;
        applyTransform();
      }
    });

    document.addEventListener('mouseup', function() {
      if (draggingNode !== null) {
        var el = document.querySelectorAll('.iso-node')[draggingNode];
        el.style.zIndex = 10;
        draggingNode = null;
      }
      isPanning = false;
      canvas.classList.remove('grabbing');
    });

    // ═══ Zoom ═══
    document.addEventListener('wheel', function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? 0.9 : 1.1;
      var newZoom = Math.min(3, Math.max(0.15, zoom * delta));
      var mx = e.clientX, my = e.clientY;
      panX = mx - (mx - panX) * (newZoom / zoom);
      panY = my - (my - panY) * (newZoom / zoom);
      zoom = newZoom;
      applyTransform();
    }, { passive: false });

    // ═══ Controls ═══
    document.getElementById('zoomIn').onclick = function() { zoom = Math.min(3, zoom * 1.25); applyTransform(); };
    document.getElementById('zoomOut').onclick = function() { zoom = Math.max(0.15, zoom / 1.25); applyTransform(); };
    document.getElementById('resetBtn').onclick = function() { zoom = 1; panX = 0; panY = 0; applyTransform(); };
    document.getElementById('fitBtn').onclick = fitToView;

    function fitToView() {
      if (nodeState.length === 0) return;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodeState.forEach(function(n) {
        if (n.px < minX) minX = n.px;
        if (n.py < minY) minY = n.py;
        if (n.px + NODE_W > maxX) maxX = n.px + NODE_W;
        if (n.py + NODE_H > maxY) maxY = n.py + NODE_H;
      });
      var contentW = maxX - minX + 100;
      var contentH = maxY - minY + 100;
      var viewW = window.innerWidth;
      var viewH = window.innerHeight;
      zoom = Math.min(viewW / contentW, viewH / contentH, 1.2) * 0.82;
      panX = (viewW - contentW * zoom) / 2 - minX * zoom + 50;
      panY = (viewH - contentH * zoom) / 2 - minY * zoom + 50;
      applyTransform();
    }

    // ═══ Legend ═══
    var types = [];
    nodeState.forEach(function(n) { if (types.indexOf(n.type) === -1) types.push(n.type); });
    var legendEl = document.createElement('div');
    legendEl.className = 'legend';
    legendEl.innerHTML = '<div class="legend-title">Components</div>' +
      types.map(function(t) {
        var cc = getColor(t);
        return '<div class="legend-item"><div class="legend-color" style="background:' + cc.border + '30;border-color:' + cc.border + ';"></div><span class="legend-label">' + t + '</span></div>';
      }).join('');
    document.body.appendChild(legendEl);

    // ═══ Stats ═══
    var statsEl = document.createElement('div');
    statsEl.className = 'stats-bar';
    statsEl.innerHTML = 
      '<div class="stat-item"><div class="stat-dot" style="background:#818cf8;"></div>' + nodeState.length + ' components</div>' +
      '<div class="stat-item"><div class="stat-dot" style="background:#22c55e;"></div>' + EDGES.length + ' connections</div>' +
      '<div class="stat-item"><div class="stat-dot" style="background:#f59e0b;"></div>' + types.length + ' layers</div>';
    document.body.appendChild(statsEl);

    // ═══ Title ═══
    var titleEl = document.createElement('div');
    titleEl.className = 'diagram-title';
    titleEl.innerHTML = '<span class="diagram-title-text">${model.name}</span>' +
      '<span class="title-badge" style="background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#818cf8;">ISOMETRIC</span>' +
      '<span class="title-badge" style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);color:#22c55e;">AI Generated</span>';
    document.body.appendChild(titleEl);

    // ═══ Initial fit ═══
    setTimeout(fitToView, 150);
    window.addEventListener('resize', function() { setTimeout(fitToView, 50); });

    // Signal render complete for Puppeteer
    setTimeout(function() {
      var signal = document.createElement('div');
      signal.id = 'iso-render-complete';
      signal.style.display = 'none';
      document.body.appendChild(signal);
    }, 500);
  </script>
</body>
</html>`;
  }

  /**
   * Convierte modelo Isoflow → código Mermaid (fallback)
   */
  isoflowToMermaid(model: IsoflowModel): string {
    const ICON_MAP: Record<string, string> = {
      person: '👤', browser: '🖥️', server: '⚙️', database: '🗄️',
      cloud: '☁️', queue: '📨', lock: '🔐', cache: '⚡',
      lambda: 'λ', cdn: '🌐', loadbalancer: '⚖️', firewall: '🛡️',
      storage: '💾', microservice: '🔷', container: '📦',
    };

    let mermaid = 'graph TB\n';

    const grouped = new Map<string, IsoflowModel['nodes']>();
    model.nodes.forEach(node => {
      const g = node.group || 'default';
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g)!.push(node);
    });

    const groupLabels = new Map<string, string>();
    model.groups?.forEach(g => groupLabels.set(g.id, g.label));

    grouped.forEach((nodes, groupId) => {
      const label = groupLabels.get(groupId) || groupId;
      mermaid += `    subgraph "${label}"\n`;
      nodes.forEach(node => {
        const icon = ICON_MAP[node.icon || node.type] || '📦';
        if (node.type === 'database') {
          mermaid += `        ${node.id}[(${icon} ${node.label})]\n`;
        } else {
          mermaid += `        ${node.id}[${icon} ${node.label}]\n`;
        }
      });
      mermaid += '    end\n';
    });

    model.edges.forEach(edge => {
      const label = edge.label ? `|${edge.label}|` : '';
      const arrow = edge.style?.strokeDash ? '-.->' : '-->';
      mermaid += `    ${edge.from} ${arrow}${label} ${edge.to}\n`;
    });

    return mermaid;
  }
}