import {
    Controller,
    Post,
    Get,
    Delete,
    Patch,
    Body,
    Param,
    UseGuards,
    Request,
    UsePipes,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PasskeyService } from './passkey.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import {
    RegisterPasskeyBeginDto,
    RegisterPasskeyCompleteDto,
    LoginPasskeyBeginDto,
    LoginPasskeyCompleteDto,
    UpdatePasskeyDto,
    RefreshTokenDto,
} from './dto/passkey.dto';

@Controller('passkey')
export class PasskeyController {
    constructor(private readonly passkeyService: PasskeyService) { }

    /**
     * Registration Begin - Generate challenge
     * Requires authentication
     */
    @Post('register/begin')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ZodValidationPipe)
    async registerBegin(
        @Request() req,
        @Body() dto: RegisterPasskeyBeginDto,
    ) {
        return this.passkeyService.registerBegin(req.user.id, dto.deviceName);
    }

    /**
     * Registration Complete - Verify and store credential
     * Requires authentication
     */
    @Post('register/complete')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ZodValidationPipe)
    async registerComplete(
        @Request() req,
        @Body() dto: RegisterPasskeyCompleteDto,
    ) {
        return this.passkeyService.registerComplete(
            req.user.id,
            dto.credential,
            dto.deviceName,
        );
    }

    /**
     * Login Begin - Generate authentication challenge
     * Public endpoint with rate limiting
     */
    @Post('login/begin')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
    @UsePipes(ZodValidationPipe)
    async loginBegin(@Body() dto: LoginPasskeyBeginDto) {
        return this.passkeyService.loginBegin(dto.email);
    }

    /**
     * Login Complete - Verify and issue tokens
     * Public endpoint with rate limiting
     */
    @Post('login/complete')
    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
    @UsePipes(ZodValidationPipe)
    async loginComplete(@Body() dto: LoginPasskeyCompleteDto) {
        return this.passkeyService.loginComplete(dto.email, dto.credential);
    }

    /**
     * Get user's passkey credentials
     * Requires authentication
     */
    @Get('credentials')
    @UseGuards(JwtAuthGuard)
    async getCredentials(@Request() req) {
        return this.passkeyService.getCredentials(req.user.id);
    }

    /**
     * Remove a passkey credential
     * Requires authentication
     */
    @Delete('credentials/:id')
    @UseGuards(JwtAuthGuard)
    async removeCredential(@Request() req, @Param('id') credentialId: string) {
        return this.passkeyService.removeCredential(req.user.id, credentialId);
    }

    /**
     * Update passkey device name
     * Requires authentication
     */
    @Patch('credentials/:id')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ZodValidationPipe)
    async updateCredential(
        @Request() req,
        @Param('id') credentialId: string,
        @Body() dto: UpdatePasskeyDto,
    ) {
        return this.passkeyService.updateCredential(
            req.user.id,
            credentialId,
            dto.deviceName,
        );
    }

    /**
     * Refresh access token
     * Public endpoint
     */
    @Post('refresh')
    @Public()
    @UsePipes(ZodValidationPipe)
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.passkeyService.refreshAccessToken(dto.refreshToken);
    }

    /**
     * Logout - Revoke refresh token
     * Requires authentication
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ZodValidationPipe)
    async logout(@Body() dto: RefreshTokenDto) {
        return this.passkeyService.revokeRefreshToken(dto.refreshToken);
    }
}

