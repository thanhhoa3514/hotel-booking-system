import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: PinoLogger) {
    logger.setContext(PrismaService.name);
    super({
      // Cấu hình log để dễ debug
      log: [
        { emit: 'event', level: 'query' }, // Log câu lệnh SQL chạy (chỉ bật ở DEV)
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }
  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  private async connectWithRetry(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.$connect();
        this.logger.log('Successfully connected to Database');
        return; // Kết nối thành công thì thoát
      } catch (error) {
        this.logger.error(
          `Connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay}ms...`,
          error.stack,
        );
        // Chờ 3s trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    // Hết lượt mà vẫn lỗi thì crash app luôn
    this.logger.error('Failed to connect to Database after multiple retries.');
    process.exit(1);
  }
}
