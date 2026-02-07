import { API_CONFIG, getApiUrl, getAuthHeaders, getAuthHeadersForUpload } from '@/config/apiConfig';

// Interfaces de autenticación
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      profile: {
        fullName: string | null;
      } | null;
      roles: string[];
    };
    token: string;
  };
  error?: string;
}

// Tipo para settings (compatible con Prisma.InputJsonValue)
export type ProjectSettings = Record<string, unknown>;

// Interfaces de proyectos
export interface ProjectData {
  name: string;
  type: string;
  description?: string;
  settings?: ProjectSettings;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  description: string | null;
  createdAt: string; 
  updatedAt: string;
  settings?: Record<string, unknown>;
}

export interface ProjectResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    type: string;
    description: string | null;
  };
}

export interface AnalysisIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location?: string;
  suggestion: string;
}

export interface AnalysisSuggestion {
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

export interface AnalysisMetrics {
  codeQuality: number;
  maintainability: number;
  performance: number;
  security: number;
}

export interface AnalysisResult {
  summary: string;
  issues: AnalysisIssue[];
  suggestions: AnalysisSuggestion[];
  metrics: AnalysisMetrics;
  recommendations: string[];
}

export interface AnalysisResponse {
  success: boolean;
  data: AnalysisResult;
  message?: string;
  error?: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'documentation' | 'diagram' | 'checklist' | 'plan' | 'report';
  content: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'confirmed' | 'rejected';
  category: string;
  impact?: string;
  metadata: {
    pros?: string[];
    cons?: string[];
    recommendation?: string;
    estimatedEffort?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  actionType: string;
  description: string;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  result?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interfaces de documentación
export interface DocumentationRequest {
  projectId: string;
  documentTypes: string[];
}

export interface DocumentationArtifact {
  id: string;
  name: string;
  type: string;
  content: string;
  status: 'generated' | 'modified' | 'deleted';
  analysisId: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  analysis?: {
    id: string;
    createdAt: string;
    objective: string;
  };
}

// API de autenticación
export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.login), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.register), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMe(token: string): Promise<AuthResponse> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.me), {
    headers: getAuthHeaders(token),
  });
  return res.json();
}

// API de salud
export async function getHealth(): Promise<{ status: string; timestamp: string; database: string; version: string }> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.health));
  return res.json();
}

// API de proyectos
export async function createProject(
  data: ProjectData,
  token: string
): Promise<ProjectResponse> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.projects), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
}

// API de subida de archivos
export async function uploadProjectFiles(
  projectId: string,
  files: File[],
  token: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projectUpload(projectId)), {
      method: 'POST',
      headers: getAuthHeadersForUpload(token),
      body: formData,
    });

    return res.json();
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'No se pudieron subir los archivos'
    };
  }
}

export async function analyzeProject(
  projectId: string,
  token: string
): Promise<AnalysisResponse> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.analyzeProject(projectId)), {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al analizar proyecto');
    }

    return res.json();
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      data: {
        summary: 'Error al analizar el proyecto',
        issues: [],
        suggestions: [],
        metrics: {
          codeQuality: 0,
          maintainability: 0,
          performance: 0,
          security: 0
        },
        recommendations: []
      },
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export async function getProjectAnalyses(
  projectId: string,
  token: string
): Promise<{ success: boolean; data: unknown[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projectAnalyses(projectId)), {
      headers: getAuthHeaders(token),
    });

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      console.error('Expected JSON, got:', text.substring(0, 200));
      throw new Error('El servidor no devolvió JSON');
    }

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al obtener análisis');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'No se pudieron obtener los análisis'
    };
  }
}

export async function getAnalysisStats(
  projectId: string,
  token: string
): Promise<{ success: boolean; data?: { totalAnalyses: number; totalTokens: number; avgDuration: number }; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.analysisStats(projectId)), {
      headers: getAuthHeaders(token),
    });

    return res.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      success: false,
      error: 'No se pudieron obtener las estadísticas'
    };
  }
}

export async function getUserProjects(
  token: string
): Promise<{ success: boolean; data: Project[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projects), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      throw new Error('Error al obtener proyectos');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      data: [],
      error: 'No se pudieron obtener los proyectos'
    };
  }
}

export async function getAnalysisArtifacts(
  analysisId: string,
  token: string
): Promise<{ success: boolean; data: Artifact[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.analysisArtifacts(analysisId)), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      throw new Error('Error al obtener artefactos');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return {
      success: false,
      data: [],
      error: 'No se pudieron obtener los artefactos'
    };
  }
}

export async function getAnalysisDecisions(
  analysisId: string,
  token: string
): Promise<{ success: boolean; data: Decision[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.analysisDecisions(analysisId)), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      throw new Error('Error al obtener decisiones');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching decisions:', error);
    return {
      success: false,
      data: [],
      error: 'No se pudieron obtener las decisiones'
    };
  }
}

