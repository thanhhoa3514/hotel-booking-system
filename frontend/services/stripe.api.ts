import api from './api';

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export const stripeApi = {
  /**
   * Create a Stripe checkout session for a booking
   */
  createCheckoutSession: async (
    bookingId: string,
  ): Promise<CreateCheckoutSessionResponse> => {
    const response = await api.post<CreateCheckoutSessionResponse>(
      '/stripe/create-checkout-session',
      { bookingId },
    );
    return response.data;
  },

  /**
   * Get session details after payment
   */
  getSession: async (sessionId: string) => {
    const response = await api.get(`/stripe/session?session_id=${sessionId}`);
    return response.data;
  },
};
