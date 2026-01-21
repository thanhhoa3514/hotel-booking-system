import { SetMetadata } from '@nestjs/common';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
    SetMetadata: jest.fn((key: string, value: boolean) => {
        return () => ({ key, value });
    }),
}));

describe('Public Decorator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Decorator Definition', () => {
        it('should be defined', () => {
            expect(Public).toBeDefined();
        });

        it('should be a function', () => {
            expect(typeof Public).toBe('function');
        });

        it('should export IS_PUBLIC_KEY constant', () => {
            expect(IS_PUBLIC_KEY).toBeDefined();
            expect(IS_PUBLIC_KEY).toBe('isPublic');
        });
    });

    describe('SetMetadata Integration', () => {
        it('should call SetMetadata with correct key', () => {
            // Act
            Public();

            // Assert
            expect(SetMetadata).toHaveBeenCalledWith('isPublic', true);
        });

        it('should call SetMetadata with true value', () => {
            // Act
            Public();

            // Assert
            expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
        });

        it('should return a decorator function', () => {
            // Act
            const decorator = Public();

            // Assert
            expect(decorator).toBeDefined();
            expect(typeof decorator).toBe('function');
        });

        it('should always set metadata value to true', () => {
            // Act
            Public();

            // Assert
            const [[, value]] = (SetMetadata as jest.Mock).mock.calls;
            expect(value).toBe(true);
        });
    });

    describe('Constant Values', () => {
        it('should have IS_PUBLIC_KEY as "isPublic"', () => {
            expect(IS_PUBLIC_KEY).toBe('isPublic');
        });

        it('should be string type', () => {
            expect(typeof IS_PUBLIC_KEY).toBe('string');
        });

        it('should not be empty string', () => {
            expect(IS_PUBLIC_KEY.length).toBeGreaterThan(0);
        });
    });

    describe('Usage', () => {
        it('should be usable as a method decorator', () => {
            // This test verifies the decorator can be applied
            // In actual use: @Public() someMethod() {}
            const decorator = Public();
            expect(decorator).toBeDefined();
        });

        it('should be callable without parameters', () => {
            // Act & Assert
            expect(() => Public()).not.toThrow();
        });

        it('should create new decorator instance on each call', () => {
            // Act
            const decorator1 = Public();
            const decorator2 = Public();

            // Assert
            expect(SetMetadata).toHaveBeenCalledTimes(2);
        });
    });

    describe('Metadata Key Consistency', () => {
        it('should use the same key as exported constant', () => {
            // Act
            Public();

            // Assert
            const [[key]] = (SetMetadata as jest.Mock).mock.calls;
            expect(key).toBe(IS_PUBLIC_KEY);
        });

        it('should maintain key consistency across multiple calls', () => {
            // Act
            Public();
            Public();
            Public();

            // Assert
            const calls = (SetMetadata as jest.Mock).mock.calls;
            calls.forEach(([key]) => {
                expect(key).toBe('isPublic');
            });
        });
    });
});
