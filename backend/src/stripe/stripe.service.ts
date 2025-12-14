import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  /**
   * Create a Stripe checkout session for a booking
   */
  async createCheckoutSession(
    bookingId: string,
    userId: string,
  ): Promise<Stripe.Checkout.Session> {
    // Get booking details
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new Error('Unauthorized access to booking');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in pending status');
    }

    this.logger.log(`Creating checkout session for booking ${bookingId}`);
    this.logger.log(`Booking rooms: ${JSON.stringify(booking.rooms)}`);

    // Prepare line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = booking.rooms.map(
      (bookingRoom) => ({
        price_data: {
          currency: 'vnd',
          product_data: {
            name: bookingRoom.room.roomType.name,
            description: `Room ${bookingRoom.room.roomNumber} - ${bookingRoom.room.roomType.description || ''}`,
          },
          unit_amount: Math.round(Number(bookingRoom.pricePerNight)), // VND doesn't use cents
        },
        quantity: bookingRoom.numberOfNights,
      }),
    );

    this.logger.log(`Line items: ${JSON.stringify(lineItems)}`);

    try {
      // Create checkout session
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${frontendUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/booking/cancel?booking_id=${bookingId}`,
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
        },
        customer_email: booking.guestEmail,
      });

      // Update booking with Stripe session ID
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          // Store session ID in special requests or create a separate field
          specialRequests: booking.specialRequests
            ? `${booking.specialRequests}\n[Stripe Session: ${session.id}]`
            : `[Stripe Session: ${session.id}]`,
        },
      });

      this.logger.log(`Created Stripe checkout session ${session.id} for booking ${bookingId}`);
      return session;
    } catch (error) {
      this.logger.error(`Stripe error: ${error.message}`);
      this.logger.error(`Stripe error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }


  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      this.logger.error('No booking ID found in session metadata');
      return;
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      this.logger.error(`Booking ${bookingId} not found`);
      return;
    }

    // Update booking status to CONFIRMED
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // Create payment record
    await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        transactionId: session.payment_intent as string,
        gatewayResponse: session as any,
      },
    });

    this.logger.log(`Payment successful for booking ${bookingId}`);

    // Send booking confirmation notifications
    await this.notificationsService.sendBookingConfirmation(updatedBooking);
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      this.logger.error('No booking ID found in session metadata');
      return;
    }

    // Create failed payment record
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (booking) {
      await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          method: 'CREDIT_CARD',
          status: 'FAILED',
          transactionId: session.payment_intent as string,
          gatewayResponse: session as any,
        },
      });
    }

    this.logger.log(`Payment failed for booking ${bookingId}`);
  }

  /**
   * Verify webhook signature
   */
  constructEventFromPayload(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  /**
   * Retrieve a checkout session
   */
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
}
