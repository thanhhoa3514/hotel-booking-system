import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;
    let prismaService: PrismaService;

    // Mock data
    const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        roleId: 'role-1',
        status: 'ACTIVE' as const,
        role: {
            id: 'role-1',
            name: 'GUEST',
            description: 'Guest role',
        },
    };

    const mockAdminUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        fullName: 'Admin User',
        roleId: 'role-admin',
        status: 'ACTIVE' as const,
        role: {
            id: 'role-admin',
            name: 'ADMIN',
            description: 'Admin role',
        },
    };

    // Mock services
    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(() => {
        reflector = mockReflector as unknown as Reflector;
        prismaService = mockPrismaService as unknown as PrismaService;
        guard = new RolesGuard(reflector, prismaService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Guard Definition', () => {
        it('should be defined', () => {
            expect(guard).toBeDefined();
        });

        it('should implement CanActivate', () => {
            expect(guard.canActivate).toBeDefined();
            expect(typeof guard.canActivate).toBe('function');
        });
    });

    describe('canActivate', () => {
        let mockExecutionContext: ExecutionContext;

        beforeEach(() => {
            mockExecutionContext = {
                getHandler: jest.fn(),
                getClass: jest.fn(),
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: mockUser,
                    }),
                }),
            } as unknown as ExecutionContext;
        });

        it('should allow access when no roles are required', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(undefined);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
                mockExecutionContext.getHandler(),
                mockExecutionContext.getClass(),
            ]);
            expect(prismaService.user.findUnique).not.toHaveBeenCalled();
        });

        it('should check user role when empty roles array is provided', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue([]);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            // Empty array means no role matches (some returns false for empty array)
            expect(result).toBe(false);
            expect(prismaService.user.findUnique).toHaveBeenCalled();
        });

        it('should deny access when user is not authenticated', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: null,
                }),
            });

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);
            expect(prismaService.user.findUnique).not.toHaveBeenCalled();
        });

        it('should deny access when user is undefined', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({}),
            });

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);
        });

        it('should allow access when user has required role', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockExecutionContext.switchToHttp = jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: mockAdminUser,
                }),
            });
            mockPrismaService.user.findUnique.mockResolvedValue(mockAdminUser);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockAdminUser.id },
                include: { role: true },
            });
        });

        it('should deny access when user does not have required role', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                include: { role: true },
            });
        });

        it('should allow access when user has one of multiple required roles', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'GUEST', 'MANAGER']);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(prismaService.user.findUnique).toHaveBeenCalled();
        });

        it('should deny access when user not found in database', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);
            expect(prismaService.user.findUnique).toHaveBeenCalled();
        });

        it('should deny access when user has no role assigned', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            const userWithoutRole = {
                ...mockUser,
                role: null,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(userWithoutRole);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);
        });

        it('should check roles from both handler and class metadata', async () => {
            // Arrange
            const mockHandler = jest.fn();
            const mockClass = jest.fn();
            mockExecutionContext.getHandler = jest.fn().mockReturnValue(mockHandler);
            mockExecutionContext.getClass = jest.fn().mockReturnValue(mockClass);
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockPrismaService.user.findUnique.mockResolvedValue(mockAdminUser);

            // Act
            await guard.canActivate(mockExecutionContext);

            // Assert
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
                mockHandler,
                mockClass,
            ]);
        });

        it('should fetch user with role from database', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['GUEST']);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Act
            await guard.canActivate(mockExecutionContext);

            // Assert
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                include: { role: true },
            });
        });

        it('should use case-sensitive role comparison', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['guest']); // lowercase
            const userWithGuestRole = {
                ...mockUser,
                role: {
                    ...mockUser.role,
                    name: 'GUEST', // uppercase
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(userWithGuestRole);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false); // Should not match due to case sensitivity
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            mockPrismaService.user.findUnique.mockRejectedValue(
                new Error('Database error'),
            );

            // Act & Assert
            await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
                'Database error',
            );
        });

        it('should work with single required role', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['MANAGER']);
            const managerUser = {
                ...mockUser,
                role: {
                    id: 'role-manager',
                    name: 'MANAGER',
                    description: 'Manager role',
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(managerUser);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should handle user with complex role object', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
            const userWithComplexRole = {
                ...mockAdminUser,
                role: {
                    id: 'role-admin',
                    name: 'ADMIN',
                    description: 'Admin role',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    permissions: [],
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(userWithComplexRole);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        let mockExecutionContext: ExecutionContext;

        beforeEach(() => {
            mockExecutionContext = {
                getHandler: jest.fn(),
                getClass: jest.fn(),
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        user: mockUser,
                    }),
                }),
            } as unknown as ExecutionContext;
        });

        it('should handle null required roles', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(null);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should handle very long role names', async () => {
            // Arrange
            const longRoleName = 'A'.repeat(100);
            mockReflector.getAllAndOverride.mockReturnValue([longRoleName]);
            const userWithLongRole = {
                ...mockUser,
                role: {
                    ...mockUser.role,
                    name: longRoleName,
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(userWithLongRole);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });

        it('should handle special characters in role names', async () => {
            // Arrange
            const specialRole = 'ROLE_WITH-SPECIAL.CHARS_123';
            mockReflector.getAllAndOverride.mockReturnValue([specialRole]);
            const userWithSpecialRole = {
                ...mockUser,
                role: {
                    ...mockUser.role,
                    name: specialRole,
                },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(userWithSpecialRole);

            // Act
            const result = await guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
        });
    });
});
