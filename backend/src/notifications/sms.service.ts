import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { format } from 'date-fns';

interface BookingData {
  bookingCode: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  totalAmount: number | string;
  guestPhone: string;
}
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private isEnabled: boolean;
  private fromNumber: string;

  constructor(private configService: ConfigService) {
    this.isEnabled =
      this.configService.get<string>('ENABLE_SMS_NOTIFICATIONS') === 'true';

    if (this.isEnabled) {
      const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      this.fromNumber =
        this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

      if (!accountSid || !authToken || !this.fromNumber) {
        throw new Error('Twilio credentials are not properly configured');
      }

      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('SMS notifications are disabled');
      return;
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to,
      });

      this.logger.log(`SMS sent: ${result.sid} to`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to:`, error);
      throw error;
    }
  }

  async sendBookingConfirmationSMS(booking: BookingData): Promise<void> {
    const reminderHoursRaw = this.configService.get('REMINDER_HOURS_BEFORE');
    const reminderHours =
      Number.isFinite(Number(reminderHoursRaw)) && Number(reminderHoursRaw) > 0
        ? Number(reminderHoursRaw)
        : 1;
    const reminderText = this.formatReminderTime(reminderHours);

    const message = ` Booking Confirmed!

Booking Code: ${booking.bookingCode}
Check-in: ${format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
Check-out: ${format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
Guests: ${booking.numberOfGuests}
Total: $${Number(booking.totalAmount).toFixed(2)}

Thank you for choosing us! You'll receive a reminder ${reminderText} before check-in.`;

    await this.sendSMS(booking.guestPhone, message);
  }

  async sendBookingReminderSMS(booking: any): Promise<void> {
    const checkInTime = new Date(booking.checkInDate);
    checkInTime.setHours(14, 0, 0, 0); // 2:00 PM

    const reminderHoursRaw = this.configService.get('REMINDER_HOURS_BEFORE');
    const reminderHours =
      Number.isFinite(Number(reminderHoursRaw)) && Number(reminderHoursRaw) > 0
        ? Number(reminderHoursRaw)
        : 1;
    const reminderText = this.formatReminderTime(reminderHours);

    const message = ` Check-in Reminder!

Your check-in is in ${reminderText}!

Booking Code: ${booking.bookingCode}
Time: ${checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Date: ${checkInTime.toLocaleDateString()}

Please bring a valid ID. We're excited to welcome you!`;

    await this.sendSMS(booking.guestPhone, message);
  }

  /**
   * Format reminder time into human-readable text
   */
  private formatReminderTime(hours: number): string {
    if (hours >= 1) {
      return hours === 1 ? '1 hour' : `${hours} hours`;
    } else {
      const minutes = Math.round(hours * 60);
      return minutes === 1 ? '1 minute' : `${minutes} minutes`;
    }
  }
}
