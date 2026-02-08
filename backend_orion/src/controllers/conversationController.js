import { ConversationsService } from '../services/conversacionsService.js';
import { ClaudeService } from '../services/claudeService.js';
import multer from 'multer';
const conversationsService = new ConversationsService();
const claudeService = new ClaudeService();
// Configurar multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'text/markdown',
            'application/pdf',
            'application/json',
            'text/javascript',
            'text/typescript',
            'text/html',
            'text/css',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    },
});
export const uploadMiddleware = upload.array('files', 5); // Máximo 5 archivos
export class ConversationsController {
    async getUserConversations(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const userId = req.user.id;
            const projectId = req.query.projectId;
            const conversations = await conversationsService.getUserConversations(userId, projectId);
            res.json({
                success: true,
                data: conversations
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async getConversationById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const id = req.params.id;
            const userId = req.user.id;
            const conversation = await conversationsService.getConversationById(id, userId);
            res.json({
                success: true,
                data: conversation
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async createConversation(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const userId = req.user.id;
            const { title, projectId } = req.body;
            const conversation = await conversationsService.createConversation(userId, title, projectId);
            res.status(201).json({
                success: true,
                data: conversation
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async sendMessage(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            console.log('req.body:', req.body);
            console.log('req.files:', req.files);
            console.log('Content-Type:', req.headers['content-type']);
            const conversationId = req.params.id;
            const userId = req.user.id;
            const { message, projectId } = req.body;
            const files = req.files;
            // Validar que hay al menos mensaje o archivos
            if (!message?.trim() && (!files || files.length === 0)) {
                return res.status(400).json({
                    success: false,
                    error: 'Se requiere un mensaje o archivos'
                });
            }
            let conversationIdToUse;
            // Si no hay conversationId, crear una nueva conversación
            if (!conversationId) {
                const title = message?.slice(0, 50) || 'Conversación con archivos';
                const newConversation = await conversationsService.createConversation(userId, title, projectId);
                conversationIdToUse = newConversation.id;
            }
            else {
                conversationIdToUse = conversationId;
            }
            // Guardar mensaje del usuario con metadata de archivos si existen
            const userMessageMetadata = files && files.length > 0 ? {
                files: files.map(f => ({
                    name: f.originalname,
                    type: f.mimetype,
                    size: f.size
                }))
            } : undefined;
            await conversationsService.addMessage(conversationIdToUse, userId, 'user', message || '📎 Archivo adjunto', userMessageMetadata);
            // Obtener conversación completa con mensajes y proyecto
            const conversationWithMessages = await conversationsService.getConversationById(conversationIdToUse, userId);
            // Preparar mensajes para Claude
            const claudeMessages = [];
            // Convertir mensajes anteriores
            for (const msg of conversationWithMessages.messages.slice(0, -1)) {
                claudeMessages.push({
                    role: msg.role,
                    content: msg.content,
                });
            }
            // Último mensaje (el actual) - puede tener archivos
            if (files && files.length > 0) {
                const contentParts = [];
                // Agregar texto si existe
                if (message?.trim()) {
                    contentParts.push({
                        type: 'text',
                        text: message
                    });
                }
                // Agregar imágenes
                for (const file of files) {
                    if (file.mimetype.startsWith('image/')) {
                        const base64Data = file.buffer.toString('base64');
                        // Validar que sea un tipo soportado
                        const mediaType = file.mimetype;
                        contentParts.push({
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Data,
                            }
                        });
                    }
                    else if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
                        // Para archivos de texto, agregar su contenido
                        const textContent = file.buffer.toString('utf-8');
                        contentParts.push({
                            type: 'text',
                            text: `\n\n--- Archivo: ${file.originalname} ---\n${textContent}\n--- Fin del archivo ---\n`
                        });
                    }
                }
                claudeMessages.push({
                    role: 'user',
                    content: contentParts
                });
            }
            else {
                claudeMessages.push({
                    role: 'user',
                    content: message
                });
            }
            // Obtener contexto del proyecto si existe
            let projectContext;
            if (conversationWithMessages.projectId && conversationWithMessages.project) {
                projectContext = `Proyecto: ${conversationWithMessages.project.name}\nDescripción: ${conversationWithMessages.project.description || 'Sin descripción'}`;
            }
            // Obtener respuesta de Claude
            const assistantResponse = await claudeService.sendMessageWithContext(claudeMessages, projectContext);
            // Guardar respuesta del asistente
            const assistantMessage = await conversationsService.addMessage(conversationIdToUse, userId, 'assistant', assistantResponse);
            res.status(200).json({
                success: true,
                data: {
                    conversationId: conversationIdToUse,
                    message: assistantMessage
                }
            });
        }
        catch (error) {
            console.error('Error in sendMessage:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async addMessage(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const id = req.params.id;
            const userId = req.user.id;
            const { role, content, metadata } = req.body;
            if (!role || !content) {
                return res.status(400).json({
                    success: false,
                    error: 'Role and content are required'
                });
            }
            const message = await conversationsService.addMessage(id, userId, role, content, metadata);
            res.status(201).json({
                success: true,
                data: message
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async updateConversation(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const id = req.params.id;
            const userId = req.user.id;
            const { title } = req.body;
            await conversationsService.updateConversationTitle(id, userId, title);
            res.json({
                success: true,
                message: 'Conversation updated'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async deleteConversation(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            const id = req.params.id;
            const userId = req.user.id;
            await conversationsService.deleteConversation(id, userId);
            res.json({
                success: true,
                message: 'Conversation deleted'
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
//# sourceMappingURL=conversationController.js.map