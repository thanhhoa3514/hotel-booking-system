import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationScheduler {
  private readonly logger = new Logger(NotificationScheduler.name);

  constructor(
    @InjectQueue('booking-reminders') private reminderQueue: Queue,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Runs every 10 minutes to check for upcoming bookings that need reminders
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async scheduleBookingReminders() {
    this.logger.log('Checking for bookings that need reminders...');

    const reminderHoursBefore =
      this.configService.get<number>('REMINDER_HOURS_BEFORE') || 1;

    try {
      // Calculate the time window for reminders
      const now = new Date();
      const reminderTime = new Date(
        now.getTime() + reminderHoursBefore * 60 * 60 * 1000,
      );

      // Find bookings with check-in time around the reminder window
      // Check-in time is 2:00 PM (14:00)
      const targetDate = new Date(reminderTime);
      targetDate.setHours(0, 0, 0, 0); // Start of day

      const bookings = await this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          checkInDate: targetDate,
          // Only send reminders if we haven't sent one yet
          // You might want to add a 'reminderSent' field to track this
        },
        select: {
          id: true,
          bookingCode: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          checkInDate: true,
          numberOfGuests: true,
        },
      });

      this.logger.log(
        `Found ${bookings.length} bookings that need reminders`,
      );

      // Schedule reminder jobs
      for (const booking of bookings) {
        const checkInDateTime = new Date(booking.checkInDate);
        checkInDateTime.setHours(14, 0, 0, 0); // 2:00 PM

        const reminderDateTime = new Date(
          checkInDateTime.getTime() - reminderHoursBefore * 60 * 60 * 1000,
        );

        // Only schedule if the reminder time is in the future
        if (reminderDateTime > now) {
          const delay = reminderDateTime.getTime() - now.getTime();

          await this.reminderQueue.add(
            'send-reminder',
            { bookingId: booking.id },
            {
              delay,
              jobId: `reminder-${booking.id}`, // Prevent duplicates
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 5000,
              },
            },
          );

          this.logger.log(
            `Scheduled reminder for booking ${booking.bookingCode} at ${reminderDateTime.toISOString()}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error scheduling booking reminders:', error);
    }
  }

  /**
   * Method to manually schedule a reminder for a specific booking
   */
  async scheduleReminderForBooking(bookingId: string): Promise<void> {
    const reminderHoursBefore =
      this.configService.get<number>('REMINDER_HOURS_BEFORE') || 1;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        checkInDate: true,
        status: true,
      },
    });

    if (!booking || booking.status !== 'CONFIRMED') {
      this.logger.warn(
        `Cannot schedule reminder for booking ${bookingId} - not found or not confirmed`,
      );
      return;
    }

    const checkInDateTime = new Date(booking.checkInDate);
    checkInDateTime.setHours(14, 0, 0, 0); // 2:00 PM

    const reminderDateTime = new Date(
      checkInDateTime.getTime() - reminderHoursBefore * 60 * 60 * 1000,
    );
    const now = new Date();

    if (reminderDateTime > now) {
      const delay = reminderDateTime.getTime() - now.getTime();

      await this.reminderQueue.add(
        'send-reminder',
        { bookingId: booking.id },
        {
          delay,
          jobId: `reminder-${booking.id}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );

      this.logger.log(
        `Manually scheduled reminder for booking ${booking.bookingCode}`,
      );
    }
  }
}
