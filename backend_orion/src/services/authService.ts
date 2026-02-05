import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EmailService } from './emailService.js';

interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface JwtPayload {
  userId: string;
  email: string;
}

interface PasswordResetPayload {
  userId: string;
  type: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(data: RegisterData) {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario con perfil
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        profile: {
          create: {
            fullName: data.fullName ?? null
          }
        },
        userRoles: {
          create: {
            role: 'user'
          }
        }
      },
      include: {
        profile: true,
        userRoles: true
      }
    });

    // Generar token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles: user.userRoles.map(r => r.role)
      },
      token
    };
  }

  async login(data: LoginData) {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        userRoles: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar password
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generar token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles: user.userRoles.map(r => r.role)
      },
      token
    };
  }

  private generateToken(userId: string, email: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    let options = {};
    if (process.env.JWT_EXPIRES_IN) {
      options = { expiresIn: process.env.JWT_EXPIRES_IN as string };
    } else {
      options = { expiresIn: '7d' };
    }

    return jwt.sign(
      { userId, email },
      secret,
      options
    );
  }

  async verifyToken(token: string) {
    try {
      const secret = process.env.JWT_SECRET;
      
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          profile: true,
          userRoles: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles: user.userRoles.map(r => r.role)
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('No existe usuario con ese email:', email);
      return { success: true, message: 'If email exists, reset link sent' };
    }

    // Generar token de reseteo (válido 1 hora)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Guardar token en base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000) // 1 hora
      }
    });

    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      console.log('Enviando email de recuperación a:', user.email);
      
      let htmlContent: string;

      try {
        // Intentar obtener HTML desde el frontend
        const frontendResponse = await fetch(`${process.env.FRONTEND_URL}/api/render-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'password-reset',
            resetUrl,
            userEmail: email,
          }),
        });

        if (frontendResponse.ok) {
          const { html } = await frontendResponse.json();
          htmlContent = html;
          console.log('HTML obtenido del frontend exitosamente');
        } else {
          console.log('Frontend no disponible, usando fallback');
          htmlContent = this.generateFallbackEmail(resetUrl, email);
        }
      } catch (fetchError) {
        console.log('Error conectando con frontend, usando fallback:', fetchError);
        htmlContent = this.generateFallbackEmail(resetUrl, email);
      }

      // Enviar email con el HTML (ya sea del frontend o fallback)
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, htmlContent);
      console.log('Email de recuperación enviado exitosamente');
      
    } catch (error) {
      console.error('Error sending reset email:', error);
      
      // Limpiar token si falla el envío
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });
      
      // No lanzar error para no revelar si el email existe
    }

    return { 
      success: true, 
      message: 'Si el correo existe, recibirás un enlace de recuperación'
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as PasswordResetPayload;
      
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          resetToken: token,
          resetTokenExpiry: { gte: new Date() }
        }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  // Método para generar HTML fallback si el frontend no responde
  private generateFallbackEmail(resetUrl: string, email: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Orion AI - Recuperar Contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin-bottom: 10px;">🌟 Orion AI</h1>
            <p style="color: #666; margin: 0;">Inteligencia Artificial Avanzada</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Recuperar Contraseña</h2>
            
            <p>Hola,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta: <strong>${email}</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
              ">
                🔐 Restablecer mi Contraseña
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Si tienes problemas con el botón, copia y pega este enlace en tu navegador:
            </p>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px;">
              <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad. Si no solicitaste este cambio, ignora este correo y tu cuenta permanecerá segura.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              ¿Necesitas ayuda? Contáctanos en 
              <a href="mailto:support@orion-ai.com" style="color: #667eea;">support@orion-ai.com</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              © ${new Date().getFullYear()} Orion AI - Tecnología del Futuro<br>
              Orion AI Labs • Perú, Lima
            </p>
          </div>

        </body>
      </html>
    `;
  }
}