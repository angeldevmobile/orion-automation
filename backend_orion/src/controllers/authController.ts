import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.register({ email, password, fullName });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      console.log('Recibida petición de recuperación para:', email);
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        })
      }
      const result = await authService.requestPasswordReset(email);
      res.json({ success: true, data: result });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Token and new password are required'
        })
      }
      const result = await authService.resetPassword(token, newPassword);
      res.json({ success: true, data: result });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      await authService.deleteAccount(req.user.id);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const isAuth = (req as any).user;
      // The authenticate middleware attaches the user to the request
      /* 
         Note: In the original code, `req.user` seems to be used directly in `deleteAccount`,
         but Express Request type might not have `user` by default without extending it.
         I'll assume `req.user` is available if `authenticate` is used.
      */

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.json(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Determine status code based on error message (e.g. invalid password => 400 or 401)
      const statusCode = errorMessage === 'Invalid current password' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }
}