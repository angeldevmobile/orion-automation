import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/indexRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Log todas las peticiones
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

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