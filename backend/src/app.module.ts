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
import { LoggerModule } from 'nestjs-pino';
@Module({
  imports: [
    UsersModule,
    BookingsModule,
    RoomsModule,
    ReviewsModule,
    AuthModule,
    PaymentsModule,
    PrismaModule,
    LoggerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
