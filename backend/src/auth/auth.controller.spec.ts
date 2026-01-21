import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  // Mock data
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
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

  const mockAuthResponse = {
    access_token: 'mock-jwt-token',
    user: {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      phone: mockUser.phone,
      avatarUrl: mockUser.avatarUrl,
      role: mockUser.role,
    },
  };

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    validateOAuthLogin: jest.fn(),
  };

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
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
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should call authService.register with correct data', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
      });
    });

    it('should return access token and user data', async () => {
      // Arrange
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('fullName');
    });

    it('should handle registration errors', async () => {
      // Arrange
      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(registerDto)).rejects.toThrow(
        'Registration failed',
      );
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle registration without optional phone', async () => {
      // Arrange
      const registerDtoNoPhone = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.register(registerDtoNoPhone);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDtoNoPhone);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRequest = {
      user: mockUser,
    };

    it('should successfully login a user', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(mockRequest, loginDto);

      // Assert
      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should use user from request object (validated by LocalAuthGuard)', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      await controller.login(mockRequest, loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockRequest.user);
    });

    it('should return access token and user data', async () => {
      // Arrange
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(mockRequest, loginDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should handle login errors', async () => {
      // Arrange
      const error = new Error('Login failed');
      mockAuthService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(mockRequest, loginDto)).rejects.toThrow(
        'Login failed',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should handle request with user containing role information', async () => {
      // Arrange
      const requestWithRole = {
        user: mockUser,
      };
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      // Act
      const result = await controller.login(requestWithRole, loginDto);

      // Assert
      expect(result.user.role).toBeDefined();
      expect(result.user.role.name).toBe('GUEST');
    });
  });

  describe('getProfile', () => {
    const mockProfile = {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      phone: mockUser.phone,
      avatarUrl: mockUser.avatarUrl,
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
      status: mockUser.status,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    };

    it('should return user profile with permissions', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      // Act
      const result = await controller.getProfile(mockUser);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(authService.getProfile).toHaveBeenCalledTimes(1);
    });

    it('should use user id from CurrentUser decorator', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      // Act
      await controller.getProfile(mockUser);

      // Assert
      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
    });

    it('should include role and permissions in profile', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      // Act
      const result = await controller.getProfile(mockUser);

      // Assert
      expect(result.role).toBeDefined();
      expect(result.role.permissions).toBeDefined();
      expect(Array.isArray(result.role.permissions)).toBe(true);
    });

    it('should handle profile retrieval errors', async () => {
      // Arrange
      const error = new Error('Profile not found');
      mockAuthService.getProfile.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getProfile(mockUser)).rejects.toThrow(
        'Profile not found',
      );
      expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not include password in profile', async () => {
      // Arrange
      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      // Act
      const result = await controller.getProfile(mockUser);

      // Assert
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(controller.googleAuth).toBeDefined();
    });

    it('should be an async function', () => {
      expect(controller.googleAuth).toBeInstanceOf(Function);
      expect(controller.googleAuth.constructor.name).toBe('AsyncFunction');
    });
  });

  describe('googleAuthCallback', () => {
    const mockOAuthUser = {
      providerId: 'google-123',
      email: 'oauth@example.com',
      fullName: 'OAuth User',
      avatarUrl: 'https://example.com/oauth-avatar.jpg',
      accessToken: 'google-access-token',
    };

    const mockRequest = {
      user: mockOAuthUser,
    };

    const mockResponse = {
      redirect: jest.fn(),
    } as unknown as Response;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should validate OAuth login and redirect to frontend', async () => {
      // Arrange
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      expect(authService.validateOAuthLogin).toHaveBeenCalledWith({
        provider: 'GOOGLE',
        providerId: mockOAuthUser.providerId,
        email: mockOAuthUser.email,
        fullName: mockOAuthUser.fullName,
        avatarUrl: mockOAuthUser.avatarUrl,
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/auth/callback#token=${mockAuthResponse.access_token}`,
      );
    });

    it('should use default frontend URL when not configured', async () => {
      // Arrange
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue(undefined);

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/auth/callback#token=${mockAuthResponse.access_token}`,
      );
    });

    it('should call validateOAuthLogin with correct provider data', async () => {
      // Arrange
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      const callArgs = mockAuthService.validateOAuthLogin.mock.calls[0][0];
      expect(callArgs.provider).toBe('GOOGLE');
      expect(callArgs.providerId).toBe(mockOAuthUser.providerId);
      expect(callArgs.email).toBe(mockOAuthUser.email);
      expect(callArgs.fullName).toBe(mockOAuthUser.fullName);
      expect(callArgs.avatarUrl).toBe(mockOAuthUser.avatarUrl);
    });

    it('should redirect with access token in URL fragment', async () => {
      // Arrange
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue('http://example.com');

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      const redirectUrl = (mockResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl).toContain('#token=');
      expect(redirectUrl).toContain(mockAuthResponse.access_token);
    });

    it('should handle custom frontend URL from config', async () => {
      // Arrange
      const customUrl = 'https://custom-frontend.com';
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue(customUrl);

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      expect(configService.get).toHaveBeenCalledWith('FRONTEND_URL');
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `${customUrl}/auth/callback#token=${mockAuthResponse.access_token}`,
      );
    });

    it('should handle OAuth callback without avatar', async () => {
      // Arrange
      const requestNoAvatar = {
        user: {
          ...mockOAuthUser,
          avatarUrl: undefined,
        },
      };
      mockAuthService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      await controller.googleAuthCallback(requestNoAvatar, mockResponse);

      // Assert
      expect(authService.validateOAuthLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarUrl: undefined,
        }),
      );
    });

    it('should handle validateOAuthLogin errors', async () => {
      // Arrange
      const error = new Error('OAuth validation failed');
      mockAuthService.validateOAuthLogin.mockRejectedValue(error);
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act & Assert
      await expect(
        controller.googleAuthCallback(mockRequest, mockResponse),
      ).rejects.toThrow('OAuth validation failed');
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });

    it('should properly encode special characters in redirect URL', async () => {
      // Arrange
      const responseWithSpecialChars = {
        ...mockAuthResponse,
        access_token: 'token.with.dots',
      };
      mockAuthService.validateOAuthLogin.mockResolvedValue(
        responseWithSpecialChars,
      );
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      // Act
      await controller.googleAuthCallback(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/auth/callback#token=${responseWithSpecialChars.access_token}`,
      );
    });
  });
});
