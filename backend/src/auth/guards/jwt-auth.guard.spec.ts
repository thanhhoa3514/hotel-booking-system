import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Observable } from 'rxjs';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let reflector: Reflector;

    const mockReflector = {
        getAllAndOverride: jest.fn(),
    };

    beforeEach(() => {
        reflector = mockReflector as unknown as Reflector;
        guard = new JwtAuthGuard(reflector);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Guard Definition', () => {
        it('should be defined', () => {
            expect(guard).toBeDefined();
        });

        it('should extend AuthGuard', () => {
            expect(guard).toBeInstanceOf(JwtAuthGuard);
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
                        headers: {
                            authorization: 'Bearer mock-token',
                        },
                    }),
                }),
            } as unknown as ExecutionContext;
        });

        it('should allow access to public routes', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockExecutionContext.getHandler(),
                mockExecutionContext.getClass(),
            ]);
        });

        it('should call super.canActivate for protected routes', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(false);
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeDefined();
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockExecutionContext.getHandler(),
                mockExecutionContext.getClass(),
            ]);

            superCanActivateSpy.mockRestore();
        });

        it('should check both handler and class for public metadata', () => {
            // Arrange
            const mockHandler = jest.fn();
            const mockClass = jest.fn();
            mockExecutionContext.getHandler = jest.fn().mockReturnValue(mockHandler);
            mockExecutionContext.getClass = jest.fn().mockReturnValue(mockClass);
            mockReflector.getAllAndOverride.mockReturnValue(true);

            // Act
            guard.canActivate(mockExecutionContext);

            // Assert
            expect(mockExecutionContext.getHandler).toHaveBeenCalled();
            expect(mockExecutionContext.getClass).toHaveBeenCalled();
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockHandler,
                mockClass,
            ]);
        });

        it('should return true immediately for public routes without calling super', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(true);
            const superCanActivateSpy = jest.spyOn(
                Object.getPrototypeOf(JwtAuthGuard.prototype),
                'canActivate',
            );

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(superCanActivateSpy).not.toHaveBeenCalled();

            superCanActivateSpy.mockRestore();
        });

        it('should handle undefined public metadata', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(undefined);
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeDefined();

            superCanActivateSpy.mockRestore();
        });

        it('should handle false public metadata', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(false);
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeDefined();

            superCanActivateSpy.mockRestore();
        });

        it('should return boolean from super.canActivate', () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(false);
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(false);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(false);

            superCanActivateSpy.mockRestore();
        });

        it('should return Promise from super.canActivate', async () => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(false);
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(Promise.resolve(true));

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeInstanceOf(Promise);
            await expect(result).resolves.toBe(true);

            superCanActivateSpy.mockRestore();
        });

        it('should return Observable from super.canActivate', (done) => {
            // Arrange
            mockReflector.getAllAndOverride.mockReturnValue(false);
            const mockObservable = new Observable<boolean>((subscriber) => {
                subscriber.next(true);
                subscriber.complete();
            });
            const superCanActivateSpy = jest
                .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
                .mockReturnValue(mockObservable);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBeInstanceOf(Observable);
            if (result instanceof Observable) {
                result.subscribe({
                    next: (value) => {
                        expect(value).toBe(true);
                        superCanActivateSpy.mockRestore();
                        done();
                    },
                });
            }
        });
    });

    describe('Integration with Reflector', () => {
        it('should correctly identify routes marked with @Public decorator', () => {
            // Arrange
            const mockExecutionContext = {
                getHandler: jest.fn().mockReturnValue({}),
                getClass: jest.fn().mockReturnValue({}),
            } as unknown as ExecutionContext;
            mockReflector.getAllAndOverride.mockReturnValue(true);

            // Act
            const result = guard.canActivate(mockExecutionContext);

            // Assert
            expect(result).toBe(true);
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
                'isPublic',
                expect.any(Array),
            );
        });

        it('should use getAllAndOverride to check metadata priority', () => {
            // Arrange
            const mockHandler = jest.fn();
            const mockClass = jest.fn();
            const mockExecutionContext = {
                getHandler: jest.fn().mockReturnValue(mockHandler),
                getClass: jest.fn().mockReturnValue(mockClass),
            } as unknown as ExecutionContext;
            mockReflector.getAllAndOverride.mockReturnValue(true);

            // Act
            guard.canActivate(mockExecutionContext);

            // Assert
            expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
                mockHandler,
                mockClass,
            ]);
        });
    });
});
