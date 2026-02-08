/**
 * Configuración centralizada de la API
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  endpoints: {
    // Auth
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    deleteAccount: '/api/auth/me',

    // Health
    health: '/api/health',

    // Projects
    projects: '/api/projects',
    projectById: (id: string) => `/api/projects/${id}`,
    projectUpload: (id: string) => `/api/projects/${id}/upload`,
    projectActions: (id: string) => `/api/projects/${id}/actions`,

    // Analyses
    analyzeProject: (id: string) => `/api/analyses/project/${id}/analyze`,
    projectAnalyses: (id: string) => `/api/analyses/project/${id}`,
    analysisStats: (id: string) => `/api/analyses/project/${id}/stats`,
    analysisArtifacts: (id: string) => `/api/analyses/${id}/artifacts`,
    analysisDecisions: (id: string) => `/api/analyses/${id}/decisions`,

    // Decisions
    decision: (id: string) => `/api/decisions/${id}`,

    // Documentation
    generateDocumentation: '/api/documentation/generate',
    projectDocumentation: (id: string) => `/api/documentation/project/${id}`,
    downloadDocumentation: (id: string, format: 'md' | 'pdf' = 'md') =>
      `/api/documentation/${id}/download?format=${format}`,

    // Conversations
    conversations: '/api/conversations',
    conversationById: (id: string) => `/api/conversations/${id}`,
    sendMessage: '/api/conversations/send',
    conversationSendMessage: (id: string) => `/api/conversations/${id}/send`,

    // Diagrams
    generateDiagrams: (id: string) => `/api/diagrams/project/${id}/generate`,
    projectDiagrams: (id: string) => `/api/diagrams/project/${id}`,
    diagramImage: (id: string, format: 'mermaid' | 'd2') => `/api/diagrams/project/${id}/image/${format}`,
    isometricImage: (id: string) => `/api/diagrams/project/${id}/isometric/image`,
    isometricHTML: (id: string) => `/api/diagrams/project/${id}/isometric/html`,
  },
} as const;

/**
 * Helper para construir URLs completas
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

/**
 * Headers por defecto para requests autenticados
 */
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

/**
 * Headers para uploads de archivos (sin Content-Type)
 */
export const getAuthHeadersForUpload = (token: string) => ({
  'Authorization': `Bearer ${token}`,
});