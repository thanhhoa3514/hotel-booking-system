import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

        if (!clientID || !clientSecret) {
            throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) must be configured');
        }
        super({
            clientID,
            clientSecret,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        const email = emails?.[0]?.value;
        if (!email) {
            return done(new Error('Email not provided by Google'));
        }
        const user = {
            providerId: id,
            email,
            fullName: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
            avatarUrl: photos?.[0]?.value,
            accessToken,
        };

        done(null, user);
    }
}
