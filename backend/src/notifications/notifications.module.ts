import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { NotificationScheduler } from './notification.scheduler';
import { ReminderProcessor } from './reminder.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'booking-reminders',
    }),
  ],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    NotificationScheduler,
    ReminderProcessor,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
