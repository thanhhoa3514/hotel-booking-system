import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  UseGuards,
  Get,
  Query,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Create a Stripe checkout session
   */
  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser('id') userId: string,
  ) {
    const session = await this.stripeService.createCheckoutSession(
      dto.bookingId,
      userId,
    );

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Stripe webhook endpoint
   * This endpoint receives events from Stripe
   */
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    const payload = request.rawBody;

    if (!payload) {
      throw new Error('No payload received');
    }

    let event;

    try {
      event = this.stripeService.constructEventFromPayload(payload, signature);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.stripeService.handlePaymentSuccess(event.data.object);
        break;
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed':
        await this.stripeService.handlePaymentFailure(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Retrieve session details (for success page)
   */
  @Get('session')
  @UseGuards(JwtAuthGuard)
  async getSession(@Query('session_id') sessionId: string) {
    const session = await this.stripeService.retrieveSession(sessionId);
    return {
      status: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
    };
  }
}
