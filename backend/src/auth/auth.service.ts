import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, dateOfBirth, gender, weightKg } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('کاربری با این ایمیل قبلاً ثبت‌نام کرده است');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and patient profile in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'VIEWER',
        },
      });

      const patientProfile = await tx.patientProfile.create({
        data: {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: new Date(dateOfBirth),
          gender,
          weight_kg: weightKg,
        },
      });

      return { user, patientProfile };
    });

    const token = this.jwtService.sign({ sub: result.user.id, email: result.user.email });

    return {
      access_token: token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: result.patientProfile,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: true,
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.patientProfile,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: {
          include: {
            medicalHistory: true,
            medicationHistory: {
              include: {
                drug: true,
              },
            },
            reminders: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    return user;
  }
}