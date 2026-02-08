import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/indexRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import projectRoutes from './routes/projectRoutes.js';
import diagramRoutes from './routes/diagramRoutes.js';
import { generalLimiter, aiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { startCleanupScheduler } from './utils/cleanupOldUploads.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// CORS configuration 
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Seguridad y rate limiting
app.use(helmet());
app.use(generalLimiter);
app.use(express.json());
// Log todas las peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Rate limiting específico (ANTES de las rutas)
app.use('/api/auth', authLimiter);
app.use('/api/projects/:id/generate', aiLimiter);
app.use('/api/projects/:id/analyze', aiLimiter);
app.use('/api/conversations', aiLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', routes);
app.use('/api/projects', projectRoutes);
app.use('/api/diagrams', diagramRoutes);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Orion AI Automation API',
        version: '1.0.0',
        database: 'orion_automation',
        endpoints: {
            api: '/api',
            health: '/health'
        }
    });
});
// Error handler
app.use(errorHandler);
// Start server
async function startServer() {
    const connected = await connectDatabase();
    if (!connected) {
        process.exit(1);
    }
    // Iniciar limpieza automática de archivos temporales
    startCleanupScheduler();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
    });
}
// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map