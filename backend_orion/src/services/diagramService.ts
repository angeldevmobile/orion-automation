import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class DiagramService {
  /**
   * Genera un diagrama de arquitectura C4 con Mermaid
   */
  async generateArchitectureDiagram(
    projectName: string,
    projectType: string,
    filesContent: Record<string, string>
  ): Promise<string> {
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
  async generateD2Diagram(
    projectName: string,
    projectType: string,
    filesContent: Record<string, string>
  ): Promise<string> {
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

Ejemplo de estructura D2 profesional:

\`\`\`d2
direction: right

# ${projectName} - System Architecture

external: External Access {
  style.fill: "#e3f2fd"
  style.stroke: "#1976d2"
  style.stroke-width: 3
  
  user: End Users {
    shape: person
    style.fill: "#1976d2"
    style.font-color: "#fff"
  }
  
  mobile: Mobile App {
    shape: rectangle
    style.fill: "#42a5f5"
    style.stroke: "#1976d2"
  }
}

gateway: API Gateway {
  style.fill: "#fff3e0"
  style.stroke: "#f57c00"
  style.stroke-width: 3
  
  firewall: Security Firewall {
    shape: diamond
    style.fill: "#ff6f00"
    style.stroke: "#e65100"
  }
  
  loadbalancer: Load Balancer {
    shape: hexagon
    style.fill: "#ffa726"
    style.stroke: "#f57c00"
  }
  
  api: REST API Gateway {
    shape: rectangle
    style.fill: "#ffb74d"
    style.stroke: "#f57c00"
  }
}

backend: Backend Services {
  style.fill: "#f3e5f5"
  style.stroke: "#7b1fa2"
  style.stroke-width: 3
  
  auth: Authentication Service {
    shape: rectangle
    style.fill: "#ba68c8"
    style.stroke: "#7b1fa2"
  }
  
  business: Business Logic Layer {
    shape: rectangle
    style.fill: "#ce93d8"
    style.stroke: "#8e24aa"
  }
  
  microservices: Microservices {
    style.fill: "#e1bee7"
    style.stroke: "#9c27b0"
    
    users: User Service {
      shape: rectangle
    }
    
    products: Product Catalog {
      shape: rectangle
    }
    
    orders: Order Management {
      shape: rectangle
    }
  }
}

messaging: Message Queue {
  style.fill: "#fff9c4"
  style.stroke: "#f9a825"
  style.stroke-width: 3
  
  redis: Redis Cache {
    shape: cylinder
    style.fill: "#fdd835"
    style.stroke: "#f57f17"
  }
  
  rabbitmq: RabbitMQ {
    shape: queue
    style.fill: "#ffee58"
    style.stroke: "#f9a825"
  }
}

data: Data Layer {
  style.fill: "#e8f5e9"
  style.stroke: "#388e3c"
  style.stroke-width: 3
  
  postgres: PostgreSQL Database {
    shape: cylinder
    style.fill: "#66bb6a"
    style.stroke: "#2e7d32"
  }
  
  storage: Cloud File Storage {
    shape: cloud
    style.fill: "#81c784"
    style.stroke: "#388e3c"
  }
}

# Connections with styles
user -> firewall: HTTPS Request {
  style.stroke: "#1976d2"
  style.stroke-width: 2
}

mobile -> firewall: API Call {
  style.stroke: "#42a5f5"
  style.stroke-width: 2
}

firewall -> loadbalancer: Validated Traffic
loadbalancer -> api: Distribute Load

api -> auth: Validate Token {
  style.stroke: "#7b1fa2"
  style.stroke-width: 2
  style.stroke-dash: 3
}

api -> business: Process Request {
  style.stroke: "#8e24aa"
  style.stroke-width: 2
}

business -> microservices.users: User Operations
business -> microservices.products: Product Queries
business -> microservices.orders: Order Processing

microservices.users -> postgres: CRUD Operations {
  style.stroke: "#388e3c"
  style.stroke-width: 2
}

microservices.products -> postgres: Read Data
microservices.orders -> postgres: Transactional Writes

business -> redis: Cache Layer {
  style.stroke: "#f9a825"
  style.stroke-dash: 5
}

business -> rabbitmq: Async Events {
  style.stroke: "#f57c00"
  style.stroke-dash: 3
}

rabbitmq -> storage: Store Files
\`\`\`

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
  async generateSequenceDiagram(
    projectName: string,
    flowDescription: string
  ): Promise<string> {
    const prompt = `Genera un diagrama de secuencia Mermaid para el flujo: "${flowDescription}" en el proyecto ${projectName}.

Incluye:
- Actores (Usuario, Frontend, Backend, Base de Datos)
- Llamadas API con métodos HTTP
- Autenticación JWT si aplica
- Manejo de errores con notas
- Respuestas exitosas y de error

Formato:
\`\`\`mermaid
sequenceDiagram
    actor User as 👤 Usuario
    participant FE as 💻 Frontend
    participant API as 🚪 API Gateway
    participant Auth as 🔐 Auth Service
    participant DB as 🗄️ Database
    
    User->>FE: Click "Login"
    FE->>API: POST /auth/login
    Note over FE,API: {email, password}
    
    API->>Auth: Validate credentials
    Auth->>DB: SELECT * FROM users WHERE email=?
    
    alt User found
        DB-->>Auth: User data
        Auth->>Auth: Verify password
        Auth-->>API: JWT token
        API-->>FE: {token, user}
        FE-->>User: Redirect to dashboard
    else User not found
        DB-->>Auth: NULL
        Auth-->>API: 401 Unauthorized
        API-->>FE: {error: "Invalid credentials"}
        FE-->>User: Show error message
    end
\`\`\`

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
  async generateERDiagram(prismaSchema: string): Promise<string> {
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

Formato:
\`\`\`mermaid
erDiagram
    USER ||--o{ PROJECT : "creates"
    USER {
        string id PK
        string email UK
        string password
        datetime created_at
    }
    PROJECT ||--o{ ANALYSIS : "has"
    PROJECT {
        string id PK
        string user_id FK
        string name
        string type
        int file_count
    }
\`\`\`

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

  /**
   * Extrae el código Mermaid de la respuesta de Claude
   */
  private extractMermaidCode(text: string): string {
    const mermaidMatch = text.match(/```mermaid\n([\s\S]*?)```/);

    if (mermaidMatch && mermaidMatch[1]) {
      return mermaidMatch[1].trim();
    }

    return text.trim();
  }

  /**
   * Extrae el código D2 de la respuesta de Claude
   */
  private extractD2Code(text: string): string {
    const d2Match = text.match(/```d2\n([\s\S]*?)```/);

    if (d2Match && d2Match[1]) {
      return d2Match[1].trim();
    }

    // Si no está en bloques de código, intentar devolver todo
    return text.trim();
  }
}