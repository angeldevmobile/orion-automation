import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000, // Relaxed for dev
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intente en 1 minuto.',
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Límite de generación alcanzado. Espere 1 minuto.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Relaxed for dev
  message: {
    success: false,
    error: 'Demasiados intentos. Intente en 15 minutos.',
  },
});