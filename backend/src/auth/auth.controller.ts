import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  UsePipes,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  @Public()
  @Post('register')
  @UsePipes(ZodValidationPipe)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UsePipes(ZodValidationPipe)
  async login(@Request() req, @Body() LoginDto: LoginDto) {
    // LocalAuthGuard validates user, so req.user is available
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  // ============== Google OAuth ==============

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Res() res: Response) {
    // req.user contains the validated OAuth data from GoogleStrategy
    const result = await this.authService.validateOAuthLogin({
      provider: 'GOOGLE',
      providerId: req.user.providerId,
      email: req.user.email,
      fullName: req.user.fullName,
      avatarUrl: req.user.avatarUrl,
    });

    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback#token=${result.access_token}`);
  }
}
