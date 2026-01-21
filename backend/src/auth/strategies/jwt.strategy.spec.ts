import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let prismaService: PrismaService;

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

    const mockPayload: JwtPayload = {
        sub: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
    };

    // Mock PrismaService
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        // Set environment variable for testing
        process.env.JWT_SECRET = 'test-secret';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.JWT_SECRET;
    });

    describe('Strategy Definition', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should be instance of JwtStrategy', () => {
            expect(strategy).toBeInstanceOf(JwtStrategy);
        });
    });

    describe('validate', () => {
        it('should return user without password when user exists and is active', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(mockUser.id);
            expect(result.email).toBe(mockUser.email);
            expect(result.role).toBeDefined();
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockPayload.sub },
                include: { role: true },
            });
        });

        it('should exclude password from returned user object', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            expect(result).not.toHaveProperty('password');
            expect(Object.keys(result)).not.toContain('password');
        });

        it('should throw UnauthorizedException when user does not exist', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                'User không tồn tại hoặc đã bị vô hiệu hóa',
            );
        });

        it('should throw UnauthorizedException when user is inactive', async () => {
            // Arrange
            const inactiveUser = {
                ...mockUser,
                status: 'INACTIVE' as const,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                'User không tồn tại hoặc đã bị vô hiệu hóa',
            );
        });

        it('should throw UnauthorizedException when user is suspended', async () => {
            // Arrange
            const suspendedUser = {
                ...mockUser,
                status: 'SUSPENDED' as const,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(suspendedUser);

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should use user id from JWT payload sub field', async () => {
            // Arrange
            const payload: JwtPayload = {
                sub: 'custom-user-id',
                email: 'custom@example.com',
                roleId: 'role-2',
            };
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                id: 'custom-user-id',
            });

            // Act
            await strategy.validate(payload);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'custom-user-id' },
                include: { role: true },
            });
        });

        it('should include role in returned user object', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            expect(result.role).toBeDefined();
            expect(result.role.id).toBe(mockUser.role.id);
            expect(result.role.name).toBe(mockUser.role.name);
        });

        it('should handle user without optional fields', async () => {
            // Arrange
            const userWithoutOptionalFields = {
                ...mockUser,
                phone: null,
                avatarUrl: null,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(
                userWithoutOptionalFields,
            );

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            expect(result).toBeDefined();
            expect(result.phone).toBeNull();
            expect(result.avatarUrl).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockRejectedValue(
                new Error('Database connection failed'),
            );

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                'Database connection failed',
            );
        });

        it('should validate with different user statuses', async () => {
            // Arrange
            const activeUser = {
                ...mockUser,
                status: 'ACTIVE' as const,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(activeUser);

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            expect(result).toBeDefined();
            expect(result.status).toBe('ACTIVE');
        });
    });

    describe('JWT Payload Structure', () => {
        it('should accept valid JWT payload with all required fields', async () => {
            // Arrange
            const validPayload: JwtPayload = {
                sub: 'user-123',
                email: 'user@example.com',
                roleId: 'role-456',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await strategy.validate(validPayload);

            // Assert
            expect(result).toBeDefined();
        });

        it('should handle payload with user id in sub field', async () => {
            // Arrange
            const payload: JwtPayload = {
                sub: 'unique-user-id',
                email: 'test@example.com',
                roleId: 'role-id',
            };
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                id: 'unique-user-id',
            });

            // Act
            await strategy.validate(payload);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'unique-user-id' },
                }),
            );
        });
    });

    describe('Integration with Prisma', () => {
        it('should query user with role relation included', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            await strategy.validate(mockPayload);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockPayload.sub },
                include: { role: true },
            });
        });

        it('should call findUnique only once per validation', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            await strategy.validate(mockPayload);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
        });

        it('should handle null response from Prisma', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should handle Prisma connection errors', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockRejectedValue(
                new Error('Prisma connection error'),
            );

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                'Prisma connection error',
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle user with very long id', async () => {
            // Arrange
            const longId = 'a'.repeat(100);
            const payload: JwtPayload = {
                sub: longId,
                email: 'test@example.com',
                roleId: 'role-1',
            };
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                id: longId,
            });

            // Act
            const result = await strategy.validate(payload);

            // Assert
            expect(result).toBeDefined();
            expect(result.id).toBe(longId);
        });

        it('should handle user with special characters in email', async () => {
            // Arrange
            const specialEmail = 'user+test@example.com';
            const payload: JwtPayload = {
                sub: 'user-1',
                email: specialEmail,
                roleId: 'role-1',
            };
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                email: specialEmail,
            });

            // Act
            const result = await strategy.validate(payload);

            // Assert
            expect(result).toBeDefined();
            expect(result.email).toBe(specialEmail);
        });

        it('should handle concurrent validation requests', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const promises = [
                strategy.validate(mockPayload),
                strategy.validate(mockPayload),
                strategy.validate(mockPayload),
            ];
            const results = await Promise.all(promises);

            // Assert
            expect(results).toHaveLength(3);
            results.forEach((result) => {
                expect(result).toBeDefined();
            });
            expect(prismaService.user.findUnique).toHaveBeenCalledTimes(3);
        });
    });

    describe('Security', () => {
        it('should always exclude password from response', async () => {
            // Arrange
            const userWithSensitiveData = {
                ...mockUser,
                password: 'very-secret-password-hash',
            };
            mockPrismaService.user.findUnique.mockResolvedValue(
                userWithSensitiveData,
            );

            // Act
            const result = await strategy.validate(mockPayload);

            // Assert
            const resultKeys = Object.keys(result);
            expect(resultKeys).not.toContain('password');
        });

        it('should validate user status is exactly ACTIVE', async () => {
            // Arrange
            const userWithDifferentStatus = {
                ...mockUser,
                status: 'PENDING' as const,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(
                userWithDifferentStatus,
            );

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should not validate deleted users', async () => {
            // Arrange
            const deletedUser = {
                ...mockUser,
                status: 'DELETED' as const,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(deletedUser);

            // Act & Assert
            await expect(strategy.validate(mockPayload)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
