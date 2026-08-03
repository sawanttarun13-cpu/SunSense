import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repo';
import { config } from '../config/env';

const userRepo = new UserRepository();

export class AuthService {
  async register(data: any) {
    const existingUser = await userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    const user = await userRepo.create({
      email: data.email,
      passwordHash,
      name: data.name,
      skinType: 3, // Default fallback
      preferredSpf: 30, // Default fallback
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(data: any) {
    const user = await userRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
      refreshToken
    };
  }

  async getProfile(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    return { id: user.id, email: user.email, name: user.name, skinType: user.skinType, preferredSpf: user.preferredSpf };
  }
}
