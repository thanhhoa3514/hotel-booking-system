import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      errorFormat: 'colorless',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async connectWithRetry(retries = 5, delay = 3000): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.$connect();
        this.logger.info('Successfully connected to Database');
        return;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.stack : 'Unknown error occurred';
        this.logger.error(
          `Connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay}ms... ${message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    this.logger.error('Failed to connect to Database after multiple retries.');
    process.exit(1);
  }
}
