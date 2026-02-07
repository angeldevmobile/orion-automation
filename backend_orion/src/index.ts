import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/indexRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import projectRoutes from './routes/projectRoutes.js';
import diagramRoutes from './routes/diagramRoutes.js';

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
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
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
      health: '/api/health'
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