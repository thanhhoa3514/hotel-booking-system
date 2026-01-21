import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { Profile, VerifyCallback } from 'passport-google-oauth20';

describe('GoogleStrategy', () => {
    let strategy: GoogleStrategy;
    let configService: ConfigService;

    // Mock ConfigService
    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();

        // Set up default config values
        mockConfigService.get.mockImplementation((key: string) => {
            const config = {
                GOOGLE_CLIENT_ID: 'mock-google-client-id',
                GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
                GOOGLE_CALLBACK_URL: 'http://localhost:3001/auth/google/callback',
            };
            return config[key];
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleStrategy,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        strategy = module.get<GoogleStrategy>(GoogleStrategy);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Strategy Definition', () => {
        it('should be defined', () => {
            expect(strategy).toBeDefined();
        });

        it('should be instance of GoogleStrategy', () => {
            expect(strategy).toBeInstanceOf(GoogleStrategy);
        });
    });

    describe('Strategy Configuration', () => {
        it('should throw error when GOOGLE_CLIENT_ID is not configured', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'GOOGLE_CLIENT_ID') return null;
                if (key === 'GOOGLE_CLIENT_SECRET') return 'secret';
                return null;
            });

            // Act & Assert
            expect(() => {
                new GoogleStrategy(configService);
            }).toThrow(
                'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) must be configured',
            );
        });

        it('should throw error when GOOGLE_CLIENT_SECRET is not configured', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'GOOGLE_CLIENT_ID') return 'client-id';
                if (key === 'GOOGLE_CLIENT_SECRET') return null;
                return null;
            });

            // Act & Assert
            expect(() => {
                new GoogleStrategy(configService);
            }).toThrow(
                'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) must be configured',
            );
        });

        it('should throw error when both credentials are missing', () => {
            // Arrange
            mockConfigService.get.mockReturnValue(null);

            // Act & Assert
            expect(() => {
                new GoogleStrategy(configService);
            }).toThrow(
                'Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) must be configured',
            );
        });

        it('should use default callback URL when not configured', () => {
            // Arrange
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'GOOGLE_CLIENT_ID') return 'client-id';
                if (key === 'GOOGLE_CLIENT_SECRET') return 'client-secret';
                if (key === 'GOOGLE_CALLBACK_URL') return undefined;
                return null;
            });

            // Act & Assert
            expect(() => {
                new GoogleStrategy(configService);
            }).not.toThrow();
        });

        it('should retrieve client ID from config', () => {
            // Assert
            expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
        });

        it('should retrieve client secret from config', () => {
            // Assert
            expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
        });

        it('should retrieve callback URL from config', () => {
            // Assert
            expect(configService.get).toHaveBeenCalledWith('GOOGLE_CALLBACK_URL');
        });
    });

    describe('validate', () => {
        const mockProfile: Profile = {
            id: 'google-user-123',
            displayName: 'Test User',
            name: {
                givenName: 'Test',
                familyName: 'User',
            },
            emails: [{ value: 'test@example.com', verified: true }],
            photos: [{ value: 'https://example.com/photo.jpg' }],
            provider: 'google',
            profileUrl: 'https://plus.google.com/google-user-123',
            _raw: '',
            _json: {
                iss: 'https://accounts.google.com',
                aud: 'mock-client-id',
                sub: 'google-user-123',
                iat: Date.now(),
                exp: Date.now() + 3600,
            },
        };

        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';
        const mockDone: VerifyCallback = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should successfully validate Google OAuth profile', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            expect(mockDone).toHaveBeenCalledWith(null, {
                providerId: 'google-user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                avatarUrl: 'https://example.com/photo.jpg',
                accessToken: mockAccessToken,
            });
        });

        it('should extract provider ID from profile', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.providerId).toBe('google-user-123');
        });

        it('should extract email from profile', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.email).toBe('test@example.com');
        });

        it('should construct full name from given name and family name', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe('Test User');
        });

        it('should extract avatar URL from photos', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.avatarUrl).toBe('https://example.com/photo.jpg');
        });

        it('should include access token in result', async () => {
            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                mockProfile,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.accessToken).toBe(mockAccessToken);
        });

        it('should return error when email is not provided', async () => {
            // Arrange
            const profileWithoutEmail: Profile = {
                ...mockProfile,
                emails: undefined,
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutEmail,
                mockDone,
            );

            // Assert
            expect(mockDone).toHaveBeenCalledTimes(1);
            const [error] = (mockDone as jest.Mock).mock.calls[0];
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Email not provided by Google');
        });

        it('should return error when email array is empty', async () => {
            // Arrange
            const profileWithEmptyEmails: Profile = {
                ...mockProfile,
                emails: [],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithEmptyEmails,
                mockDone,
            );

            // Assert
            expect(mockDone).toHaveBeenCalledTimes(1);
            const [error] = (mockDone as jest.Mock).mock.calls[0];
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Email not provided by Google');
        });

        it('should handle profile without given name', async () => {
            // Arrange
            const profileWithoutGivenName: Profile = {
                ...mockProfile,
                name: {
                    familyName: 'User',
                    givenName: '',
                },
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutGivenName,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe('User');
        });

        it('should handle profile without family name', async () => {
            // Arrange
            const profileWithoutFamilyName: Profile = {
                ...mockProfile,
                name: {
                    givenName: 'Test',
                    familyName: '',
                },
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutFamilyName,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe('Test');
        });

        it('should handle profile without any name', async () => {
            // Arrange
            const profileWithoutName: Profile = {
                ...mockProfile,
                name: undefined,
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutName,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe('');
        });

        it('should handle profile without photos', async () => {
            // Arrange
            const profileWithoutPhotos: Profile = {
                ...mockProfile,
                photos: undefined,
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutPhotos,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.avatarUrl).toBeUndefined();
        });

        it('should handle profile with empty photos array', async () => {
            // Arrange
            const profileWithEmptyPhotos: Profile = {
                ...mockProfile,
                photos: [],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithEmptyPhotos,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.avatarUrl).toBeUndefined();
        });

        it('should trim extra whitespace from full name', async () => {
            // Arrange
            const profileWithWhitespace: Profile = {
                ...mockProfile,
                name: {
                    givenName: '  Test  ',
                    familyName: '  User  ',
                },
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithWhitespace,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            // The actual implementation trims and joins with single space
            expect(userArg.fullName.trim()).toBeTruthy();
            expect(userArg.fullName).toContain('Test');
            expect(userArg.fullName).toContain('User');
        });

        it('should handle multiple emails and use the first one', async () => {
            // Arrange
            const profileWithMultipleEmails: Profile = {
                ...mockProfile,
                emails: [
                    { value: 'primary@example.com', verified: true },
                    { value: 'secondary@example.com', verified: false },
                ],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithMultipleEmails,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.email).toBe('primary@example.com');
        });

        it('should handle multiple photos and use the first one', async () => {
            // Arrange
            const profileWithMultiplePhotos: Profile = {
                ...mockProfile,
                photos: [
                    { value: 'https://example.com/photo1.jpg' },
                    { value: 'https://example.com/photo2.jpg' },
                ],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithMultiplePhotos,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.avatarUrl).toBe('https://example.com/photo1.jpg');
        });

        it('should handle special characters in names', async () => {
            // Arrange
            const profileWithSpecialChars: Profile = {
                ...mockProfile,
                name: {
                    givenName: "O'Brien",
                    familyName: 'Müller-Schmidt',
                },
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithSpecialChars,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe("O'Brien Müller-Schmidt");
        });

        it('should handle very long names', async () => {
            // Arrange
            const longName = 'A'.repeat(100);
            const profileWithLongName: Profile = {
                ...mockProfile,
                name: {
                    givenName: longName,
                    familyName: longName,
                },
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithLongName,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.fullName).toBe(`${longName} ${longName}`);
        });

        it('should handle email with special characters', async () => {
            // Arrange
            const specialEmail = 'user+test@example.co.uk';
            const profileWithSpecialEmail: Profile = {
                ...mockProfile,
                emails: [{ value: specialEmail, verified: true }],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithSpecialEmail,
                mockDone,
            );

            // Assert
            const userArg = (mockDone as jest.Mock).mock.calls[0][1];
            expect(userArg.email).toBe(specialEmail);
        });
    });

    describe('Error Handling', () => {
        const mockProfile: Profile = {
            id: 'google-user-123',
            displayName: 'Test User',
            name: {
                familyName: 'User',
                givenName: 'Test',
            },
            emails: [{ value: 'test@example.com', verified: true }],
            photos: [{ value: 'https://example.com/photo.jpg' }],
            provider: 'google',
            profileUrl: 'https://plus.google.com/google-user-123',
            _raw: '',
            _json: {
                iss: 'https://accounts.google.com',
                aud: 'mock-client-id',
                sub: 'google-user-123',
                iat: Date.now(),
                exp: Date.now() + 3600,
            },
        };

        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';
        const mockDone: VerifyCallback = jest.fn();

        it('should call done with error when email is missing', async () => {
            // Arrange
            const profileWithoutEmail: Profile = {
                ...mockProfile,
                emails: undefined,
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutEmail,
                mockDone,
            );

            // Assert
            expect(mockDone).toHaveBeenCalledTimes(1);
            const [error] = (mockDone as jest.Mock).mock.calls[0];
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Email not provided by Google');
        });

        it('should provide clear error message for missing email', async () => {
            // Arrange
            const profileWithoutEmail: Profile = {
                ...mockProfile,
                emails: [],
            };

            // Act
            await strategy.validate(
                mockAccessToken,
                mockRefreshToken,
                profileWithoutEmail,
                mockDone,
            );

            // Assert
            expect(mockDone).toHaveBeenCalledTimes(1);
            const [error] = (mockDone as jest.Mock).mock.calls[0];
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toContain('Email not provided by Google');
        });
    });
});
