import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  /**
   * Send booking confirmation notifications (email + SMS)
   */
  async sendBookingConfirmation(booking: any): Promise<void> {
    this.logger.log(
      `Sending booking confirmation for ${booking.bookingCode}`,
    );

    try {
      // Send email
      await this.emailService.sendBookingConfirmation(booking);

      // Send SMS if phone number is provided
      if (booking.guestPhone) {
        await this.smsService.sendBookingConfirmationSMS(booking);
      }

      this.logger.log(
        `Booking confirmation sent successfully for ${booking.bookingCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation for ${booking.bookingCode}:`,
        error,
      );
      // Don't throw - notification failure shouldn't break the booking process
    }
  }

  /**
   * Send booking reminder notifications (email + SMS)
   */
  async sendBookingReminder(booking: any): Promise<void> {
    this.logger.log(`Sending booking reminder for ${booking.bookingCode}`);

    try {
      // Send email
      await this.emailService.sendBookingReminder(booking);

      // Send SMS if phone number is provided
      if (booking.guestPhone) {
        await this.smsService.sendBookingReminderSMS(booking);
      }

      this.logger.log(
        `Booking reminder sent successfully for ${booking.bookingCode}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking reminder for ${booking.bookingCode}:`,
        error,
      );
    }
  }
}
