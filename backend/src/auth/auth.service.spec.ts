import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/auth.dto';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Mock data
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword123',
    fullName: 'Test User',
    phone: '0123456789',
    avatarUrl: 'https://example.com/avatar.jpg',
    roleId: 'role-1',
    status: 'ACTIVE' as const,
    role: {
      id: 'role-1',
      name: 'GUEST',
      description: 'Guest role',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: mockUser.id,
    email: mockUser.email,
    fullName: mockUser.fullName,
    phone: mockUser.phone,
    avatarUrl: mockUser.avatarUrl,
    roleId: mockUser.roleId,
    status: mockUser.status,
    role: mockUser.role,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  const mockGuestRole = {
    id: 'role-1',
    name: 'GUEST',
    description: 'Guest role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    userProvider: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  // Mock JwtService
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.email).toBe('test@example.com');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { role: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
    });

    it('should return null when user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        include: { role: true },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when user has no password (social login)', async () => {
      // Arrange
      const userWithoutPassword = { ...mockUser, password: null };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      // Assert
      expect(result).toBeNull();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword123',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: 'INACTIVE' as const };
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('Tài khoản đã bị vô hiệu hóa');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(mockUserWithoutPassword);

      // Assert
      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          fullName: mockUser.fullName,
          phone: mockUser.phone,
          avatarUrl: mockUser.avatarUrl,
          role: mockUser.role,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        roleId: mockUser.roleId,
      });
    });

    it('should generate JWT with correct payload structure', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      // Act
      await service.login(mockUserWithoutPassword);

      // Assert
      const payload = mockJwtService.sign.mock.calls[0][0];
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('roleId');
      expect(payload.sub).toBe(mockUser.id);
    });

    it('should handle user without optional fields', async () => {
      // Arrange
      const userWithoutOptionalFields = {
        ...mockUserWithoutPassword,
        phone: null,
        avatarUrl: null,
      };
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      // Act
      const result = await service.login(userWithoutOptionalFields);

      // Assert
      expect(result.user.phone).toBeNull();
      expect(result.user.avatarUrl).toBeNull();
      expect(result.access_token).toBe(mockToken);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'New User',
      phone: '0987654321',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: registerDto.email,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'GUEST' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email đã được sử dụng',
      );
      expect(prismaService.role.findUnique).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when GUEST role does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Không tìm thấy vai trò mặc định',
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should hash password with correct salt rounds', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should create user with correct data structure', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.register(registerDto);

      // Assert
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: 'hashedPassword123',
          fullName: registerDto.fullName,
          phone: registerDto.phone,
          roleId: mockGuestRole.id,
          status: 'ACTIVE',
        },
        include: {
          role: true,
        },
      });
    });

    it('should handle registration without optional phone', async () => {
      // Arrange
      const registerDtoNoPhone = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.register(registerDtoNoPhone);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(prismaService.user.create).toHaveBeenCalled();
    });

    it('should handle database errors during user creation', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getProfile', () => {
    const mockUserWithPermissions = {
      ...mockUser,
      role: {
        ...mockUser.role,
        permissions: [
          {
            permission: {
              id: 'perm-1',
              name: 'READ_USERS',
              description: 'Read users',
            },
          },
        ],
      },
    };

    it('should return user profile with role and permissions', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(
        mockUserWithPermissions,
      );

      // Act
      const result = await service.getProfile('user-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.id).toBe('user-1');
      expect(result.role).toBeDefined();
      expect(result.role.permissions).toBeDefined();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        'Không tìm thấy người dùng',
      );
    });

    it('should exclude password from profile data', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getProfile('user-1');

      // Assert
      expect(result).not.toHaveProperty('password');
      expect(Object.keys(result)).not.toContain('password');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(service.getProfile('user-1')).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('validateOAuthLogin', () => {
    const oauthData = {
      provider: 'GOOGLE' as const,
      providerId: 'google-123',
      email: 'oauth@example.com',
      fullName: 'OAuth User',
      avatarUrl: 'https://example.com/oauth-avatar.jpg',
    };

    it('should login existing user with linked provider', async () => {
      // Arrange
      const mockProvider = {
        provider: 'GOOGLE',
        providerId: 'google-123',
        userId: 'user-1',
        user: mockUser,
      };
      mockPrismaService.userProvider.findUnique.mockResolvedValue(mockProvider);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.validateOAuthLogin(oauthData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result.user.email).toBe(mockUser.email);
      expect(prismaService.userProvider.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerId: {
            provider: 'GOOGLE',
            providerId: 'google-123',
          },
        },
        include: {
          user: {
            include: { role: true },
          },
        },
      });
    });

    it('should link provider to existing user with same email', async () => {
      // Arrange
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProvider.create.mockResolvedValue({
        provider: 'GOOGLE',
        providerId: 'google-123',
        userId: mockUser.id,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.validateOAuthLogin(oauthData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(prismaService.userProvider.create).toHaveBeenCalledWith({
        data: {
          provider: 'GOOGLE',
          providerId: 'google-123',
          userId: mockUser.id,
        },
      });
    });

    it('should update avatar if not set for existing user', async () => {
      // Arrange
      const userWithoutAvatar = { ...mockUser, avatarUrl: null };
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutAvatar);
      mockPrismaService.userProvider.create.mockResolvedValue({
        provider: 'GOOGLE',
        providerId: 'google-123',
        userId: mockUser.id,
      });
      mockPrismaService.user.update.mockResolvedValue({
        ...userWithoutAvatar,
        avatarUrl: oauthData.avatarUrl,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.validateOAuthLogin(oauthData);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { avatarUrl: oauthData.avatarUrl },
      });
    });

    it('should not update avatar if already set', async () => {
      // Arrange
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userProvider.create.mockResolvedValue({
        provider: 'GOOGLE',
        providerId: 'google-123',
        userId: mockUser.id,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.validateOAuthLogin(oauthData);

      // Assert
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should create new user with provider when email does not exist', async () => {
      // Arrange
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null) // First call in validateOAuthLogin
        .mockResolvedValueOnce(null); // Second call doesn't exist in this flow
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        email: oauthData.email,
        fullName: oauthData.fullName,
        avatarUrl: oauthData.avatarUrl,
        password: null,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.validateOAuthLogin(oauthData);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: oauthData.email,
          fullName: oauthData.fullName,
          avatarUrl: oauthData.avatarUrl,
          roleId: mockGuestRole.id,
          status: 'ACTIVE',
          providers: {
            create: {
              provider: oauthData.provider,
              providerId: oauthData.providerId,
            },
          },
        },
        include: { role: true },
      });
    });

    it('should throw NotFoundException when GUEST role not found for new user', async () => {
      // Arrange
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateOAuthLogin(oauthData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validateOAuthLogin(oauthData)).rejects.toThrow(
        'Không tìm thấy vai trò mặc định',
      );
    });

    it('should handle OAuth data without avatar', async () => {
      // Arrange
      const oauthDataNoAvatar = { ...oauthData, avatarUrl: undefined };
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        avatarUrl: null,
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.validateOAuthLogin(oauthDataNoAvatar);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(prismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            avatarUrl: undefined,
          }),
        }),
      );
    });

    it('should handle different OAuth providers', async () => {
      // Arrange
      const facebookData = {
        provider: 'FACEBOOK' as const,
        providerId: 'fb-123',
        email: 'facebook@example.com',
        fullName: 'Facebook User',
      };
      mockPrismaService.userProvider.findUnique.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockGuestRole);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      await service.validateOAuthLogin(facebookData);

      // Assert
      expect(prismaService.userProvider.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            provider_providerId: {
              provider: 'FACEBOOK',
              providerId: 'fb-123',
            },
          },
        }),
      );
    });
  });
});
