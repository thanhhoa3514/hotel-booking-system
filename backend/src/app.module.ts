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
import { LoggerModule } from 'nestjs-pino';
import { JwtService } from './jwt/jwt.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
// import { HealthController } from './health/health.controller';

@Module({
  imports: [
    UsersModule,
    BookingsModule,
    RoomsModule,
    ReviewsModule,
    AuthModule,
    PaymentsModule,
    RolesModule,
    PrismaModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
            : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        autoLogging: true,
      },
    }),
    RedisModule,
  ],
  controllers: [AppController, /* HealthController */],
  providers: [AppService, JwtService, RedisService],
})
export class AppModule { }
