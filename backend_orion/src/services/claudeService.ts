import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Tipos específicos para los bloques de contenido
type TextBlock = {
  type: 'text';
  text: string;
};

type ImageBlock = {
  type: 'image';
  source: {
    type: 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
};

// Tipo para el contenido de un mensaje
export type MessageContent = string | Array<TextBlock | ImageBlock>;

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: MessageContent;
}

// System prompt base para Orion AI
const BASE_SYSTEM_PROMPT = `Eres Orion AI, un asistente inteligente especializado en desarrollo de software, automatización y análisis de código.

## Tu Identidad
- Nombre: Orion AI
- Especialización: Desarrollo de software, arquitectura, automatización y análisis de código
- Personalidad: Profesional, amigable, y siempre dispuesto a ayudar

## Cómo debes responder
- Sé claro, conciso y técnicamente preciso
- Usa ejemplos de código cuando sea apropiado
- Adapta tu nivel técnico según la pregunta del usuario
- Proporciona contexto y explicaciones cuando sea necesario
- Si no estás seguro de algo, admítelo honestamente
- Prioriza las mejores prácticas y código limpio

## Especialidades
- Desarrollo de software y automatización
- Arquitectura de aplicaciones
- Análisis y optimización de código
- Debugging y resolución de problemas
- Documentación técnica
- Code reviews y mejores prácticas
- Integración y despliegue continuo

Responde siempre en español, de manera clara y profesional.`;

export class ClaudeService {
  async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt || BASE_SYSTEM_PROMPT,
        messages: messages as Anthropic.MessageParam[], // Cast explícito
      });

      // Validar que existe contenido
      if (!response.content || response.content.length === 0) {
        throw new Error('No se recibió respuesta de Claude');
      }

      const firstContent = response.content[0];
      
      if (!firstContent) {
        throw new Error('El contenido está vacío');
      }

      if (firstContent.type === 'text') {
        return firstContent.text;
      }

      // Si no es texto, lanzar error
      throw new Error(`Tipo de contenido no soportado: ${firstContent.type}`);
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Manejar errores específicos de Anthropic
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Error de Claude API: ${error.message}`);
      }
      
      throw new Error('Error al comunicarse con Claude');
    }
  }

  async sendMessageWithContext(
    messages: ClaudeMessage[],
    projectContext?: string
  ): Promise<string> {
    const systemPrompt = projectContext
      ? `${BASE_SYSTEM_PROMPT}

## Contexto del Proyecto Actual
${projectContext}

Usa este contexto para proporcionar respuestas más precisas y relevantes al proyecto específico del usuario.`
      : BASE_SYSTEM_PROMPT;

    return this.sendMessage(messages, systemPrompt);
  }
}