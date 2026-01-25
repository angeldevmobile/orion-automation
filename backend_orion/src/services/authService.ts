import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

export class AuthService {
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
}