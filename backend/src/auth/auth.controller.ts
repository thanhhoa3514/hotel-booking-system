import { Controller, Get, Headers, Req } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('profile')
  getProfile(
    @Headers('user-agent') userAgent: string, // 1. Lấy User Agent
    @Headers('authorization') token: string, // 2. Lấy Token
    @Req() req: Request, // 3. Lấy IP
  ) {
    // const ip = req.ip || req.headers['x-forwarded-for'];
    // console.log({ userAgent, token, ip });
    // Logic check Redis ở đây...
  }
}
