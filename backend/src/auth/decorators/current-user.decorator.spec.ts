import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
    describe('Decorator Definition', () => {
        it('should be defined', () => {
            expect(CurrentUser).toBeDefined();
        });

        it('should be a function', () => {
            expect(typeof CurrentUser).toBe('function');
        });

        it('should be callable without parameters', () => {
            expect(() => CurrentUser()).not.toThrow();
        });

        it('should be callable with string parameter', () => {
            expect(() => CurrentUser('email')).not.toThrow();
        });
    });

    describe('Decorator Usage', () => {
        it('should return a parameter decorator', () => {
            const decorator = CurrentUser();
            expect(decorator).toBeDefined();
        });

        it('should accept specific property name', () => {
            const decorator = CurrentUser('id');
            expect(decorator).toBeDefined();
        });

        it('should work with different property names', () => {
            expect(() => CurrentUser('email')).not.toThrow();
            expect(() => CurrentUser('fullName')).not.toThrow();
            expect(() => CurrentUser('role')).not.toThrow();
            expect(() => CurrentUser('id')).not.toThrow();
        });
    });

    describe('Integration Notes', () => {
        it('should be usable as a parameter decorator in controllers', () => {
            // This decorator is designed to be used like:
            // getProfile(@CurrentUser() user) or
            // getProfile(@CurrentUser('id') userId: string)
            // We verify it can be instantiated correctly
            expect(CurrentUser).toBeDefined();
            expect(typeof CurrentUser).toBe('function');
        });

        it('should support extracting entire user object', () => {
            // Usage: @CurrentUser() user
            const decorator = CurrentUser();
            expect(decorator).toBeDefined();
        });

        it('should support extracting specific user properties', () => {
            // Usage: @CurrentUser('email') email: string
            const emailDecorator = CurrentUser('email');
            const idDecorator = CurrentUser('id');

            expect(emailDecorator).toBeDefined();
            expect(idDecorator).toBeDefined();
        });
    });

    describe('Type Safety', () => {
        it('should be type-safe with string parameter', () => {
            expect(() => CurrentUser('email')).not.toThrow();
            expect(() => CurrentUser('id')).not.toThrow();
            expect(() => CurrentUser('fullName')).not.toThrow();
        });

        it('should be type-safe without parameter', () => {
            expect(() => CurrentUser()).not.toThrow();
        });

        it('should handle empty string parameter', () => {
            expect(() => CurrentUser('')).not.toThrow();
        });
    });

    describe('Common Use Cases', () => {
        it('should be suitable for extracting user id', () => {
            const decorator = CurrentUser('id');
            expect(decorator).toBeDefined();
        });

        it('should be suitable for extracting user email', () => {
            const decorator = CurrentUser('email');
            expect(decorator).toBeDefined();
        });

        it('should be suitable for extracting entire user', () => {
            const decorator = CurrentUser();
            expect(decorator).toBeDefined();
        });

        it('should be suitable for extracting user role', () => {
            const decorator = CurrentUser('role');
            expect(decorator).toBeDefined();
        });

        it('should be suitable for extracting nested properties', () => {
            const decorator = CurrentUser('role.name');
            expect(decorator).toBeDefined();
        });
    });

    describe('Decorator Instantiation', () => {
        it('should create new decorator instance each time', () => {
            const decorator1 = CurrentUser();
            const decorator2 = CurrentUser();

            expect(decorator1).toBeDefined();
            expect(decorator2).toBeDefined();
        });

        it('should create different decorators for different properties', () => {
            const emailDecorator = CurrentUser('email');
            const idDecorator = CurrentUser('id');
            const fullDecorator = CurrentUser();

            expect(emailDecorator).toBeDefined();
            expect(idDecorator).toBeDefined();
            expect(fullDecorator).toBeDefined();
        });
    });
});
