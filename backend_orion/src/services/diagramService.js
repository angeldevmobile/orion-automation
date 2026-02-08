import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
export class DiagramService {
    /**
     * Genera un diagrama de arquitectura C4 con Mermaid
     */
    async generateArchitectureDiagram(projectName, projectType, filesContent) {
        const prompt = `Analiza este proyecto y genera un diagrama Mermaid PROFESIONAL de arquitectura tipo C4 Model.

**PROYECTO:** ${projectName}
**TIPO:** ${projectType}
**ARCHIVOS CLAVE:**
${Object.entries(filesContent)
            .slice(0, 10)
            .map(([name, content]) => `### ${name}\n${content.slice(0, 800)}`)
            .join('\n\n')}

Genera un diagrama Mermaid avanzado con:

1. **Subgrafos organizados** (Frontend, Backend, Data Layer, External)
2. **Iconos con emojis** relevantes (💻 🔐 🗄️ ⚡ 🌐)
3. **Estilos personalizados** por tipo de componente
4. **Flechas descriptivas** con labels
5. **Jerarquía clara** de capas

Ejemplo de estructura:

\`\`\`mermaid
graph TB
    subgraph "🌐 External Layer"
        USER[👤 Users]
        EXT_API[🔌 External APIs]
    end
    
    subgraph "💻 Frontend Layer"
        WEB[🖥️ Web App<br/>React + TypeScript]
        MOBILE[📱 Mobile App]
    end
    
    subgraph "⚙️ Backend Services"
        API[🚪 API Gateway<br/>Express.js]
        AUTH[🔐 Auth Service<br/>JWT]
        LOGIC[⚡ Business Logic]
    end
    
    subgraph "💾 Data Layer"
        DB[(🗄️ PostgreSQL<br/>Primary DB)]
        CACHE[(⚡ Redis<br/>Cache)]
    end
    
    USER -->|HTTPS| WEB
    USER -->|HTTPS| MOBILE
    WEB -->|REST API| API
    MOBILE -->|REST API| API
    API -->|Validate| AUTH
    API -->|Process| LOGIC
    LOGIC -->|Query| DB
    LOGIC -->|Cache| CACHE
    LOGIC -->|Integrate| EXT_API
    
    classDef frontend fill:#667eea,stroke:#764ba2,stroke-width:3px,color:#fff
    classDef backend fill:#f093fb,stroke:#f5576c,stroke-width:3px,color:#fff
    classDef database fill:#4facfe,stroke:#00f2fe,stroke-width:3px,color:#fff
    classDef external fill:#ffeaa7,stroke:#fdcb6e,stroke-width:2px
    
    class WEB,MOBILE frontend
    class API,AUTH,LOGIC backend
    class DB,CACHE database
    class EXT_API,USER external
\`\`\`

**IMPORTANTE:** 
- Responde SOLO con el código Mermaid entre \`\`\`mermaid y \`\`\`
- Usa componentes reales del proyecto analizado
- Incluye tecnologías específicas identificadas`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta de la IA');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('La respuesta de la IA no contiene texto válido');
        }
        return this.extractMermaidCode(content.text);
    }
    /**
     * Genera diagrama D2 PROFESIONAL con iconos y estilos avanzados
     */
    async generateD2Diagram(projectName, projectType, filesContent) {
        const prompt = `Analiza este proyecto y genera un diagrama D2 ULTRA PROFESIONAL con iconos, colores y formas avanzadas.

**PROYECTO:** ${projectName}
**TIPO:** ${projectType}
**ARCHIVOS CLAVE:**
${Object.entries(filesContent)
            .slice(0, 10)
            .map(([name, content]) => `### ${name}\n${content.slice(0, 800)}`)
            .join('\n\n')}

Genera un diagrama D2 de nivel empresarial con:

