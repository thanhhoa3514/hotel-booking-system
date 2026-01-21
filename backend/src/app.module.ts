import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { RolesModule } from './roles/roles.module';
import { StripeModule } from './stripe/stripe.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ServicesModule } from './services/services.module';
import { ServiceBookingsModule } from './service-bookings/service-bookings.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from './jwt/jwt.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { UploadModule } from './upload/upload.module';
import { PasskeyModule } from './passkey/passkey.module';
// import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute (default)
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BookingsModule,
    RoomsModule,
    ReviewsModule,
    AuthModule,
    PaymentsModule,
    RolesModule,
    StripeModule,
    NotificationsModule,
    ServicesModule,
    ServiceBookingsModule,
    PasskeyModule,
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            // Terminal output with pretty formatting
            {
              target: 'pino-pretty',
              level: 'debug',
              options: {
                colorize: true,
                singleLine: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
            // File output for log management
            {
              target: 'pino/file',
              level: 'info',
              options: {
                destination: './logs/app.log',
                mkdir: true,
              },
            },
            // Error log file
            {
              target: 'pino/file',
              level: 'error',
              options: {
                destination: './logs/error.log',
                mkdir: true,
              },
            },
          ],
        },
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        autoLogging: true,
      },
    }),
    RedisModule,
    UploadModule,
  ],
  controllers: [AppController, /* HealthController */],
  providers: [
    AppService,
    JwtService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
