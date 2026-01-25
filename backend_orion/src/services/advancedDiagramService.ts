import axios from 'axios';
import * as fs from 'fs/promises';
import pako from 'pako';

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
      // Método 1: Kroki (más robusto)
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
      console.log(`✅ Diagrama Mermaid generado: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generando diagrama Mermaid con Kroki:', error);
      // Fallback: usar mermaid.ink
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
      console.log(`✅ Diagrama Mermaid.ink generado: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generando diagrama Mermaid.ink:', error);
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
      console.log(`✅ Diagrama D2 generado: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generando diagrama D2:', error);
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
      console.log(`✅ Diagrama PlantUML generado: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error generando diagrama PlantUML:', error);
      throw error;
    }
  }
}