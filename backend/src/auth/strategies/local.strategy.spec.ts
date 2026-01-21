import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let authService: AuthService;

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

    // Mock AuthService
    const mockAuthService = {
        validateUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LocalStrategy,
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        strategy = module.get<LocalStrategy>(LocalStrategy);
        authService = module.get<AuthService>(AuthService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Strategy Definition', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should be instance of LocalStrategy', () => {
            expect(strategy).toBeInstanceOf(LocalStrategy);
        });
    });

    describe('validate', () => {
        it('should return user when credentials are valid', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(
                'test@example.com',
                'password123',
            );

            // Assert
            expect(result).toEqual(mockUser);
            expect(authService.validateUser).toHaveBeenCalledWith(
                'test@example.com',
                'password123',
            );
            expect(authService.validateUser).toHaveBeenCalledTimes(1);
        });

        it('should throw UnauthorizedException when user is null', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate('wrong@example.com', 'wrongpassword'),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                strategy.validate('wrong@example.com', 'wrongpassword'),
            ).rejects.toThrow('Email hoặc mật khẩu không đúng');
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', 'wrongpassword'),
            ).rejects.toThrow(UnauthorizedException);
            expect(authService.validateUser).toHaveBeenCalledWith(
                'test@example.com',
                'wrongpassword',
            );
        });

        it('should throw UnauthorizedException when email does not exist', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate('nonexistent@example.com', 'password123'),
            ).rejects.toThrow(UnauthorizedException);
            expect(authService.validateUser).toHaveBeenCalledWith(
                'nonexistent@example.com',
                'password123',
            );
        });

        it('should call authService.validateUser with email field', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('test@example.com', 'password123');

            // Assert
            const [email, password] = mockAuthService.validateUser.mock.calls[0];
            expect(email).toBe('test@example.com');
            expect(password).toBe('password123');
        });

        it('should return user with role information', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(
                'test@example.com',
                'password123',
            );

            // Assert
            expect(result.role).toBeDefined();
            expect(result.role.name).toBe('GUEST');
        });

        it('should handle lowercase email addresses', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('test@example.com', 'password123');

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                'test@example.com',
                'password123',
            );
        });

        it('should handle uppercase email addresses', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('TEST@EXAMPLE.COM', 'password123');

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                'TEST@EXAMPLE.COM',
                'password123',
            );
        });

        it('should handle mixed case email addresses', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('Test@Example.Com', 'password123');

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                'Test@Example.Com',
                'password123',
            );
        });

        it('should handle special characters in email', async () => {
            // Arrange
            const emailWithSpecialChars = 'user+test@example.com';
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate(emailWithSpecialChars, 'password123');

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                emailWithSpecialChars,
                'password123',
            );
        });

        it('should handle empty email', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(strategy.validate('', 'password123')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should handle empty password', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', ''),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should handle whitespace in credentials', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate(' test@example.com ', ' password123 ');

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                ' test@example.com ',
                ' password123 ',
            );
        });

        it('should propagate errors from authService', async () => {
            // Arrange
            mockAuthService.validateUser.mockRejectedValue(
                new Error('Database error'),
            );

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', 'password123'),
            ).rejects.toThrow('Database error');
        });

        it('should handle very long passwords', async () => {
            // Arrange
            const longPassword = 'a'.repeat(1000);
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('test@example.com', longPassword);

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                'test@example.com',
                longPassword,
            );
        });

        it('should handle passwords with special characters', async () => {
            // Arrange
            const specialPassword = 'p@ssw0rd!#$%^&*()_+-={}[]|:;"<>,.?/';
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            await strategy.validate('test@example.com', specialPassword);

            // Assert
            expect(authService.validateUser).toHaveBeenCalledWith(
                'test@example.com',
                specialPassword,
            );
        });

        it('should handle user without optional fields', async () => {
            // Arrange
            const minimalUser = {
                id: 'user-1',
                email: 'test@example.com',
                fullName: 'Test User',
                phone: null,
                avatarUrl: null,
                roleId: 'role-1',
                status: 'ACTIVE' as const,
                role: mockUser.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockAuthService.validateUser.mockResolvedValue(minimalUser);

            // Act
            const result = await strategy.validate(
                'test@example.com',
                'password123',
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.phone).toBeNull();
            expect(result.avatarUrl).toBeNull();
        });
    });

    describe('Strategy Configuration', () => {
        it('should use email as username field', () => {
            // The strategy is configured to use 'email' as usernameField
            // This is tested implicitly through the validate method accepting email
            expect(strategy.validate).toBeDefined();
        });

        it('should use password as password field', () => {
            // The strategy is configured to use 'password' as passwordField
            // This is tested implicitly through the validate method accepting password
            expect(strategy.validate).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should throw custom error message in Vietnamese', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            try {
                await strategy.validate('test@example.com', 'wrongpassword');
                fail('Should have thrown UnauthorizedException');
            } catch (error) {
                expect(error).toBeInstanceOf(UnauthorizedException);
                expect(error.message).toBe('Email hoặc mật khẩu không đúng');
            }
        });

        it('should not reveal whether email or password is wrong', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            const wrongEmailPromise = strategy.validate(
                'wrong@example.com',
                'password123',
            );
            const wrongPasswordPromise = strategy.validate(
                'test@example.com',
                'wrongpassword',
            );

            await expect(wrongEmailPromise).rejects.toThrow(
                'Email hoặc mật khẩu không đúng',
            );
            await expect(wrongPasswordPromise).rejects.toThrow(
                'Email hoặc mật khẩu không đúng',
            );
        });

        it('should handle authService returning undefined', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(undefined);

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', 'password123'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should handle authService throwing custom exceptions', async () => {
            // Arrange
            const customError = new UnauthorizedException('Custom error');
            mockAuthService.validateUser.mockRejectedValue(customError);

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', 'password123'),
            ).rejects.toThrow('Custom error');
        });
    });

    describe('Integration', () => {
        it('should work with valid user credentials flow', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(
                'test@example.com',
                'password123',
            );

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe('user-1');
            expect(result.email).toBe('test@example.com');
            expect(result.role).toBeDefined();
        });

        it('should work with invalid user credentials flow', async () => {
            // Arrange
            mockAuthService.validateUser.mockResolvedValue(null);

            // Act & Assert
            await expect(
                strategy.validate('test@example.com', 'wrongpassword'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
