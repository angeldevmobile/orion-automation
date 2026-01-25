import Anthropic from '@anthropic-ai/sdk';
import { DiagramService } from './diagramService.js';
import { DocumentExportService } from './documentExportService.js';
import type { Project, ProjectSource } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const diagramService = new DiagramService();
const documentExportService = new DocumentExportService();

interface ProjectWithSources extends Project {
  projectSources: ProjectSource[];
}

export class DocumentationService {
  /**
   * Genera README completo con IA
   */
  async generateReadme(project: ProjectWithSources): Promise<string> {
    const filesContent = await this.readProjectFiles(project.projectSources);

    const prompt = `Genera un README.md PROFESIONAL de nivel empresarial para el proyecto "${project.name}".

**IMPORTANTE:** 
- Responde SOLO con el Markdown del README, sin comentarios adicionales
- Responde SOLO en español
- NO uses emojis, mantén un tono profesional y formal
- Analiza profundamente los archivos antes de documentar
- NO inventes características inexistentes
- Documenta solo lo que existe en el código real
- Usa formato académico/empresarial estricto

**INFORMACIÓN DEL PROYECTO:**
- Nombre: ${project.name}
- Tipo: ${project.type}
- Descripción: ${project.description || 'No disponible'}

**ARCHIVOS DEL PROYECTO:**
${Object.entries(filesContent)
        .slice(0, 15)
        .map(([name, content]) => `### ${name}\n${content.slice(0, 1000)}`)
        .join('\n\n')}

**REGLAS DE DOCUMENTACIÓN:**
1. Solo documenta características implementadas
2. Si no hay tests, omite esa sección
3. Si no hay autenticación, no la menciones
4. Adapta el stack a las dependencias reales
5. Mantén un tono técnico y profesional
6. Sin emojis ni lenguaje informal

**ESTRUCTURA REQUERIDA:**

# ${project.name}

## Descripción

[2-3 párrafos técnicos sobre el propósito del proyecto]

## Estado del Proyecto

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Testing](#testing) (solo si existe)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características

[Lista estructurada de características reales]

- Característica 1 (basada en código)
- Característica 2 (basada en código)
- Característica 3 (basada en código)

## Tecnologías

### Stack Principal

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| [Nombre]   | x.x.x   | [Uso]     |

### Dependencias Principales

\`\`\`
[Lista basada en package.json]
\`\`\`

## Requisitos Previos

- Node.js >= 14.0.0
- npm >= 6.0.0
- [Otros requisitos del código real]

## Instalación

### Clonar el Repositorio

\`\`\`bash
git clone [URL]
cd ${project.name}
\`\`\`

### Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

## Configuración

[Solo incluir si hay .env o configuración]

### Variables de Entorno

\`\`\`env
[Variables reales del proyecto]
\`\`\`

## Uso

### Modo Desarrollo

\`\`\`bash
npm run dev
\`\`\`

### Modo Producción

\`\`\`bash
npm start
\`\`\`

### Ejemplos de Uso

[Basados en el código real]

## Estructura del Proyecto

\`\`\`
[Árbol de directorios real]
\`\`\`

## Testing

[Solo si existen tests]

\`\`\`bash
npm test
\`\`\`

## API Documentation

[Solo si es API REST]

Ver [API.md](./API.md) para documentación detallada de endpoints.

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Cree una rama para su feature (\`git checkout -b feature/NuevaCaracteristica\`)
3. Commit sus cambios (\`git commit -m 'Add: nueva característica'\`)
4. Push a la rama (\`git push origin feature/NuevaCaracteristica\`)
5. Abra un Pull Request

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

## Licencia

[Especificar licencia si existe]

## Autores

- **[Nombre]** - *Desarrollo principal* - [GitHub](https://github.com/usuario)

## Contacto

- Email: [email]
- GitHub: [perfil]
- LinkedIn: [perfil]

---

**Nota:** Esta documentación se mantiene actualizada con el desarrollo del proyecto.

IMPORTANTE: Mantén un tono profesional, técnico y formal en todo momento. Sin emojis.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('No se recibió respuesta de la IA para README');
    }

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('La respuesta no contiene texto válido');
    }

    return content.text;
  }

  /**
   * Genera documentación de arquitectura con múltiples diagramas
   */
  async generateArchitecture(project: ProjectWithSources): Promise<string> {
    const filesContent = await this.readProjectFiles(project.projectSources);

    // Generar AMBOS diagramas: Mermaid (básico) y D2 (profesional)
    const [architectureDiagram, d2Diagram, erDiagram] = await Promise.all([
      diagramService.generateArchitectureDiagram(
        project.name,
        project.type,
        filesContent
      ),
      diagramService.generateD2Diagram(
        project.name,
        project.type,
        filesContent
      ),
      this.getPrismaSchema().then((schema) =>
        diagramService.generateERDiagram(schema)
      ),
    ]);

    const currentDate = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });

    const prompt = `Genera documentación de ARQUITECTURA de nivel empresarial para "${project.name}".

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, tono profesional y técnico
- Formato académico estricto

**ARCHIVOS DEL PROYECTO:**
${Object.entries(filesContent)
        .slice(0, 10)
        .map(([name, content]) => `### ${name}\n${content.slice(0, 1500)}`)
        .join('\n\n')}

**ESTRUCTURA:**

# Arquitectura del Sistema - ${project.name}

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Objetivos Arquitectónicos](#objetivos-arquitectónicos)
3. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
4. [Flujo de Datos](#flujo-de-datos)
5. [Componentes Principales](#componentes-principales)
6. [Modelo de Datos](#modelo-de-datos)
7. [Stack Tecnológico](#stack-tecnológico)
8. [Seguridad](#seguridad)
9. [Rendimiento](#rendimiento)
10. [Patrones de Diseño](#patrones-de-diseño)
11. [Escalabilidad](#escalabilidad)
12. [Estrategia de Testing](#estrategia-de-testing)

## Visión General

[3-4 párrafos técnicos sobre la arquitectura general]

## Objetivos Arquitectónicos

### Funcionales
- [Objetivo 1]
- [Objetivo 2]

### No Funcionales
- [Objetivo 1]
- [Objetivo 2]

## Diagrama de Arquitectura

  ### Vista de Alto Nivel (D2)

  [PLACEHOLDER - Diagrama D2 Profesional]

  ### Vista Técnica (Mermaid)

  [PLACEHOLDER - Diagrama Mermaid]

## Flujo de Datos

### Flujo Principal

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

### Flujos Secundarios

[Descripción detallada]

## Componentes Principales

| Componente | Responsabilidad | Tecnología | Estado |
|------------|-----------------|------------|--------|
| [Nombre]   | [Descripción]   | [Tech]     | [Est]  |

## Modelo de Datos

### Entidades Principales

| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| [Nom]   | [Desc]      | [Rels]     |

## Stack Tecnológico

### Capa de Presentación
- [Tecnología y versión]

### Capa de Aplicación
- [Tecnología y versión]

### Capa de Datos
- [Tecnología y versión]

### Infraestructura
- [Tecnología y versión]

## Seguridad

### Medidas Implementadas

1. **Autenticación**: [Descripción]
2. **Autorización**: [Descripción]
3. **Encriptación**: [Descripción]
4. **Validación**: [Descripción]

## Rendimiento

### Optimizaciones Aplicadas

- [Optimización 1]
- [Optimización 2]

### Métricas Objetivo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| [Nom]   | [Val]    | [Val]  |

## Patrones de Diseño

### Patrones Implementados

1. **[Patrón]**: [Descripción y ubicación]
2. **[Patrón]**: [Descripción y ubicación]

## Escalabilidad

### Estrategias Horizontal

[Descripción]

### Estrategias Vertical

[Descripción]

## Estrategia de Testing

### Niveles de Testing

1. **Unitario**: [Enfoque]
2. **Integración**: [Enfoque]
3. **E2E**: [Enfoque]

### Cobertura Objetivo

- Statements: > 80%
- Branches: > 75%
- Functions: > 85%
- Lines: > 80%

---

**Última actualización:** ${currentDate}

IMPORTANTE: Tono profesional y técnico. Sin emojis.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 7000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('No se recibió respuesta de la IA para arquitectura');
    }

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('La respuesta no contiene texto válido');
    }

    let documentation = content.text;

    // Insertar AMBOS diagramas
    documentation = documentation.replace(
      '[PLACEHOLDER - Diagrama D2 Profesional]',
      `\`\`\`d2\n${d2Diagram}\n\`\`\``
    );

    documentation = documentation.replace(
      '[PLACEHOLDER - Diagrama Mermaid]',
      `\`\`\`mermaid\n${architectureDiagram}\n\`\`\``
    );

    documentation = documentation.replace(
      /## Modelo de Datos\n\n\[PLACEHOLDER - Se insertará automáticamente\]/,
      `## Modelo de Datos\n\n\`\`\`mermaid\n${erDiagram}\n\`\`\``
    );

    return documentation;
  }

  /**
   * Genera documentación de API
   */
  async generateApiDocs(project: ProjectWithSources): Promise<string> {
    const filesContent = await this.readProjectFiles(project.projectSources);

    const routeFiles = Object.entries(filesContent).filter(
      ([name]) => name.includes('route') || name.includes('controller')
    );

    const prompt = `Genera documentación de API profesional para "${project.name}".

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, formato técnico empresarial
- Estilo OpenAPI/Swagger profesional

**ARCHIVOS DE RUTAS:**
${routeFiles
        .map(([name, content]) => `### ${name}\n${content.slice(0, 2000)}`)
        .join('\n\n')}

**ESTRUCTURA:**

# API Documentation - ${project.name}

## Tabla de Contenidos

1. [Información General](#información-general)
2. [Autenticación](#autenticación)
3. [Endpoints](#endpoints)
4. [Modelos de Datos](#modelos-de-datos)
5. [Códigos de Estado](#códigos-de-estado)
6. [Manejo de Errores](#manejo-de-errores)

## Información General

### Base URL

\`\`\`
[URL base del proyecto]
\`\`\`

### Formato de Respuesta

Todas las respuestas siguen el formato:

\`\`\`json
{
  "success": boolean,
  "data": object | array,
  "error": string | null
}
\`\`\`

## Autenticación

[Describir método de autenticación basado en el código]

### Headers Requeridos

\`\`\`http
Authorization: Bearer {token}
Content-Type: application/json
\`\`\`

## Endpoints

### [Recurso 1]

#### [Método] /ruta

**Descripción:** [Descripción técnica]

**Request:**

| Parámetro | Tipo | Ubicación | Requerido | Descripción |
|-----------|------|-----------|-----------|-------------|
| [param]   | [tipo] | [loc]   | [sí/no]   | [desc]      |

**Ejemplo Request:**

\`\`\`http
POST /api/recurso HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "campo": "valor"
}
\`\`\`

**Response 200:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campo": "valor"
  }
}
\`\`\`

**Response 400:**

\`\`\`json
{
  "success": false,
  "error": "Mensaje de error"
}
\`\`\`

## Modelos de Datos

### [Modelo]

\`\`\`typescript
interface Modelo {
  campo1: tipo;
  campo2: tipo;
}
\`\`\`

## Códigos de Estado

| Código | Descripción |
|--------|-------------|
| 200    | OK          |
| 201    | Created     |
| 400    | Bad Request |
| 401    | Unauthorized|
| 404    | Not Found   |
| 500    | Server Error|

## Manejo de Errores

[Describir estrategia de errores]

---

**Versión:** 1.0.0
**Última actualización:** [Fecha]

IMPORTANTE: Formato profesional, sin emojis.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('No se recibió respuesta de la IA para API docs');
    }

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('La respuesta no contiene texto válido');
    }

    return content.text;
  }

  /**
   * Genera guía de contribución
   */
  async generateContributing(project: ProjectWithSources): Promise<string> {
    const prompt = `Genera CONTRIBUTING.md profesional para "${project.name}" (${project.type}).

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, tono profesional
- Formato empresarial estricto

**ESTRUCTURA:**

# Guía de Contribución

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Código de Conducta](#código-de-conducta)
3. [Cómo Contribuir](#cómo-contribuir)
4. [Configuración del Entorno](#configuración-del-entorno)
5. [Estándares de Código](#estándares-de-código)
6. [Testing](#testing)
7. [Proceso de Pull Request](#proceso-de-pull-request)
8. [Convenciones](#convenciones)

## Introducción

Agradecemos su interés en contribuir a ${project.name}. Este documento establece las pautas para contribuir efectivamente al proyecto.

## Código de Conducta

### Principios

1. Respeto profesional
2. Comunicación constructiva
3. Colaboración efectiva
4. Calidad del código

## Cómo Contribuir

### Reportar Issues

1. Verificar que el issue no exista
2. Usar el template correspondiente
3. Proporcionar información completa
4. Incluir pasos de reproducción

### Sugerir Features

1. Abrir un issue de tipo "Feature Request"
2. Describir el problema a resolver
3. Proponer solución detallada
4. Considerar impacto en arquitectura

## Configuración del Entorno

### Requisitos

- Node.js >= 14.0.0
- Git
- [Otros requisitos]

### Setup

\`\`\`bash
# Clonar repositorio
git clone [URL]

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env

# Ejecutar tests
npm test
\`\`\`

## Estándares de Código

### Naming Conventions

- Variables: camelCase
- Clases: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Archivos: kebab-case

### TypeScript

- Strict mode habilitado
- Tipos explícitos
- Sin any (salvo excepciones justificadas)

### Linting

\`\`\`bash
npm run lint
npm run lint:fix
\`\`\`

## Testing

### Escribir Tests

\`\`\`typescript
describe('Componente', () => {
  it('debe realizar acción', () => {
    // Arrange
    // Act
    // Assert
  });
});
\`\`\`

### Ejecutar Tests

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

### Cobertura Mínima

- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%

## Proceso de Pull Request

### Antes de Enviar

1. Actualizar rama desde main
2. Ejecutar todos los tests
3. Verificar linting
4. Actualizar documentación

### Branch Naming

- feature/descripcion-corta
- fix/descripcion-bug
- refactor/descripcion-cambio
- docs/descripcion-cambio

### Commits

Formato: \`tipo: descripción breve\`

Tipos permitidos:
- feat: Nueva característica
- fix: Corrección de bug
- refactor: Refactorización
- docs: Documentación
- test: Tests
- chore: Mantenimiento

### Template de PR

\`\`\`markdown
## Descripción
[Descripción detallada]

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Refactorización
- [ ] Documentación

## Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests manuales

## Checklist
- [ ] Código cumple estándares
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Sin conflictos con main
\`\`\`

## Convenciones

### Documentación

- JSDoc para funciones públicas
- README actualizado
- CHANGELOG.md actualizado

### Git

- Commits atómicos
- Mensajes descriptivos
- No commits directos a main
- Rebase antes de merge

## Contacto

Para dudas sobre contribuciones:
- Email: [email]
- Issues: [URL]

---

**Última actualización:** [Fecha]

IMPORTANTE: Mantener tono profesional y técnico.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 5000,
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('No se recibió respuesta de la IA para CONTRIBUTING');
    }

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('La respuesta no contiene texto válido');
    }

    return content.text;
  }

  /**
   * Lee archivos del proyecto desde las fuentes
   */
  private async readProjectFiles(
    sources: ProjectSource[]
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    for (const source of sources) {
      if (source.sourceType === 'local' && source.sourceUrl) {
        try {
          const entries = await fs.readdir(source.sourceUrl, {
            withFileTypes: true,
          });

          for (const entry of entries.slice(0, 20)) {
            if (entry.isFile() && this.isRelevantFile(entry.name)) {
              const filePath = path.join(source.sourceUrl, entry.name);
              const content = await fs.readFile(filePath, 'utf-8');
              files[entry.name] = content;
            }
          }
        } catch (error) {
          console.error(
            `Error leyendo archivos de ${source.sourceName}:`,
            error
          );
        }
      }
    }

    return files;
  }

  private isRelevantFile(filename: string): boolean {
    const relevantExtensions = ['.ts', '.js', '.tsx', '.jsx', '.md', '.json'];
    const irrelevantFiles = ['package-lock.json', 'yarn.lock'];

    return (
      relevantExtensions.some((ext) => filename.endsWith(ext)) &&
      !irrelevantFiles.includes(filename)
    );
  }

  private async getPrismaSchema(): Promise<string> {
    try {
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      return await fs.readFile(schemaPath, 'utf-8');
    } catch (error) {
      console.error('Error leyendo Prisma schema:', error);
      return '';
    }
  }
}