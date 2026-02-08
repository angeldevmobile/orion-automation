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
export declare class DocumentExportService {
    private advancedDiagram;
    /**
     * Convierte Markdown a PDF profesional con branding Orion AI
     */
    markdownToPDF(markdown: string, outputPath: string, options?: PDFExportOptions): Promise<void>;
    /**
     * Procesa y convierte TODOS los bloques de diagramas en el markdown a imágenes
     */
    private processAllDiagrams;
    /**
     * Construye el HTML profesional completo con portada, TOC y estilos Orion AI
     */
    private buildProfessionalHTML;
    /**
     * Construye la portada profesional del documento
     */
    private buildCoverPage;
    /**
     * Obtiene el subtítulo según el tipo de documento
     */
    private getDocumentSubtitle;
    /**
     * Obtiene la etiqueta del tipo de documento para la portada
     */
    private getDocumentTypeLabel;
    /**
     * Convierte Markdown a HTML estilizado para vista previa web
     */
    markdownToHTML(markdown: string): Promise<string>;
}
export {};
//# sourceMappingURL=documentExportService.d.ts.map