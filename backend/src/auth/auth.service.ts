import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    // Check if user has a password (social login users may not have one)
    if (!user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Get GUEST role (default for new registrations)
    const guestRole = await this.prisma.role.findUnique({
      where: { name: 'GUEST' },
    });

    if (!guestRole) {
      throw new NotFoundException('Không tìm thấy vai trò mặc định');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
        roleId: guestRole.id,
        status: 'ACTIVE',
      },
      include: {
        role: true,
      },
    });

    // Return user without password and generate token
    const { password, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Validate OAuth login (Google, Facebook, etc.)
   * - Find user by provider + providerId
   * - If not found, find by email and link provider
   * - If email not found, create new user + provider
   */
  async validateOAuthLogin(oauthData: {
    provider: 'GOOGLE' | 'FACEBOOK' | 'APPLE';
    providerId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  }) {
    const { provider, providerId, email, fullName, avatarUrl } = oauthData;

    // 1. Check if provider is already linked to a user
    const existingProvider = await this.prisma.userProvider.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (existingProvider) {
      // User already has this provider linked
      const { password, ...userWithoutPassword } = existingProvider.user;
      return this.login(userWithoutPassword);
    }

    // 2. Check if user with this email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (existingUser) {
      // Link provider to existing user
      await this.prisma.userProvider.create({
        data: {
          provider,
          providerId,
          userId: existingUser.id,
        },
      });

      // Update avatar if not set
      if (!existingUser.avatarUrl && avatarUrl) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { avatarUrl },
        });
      }

      const { password, ...userWithoutPassword } = existingUser;
      return this.login(userWithoutPassword);
    }

    // 3. Create new user with provider
    const guestRole = await this.prisma.role.findUnique({
      where: { name: 'GUEST' },
    });

    if (!guestRole) {
      throw new NotFoundException('Không tìm thấy vai trò mặc định');
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        fullName,
        avatarUrl,
        roleId: guestRole.id,
        status: 'ACTIVE',
        providers: {
          create: {
            provider,
            providerId,
          },
        },
      },
      include: { role: true },
    });

    return this.login(newUser);
  }
}