export async function getProjectActions(
  projectId: string,
  token: string
): Promise<{ success: boolean; data: ActionItem[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projectActions(projectId)), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      throw new Error('Error al obtener historial');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching actions:', error);
    return {
      success: false,
      data: [],
      error: 'No se pudo obtener el historial'
    };
  }
}

export async function updateDecisionStatus(
  decisionId: string,
  status: 'pending' | 'confirmed' | 'rejected',
  token: string
): Promise<ApiResponse<Decision>> { 
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.decision(decisionId)), {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al actualizar decisión');
    }

    return res.json();
  } catch (error) {
    console.error('Error updating decision:', error);
    throw error; 
  }
}

export async function generateDocumentation(
  data: DocumentationRequest,
  token: string
): Promise<{ success: boolean; data: DocumentationArtifact[]; meta?: { analysisId: string; count: number; durationMs: number }; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.generateDocumentation), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al generar documentación');
    }

    return res.json();
  } catch (error) {
    console.error('Error generating documentation:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export async function getProjectDocumentation(
  projectId: string,
  token: string
): Promise<{ success: boolean; data: DocumentationArtifact[]; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projectDocumentation(projectId)), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      throw new Error('Error al obtener documentación');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return {
      success: false,
      data: [],
      error: 'No se pudo obtener la documentación'
    };
  }
}

export async function downloadDocumentation(
  artifactId: string,
  token: string,
  format: "md" | "pdf" = "md"
): Promise<Blob> {
  try {
    const res = await fetch(
      getApiUrl(API_CONFIG.endpoints.downloadDocumentation(artifactId, format)),
      {
        headers: getAuthHeadersForUpload(token),
      }
    );

    if (!res.ok) {
      throw new Error('Error al descargar documento');
    }

    return res.blob();
  } catch (error) {
    console.error('Error downloading documentation:', error);
    throw error;
  }
}

export async function deleteProject(
  projectId: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.projectById(projectId)), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    return res.json();
  } catch (error) {
    console.error('Delete project error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar proyecto'
    };
  }
}

// Verificación de token
export async function verifyToken(token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(getApiUrl(API_CONFIG.endpoints.me), {
      headers: getAuthHeaders(token),
    });

    if (!res.ok) {
      return {
        success: false,
        data: {
          user: { id: '', email: '', profile: null, roles: [] },
          token: ''
        },
        error: 'Invalid token'
      };
    }

    const result = await res.json();
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          user: {
            id: result.data.id,
            email: result.data.email,
            profile: result.data.profile || null,
            roles: result.data.roles || []
          },
          token: token // Mantener el token original
        }
      };
    }

    return {
      success: false,
      data: {
        user: { id: '', email: '', profile: null, roles: [] },
        token: ''
      },
      error: result.error || 'Verification failed'
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      data: {
        user: { id: '', email: '', profile: null, roles: [] },
        token: ''
      },
      error: 'Network error'
    };
  }
}

export async function forgotPassword(email: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.forgotPassword), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPassword(
  token: string, 
  newPassword: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const res = await fetch(getApiUrl(API_CONFIG.endpoints.resetPassword), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return res.json();
}

/**
 * Genera diagramas de arquitectura (Mermaid, D2, Isométrico)
 */
export async function generateDiagrams(
  projectId: string,
  token: string,
  type: 'architecture' | 'sequence' | 'er' | 'isometric' = 'architecture'
): Promise<ApiResponse> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.endpoints.generateDiagrams(projectId)), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ type }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error generando diagramas' };
  }
}

/**
 * Obtiene los diagramas generados de un proyecto
 */
export async function getProjectDiagrams(
  projectId: string,
  token: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.endpoints.projectDiagrams(projectId)), {
      headers: getAuthHeaders(token),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error obteniendo diagramas' };
  }
}

/**
 * Obtiene imagen PNG de diagrama Mermaid o D2
 */
export async function getDiagramImage(
  projectId: string,
  token: string,
  format: 'mermaid' | 'd2'
): Promise<string | null> {
  try {
    const response = await fetch(
      getApiUrl(API_CONFIG.endpoints.diagramImage(projectId, format)),
      { headers: getAuthHeadersForUpload(token) }
    );
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Obtiene imagen PNG de diagrama isométrico
 */
export async function getIsometricDiagramImage(
  projectId: string,
  token: string
): Promise<string | null> {
  try {
    const response = await fetch(
      getApiUrl(API_CONFIG.endpoints.isometricImage(projectId)),
      { headers: getAuthHeadersForUpload(token) }
    );
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Obtiene HTML interactivo del diagrama isométrico
 */
export async function getIsometricDiagramHTML(
  projectId: string,
  token: string
): Promise<string | null> {
  try {
    const response = await fetch(
      getApiUrl(API_CONFIG.endpoints.isometricHTML(projectId)),
      { headers: getAuthHeadersForUpload(token) }
    );
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}