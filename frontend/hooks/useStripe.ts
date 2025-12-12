import { useMutation } from '@tanstack/react-query';
import { stripeApi } from '@/services/stripe.api';
import { toast } from 'sonner';

/**
 * Create Stripe checkout session mutation
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      stripeApi.createCheckoutSession(bookingId),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create checkout session.';
      toast.error(message);
    },
  });
}

/**
 * Get session details
 */
export function useGetSession(sessionId: string) {
  return useMutation({
    mutationFn: () => stripeApi.getSession(sessionId),
  });
}