1. **Contenedores agrupados** por capas (External, Gateway, Backend, Data)
2. **Formas variadas**: rectangle, cylinder, cloud, hexagon, diamond, queue
3. **Colores profesionales** por sección (#e3f2fd, #fff3e0, #f3e5f5, #e8f5e9)
4. **Conexiones con estilos** personalizados (stroke-dash, stroke-width)
5. **Dirección horizontal** (direction: right)

**IMPORTANTE:** 
- Responde SOLO con el código D2 entre \`\`\`d2 y \`\`\`
- Analiza los archivos y usa componentes REALES del proyecto
- Identifica tecnologías específicas (Express, PostgreSQL, Redis, etc.)
- Usa nombres descriptivos y profesionales`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 5000,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta de la IA para diagrama D2');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('La respuesta de la IA no contiene texto válido');
        }
        return this.extractD2Code(content.text);
    }
    /**
     * Genera diagrama de secuencia para un flujo específico
     */
    async generateSequenceDiagram(projectName, flowDescription) {
        const prompt = `Genera un diagrama de secuencia Mermaid para el flujo: "${flowDescription}" en el proyecto ${projectName}.

Incluye:
- Actores (Usuario, Frontend, Backend, Base de Datos)
- Llamadas API con métodos HTTP
- Autenticación JWT si aplica
- Manejo de errores con notas
- Respuestas exitosas y de error

Responde SOLO con el código Mermaid.`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3000,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta de la IA');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('La respuesta de la IA no contiene texto válido');
        }
        return this.extractMermaidCode(content.text);
    }
    /**
     * Genera diagrama ER de la base de datos
     */
    async generateERDiagram(prismaSchema) {
        const prompt = `Genera un diagrama ER (Entity-Relationship) en Mermaid basado en este schema de Prisma:

\`\`\`prisma
${prismaSchema.slice(0, 3000)}
\`\`\`

Incluye:
- Todas las entidades con sus campos principales
- Tipos de datos
- Relaciones (one-to-one, one-to-many, many-to-many)
- Claves primarias (PK) y foráneas (FK)
- Índices únicos (UK)

Responde SOLO con el código Mermaid.`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 3500,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta de la IA');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('La respuesta de la IA no contiene texto válido');
        }
        return this.extractMermaidCode(content.text);
    }
    // ═══════════════════════════════════════════════════════
    // ISOFLOW — IA genera modelo isométrico
    // ═══════════════════════════════════════════════════════
    /**
     * Genera modelo JSON Isoflow para diagramas isométricos.
     * La IA analiza el proyecto y emite el JSON que Isoflow renderiza.
     */
    async generateIsoflowModel(projectName, projectType, filesContent) {
        const prompt = `Analiza este proyecto y genera un modelo JSON para un diagrama isométrico de arquitectura usando Isoflow.

**PROYECTO:** ${projectName}
**TIPO:** ${projectType}
**ARCHIVOS CLAVE:**
${Object.entries(filesContent)
            .slice(0, 10)
            .map(([name, content]) => `### ${name}\n${content.slice(0, 800)}`)
            .join('\n\n')}

Genera un JSON con esta estructura EXACTA. Analiza los archivos REALES y usa componentes que existan en el proyecto:

