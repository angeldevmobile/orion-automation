import type { Project, ProjectSource } from '@prisma/client';
interface ProjectWithSources extends Project {
    projectSources: ProjectSource[];
}
export declare class DocumentationService {
    /**
     * Genera README completo con IA - Nivel profesional con branding Orion AI
     */
    generateReadme(project: ProjectWithSources): Promise<string>;
    /**
     * Genera documentación de arquitectura con múltiples diagramas - Nivel empresarial
     */
    generateArchitecture(project: ProjectWithSources): Promise<string>;
    /**
     * Genera documentación de API exhaustiva - Estilo OpenAPI/Swagger profesional
     */
    generateApiDocs(project: ProjectWithSources): Promise<string>;
    /**
     * Genera guía de contribución profesional con branding Orion AI
     */
    generateContributing(project: ProjectWithSources): Promise<string>;
    /**
     * Lee archivos del proyecto desde las fuentes - Mejorado con lectura recursiva
     */
    private readProjectFiles;
    /**
     * Lee directorios recursivamente hasta una profundidad máxima
     */
    private readDirectoryRecursive;
    private isRelevantFile;
    /**
     * Prioriza archivos más importantes para el contexto del prompt
     */
    private prioritizeFiles;
    private getPrismaSchema;
}
export {};
//# sourceMappingURL=documentationService.d.ts.map