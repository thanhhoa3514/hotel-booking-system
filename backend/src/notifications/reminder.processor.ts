import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('booking-reminders')
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job<{ bookingId: string }>) {
    this.logger.log(
      `Processing reminder job ${job.id} for booking ${job.data.bookingId}`,
    );

    try {
      // Fetch booking details
      const booking = await this.prisma.booking.findUnique({
        where: { id: job.data.bookingId },
        select: {
          id: true,
          bookingCode: true,
          guestName: true,
          guestEmail: true,
          guestPhone: true,
          checkInDate: true,
          numberOfGuests: true,
          status: true,
        },
      });

      if (!booking) {
        this.logger.warn(
          `Booking ${job.data.bookingId} not found, skipping reminder`,
        );
        return;
      }

      // Only send reminder if booking is still confirmed
      if (booking.status !== 'CONFIRMED') {
        this.logger.log(
          `Booking ${booking.bookingCode} is no longer confirmed, skipping reminder`,
        );
        return;
      }

      // Send the reminder
      await this.notificationsService.sendBookingReminder(booking);

      this.logger.log(
        `Successfully sent reminder for booking ${booking.bookingCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process reminder for booking ${job.data.bookingId}:`,
        error,
      );
      throw error; // Re-throw to trigger retry
    }
  }
}
