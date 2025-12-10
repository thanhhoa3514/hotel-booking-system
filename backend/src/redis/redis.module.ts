import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const redisClient = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),

          // Retry strategy
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },

          // Reconnect on error
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            if (err.message.includes(targetError)) {
              // Chỉ reconnect khi gặp lỗi READONLY
              return true;
            }
            return false;
          },

          // Connection settings
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true,

          // Timeouts
          connectTimeout: 10000, // 10 seconds
          commandTimeout: 5000, // 5 seconds

          // Keepalive
          keepAlive: 30000, // 30 seconds

          // TLS (nếu production cần)
          // tls: configService.get('NODE_ENV') === 'production' ? {} : undefined,

          // Lazy connect - không connect ngay lập tức
          lazyConnect: false,
        });

        // Event listeners
        redisClient.on('connect', () => {
          console.log(' Redis::: Connecting...');
        });

        redisClient.on('ready', () => {
          console.log(' Redis::: Ready to accept commands');
        });

        redisClient.on('error', (err) => {
          console.error(' Redis Error::: ', err.message);
        });

        redisClient.on('close', () => {
          console.log('  Redis::: Connection closed');
        });

        redisClient.on('reconnecting', (delay: number) => {
          console.log(` Redis::: Reconnecting in ${delay}ms...`);
        });

        redisClient.on('end', () => {
          console.log(' Redis::: Connection ended');
        });

        // Test connection
        try {
          await redisClient.ping();
          console.log(' Redis:::: Connected successfully!');
        } catch (error) {
          console.error(' Redis:::: Connection failed:', error);
          throw error;
        }

        return redisClient;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
