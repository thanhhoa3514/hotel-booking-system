import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.isEnabled =
      this.configService.get<string>('ENABLE_EMAIL_NOTIFICATIONS') === 'true';

    if (this.isEnabled) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST'),
        port: this.configService.get<number>('MAIL_PORT'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASSWORD'),
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('Email notifications are disabled');
      return;
    }

    try {
      // Load and compile template
      const templatePath = path.join(
        __dirname,
        'templates',
        `${options.template}.hbs`,
      );
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      const html = template(options.context);

      // Send email
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId} to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendBookingConfirmation(booking: any): Promise<void> {
    const context = {
      guestName: booking.guestName,
      bookingCode: booking.bookingCode,
      checkInDate: new Date(booking.checkInDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      checkOutDate: new Date(booking.checkOutDate).toLocaleDateString(
        'en-US',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
      ),
      numberOfGuests: booking.numberOfGuests,
      numberOfNights: booking.numberOfNights,
      totalAmount: Number(booking.totalAmount).toFixed(2),
      dashboardUrl: `${this.configService.get<string>('FRONTEND_URL')}/dashboard/bookings`,
    };

    await this.sendEmail({
      to: booking.guestEmail,
      subject: `Booking Confirmation - ${booking.bookingCode}`,
      template: 'booking-confirmation',
      context,
    });
  }

  async sendBookingReminder(booking: any): Promise<void> {
    const checkInDateTime = new Date(booking.checkInDate);
    checkInDateTime.setHours(14, 0, 0, 0); // Set to 2:00 PM

    // Get configurable reminder time
    const reminderHours =
      this.configService.get<number>('REMINDER_HOURS_BEFORE') || 1;
    const reminderTimeText = this.formatReminderTime(reminderHours);

    const context = {
      guestName: booking.guestName,
      bookingCode: booking.bookingCode,
      checkInDate: checkInDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      checkInTime: checkInDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      numberOfGuests: booking.numberOfGuests,
      reminderTimeText,
      dashboardUrl: `${this.configService.get<string>('FRONTEND_URL')}/dashboard/bookings`,
    };

    await this.sendEmail({
      to: booking.guestEmail,
      subject: `Reminder: Check-in Today - ${booking.bookingCode}`,
      template: 'booking-reminder',
      context,
    });
  }

  /**
   * Format reminder time into human-readable text
   */
  private formatReminderTime(hours: number): string {
    if (hours >= 1) {
      return hours === 1 ? '1 Hour' : `${hours} Hours`;
    } else {
      const minutes = Math.round(hours * 60);
      return minutes === 1 ? '1 Minute' : `${minutes} Minutes`;
    }
  }
}
