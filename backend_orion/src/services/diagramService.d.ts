export interface IsoflowNodeDef {
    id: string;
    type: string;
    label: string;
    description?: string;
    position: {
        x: number;
        y: number;
    };
    icon?: string;
    group?: string;
    style?: {
        color?: string;
        opacity?: number;
    };
}
export interface IsoflowEdgeDef {
    from: string;
    to: string;
    label?: string;
    style?: {
        color?: string;
        strokeDash?: string;
        animated?: boolean;
    };
}
export interface IsoflowGroupDef {
    id: string;
    label: string;
    style?: {
        color?: string;
        opacity?: number;
    };
}
export interface IsoflowModel {
    name: string;
    description?: string;
    nodes: IsoflowNodeDef[];
    edges: IsoflowEdgeDef[];
    groups?: IsoflowGroupDef[];
    metadata?: {
        generatedAt: string;
        projectType: string;
        version: string;
    };
}
export declare class DiagramService {
    /**
     * Genera un diagrama de arquitectura C4 con Mermaid
     */
    generateArchitectureDiagram(projectName: string, projectType: string, filesContent: Record<string, string>): Promise<string>;
    /**
     * Genera diagrama D2 PROFESIONAL con iconos y estilos avanzados
     */
    generateD2Diagram(projectName: string, projectType: string, filesContent: Record<string, string>): Promise<string>;
    /**
     * Genera diagrama de secuencia para un flujo específico
     */
    generateSequenceDiagram(projectName: string, flowDescription: string): Promise<string>;
    /**
     * Genera diagrama ER de la base de datos
     */
    generateERDiagram(prismaSchema: string): Promise<string>;
    /**
     * Genera modelo JSON Isoflow para diagramas isométricos.
     * La IA analiza el proyecto y emite el JSON que Isoflow renderiza.
     */
    generateIsoflowModel(projectName: string, projectType: string, filesContent: Record<string, string>): Promise<IsoflowModel>;
    /**
     * Genera modelo Isoflow desde especificación OpenAPI
     */
    generateIsoflowFromOpenAPI(openApiSpec: string, projectName: string): Promise<IsoflowModel>;
    private extractMermaidCode;
    private extractD2Code;
    private extractJsonCode;
}
//# sourceMappingURL=diagramService.d.ts.map