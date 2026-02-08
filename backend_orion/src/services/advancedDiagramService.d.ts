import type { IsoflowModel } from './diagramService.js';
export declare class AdvancedDiagramService {
    /**
     * Genera diagrama usando Kroki con Mermaid (PNG de alta calidad)
     */
    generateMermaidImage(mermaidCode: string, outputPath: string, format?: 'png' | 'svg'): Promise<void>;
    /**
     * Fallback: Mermaid.ink (método alternativo)
     */
    private generateMermaidInk;
    /**
     * Genera diagrama profesional usando D2 (con iconos y estilo avanzado)
     */
    generateD2Diagram(d2Code: string, outputPath: string, format?: 'png' | 'svg'): Promise<void>;
    /**
     * Genera diagrama usando PlantUML (alternativa adicional)
     */
    generatePlantUMLDiagram(plantUMLCode: string, outputPath: string, format?: 'png' | 'svg'): Promise<void>;
    /**
     * Guarda modelo Isoflow como JSON (importable por FossFLOW)
     */
    saveIsoflowModel(model: IsoflowModel, outputPath: string): Promise<void>;
    /**
     * Genera HTML con Isoflow embebido (React + @isoflow/isopacks)
     * Este HTML renderiza un diagrama isométrico REAL
     */
    generateIsoflowHTML(model: IsoflowModel, outputPath: string): Promise<void>;
    /**
     * Genera imagen PNG del diagrama isométrico
     * Usa Puppeteer para renderizar el HTML de Isoflow y capturar screenshot
     */
    generateIsoflowImage(model: IsoflowModel, outputPath: string, options?: {
        width?: number;
        height?: number;
        format?: 'png' | 'jpeg';
        quality?: number;
    }): Promise<void>;
    /**
     * Construye el HTML completo que renderiza Isoflow con React
     * Usa CDN para React + renderizado isométrico con canvas
     */
    private buildIsoflowHTML;
    /**
     * Convierte modelo Isoflow → código Mermaid (fallback)
     */
    isoflowToMermaid(model: IsoflowModel): string;
}
//# sourceMappingURL=advancedDiagramService.d.ts.map