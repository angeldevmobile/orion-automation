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

    // Enviar email con el link de reseteo
    try {
      console.log('Enviando email de recuperación a:', user.email);
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('Error sending reset email:', error);
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
}