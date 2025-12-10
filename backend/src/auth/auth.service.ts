import { Injectable } from '@nestjs/common';
// import { uuidv4 } from 'zod';

@Injectable()
export class AuthService {
  // async login(user: User, deviceIp: string, userAgent: string) {
  //   const jti = uuidv4(); // Tạo ID cho session này
  //   const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 ngày
  //   // 1. Tạo JWT
  //   const accessToken = this.jwtService.sign({
  //     sub: user.id,
  //     role: user.role,
  //     jti: jti,
  //   });
  //   // 2. Lưu vào Redis (Pipeline để chạy song song cho nhanh)
  //   const pipeline = this.redis.pipeline();
  //   // ZADD: Lưu hạn sử dụng
  //   pipeline.zadd(`ss:${user.id}`, exp, jti);
  //   // HSET: Lưu metadata thiết bị
  //   pipeline.hset(
  //     `meta:${user.id}`,
  //     jti,
  //     JSON.stringify({ ip: deviceIp, ua: userAgent }),
  //   );
  //   // (Optional) Set TTL cho key meta để Redis tự dọn rác khi user không login lâu
  //   pipeline.expire(`meta:${user.id}`, 60 * 60 * 24 * 30);
  //   await pipeline.exec();
  //   return { accessToken };
  // }
}
