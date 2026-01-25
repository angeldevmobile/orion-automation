export interface Project {
  id: string;
  name: string;
  type: 'code' | 'documents' | 'data';
  status: 'analyzing' | 'ready' | 'pending' | 'error';
  lastAnalysis: string;
  description: string;
  filesCount: number;
  issuesFound: number;
}

export interface AIResponse {
  id: string;
  objective: string;
  contextUsed: string[];
  reasoning: string;
  result: string;
  risks: string[];
  nextSteps: string[];
  timestamp: string;
  type: 'analysis' | 'documentation' | 'issues' | 'improvements';
}

export interface ActionHistoryItem {
  id: string;
  action: string;
  timestamp: string;
  status: 'completed' | 'running' | 'failed';
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'nexus-api',
    type: 'code',
    status: 'ready',
    lastAnalysis: '2024-01-10T14:30:00Z',
    description: 'Backend API principal con autenticación y endpoints REST',
    filesCount: 156,
    issuesFound: 3,
  },
  {
    id: '2',
    name: 'documentación-técnica',
    type: 'documents',
    status: 'analyzing',
    lastAnalysis: '2024-01-10T10:15:00Z',
    description: 'Documentación de arquitectura y guías de desarrollo',
    filesCount: 42,
    issuesFound: 0,
  },
  {
    id: '3',
    name: 'analytics-pipeline',
    type: 'data',
    status: 'ready',
    lastAnalysis: '2024-01-09T18:45:00Z',
    description: 'Pipeline de procesamiento de datos con Apache Spark',
    filesCount: 89,
    issuesFound: 7,
  },
  {
    id: '4',
    name: 'mobile-app',
    type: 'code',
    status: 'pending',
    lastAnalysis: '2024-01-08T09:00:00Z',
    description: 'Aplicación móvil React Native para iOS y Android',
    filesCount: 234,
    issuesFound: 12,
  },
];

export const mockAIResponse: AIResponse = {
  id: '1',
  objective: 'Analizar la estructura del proyecto e identificar patrones de código',
  contextUsed: [
    'src/api/routes/*.ts',
    'src/services/*.ts',
    'package.json',
    'tsconfig.json',
  ],
  reasoning: `El proyecto sigue una arquitectura de capas bien definida con separación clara entre controladores, servicios y repositorios. 

Se identificaron patrones consistentes de manejo de errores usando un middleware centralizado. La estructura de carpetas facilita la escalabilidad horizontal.

Sin embargo, se detectaron algunas áreas de mejora en la gestión de dependencias y en la cobertura de pruebas unitarias.`,
  result: `### Estructura General
- **Arquitectura**: Capas (Controller → Service → Repository)
- **Patrones**: Dependency Injection, Factory Pattern
- **Framework**: Express.js con TypeScript

### Métricas Clave
- Cobertura de tests: 67%
- Complejidad ciclomática promedio: 4.2
- Duplicación de código: 3.8%`,
  risks: [
    'Dependencias desactualizadas con vulnerabilidades conocidas',
    'Falta de validación en algunos endpoints',
    'Memoria potencialmente no liberada en conexiones WebSocket',
  ],
  nextSteps: [
    'Actualizar dependencias críticas (express, lodash)',
    'Implementar validación con Zod en endpoints pendientes',
    'Agregar tests para servicios de autenticación',
  ],
  timestamp: '2024-01-10T14:30:00Z',
  type: 'analysis',
};

export const mockActionHistory: ActionHistoryItem[] = [
  { id: '1', action: 'Análisis completo del proyecto', timestamp: '2024-01-10T14:30:00Z', status: 'completed' },
  { id: '2', action: 'Generación de documentación API', timestamp: '2024-01-10T13:15:00Z', status: 'completed' },
  { id: '3', action: 'Detección de vulnerabilidades', timestamp: '2024-01-10T12:00:00Z', status: 'completed' },
  { id: '4', action: 'Análisis de dependencias', timestamp: '2024-01-09T16:45:00Z', status: 'completed' },
];

export const projectTypes = [
  { value: 'code', label: 'Código', description: 'Repositorios de código fuente' },
  { value: 'documents', label: 'Documentos', description: 'Archivos de documentación y texto' },
  { value: 'data', label: 'Datos', description: 'Datasets y pipelines de datos' },
] as const;
