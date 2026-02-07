declare global {
  namespace Express {
    interface Request {
      user?: {  // ← Agregar ? para hacerlo opcional
        id: string;
        email: string;
      };
    }
  }
}

export {};