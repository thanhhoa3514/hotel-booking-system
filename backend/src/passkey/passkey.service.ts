import {
    Injectable,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
    AuthenticatorTransport,
} from '@simplewebauthn/server';
import * as crypto from 'crypto';

@Injectable()
export class PasskeyService {
    private rpID: string;
    private rpName: string;
    private origin: string;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.rpID = this.configService.get('RP_ID') || 'localhost';
        this.rpName =
            this.configService.get('RP_NAME') || 'Hotel Management System';
        this.origin =
            this.configService.get('RP_ORIGIN') || 'http://localhost:3000';
    }

    /**
     * Registration Begin - Generate challenge and options
     */
    async registerBegin(userId: string, deviceName?: string) {
        // Get user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        // Get existing credentials for this user
        const existingCredentials = await this.prisma.passkeyCredential.findMany({
            where: { userId: user.id, isActive: true },
        });

        // Generate registration options
        const options = await generateRegistrationOptions({
            rpName: this.rpName,
            rpID: this.rpID,
            userID: Buffer.from(user.id),
            userName: user.email,
            userDisplayName: user.fullName,
            attestationType: 'none',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                residentKey: 'discouraged',
                userVerification: 'required',
            },
            excludeCredentials: existingCredentials.map((cred) => ({
                id: cred.credentialId,
                transports: cred.transports as AuthenticatorTransport[],
            })),
            supportedAlgorithmIDs: [-7, -257], // ES256, RS256
        });

        // Store challenge in database
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.prisma.authChallenge.create({
            data: {
                challenge: options.challenge,
                userId: user.id,
                type: 'registration',
                username: user.email,
                displayName: user.fullName,
                expiresAt,
                used: false,
            },
        });

        return options;
    }

    /**
     * Registration Complete - Verify attestation and store credential
     */
    async registerComplete(
        userId: string,
        credential: RegistrationResponseJSON,
        deviceName?: string,
    ) {
        // Find the most recent unused registration challenge
        const challenge = await this.prisma.authChallenge.findFirst({
            where: {
                userId,
                type: 'registration',
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!challenge) {
            throw new BadRequestException(
                'Không tìm thấy challenge hoặc đã hết hạn. Vui lòng thử lại.',
            );
        }

        try {
            // Verify registration response
            const verification = await verifyRegistrationResponse({
                response: credential,
                expectedChallenge: challenge.challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                requireUserVerification: true,
            });

            if (!verification.verified || !verification.registrationInfo) {
                throw new BadRequestException('Xác thực passkey không thành công');
            }

            const { credential: verifiedCredential, credentialDeviceType, credentialBackedUp } =
                verification.registrationInfo;

            // Check if credential already exists
            const existingCredential = await this.prisma.passkeyCredential.findUnique(
                {
                    where: {
                        credentialId: verifiedCredential.id,
                    },
                },
            );

            if (existingCredential) {
                throw new ConflictException('Passkey này đã được đăng ký');
            }

            // Store credential
            const passkeyCredential = await this.prisma.passkeyCredential.create({
                data: {
                    userId,
                    credentialId: verifiedCredential.id,
                    publicKey: Buffer.from(verifiedCredential.publicKey),
                    signCount: verifiedCredential.counter,
                    deviceName: deviceName || 'Thiết bị không xác định',
                    aaguid: verifiedCredential.id.substring(0, 36), // Use first part of ID as aaguid
                    transports: verifiedCredential.transports || [],
                    isActive: true,
                },
            });

            // Mark challenge as used
            await this.prisma.authChallenge.updateMany({
                where: { id: challenge.id },
                data: { used: true },
            });

            return {
                success: true,
                credentialId: passkeyCredential.id,
                message: 'Đăng ký passkey thành công',
            };
        } catch (error) {
            throw new BadRequestException(
                `Xác thực thất bại: ${error.message || 'Lỗi không xác định'}`,
            );
        }
    }

    /**
     * Login Begin - Generate authentication challenge
     */
    async loginBegin(email: string) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                passkeyCredentials: {
                    where: { isActive: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        if (user.passkeyCredentials.length === 0) {
            throw new BadRequestException(
                'Người dùng chưa đăng ký passkey nào',
            );
        }

        // Generate authentication options
        const options = await generateAuthenticationOptions({
            rpID: this.rpID,
            allowCredentials: user.passkeyCredentials.map((cred) => ({
                id: cred.credentialId,
                transports: cred.transports as AuthenticatorTransport[],
            })),
            userVerification: 'required',
            timeout: 60000,
        });

        // Store challenge
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.prisma.authChallenge.create({
            data: {
                challenge: options.challenge,
                userId: user.id,
                type: 'authentication',
                expiresAt,
                used: false,
            },
        });

        return options;
    }

    /**
     * Login Complete - Verify signature and issue tokens
     */
    async loginComplete(
        email: string,
        credential: AuthenticationResponseJSON,
    ) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
                passkeyCredentials: {
                    where: { isActive: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        // Find challenge
        const challenge = await this.prisma.authChallenge.findFirst({
            where: {
                userId: user.id,
                type: 'authentication',
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!challenge) {
            throw new BadRequestException('Challenge không hợp lệ hoặc đã hết hạn');
        }

        // Find the credential
        const passkeyCredential = user.passkeyCredentials.find(
            (c) => c.credentialId === credential.id,
        );

        if (!passkeyCredential) {
            throw new UnauthorizedException('Passkey không hợp lệ');
        }

        try {
            // Verify authentication response
            const verification = await verifyAuthenticationResponse({
                response: credential,
                expectedChallenge: challenge.challenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                credential: {
                    id: passkeyCredential.credentialId,
                    publicKey: new Uint8Array(passkeyCredential.publicKey),
                    counter: passkeyCredential.signCount,
                    transports: passkeyCredential.transports as AuthenticatorTransport[],
                },
                requireUserVerification: true,
            });

            if (!verification.verified) {
                throw new UnauthorizedException('Xác thực passkey thất bại');
            }

            // Check sign count (detect cloning)
            const newSignCount = verification.authenticationInfo.newCounter;
            if (newSignCount <= passkeyCredential.signCount) {
                // Potential credential cloning detected
                await this.prisma.passkeyCredential.update({
                    where: { id: passkeyCredential.id },
                    data: { isActive: false },
                });
                throw new UnauthorizedException(
                    'Phát hiện passkey bị sao chép. Passkey đã bị vô hiệu hóa.',
                );
            }

            // Update sign count and last used
            await this.prisma.passkeyCredential.update({
                where: { id: passkeyCredential.id },
                data: {
                    signCount: newSignCount,
                    lastUsedAt: new Date(),
                },
            });

            // Mark challenge as used
            await this.prisma.authChallenge.update({
                where: { id: challenge.id },
                data: { used: true },
            });

            // Update user last login
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });

            // Generate tokens
            const tokens = await this.generateTokens(user.id, user.email, user.roleId);

            return {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                token_type: 'Bearer',
                expires_in: 900, // 15 minutes
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                },
            };
        } catch (error) {
            throw new UnauthorizedException(
                `Xác thực thất bại: ${error.message || 'Lỗi không xác định'}`,
            );
        }
    }

    /**
     * Get user's passkey credentials
     */
    async getCredentials(userId: string) {
        const credentials = await this.prisma.passkeyCredential.findMany({
            where: { userId, isActive: true },
            select: {
                id: true,
                deviceName: true,
                createdAt: true,
                lastUsedAt: true,
                transports: true,
            },
            orderBy: { lastUsedAt: 'desc' },
        });

        return credentials;
    }

    /**
     * Remove a passkey credential
     */
    async removeCredential(userId: string, credentialId: string) {
        const credential = await this.prisma.passkeyCredential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Không tìm thấy passkey');
        }

        if (credential.userId !== userId) {
            throw new UnauthorizedException('Bạn không có quyền xóa passkey này');
        }

        // Check if this is the last authentication method
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                passkeyCredentials: {
                    where: { isActive: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        if (!user.password && user.passkeyCredentials.length === 1) {
            throw new BadRequestException(
                'Không thể xóa phương thức xác thực cuối cùng',
            );
        }

        await this.prisma.passkeyCredential.update({
            where: { id: credentialId },
            data: { isActive: false },
        });

        return { success: true, message: 'Đã xóa passkey' };
    }

    /**
     * Update passkey device name
     */
    async updateCredential(
        userId: string,
        credentialId: string,
        deviceName: string,
    ) {
        const credential = await this.prisma.passkeyCredential.findUnique({
            where: { id: credentialId },
        });

        if (!credential) {
            throw new NotFoundException('Không tìm thấy passkey');
        }

        if (credential.userId !== userId) {
            throw new UnauthorizedException(
                'Bạn không có quyền cập nhật passkey này',
            );
        }

        await this.prisma.passkeyCredential.update({
            where: { id: credentialId },
            data: { deviceName },
        });

        return { success: true, message: 'Đã cập nhật tên thiết bị' };
    }

    /**
     * Generate access and refresh tokens
     */
    private async generateTokens(userId: string, email: string, roleId: string) {
        const accessToken = this.jwtService.sign(
            { sub: userId, email, roleId },
            { expiresIn: '15m' },
        );

        const refreshToken = this.jwtService.sign(
            { sub: userId, type: 'refresh' },
            {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            },
        );

        // Hash and store refresh token
        const tokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Token không hợp lệ');
            }

            // Check if token exists and is not revoked
            const tokenHash = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');

            const storedToken = await this.prisma.refreshToken.findUnique({
                where: { tokenHash },
            });

            if (!storedToken || storedToken.revoked) {
                throw new UnauthorizedException('Token đã bị thu hồi');
            }

            if (storedToken.expiresAt < new Date()) {
                throw new UnauthorizedException('Token đã hết hạn');
            }

            // Get user
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user) {
                throw new UnauthorizedException('Người dùng không tồn tại');
            }

            // Revoke old refresh token
            await this.prisma.refreshToken.update({
                where: { tokenHash },
                data: { revoked: true, revokedAt: new Date() },
            });

            // Generate new tokens
            const tokens = await this.generateTokens(
                user.id,
                user.email,
                user.roleId,
            );

            return {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                token_type: 'Bearer',
                expires_in: 900,
            };
        } catch (error) {
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    /**
     * Revoke refresh token (logout)
     */
    async revokeRefreshToken(refreshToken: string) {
        const tokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { revoked: true, revokedAt: new Date() },
        });

        return { success: true, message: 'Đã đăng xuất' };
    }

    /**
     * Cleanup expired challenges (scheduled job)
     */
    async cleanupExpiredChallenges() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const result = await this.prisma.authChallenge.deleteMany({
            where: {
                createdAt: { lt: oneHourAgo },
            },
        });

        return { deleted: result.count };
    }
}

