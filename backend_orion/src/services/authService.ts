import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { EmailService } from './emailService.js';
import { resetPasswordEmailTemplate } from '../utils/email_templates.js';

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

  // Método helper para extraer nombre del email
  private getUserNameFromEmail(email: string): string {
    // Validar que el email tenga formato básico válido
    if (!email || !email.includes('@')) {
      return 'Usuario';
    }

    const emailParts = email.split('@');
    const localPart = emailParts[0];
    
    // Validar que la parte local existe y no está vacía
    if (!localPart || localPart.length === 0) {
      return 'Usuario';
    }

    // Dividir por puntos, guiones o guiones bajos y tomar la primera parte
    const nameParts = localPart.split(/[._-]/);
    const namePart = nameParts[0];
    
    // Validar que la parte del nombre existe y no está vacía
    if (!namePart || namePart.length === 0) {
      return 'Usuario';
    }

    // Capitalizar primera letra
    const capitalizedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
    
    // Validar que el nombre parece válido (más de 2 caracteres y no contiene números)
    if (capitalizedName.length > 2 && !/\d/.test(capitalizedName)) {
      return capitalizedName;
    }
    
    // Fallback genérico
    return 'Usuario';
  }

  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
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

    // Obtener nombre del usuario con validaciones de seguridad
    let userName = 'Usuario';
    
    if (user.profile?.fullName) {
      const fullNameTrimmed = user.profile.fullName.trim();
      
      if (fullNameTrimmed.length > 0) {
        const firstName = fullNameTrimmed.split(' ')[0];
        
        if (firstName && firstName.length > 0) {
          userName = firstName;
        } else {
          userName = this.getUserNameFromEmail(email);
        }
      } else {
        userName = this.getUserNameFromEmail(email);
      }
    } else {
      // Si no tiene nombre en el perfil, extraer del email
      userName = this.getUserNameFromEmail(email);
    }

    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      console.log('Enviando email de recuperación a:', user.email);
      console.log('Nombre del usuario:', userName);
      
      // ✅ Generar HTML directamente en el backend
      const htmlContent = resetPasswordEmailTemplate(resetUrl, userName);
      
      // Enviar email
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
      
      // Lanzar el error para que el controller lo maneje
      throw new Error('Error enviando email de recuperación');
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