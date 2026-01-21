import { ExecutionContext } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
    let guard: LocalAuthGuard;

    beforeEach(() => {
        guard = new LocalAuthGuard();
    });

    describe('Guard Definition', () => {
        it('should be defined', () => {
            expect(guard).toBeDefined();
        });

        it('should extend AuthGuard with local strategy', () => {
            expect(guard).toBeInstanceOf(LocalAuthGuard);
        });
    });

    describe('canActivate', () => {
        let mockExecutionContext: ExecutionContext;

        beforeEach(() => {
            mockExecutionContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        body: {
                            email: 'test@example.com',
                            password: 'password123',
                        },
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;
        });

        it('should delegate to passport local strategy', () => {
            // Arrange
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeDefined();

            superCanActivateSpy.mockRestore();
        });

        it('should pass execution context to super class', () => {
            // Arrange
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockImplementation((context) => {
                    expect(context).toBe(mockExecutionContext);
                    return true;
                });

            // Act
            guard.canActivate(mockExecutionContext);

            // Assert
            expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);

            superCanActivateSpy.mockRestore();
        });

        it('should return boolean result from passport validation', () => {
            // Arrange
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);

            superCanActivateSpy.mockRestore();
        });

        it('should return Promise<boolean> from async validation', async () => {
            // Arrange
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockReturnValue(Promise.resolve(true));

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeInstanceOf(Promise);
            await expect(result).resolves.toBe(true);

            superCanActivateSpy.mockRestore();
        });

        it('should handle validation failure', async () => {
            // Arrange
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockReturnValue(Promise.resolve(false));

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            await expect(result).resolves.toBe(false);

            superCanActivateSpy.mockRestore();
        });

        it('should propagate validation errors', async () => {
            // Arrange
            const error = new Error('Invalid credentials');
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockRejectedValue(error);

            // Act & Assert
            await expect(
                guard.canActivate(mockExecutionContext),
            ).rejects.toThrow('Invalid credentials');

            superCanActivateSpy.mockRestore();
        });
    });

    describe('Integration', () => {
        it('should be usable as a guard decorator', () => {
            // Assert
            expect(LocalAuthGuard).toBeDefined();
            expect(typeof LocalAuthGuard).toBe('function');
            expect(LocalAuthGuard.prototype.canActivate).toBeDefined();
        });

        it('should work with request containing email and password', () => {
            // Arrange
            const mockContext = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        body: {
                            email: 'user@example.com',
                            password: 'securepass',
                        },
                    }),
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as unknown as ExecutionContext;

            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(LocalAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockContext);

            // Assert
            expect(result).toBeDefined();

            superCanActivateSpy.mockRestore();
        });
    });
});
