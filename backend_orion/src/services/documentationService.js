import Anthropic from '@anthropic-ai/sdk';
import { DiagramService } from './diagramService.js';
import { DocumentExportService } from './documentExportService.js';
import * as fs from 'fs/promises';
import * as path from 'path';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const diagramService = new DiagramService();
const documentExportService = new DocumentExportService();
// Branding y metadata
const ORION_BRAND = 'Orion AI';
const ORION_VERSION = '2.0';
function getFormattedDate() {
    return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
    });
}
function getFullFormattedDate() {
    return new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
export class DocumentationService {
    /**
     * Genera README completo con IA - Nivel profesional con branding Orion AI
     */
    async generateReadme(project) {
        const filesContent = await this.readProjectFiles(project.projectSources);
        if (Object.keys(filesContent).length === 0) {
            throw new Error('No se encontraron archivos del proyecto para analizar. Verifique que el proyecto tenga archivos fuente cargados y que las rutas sean accesibles.');
        }
        const prioritizedFiles = this.prioritizeFiles(filesContent);
        const currentDate = getFormattedDate();
        const fullDate = getFullFormattedDate();
        const prompt = `Genera un README.md PROFESIONAL de nivel empresarial para el proyecto "${project.name}".

**IMPORTANTE:** 
- Responde SOLO con el Markdown del README, sin comentarios adicionales
- Responde SOLO en español
- NO uses emojis, mantén un tono profesional y formal
- Analiza profundamente TODOS los archivos antes de documentar
- NO inventes características inexistentes
- Documenta solo lo que existe en el código real
- Usa formato académico/empresarial estricto
- Incluye badges profesionales con shields.io
- La documentación debe llevar el sello "Generado por ${ORION_BRAND} - ${currentDate}"

**INFORMACIÓN DEL PROYECTO:**
- Nombre: ${project.name}
- Tipo: ${project.type}
- Descripción: ${project.description || 'No disponible'}

**ARCHIVOS DEL PROYECTO (análisis exhaustivo):**
${prioritizedFiles
            .slice(0, 25)
            .map(([name, content]) => `### ${name}\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``)
            .join('\n\n')}

**REGLAS DE DOCUMENTACIÓN ESTRICTAS:**
1. Solo documenta características implementadas y verificables en el código
2. Si no hay tests, omite esa sección completamente
3. Si no hay autenticación implementada, no la menciones
4. Adapta el stack EXACTAMENTE a las dependencias reales del package.json
5. Mantén un tono técnico, profesional y formal
6. Sin emojis ni lenguaje informal en ninguna parte
7. Incluye ejemplos de código REALES extraídos del proyecto
8. Documenta TODAS las variables de entorno que encuentres en el código
9. Genera un árbol de directorios REAL basado en los archivos proporcionados
10. Si hay middleware, documenta la cadena de middleware
11. Si hay validaciones, documenta los esquemas de validación

**ESTRUCTURA REQUERIDA:**

<div align="center">

# ${project.name}

**Documentación técnica generada automáticamente**

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=for-the-badge)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)]()
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)]()
[![Coverage](https://img.shields.io/badge/coverage-85%25-green.svg?style=for-the-badge)]()

*Generado por ${ORION_BRAND} | ${currentDate}*

</div>

---

## Descripción General

[3-4 párrafos técnicos DETALLADOS sobre el propósito, alcance y contexto del proyecto. Basado EXCLUSIVAMENTE en el análisis del código real.]

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Uso y Ejecución](#uso-y-ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Testing](#testing)
- [Despliegue](#despliegue)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Características Principales

[Lista DETALLADA y estructurada de características REALES con sub-items explicativos]

### Módulo 1: [Nombre basado en código]
- **Funcionalidad A**: [Descripción técnica detallada]
- **Funcionalidad B**: [Descripción técnica detallada]

### Módulo 2: [Nombre basado en código]
- **Funcionalidad A**: [Descripción técnica detallada]
- **Funcionalidad B**: [Descripción técnica detallada]

## Arquitectura del Sistema

### Diagrama de Componentes

[Describir la arquitectura en texto técnico: capas, patrones, flujo de datos]

### Flujo de Datos Principal

1. [Paso detallado con componentes involucrados]
2. [Paso detallado con componentes involucrados]
3. [Paso detallado con componentes involucrados]

## Stack Tecnológico

### Stack Principal

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| Runtime   | [Nombre]   | x.x.x   | [Uso detallado] |
| Framework | [Nombre]   | x.x.x   | [Uso detallado] |
| Base de Datos | [Nombre] | x.x.x | [Uso detallado] |
| ORM       | [Nombre]   | x.x.x   | [Uso detallado] |

### Dependencias de Producción

| Paquete | Versión | Función |
|---------|---------|---------|
| [nombre] | x.x.x  | [Descripción específica] |

### Dependencias de Desarrollo

| Paquete | Versión | Función |
|---------|---------|---------|
| [nombre] | x.x.x  | [Descripción específica] |

## Requisitos Previos

| Requisito | Versión Mínima | Verificación |
|-----------|---------------|--------------|
| Node.js   | >= 18.0.0     | \`node --version\` |
| npm       | >= 9.0.0      | \`npm --version\` |
| [Otros]   | [Versión]     | [Comando]    |

## Instalación y Configuración

### 1. Clonar el Repositorio

\`\`\`bash
git clone [URL]
cd ${project.name}
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variables de Entorno

\`\`\`bash
cp .env.example .env
\`\`\`

### 4. Configurar Base de Datos (si aplica)

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 5. Verificar Instalación

\`\`\`bash
npm run dev
\`\`\`

## Variables de Entorno

| Variable | Tipo | Requerida | Descripción | Ejemplo |
|----------|------|-----------|-------------|---------|
| [VAR]    | string | Sí/No  | [Descripción detallada] | [Valor ejemplo] |

## Uso y Ejecución

### Modo Desarrollo

\`\`\`bash
npm run dev
\`\`\`

### Modo Producción

\`\`\`bash
npm run build
npm start
\`\`\`

### Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| dev    | \`npm run dev\` | [Descripción] |
| build  | \`npm run build\` | [Descripción] |
| start  | \`npm start\` | [Descripción] |

### Ejemplos de Uso

[Ejemplos de código REALES basados en el proyecto con explicaciones detalladas]

## Estructura del Proyecto

\`\`\`
${project.name}/
├── [Árbol de directorios REAL basado en archivos analizados]
\`\`\`

### Descripción de Directorios

| Directorio | Propósito |
|------------|-----------|
| [dir]      | [Descripción detallada] |

## Endpoints de la API

[Solo si es API REST - Documentar CADA endpoint encontrado en el código]

### Resumen de Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET    | /api/... | [Desc] | Sí/No |

### Detalle de Endpoints

[Documentar cada endpoint con request/response examples]

## Testing

[Solo si existen tests en el código]

## Despliegue

### Producción

[Instrucciones basadas en configuración real]

### Docker (si aplica)

[Solo si existe Dockerfile]

## Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guía detallada de contribución.

## Licencia

[Especificar licencia basada en package.json o LICENSE file]

---

<div align="center">

**Documentación generada automáticamente por ${ORION_BRAND}**
*${fullDate}*

[![Orion AI](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Documentation-purple.svg?style=for-the-badge)]()

</div>

IMPORTANTE: 
- Mantén un tono profesional, técnico y formal en todo momento
- Sin emojis en ninguna parte del documento
- Cada sección debe tener contenido SUSTANCIAL basado en el código real
- No dejes secciones con contenido genérico o placeholder`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
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
     * Genera documentación de arquitectura con múltiples diagramas - Nivel empresarial
     */
    async generateArchitecture(project) {
        const filesContent = await this.readProjectFiles(project.projectSources);
        // AGREGAR: Validación
        if (Object.keys(filesContent).length === 0) {
            throw new Error('No se encontraron archivos del proyecto para analizar. Verifique que el proyecto tenga archivos fuente cargados y que las rutas sean accesibles.');
        }
        const currentDate = getFormattedDate();
        const fullDate = getFullFormattedDate();
        // Generar AMBOS diagramas: Mermaid (básico) y D2 (profesional)
        const [architectureDiagram, d2Diagram, erDiagram] = await Promise.all([
            diagramService.generateArchitectureDiagram(project.name, project.type, filesContent),
            diagramService.generateD2Diagram(project.name, project.type, filesContent),
            this.getPrismaSchema().then((schema) => diagramService.generateERDiagram(schema)),
        ]);
        // Extraer información adicional del código para contexto enriquecido
        const middlewareFiles = Object.entries(filesContent).filter(([name]) => name.includes('middleware') || name.includes('guard'));
        const serviceFiles = Object.entries(filesContent).filter(([name]) => name.includes('service') || name.includes('Service'));
        const configFiles = Object.entries(filesContent).filter(([name]) => name.includes('config') || name.includes('.env') || name === 'package.json');
        const prompt = `Genera documentación de ARQUITECTURA EXHAUSTIVA de nivel empresarial/académico para "${project.name}".

**CONTEXTO CRÍTICO:**
Esta documentación será revisada por arquitectos de software senior y debe cumplir estándares ISO/IEC 25010 y IEEE 1471.
Debe incluir branding "${ORION_BRAND}" y la fecha "${currentDate}".

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, tono profesional, técnico y académico
- Formato de documento arquitectónico formal (SAD - Software Architecture Document)
- Cada sección debe tener MÍNIMO 3-4 párrafos de contenido sustancial
- Analiza CADA archivo en profundidad antes de documentar
- NO inventes componentes que no existan en el código
- Incluye análisis de trade-offs arquitectónicos
- Documenta decisiones de diseño (ADR - Architecture Decision Records)

**ARCHIVOS DEL PROYECTO (análisis exhaustivo requerido):**

### Archivos de Configuración:
${configFiles
            .map(([name, content]) => `#### ${name}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

### Archivos de Servicios/Lógica de Negocio:
${serviceFiles
            .map(([name, content]) => `#### ${name}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

### Archivos de Middleware/Guards:
${middlewareFiles
            .map(([name, content]) => `#### ${name}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

### Todos los archivos:
${this.prioritizeFiles(filesContent)
            .slice(0, 20)
            .map(([name, content]) => `#### ${name}\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``)
            .join('\n\n')}

**ESTRUCTURA REQUERIDA (cada sección debe ser EXHAUSTIVA):**

<div align="center">

# Documento de Arquitectura del Sistema

## ${project.name}

[![Architecture](https://img.shields.io/badge/Architecture-Document-blue.svg?style=for-the-badge)]()
[![Version](https://img.shields.io/badge/Version-1.0-green.svg?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge)]()
[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Generated-purple.svg?style=for-the-badge)]()

*Documento de Arquitectura de Software (SAD)*
*Generado por ${ORION_BRAND} | ${currentDate}*

</div>

---

## Control de Versiones del Documento

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0     | ${fullDate} | ${ORION_BRAND} | Generación inicial del documento |

---

## Tabla de Contenidos

1. [Introducción y Alcance](#1-introducción-y-alcance)
2. [Restricciones y Contexto](#2-restricciones-y-contexto)
3. [Objetivos Arquitectónicos](#3-objetivos-arquitectónicos)
4. [Vista de Contexto del Sistema](#4-vista-de-contexto-del-sistema)
5. [Vista de Contenedores](#5-vista-de-contenedores)
6. [Vista de Componentes](#6-vista-de-componentes)
7. [Diagrama de Arquitectura de Alto Nivel](#7-diagrama-de-arquitectura-de-alto-nivel)
8. [Flujo de Datos y Secuencias](#8-flujo-de-datos-y-secuencias)
9. [Modelo de Datos](#9-modelo-de-datos)
10. [Stack Tecnológico Detallado](#10-stack-tecnológico-detallado)
11. [Patrones de Diseño Implementados](#11-patrones-de-diseño-implementados)
12. [Decisiones Arquitectónicas (ADR)](#12-decisiones-arquitectónicas-adr)
13. [Seguridad y Control de Acceso](#13-seguridad-y-control-de-acceso)
14. [Rendimiento y Optimización](#14-rendimiento-y-optimización)
15. [Escalabilidad y Disponibilidad](#15-escalabilidad-y-disponibilidad)
16. [Observabilidad y Monitoreo](#16-observabilidad-y-monitoreo)
17. [Estrategia de Testing](#17-estrategia-de-testing)
18. [Gestión de Configuración](#18-gestión-de-configuración)
19. [Riesgos Técnicos y Mitigaciones](#19-riesgos-técnicos-y-mitigaciones)
20. [Roadmap Arquitectónico](#20-roadmap-arquitectónico)

---

## 1. Introducción y Alcance

### 1.1 Propósito del Documento
[2-3 párrafos sobre el propósito de este SAD]

### 1.2 Alcance del Sistema
[2-3 párrafos sobre qué cubre el sistema]

### 1.3 Audiencia
[Lista de stakeholders y su interés]

### 1.4 Referencias
[Documentos relacionados]

## 2. Restricciones y Contexto

### 2.1 Restricciones Técnicas
[Tabla detallada de restricciones]

### 2.2 Restricciones de Negocio
[Restricciones organizacionales]

### 2.3 Contexto Operacional
[Descripción del entorno operativo]

## 3. Objetivos Arquitectónicos

### 3.1 Atributos de Calidad (ISO 25010)

| Atributo | Prioridad | Métrica | Objetivo |
|----------|-----------|---------|----------|
| Rendimiento | Alta | Tiempo de respuesta | < 200ms |
| Mantenibilidad | Alta | Complejidad ciclomática | < 15 |
| Seguridad | Alta | Vulnerabilidades OWASP | 0 críticas |
| Fiabilidad | Media | Uptime | 99.5% |
| Portabilidad | Media | Plataformas soportadas | 3+ |

### 3.2 Objetivos Funcionales
[Lista detallada basada en código]

### 3.3 Objetivos No Funcionales
[Lista detallada con métricas]

## 4. Vista de Contexto del Sistema

### 4.1 Diagrama de Contexto
[Descripción textual del contexto: actores, sistemas externos, integraciones]

### 4.2 Actores del Sistema

| Actor | Tipo | Descripción | Interacción |
|-------|------|-------------|-------------|
| [Actor] | Humano/Sistema | [Descripción] | [Cómo interactúa] |

### 4.3 Sistemas Externos

| Sistema | Protocolo | Propósito | SLA |
|---------|-----------|-----------|-----|
| [Sistema] | [HTTP/WS/etc] | [Propósito] | [Disponibilidad] |

## 5. Vista de Contenedores

### 5.1 Contenedores del Sistema

| Contenedor | Tecnología | Responsabilidad | Puerto |
|------------|------------|-----------------|--------|
| [Nombre] | [Tech] | [Responsabilidad detallada] | [Puerto] |

### 5.2 Comunicación entre Contenedores
[Descripción detallada de protocolos y patrones de comunicación]

## 6. Vista de Componentes

### 6.1 Inventario de Componentes

| Componente | Capa | Responsabilidad | Dependencias | Archivo |
|------------|------|-----------------|--------------|---------|
| [Nombre] | [Capa] | [Responsabilidad detallada] | [Deps] | [Path] |

### 6.2 Matriz de Dependencias

[Tabla de dependencias entre componentes]

### 6.3 Descripción Detallada de Componentes

#### 6.3.1 [Componente 1]
- **Responsabilidad**: [Descripción extensa]
- **Interfaz pública**: [Métodos/endpoints]
- **Dependencias**: [Lista]
- **Consideraciones**: [Notas técnicas]

## 7. Diagrama de Arquitectura de Alto Nivel

### 7.1 Vista Profesional (D2)

[PLACEHOLDER_D2_DIAGRAM]

### 7.2 Vista Técnica Detallada (Mermaid)

[PLACEHOLDER_MERMAID_DIAGRAM]

### 7.3 Descripción de la Arquitectura
[3-4 párrafos describiendo la arquitectura mostrada en los diagramas, capas, flujos y decisiones]

## 8. Flujo de Datos y Secuencias

### 8.1 Flujo Principal de la Aplicación

| Paso | Componente Origen | Acción | Componente Destino | Datos |
|------|-------------------|--------|--------------------|-------|
| 1    | [Origen] | [Acción detallada] | [Destino] | [Tipo de datos] |

### 8.2 Flujos Secundarios
[Descripción detallada de cada flujo alternativo]

### 8.3 Flujo de Errores
[Cómo se propagan y manejan los errores a través de las capas]

## 9. Modelo de Datos

### 9.1 Diagrama Entidad-Relación

[PLACEHOLDER_ER_DIAGRAM]

### 9.2 Descripción de Entidades

| Entidad | Descripción | Campos Clave | Relaciones | Índices |
|---------|-------------|--------------|------------|---------|
| [Nombre] | [Descripción detallada] | [PK, FK] | [Relaciones] | [Índices] |

### 9.3 Estrategia de Migración de Datos
[Descripción de cómo se gestionan las migraciones]

## 10. Stack Tecnológico Detallado

### 10.1 Diagrama de Stack

| Capa | Tecnología | Versión | Justificación | Alternativas Evaluadas |
|------|------------|---------|---------------|----------------------|
| Runtime | [Tech] | [Ver] | [Por qué se eligió] | [Alternativas] |
| Framework | [Tech] | [Ver] | [Por qué se eligió] | [Alternativas] |
| Base de Datos | [Tech] | [Ver] | [Por qué se eligió] | [Alternativas] |
| ORM | [Tech] | [Ver] | [Por qué se eligió] | [Alternativas] |

### 10.2 Matriz de Compatibilidad
[Versiones compatibles entre tecnologías]

## 11. Patrones de Diseño Implementados

### 11.1 Catálogo de Patrones

| Patrón | Categoría | Ubicación en Código | Problema que Resuelve |
|--------|-----------|--------------------|-----------------------|
| [Patrón] | Creacional/Estructural/Comportamiento | [Archivo] | [Problema] |

### 11.2 Detalle de Implementación
[Para cada patrón: descripción, diagrama conceptual, código ejemplo del proyecto]

## 12. Decisiones Arquitectónicas (ADR)

### ADR-001: [Decisión]
- **Estado**: Aceptada
- **Contexto**: [Contexto detallado]
- **Decisión**: [Qué se decidió]
- **Consecuencias**: [Positivas y negativas]
- **Alternativas descartadas**: [Lista con razones]

## 13. Seguridad y Control de Acceso

### 13.1 Modelo de Amenazas (STRIDE)

| Amenaza | Categoría | Mitigación | Estado |
|---------|-----------|------------|--------|
| [Amenaza] | S/T/R/I/D/E | [Mitigación implementada] | [Implementada/Pendiente] |

### 13.2 Medidas Implementadas
[Descripción exhaustiva de cada medida de seguridad encontrada en el código]

### 13.3 Flujo de Autenticación/Autorización
[Descripción detallada si existe en el código]

## 14. Rendimiento y Optimización

### 14.1 Objetivos de Rendimiento

| Escenario | Métrica | Objetivo | Estrategia |
|-----------|---------|----------|------------|
| [Escenario] | [Métrica] | [Valor] | [Cómo se logra] |

### 14.2 Optimizaciones Implementadas
[Lista detallada basada en el código real]

### 14.3 Cuellos de Botella Identificados
[Análisis basado en la arquitectura]

## 15. Escalabilidad y Disponibilidad

### 15.1 Estrategia de Escalabilidad
[Horizontal vs Vertical, justificación]

### 15.2 Puntos de Escalabilidad
[Componentes que pueden escalar y cómo]

## 16. Observabilidad y Monitoreo

### 16.1 Estrategia de Logging
[Niveles, formato, destinos]

### 16.2 Métricas Clave
[Lista de métricas a monitorear]

### 16.3 Alertas
[Condiciones de alerta]

## 17. Estrategia de Testing

### 17.1 Pirámide de Testing

| Nivel | Herramienta | Cobertura Objetivo | Responsable |
|-------|-------------|-------------------|-------------|
| Unitario | [Tool] | > 80% | Desarrollador |
| Integración | [Tool] | > 70% | Equipo |
| E2E | [Tool] | > 60% | QA |

### 17.2 Estrategia por Componente
[Qué se testea en cada componente y cómo]

## 18. Gestión de Configuración

### 18.1 Variables de Entorno

| Variable | Tipo | Sensible | Descripción | Valor por Defecto |
|----------|------|----------|-------------|-------------------|
| [VAR] | [tipo] | Sí/No | [Descripción] | [Default] |

### 18.2 Perfiles de Configuración
[Desarrollo, staging, producción]

## 19. Riesgos Técnicos y Mitigaciones

| ID | Riesgo | Probabilidad | Impacto | Mitigación | Estado |
|----|--------|-------------|---------|------------|--------|
| R-001 | [Riesgo] | Alta/Media/Baja | Alto/Medio/Bajo | [Mitigación] | [Estado] |

## 20. Roadmap Arquitectónico

### Corto Plazo (1-3 meses)
[Mejoras arquitectónicas prioritarias]

### Mediano Plazo (3-6 meses)
[Evolución planificada]

### Largo Plazo (6-12 meses)
[Visión arquitectónica]

---

<div align="center">

## Apéndices

### A. Glosario Técnico
[Términos técnicos usados en el documento]

### B. Historial de Cambios Arquitectónicos
[Log de decisiones]

---

**Documento generado automáticamente por ${ORION_BRAND} ${ORION_VERSION}**
*${fullDate}*

[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Architecture%20Doc-purple.svg?style=for-the-badge)]()

*Conforme a estándares IEEE 1471 / ISO/IEC 42010*

</div>

IMPORTANTE: 
- Cada sección DEBE tener contenido sustancial (mínimo 3-4 párrafos o tabla completa)
- NO dejes secciones vacías o con contenido genérico
- Analiza CADA archivo proporcionado para extraer información real
- Tono estrictamente profesional y académico
- Sin emojis en ninguna parte`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 12000,
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
        // Insertar diagramas generados
        documentation = documentation.replace('[PLACEHOLDER_D2_DIAGRAM]', `\`\`\`d2\n${d2Diagram}\n\`\`\``);
        documentation = documentation.replace('[PLACEHOLDER_MERMAID_DIAGRAM]', `\`\`\`mermaid\n${architectureDiagram}\n\`\`\``);
        documentation = documentation.replace('[PLACEHOLDER_ER_DIAGRAM]', erDiagram ? `\`\`\`mermaid\n${erDiagram}\n\`\`\`` : '*No se encontró esquema de base de datos (Prisma) para generar el diagrama ER.*');
        return documentation;
    }
    /**
     * Genera documentación de API exhaustiva - Estilo OpenAPI/Swagger profesional
     */
    async generateApiDocs(project) {
        const filesContent = await this.readProjectFiles(project.projectSources);
        if (Object.keys(filesContent).length === 0) {
            throw new Error('No se encontraron archivos del proyecto para analizar. Verifique que el proyecto tenga archivos fuente cargados y que las rutas sean accesibles.');
        }
        const currentDate = getFormattedDate();
        const fullDate = getFullFormattedDate();
        // Filtrar archivos relevantes para API con más categorías
        const routeFiles = Object.entries(filesContent).filter(([name]) => name.includes('route') || name.includes('controller') || name.includes('router'));
        const middlewareFiles = Object.entries(filesContent).filter(([name]) => name.includes('middleware') || name.includes('guard') || name.includes('auth'));
        const validationFiles = Object.entries(filesContent).filter(([name]) => name.includes('validat') || name.includes('schema') || name.includes('dto'));
        const serviceFiles = Object.entries(filesContent).filter(([name]) => name.includes('service') || name.includes('Service'));
        const modelFiles = Object.entries(filesContent).filter(([name]) => name.includes('model') || name.includes('type') || name.includes('interface') || name.includes('prisma'));
        const prompt = `Genera documentación de API EXHAUSTIVA y PROFESIONAL para "${project.name}".

**CONTEXTO CRÍTICO:**
Esta documentación será usada por desarrolladores frontend y equipos de integración. 
Debe ser tan completa como una documentación Swagger/OpenAPI generada automáticamente.
Debe incluir branding "${ORION_BRAND}" y la fecha "${currentDate}".

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, formato técnico empresarial estricto
- Estilo OpenAPI/Swagger profesional
- Documenta CADA endpoint encontrado en los archivos de rutas
- Incluye TODOS los parámetros, headers, body, query params
- Documenta TODOS los posibles códigos de respuesta para cada endpoint
- Incluye ejemplos de request/response REALES basados en el código
- Si hay middleware de autenticación, documenta el flujo completo
- Si hay validaciones, documenta los esquemas de validación exactos
- Genera diagramas de flujo para endpoints complejos

**ARCHIVOS DE RUTAS/CONTROLADORES (análisis exhaustivo):**
${routeFiles
            .map(([name, content]) => `### ${name}\n\`\`\`typescript\n${content.slice(0, 3000)}\n\`\`\``)
            .join('\n\n')}

**ARCHIVOS DE MIDDLEWARE/AUTENTICACIÓN:**
${middlewareFiles
            .map(([name, content]) => `### ${name}\n\`\`\`typescript\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

**ARCHIVOS DE VALIDACIÓN/SCHEMAS:**
${validationFiles
            .map(([name, content]) => `### ${name}\n\`\`\`typescript\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

**ARCHIVOS DE SERVICIOS (lógica de negocio):**
${serviceFiles
            .map(([name, content]) => `### ${name}\n\`\`\`typescript\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

**ARCHIVOS DE MODELOS/TIPOS:**
${modelFiles
            .map(([name, content]) => `### ${name}\n\`\`\`typescript\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

**TODOS LOS ARCHIVOS (contexto adicional):**
${this.prioritizeFiles(filesContent)
            .slice(0, 20)
            .map(([name, content]) => `### ${name}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``)
            .join('\n\n')}

**ESTRUCTURA REQUERIDA (EXHAUSTIVA - cada endpoint debe estar completamente documentado):**

<div align="center">

# Documentación de API

## ${project.name}

[![API](https://img.shields.io/badge/API-REST-blue.svg?style=for-the-badge)]()
[![Version](https://img.shields.io/badge/API%20Version-1.0-green.svg?style=for-the-badge)]()
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge)]()
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-85EA2D.svg?style=for-the-badge&logo=swagger&logoColor=black)]()
[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Generated-purple.svg?style=for-the-badge)]()

*Documentación de API generada por ${ORION_BRAND} | ${currentDate}*

</div>

---

## Tabla de Contenidos

1. [Información General](#1-información-general)
2. [Autenticación y Autorización](#2-autenticación-y-autorización)
3. [Convenciones de la API](#3-convenciones-de-la-api)
4. [Rate Limiting y Throttling](#4-rate-limiting-y-throttling)
5. [Resumen de Endpoints](#5-resumen-de-endpoints)
6. [Endpoints Detallados](#6-endpoints-detallados)
7. [Modelos de Datos](#7-modelos-de-datos)
8. [Esquemas de Validación](#8-esquemas-de-validación)
9. [Códigos de Estado y Errores](#9-códigos-de-estado-y-errores)
10. [Flujos de Integración](#10-flujos-de-integración)
11. [Ejemplos de Integración](#11-ejemplos-de-integración)
12. [Changelog de la API](#12-changelog-de-la-api)

---

## 1. Información General

### 1.1 Base URL

| Entorno | URL | Descripción |
|---------|-----|-------------|
| Desarrollo | \`http://localhost:[PUERTO]\` | Entorno local |
| Staging | \`[URL]\` | Pre-producción |
| Producción | \`[URL]\` | Producción |

### 1.2 Formato de Comunicación

| Aspecto | Valor |
|---------|-------|
| Protocolo | HTTPS (HTTP en desarrollo) |
| Content-Type | application/json |
| Encoding | UTF-8 |
| Formato de fechas | ISO 8601 |

### 1.3 Formato de Respuesta Estándar

**Respuesta exitosa:**

\`\`\`json
{
  "success": true,
  "data": { },
  "message": "Operación exitosa",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
\`\`\`

**Respuesta con paginación:**

\`\`\`json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

**Respuesta de error:**

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": [],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

## 2. Autenticación y Autorización

### 2.1 Método de Autenticación
[Documentar basado en middleware encontrado: JWT, API Key, OAuth, etc.]

### 2.2 Headers de Autenticación

\`\`\`http
Authorization: Bearer {access_token}
Content-Type: application/json
X-Request-ID: {uuid}
\`\`\`

### 2.3 Flujo de Autenticación
[Diagrama paso a paso del flujo]

### 2.4 Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| [Rol] | [Descripción] | [Lista de permisos] |

## 3. Convenciones de la API

### 3.1 Nomenclatura de URLs

| Convención | Ejemplo | Descripción |
|------------|---------|-------------|
| Plurales | /api/users | Colecciones |
| Kebab-case | /api/user-profiles | Recursos compuestos |
| Versionado | /api/v1/... | Prefijo de versión |

### 3.2 Métodos HTTP

| Método | Uso | Idempotente | Body |
|--------|-----|-------------|------|
| GET | Obtener recurso(s) | Sí | No |
| POST | Crear recurso | No | Sí |
| PUT | Actualizar completo | Sí | Sí |
| PATCH | Actualizar parcial | No | Sí |
| DELETE | Eliminar recurso | Sí | No |

### 3.3 Parámetros de Query Estándar

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| page | number | Página actual | ?page=1 |
| limit | number | Elementos por página | ?limit=10 |
| sort | string | Campo de ordenamiento | ?sort=createdAt |
| order | string | Dirección (asc/desc) | ?order=desc |
| search | string | Búsqueda general | ?search=texto |
| filter | object | Filtros específicos | ?filter[status]=active |

## 4. Rate Limiting y Throttling

| Endpoint | Límite | Ventana | Header de Respuesta |
|----------|--------|---------|---------------------|
| General | [X] req | [Y] min | X-RateLimit-Remaining |
| Auth | [X] req | [Y] min | X-RateLimit-Remaining |

## 5. Resumen de Endpoints

### Mapa Visual de la API

| Recurso | GET | POST | PUT | PATCH | DELETE |
|---------|-----|------|-----|-------|--------|
| [/api/recurso] | Lista/Detalle | Crear | Actualizar | Parcial | Eliminar |

### Tabla Completa de Endpoints

| # | Método | Ruta | Descripción | Auth | Rate Limit |
|---|--------|------|-------------|------|------------|
| 1 | [MÉTODO] | [/api/ruta] | [Descripción detallada] | [Sí/No] | [Límite] |

## 6. Endpoints Detallados

[Para CADA endpoint encontrado en el código, documentar EXHAUSTIVAMENTE:]

### 6.1 [Nombre del Recurso]

---

#### [MÉTODO] \`/api/ruta\`

**Descripción:** [Descripción técnica detallada de qué hace este endpoint]

**Autenticación:** [Requerida/No requerida - Tipo]

**Permisos:** [Roles permitidos]

**Middleware aplicado:** [Lista de middleware en orden de ejecución]

##### Headers

| Header | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| Authorization | string | Sí/No | Bearer token |
| Content-Type | string | Sí | application/json |

##### Path Parameters

| Parámetro | Tipo | Requerido | Descripción | Validación |
|-----------|------|-----------|-------------|------------|
| [param]   | [tipo] | [Sí/No] | [Descripción detallada] | [Reglas] |

##### Query Parameters

| Parámetro | Tipo | Requerido | Default | Descripción | Ejemplo |
|-----------|------|-----------|---------|-------------|---------|
| [param]   | [tipo] | [Sí/No] | [default] | [Descripción] | [Ejemplo] |

##### Request Body

\`\`\`typescript
interface RequestBody {
  campo1: tipo; // Descripción - Requerido
  campo2?: tipo; // Descripción - Opcional
}
\`\`\`

**Ejemplo de Request:**

\`\`\`http
[MÉTODO] /api/ruta HTTP/1.1
Host: localhost:[PUERTO]
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "campo1": "valor_ejemplo",
  "campo2": "valor_ejemplo"
}
\`\`\`

**cURL:**

\`\`\`bash
curl -X [MÉTODO] \\
  http://localhost:[PUERTO]/api/ruta \\
  -H 'Authorization: Bearer TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "campo1": "valor",
    "campo2": "valor"
  }'
\`\`\`

##### Respuestas

**200 OK - Éxito:**

\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid-ejemplo",
    "campo1": "valor",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

**400 Bad Request - Error de validación:**

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación",
    "details": [
      {
        "field": "campo1",
        "message": "El campo es requerido"
      }
    ]
  }
}
\`\`\`

**401 Unauthorized:**

\`\`\`json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token no proporcionado o inválido"
  }
}
\`\`\`

**404 Not Found:**

\`\`\`json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso no encontrado"
  }
}
\`\`\`

**500 Internal Server Error:**

\`\`\`json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor"
  }
}
\`\`\`

---

[REPETIR PARA CADA ENDPOINT ENCONTRADO EN EL CÓDIGO]

## 7. Modelos de Datos

### 7.1 Diagrama de Modelos

[Diagrama mermaid classDiagram con todos los modelos/interfaces]

### 7.2 Detalle de Modelos

[Para cada modelo/interface encontrado:]

#### [NombreModelo]

\`\`\`typescript
interface NombreModelo {
  id: string;           // Identificador único (UUID)
  campo1: string;       // Descripción del campo
  campo2: number;       // Descripción del campo
  createdAt: Date;      // Fecha de creación
  updatedAt: Date;      // Fecha de actualización
}
\`\`\`

| Campo | Tipo | Requerido | Descripción | Validaciones |
|-------|------|-----------|-------------|--------------|
| id    | UUID | Auto | Identificador único | - |
| campo1 | string | Sí | [Descripción] | [min: X, max: Y] |

## 8. Esquemas de Validación

[Para cada endpoint que tenga validación:]

### 8.1 [Endpoint] - Esquema de Validación

\`\`\`typescript
{
  campo1: {
    tipo: "string",
    requerido: true,
    minLength: 3,
    maxLength: 255
  }
}
\`\`\`

## 9. Códigos de Estado y Errores

### 9.1 Códigos HTTP Utilizados

| Código | Estado | Descripción | Cuándo se Usa |
|--------|--------|-------------|---------------|
| 200 | OK | Solicitud exitosa | GET, PUT, PATCH exitosos |
| 201 | Created | Recurso creado | POST exitoso |
| 204 | No Content | Sin contenido | DELETE exitoso |
| 400 | Bad Request | Error del cliente | Validación fallida |
| 401 | Unauthorized | No autenticado | Token faltante/inválido |
| 403 | Forbidden | No autorizado | Sin permisos |
| 404 | Not Found | No encontrado | Recurso inexistente |
| 409 | Conflict | Conflicto | Duplicado/conflicto |
| 422 | Unprocessable | No procesable | Lógica de negocio |
| 429 | Too Many Req | Rate limit | Exceso de peticiones |
| 500 | Server Error | Error interno | Error del servidor |

### 9.2 Catálogo de Errores de Negocio

| Código | Mensaje | Descripción | Resolución |
|--------|---------|-------------|------------|
| [CODE] | [Mensaje] | [Cuándo ocurre] | [Cómo resolverlo] |

## 10. Flujos de Integración

### 10.1 Flujo de [Proceso Principal]

[Diagrama de secuencia mermaid mostrando el flujo completo]

### 10.2 Guía de Integración Paso a Paso

1. **Paso 1 - Autenticación**: [Descripción con ejemplo]
2. **Paso 2 - [Acción]**: [Descripción con ejemplo]
3. **Paso 3 - [Acción]**: [Descripción con ejemplo]

## 11. Ejemplos de Integración

### 11.1 JavaScript/TypeScript (Fetch)

\`\`\`typescript
const response = await fetch('http://localhost:[PUERTO]/api/recurso', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campo1: 'valor'
  })
});

const data = await response.json();
\`\`\`

### 11.2 Python (requests)

\`\`\`python
import requests

response = requests.post(
    'http://localhost:[PUERTO]/api/recurso',
    headers={'Authorization': f'Bearer {token}'},
    json={'campo1': 'valor'}
)

data = response.json()
\`\`\`

### 11.3 cURL

\`\`\`bash
curl -X POST http://localhost:[PUERTO]/api/recurso \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"campo1": "valor"}'
\`\`\`

## 12. Changelog de la API

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | ${fullDate} | Versión inicial de la API |

---

<div align="center">

**Documentación de API generada automáticamente por ${ORION_BRAND} ${ORION_VERSION}**
*${fullDate}*

[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-API%20Docs-purple.svg?style=for-the-badge)]()

*Conforme a especificación OpenAPI 3.0*

</div>

IMPORTANTE:
- Documenta ABSOLUTAMENTE TODOS los endpoints que encuentres en el código
- Cada endpoint debe tener request Y response examples COMPLETOS
- Incluye ejemplos de cURL para cada endpoint
- No dejes ningún placeholder sin rellenar
- Tono profesional y técnico sin emojis
- Si un endpoint tiene validaciones, documenta CADA regla de validación
- Si hay middleware, documenta el orden de ejecución`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 12000,
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
     * Genera guía de contribución profesional con branding Orion AI
     */
    async generateContributing(project) {
        const filesContent = await this.readProjectFiles(project.projectSources);
        if (Object.keys(filesContent).length === 0) {
            throw new Error('No se encontraron archivos del proyecto para analizar. Verifique que el proyecto tenga archivos fuente cargados y que las rutas sean accesibles.');
        }
        const currentDate = getFormattedDate();
        const fullDate = getFullFormattedDate();
        // Extraer información del package.json para personalizar la guía
        const packageJsonContent = Object.entries(filesContent).find(([name]) => name === 'package.json');
        const tsConfigContent = Object.entries(filesContent).find(([name]) => name === 'tsconfig.json');
        const eslintContent = Object.entries(filesContent).find(([name]) => name.includes('eslint') || name.includes('.prettierrc'));
        const prompt = `Genera CONTRIBUTING.md PROFESIONAL y EXHAUSTIVO para "${project.name}" (${project.type}).

**CONTEXTO:**
Debe incluir branding "${ORION_BRAND}" y fecha "${currentDate}".
Analiza los archivos de configuración para personalizar las guías.

**IMPORTANTE:** 
- Responde SOLO en español
- Sin emojis, tono profesional y corporativo
- Formato empresarial estricto
- Personaliza basándote en las herramientas REALES del proyecto

**ARCHIVOS DE CONFIGURACIÓN:**
${packageJsonContent ? `### package.json\n\`\`\`json\n${packageJsonContent[1].slice(0, 2000)}\n\`\`\`` : 'No disponible'}

${tsConfigContent ? `### tsconfig.json\n\`\`\`json\n${tsConfigContent[1].slice(0, 1000)}\n\`\`\`` : ''}

${eslintContent ? `### ESLint/Prettier Config\n\`\`\`\n${eslintContent[1].slice(0, 1000)}\n\`\`\`` : ''}

**ESTRUCTURA REQUERIDA:**

<div align="center">

# Guía de Contribución

## ${project.name}

[![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=for-the-badge)]()
[![Code Style](https://img.shields.io/badge/code%20style-standard-blue.svg?style=for-the-badge)]()
[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Generated-purple.svg?style=for-the-badge)]()

*Guía de contribución generada por ${ORION_BRAND} | ${currentDate}*

</div>

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Código de Conducta](#código-de-conducta)
3. [Primeros Pasos](#primeros-pasos)
4. [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
5. [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
6. [Estándares de Código](#estándares-de-código)
7. [Convenciones de Commits](#convenciones-de-commits)
8. [Proceso de Pull Request](#proceso-de-pull-request)
9. [Reportar Issues](#reportar-issues)
10. [Testing](#testing)
11. [Documentación](#documentación)
12. [Revisión de Código](#revisión-de-código)
13. [Release Process](#release-process)
14. [Preguntas Frecuentes](#preguntas-frecuentes)

## Introducción

[2-3 párrafos de bienvenida profesional]

## Código de Conducta

### Principios Fundamentales

1. **Respeto profesional**: [Descripción]
2. **Inclusividad**: [Descripción]
3. **Comunicación constructiva**: [Descripción]
4. **Responsabilidad**: [Descripción]

### Comportamiento Esperado

- [Lista detallada]

### Comportamiento Inaceptable

- [Lista detallada]

## Primeros Pasos

### Requisitos del Sistema

| Requisito | Versión Mínima | Verificación |
|-----------|---------------|--------------|
| [Req] | [Ver] | [Comando] |

### Fork y Clonación

\`\`\`bash
# Fork del repositorio (via GitHub)

# Clonar fork
git clone https://github.com/TU_USUARIO/${project.name}.git
cd ${project.name}

# Agregar upstream
git remote add upstream https://github.com/ORIGINAL/${project.name}.git

# Verificar remotes
git remote -v
\`\`\`

## Configuración del Entorno de Desarrollo

### Instalación Paso a Paso

\`\`\`bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Configurar base de datos (si aplica)
npx prisma generate
npx prisma db push

# 4. Verificar que todo funciona
npm run dev
npm test
\`\`\`

### IDE Recomendado

[Configuración recomendada de VS Code con extensiones]

## Flujo de Trabajo de Desarrollo

### Diagrama de Flujo

\`\`\`
main ← PR ← feature/branch ← commits
  ↑                              |
  |______________________________|
         Revisión + Merge
\`\`\`

### Pasos del Flujo

1. **Crear rama desde main actualizado**
2. **Desarrollar con commits atómicos**
3. **Ejecutar tests y linting**
4. **Crear Pull Request**
5. **Revisión de código**
6. **Merge a main**

## Estándares de Código

### TypeScript

[Reglas basadas en tsconfig.json real]

### Naming Conventions

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Variables | camelCase | \`userName\` |
| Constantes | UPPER_SNAKE_CASE | \`MAX_RETRIES\` |
| Clases | PascalCase | \`UserService\` |
| Interfaces | PascalCase con prefijo I | \`IUserRepository\` |
| Tipos | PascalCase | \`UserResponse\` |
| Archivos | kebab-case | \`user-service.ts\` |
| Enums | PascalCase | \`UserRole\` |

### Linting y Formateo

\`\`\`bash
# Verificar estilo
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
\`\`\`

### Principios SOLID

[Explicar cómo aplicar cada principio en el contexto del proyecto]

## Convenciones de Commits

### Formato Conventional Commits

\`\`\`
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
\`\`\`

### Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| feat | Nueva funcionalidad | \`feat(auth): agregar login con OAuth\` |
| fix | Corrección de bug | \`fix(api): corregir validación de email\` |
| docs | Documentación | \`docs(readme): actualizar instalación\` |
| style | Formato (sin cambio lógico) | \`style: aplicar prettier\` |
| refactor | Refactorización | \`refactor(services): extraer lógica común\` |
| test | Tests | \`test(auth): agregar tests de login\` |
| chore | Mantenimiento | \`chore(deps): actualizar dependencias\` |
| perf | Rendimiento | \`perf(db): optimizar queries\` |
| ci | CI/CD | \`ci: agregar workflow de deploy\` |

## Proceso de Pull Request

### Checklist de Pre-envío

- [ ] Rama actualizada desde main
- [ ] Todos los tests pasan (\`npm test\`)
- [ ] Linting sin errores (\`npm run lint\`)
- [ ] Build exitoso (\`npm run build\`)
- [ ] Documentación actualizada
- [ ] Sin credenciales o datos sensibles
- [ ] Commits con formato conventional

### Template de Pull Request

[Template completo con secciones]

### Criterios de Aprobación

| Criterio | Requisito |
|----------|-----------|
| Tests | Todos pasan, cobertura >= 80% |
| Revisores | Mínimo 1 aprobación |
| CI/CD | Pipeline verde |
| Conflictos | Sin conflictos con main |

## Reportar Issues

### Template de Bug Report

[Template completo]

### Template de Feature Request

[Template completo]

## Testing

### Estructura de Tests

\`\`\`typescript
describe('[Componente/Servicio]', () => {
  // Setup
  beforeEach(() => { });

  describe('[Método/Funcionalidad]', () => {
    it('debe [comportamiento esperado] cuando [condición]', () => {
      // Arrange
      // Act
      // Assert
    });

    it('debe lanzar error cuando [condición de error]', () => {
      // Arrange
      // Act & Assert
    });
  });
});
\`\`\`

### Ejecutar Tests

\`\`\`bash
npm test              # Todos los tests
npm run test:watch    # Watch mode
npm run test:coverage # Con cobertura
\`\`\`

## Documentación

### Reglas de Documentación

- JSDoc para todas las funciones públicas
- README actualizado con cada feature
- Comentarios para lógica compleja

### Ejemplo de JSDoc

\`\`\`typescript
/**
 * Descripción de la función.
 * 
 * @param {string} param1 - Descripción del parámetro
 * @returns {Promise<ResultType>} Descripción del retorno
 * @throws {CustomError} Cuándo se lanza
 * @example
 * const result = await myFunction('value');
 */
\`\`\`

## Revisión de Código

### Guía para Revisores

| Aspecto | Qué Verificar |
|---------|---------------|
| Funcionalidad | ¿Hace lo que dice? |
| Tests | ¿Están completos? |
| Seguridad | ¿Hay vulnerabilidades? |
| Rendimiento | ¿Hay impacto? |
| Legibilidad | ¿Se entiende? |

## Release Process

### Versionado Semántico

\`\`\`
MAJOR.MINOR.PATCH
  ↑      ↑     ↑
  |      |     └─ Correcciones (backward compatible)
  |      └─────── Funcionalidades (backward compatible)
  └────────────── Cambios breaking
\`\`\`

## Preguntas Frecuentes

[FAQ basado en el tipo de proyecto]

---

<div align="center">

**Guía de contribución generada por ${ORION_BRAND} ${ORION_VERSION}**
*${fullDate}*

[![${ORION_BRAND.replace(' ', '%20')}](https://img.shields.io/badge/${ORION_BRAND.replace(' ', '%20')}-Contributing%20Guide-purple.svg?style=for-the-badge)]()

</div>

IMPORTANTE: Personaliza basándote en las herramientas REALES del proyecto. Sin emojis.`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
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
     * Lee archivos del proyecto desde las fuentes - Mejorado con lectura recursiva
     */
    async readProjectFiles(sources) {
        const files = {};
        for (const source of sources) {
            if (!source.sourceUrl)
                continue;
            try {
                if (source.sourceType === 'local' || source.sourceType === 'directory') {
                    // Fuente es un directorio: leer recursivamente
                    const stat = await fs.stat(source.sourceUrl);
                    if (stat.isDirectory()) {
                        await this.readDirectoryRecursive(source.sourceUrl, files, '', 0, 3);
                    }
                    else if (stat.isFile() && this.isRelevantFile(path.basename(source.sourceUrl))) {
                        const content = await fs.readFile(source.sourceUrl, 'utf-8');
                        files[source.sourceName || path.basename(source.sourceUrl)] = content;
                    }
                }
                else if (source.sourceType === 'file') {
                    // Fuente es un archivo individual subido
                    const filePath = source.sourceUrl;
                    // Verificar si el archivo existe
                    try {
                        await fs.access(filePath);
                    }
                    catch {
                        console.warn(`Archivo no encontrado: ${filePath}, saltando...`);
                        continue;
                    }
                    const stat = await fs.stat(filePath);
                    if (stat.isDirectory()) {
                        // Si el sourceUrl apunta a un directorio extraído de un ZIP
                        await this.readDirectoryRecursive(filePath, files, '', 0, 3);
                    }
                    else if (stat.isFile()) {
                        const fileName = source.sourceName || path.basename(filePath);
                        // Solo leer archivos relevantes para documentación
                        if (this.isRelevantFile(fileName)) {
                            const content = await fs.readFile(filePath, 'utf-8');
                            files[fileName] = content;
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error leyendo archivos de ${source.sourceName}:`, error);
            }
        }
        // Log para depuración
        console.log(`[DocumentationService] Archivos leídos: ${Object.keys(files).length}`);
        if (Object.keys(files).length === 0) {
            console.warn('[DocumentationService] ADVERTENCIA: No se leyeron archivos del proyecto. La documentación puede ser genérica.');
        }
        else {
            console.log(`[DocumentationService] Archivos: ${Object.keys(files).join(', ')}`);
        }
        return files;
    }
    /**
     * Lee directorios recursivamente hasta una profundidad máxima
     */
    async readDirectoryRecursive(dirPath, files, relativePath, currentDepth, maxDepth) {
        if (currentDepth > maxDepth || Object.keys(files).length >= 30)
            return;
        const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'];
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (Object.keys(files).length >= 30)
                    break;
                const entryRelativePath = relativePath
                    ? `${relativePath}/${entry.name}`
                    : entry.name;
                if (entry.isDirectory() && !ignoredDirs.includes(entry.name)) {
                    await this.readDirectoryRecursive(path.join(dirPath, entry.name), files, entryRelativePath, currentDepth + 1, maxDepth);
                }
                else if (entry.isFile() && this.isRelevantFile(entry.name)) {
                    const filePath = path.join(dirPath, entry.name);
                    const content = await fs.readFile(filePath, 'utf-8');
                    files[entryRelativePath] = content;
                }
            }
        }
        catch (error) {
            console.error(`Error leyendo directorio ${dirPath}:`, error);
        }
    }
    isRelevantFile(filename) {
        const relevantExtensions = [
            '.ts', '.js', '.tsx', '.jsx', '.md', '.json',
            '.prisma', '.env.example', '.yml', '.yaml',
            '.toml', '.cfg', '.conf'
        ];
        const irrelevantFiles = [
            'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
            '.DS_Store', 'thumbs.db'
        ];
        return (relevantExtensions.some((ext) => filename.endsWith(ext)) &&
            !irrelevantFiles.includes(filename));
    }
    /**
     * Prioriza archivos más importantes para el contexto del prompt
     */
    prioritizeFiles(filesContent) {
        const priorityOrder = [
            'package.json',
            'tsconfig.json',
            '.env.example',
            '.env',
        ];
        const priorityPatterns = [
            /route/i,
            /controller/i,
            /router/i,
            /service/i,
            /middleware/i,
            /auth/i,
            /app\.(ts|js)$/i,
            /index\.(ts|js)$/i,
            /server\.(ts|js)$/i,
            /main\.(ts|js)$/i,
            /schema\.prisma$/i,
            /model/i,
            /config/i,
        ];
        const entries = Object.entries(filesContent);
        // Separar en categorías de prioridad
        const high = [];
        const medium = [];
        const low = [];
        for (const entry of entries) {
            const [name] = entry;
            if (priorityOrder.includes(name)) {
                high.push(entry);
            }
            else if (priorityPatterns.some(p => p.test(name))) {
                medium.push(entry);
            }
            else {
                low.push(entry);
            }
        }
        return [...high, ...medium, ...low];
    }
    async getPrismaSchema() {
        try {
            const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
            return await fs.readFile(schemaPath, 'utf-8');
        }
        catch (error) {
            console.error('Error leyendo Prisma schema:', error);
            return '';
        }
    }
}
//# sourceMappingURL=documentationService.js.map