\`\`\`json
{
  "name": "${projectName} Architecture",
  "description": "Isometric architecture diagram generated by AI",
  "groups": [
    { "id": "external", "label": "External Layer", "style": { "color": "#e3f2fd", "opacity": 0.3 } },
    { "id": "frontend", "label": "Frontend", "style": { "color": "#e8eaf6", "opacity": 0.3 } },
    { "id": "backend", "label": "Backend Services", "style": { "color": "#f3e5f5", "opacity": 0.3 } },
    { "id": "data", "label": "Data Layer", "style": { "color": "#e8f5e9", "opacity": 0.3 } },
    { "id": "infra", "label": "Infrastructure", "style": { "color": "#fff3e0", "opacity": 0.3 } }
  ],
  "nodes": [
    {
      "id": "users",
      "type": "person",
      "label": "End Users",
      "description": "Web and mobile clients",
      "group": "external",
      "icon": "person",
      "position": { "x": 0, "y": 0 },
      "style": { "color": "#1976d2" }
    },
    {
      "id": "api_gateway",
      "type": "server",
      "label": "API Gateway",
      "description": "Express.js REST API",
      "group": "backend",
      "icon": "server",
      "position": { "x": 2, "y": 0 },
      "style": { "color": "#7b1fa2" }
    },
    {
      "id": "database",
      "type": "database",
      "label": "PostgreSQL",
      "description": "Primary relational database",
      "group": "data",
      "icon": "database",
      "position": { "x": 4, "y": 0 },
      "style": { "color": "#388e3c" }
    }
  ],
  "edges": [
    {
      "from": "users",
      "to": "api_gateway",
      "label": "HTTPS Requests",
      "style": { "color": "#1976d2", "animated": true }
    },
    {
      "from": "api_gateway",
      "to": "database",
      "label": "SQL Queries",
      "style": { "color": "#388e3c" }
    }
  ]
}
\`\`\`

**REGLAS:**
1. Responde SOLO con JSON válido entre \`\`\`json y \`\`\`
2. Detecta: APIs, DBs, colas, auth, cache, servicios externos
3. type puede ser: person, browser, server, database, cloud, queue, container, lambda, cdn, loadbalancer, firewall, storage, microservice
4. icon puede ser: person, browser, server, database, lock, cache, cloud, queue, lambda, cdn, loadbalancer, firewall, storage, microservice
5. Posiciones en grid (x,y) incrementando de izquierda a derecha por capas
6. Mínimo 4 nodos, máximo 12 nodos
7. Cada edge tiene label descriptivo
8. Usa nombres y tecnologías REALES detectadas en los archivos`;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 5000,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta de la IA para Isoflow');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('La respuesta de la IA no contiene texto válido');
        }
        const jsonStr = this.extractJsonCode(content.text);
        const model = JSON.parse(jsonStr);
        model.metadata = {
            generatedAt: new Date().toISOString(),
            projectType,
            version: '1.0.0',
        };
        return model;
    }
    /**
     * Genera modelo Isoflow desde especificación OpenAPI
     */
    async generateIsoflowFromOpenAPI(openApiSpec, projectName) {
        const prompt = `Analiza esta especificación OpenAPI y genera un modelo JSON Isoflow para diagrama isométrico.

**PROYECTO:** ${projectName}
**OPENAPI SPEC:**
\`\`\`yaml
${openApiSpec.slice(0, 4000)}
\`\`\`

Detecta todos los endpoints, agrúpalos por recurso/tag, identifica servicios, DBs, auth.
Genera JSON con la misma estructura: { name, description, groups, nodes, edges }

- Cada recurso/tag = 1 nodo tipo "microservice" o "server"
- API Gateway como nodo central
- Auth si hay securitySchemes
- Database inferida de las operaciones CRUD

Responde SOLO con JSON válido entre \`\`\`json y \`\`\``;
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 5000,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
        });
        if (!response.content || response.content.length === 0) {
            throw new Error('No se recibió respuesta para OpenAPI → Isoflow');
        }
        const content = response.content[0];
        if (!content || content.type !== 'text') {
            throw new Error('Respuesta inválida');
        }
        const jsonStr = this.extractJsonCode(content.text);
        const model = JSON.parse(jsonStr);
        model.metadata = {
            generatedAt: new Date().toISOString(),
            projectType: 'openapi',
            version: '1.0.0',
        };
        return model;
    }
    // ═══════════════════════════════════════════════════════
    // Extractores
    // ═══════════════════════════════════════════════════════
    extractMermaidCode(text) {
        const mermaidMatch = text.match(/```mermaid\n([\s\S]*?)```/);
        if (mermaidMatch && mermaidMatch[1]) {
            return mermaidMatch[1].trim();
        }
        return text.trim();
    }
    extractD2Code(text) {
        const d2Match = text.match(/```d2\n([\s\S]*?)```/);
        if (d2Match && d2Match[1]) {
            return d2Match[1].trim();
        }
        return text.trim();
    }
    extractJsonCode(text) {
        const jsonMatch = text.match(/```json\n([\s\S]*?)```/);
        if (jsonMatch && jsonMatch[1]) {
            return jsonMatch[1].trim();
        }
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
            return text.slice(startIdx, endIdx + 1);
        }
        throw new Error('No se encontró JSON válido en la respuesta');
    }
}
//# sourceMappingURL=diagramService.js.map