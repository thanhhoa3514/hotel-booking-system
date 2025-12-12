'use client';

import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '@/hooks/useStripe';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStripe } from '@fortawesome/free-brands-svg-icons';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutButtonProps {
  bookingId: string;
  amount: number;
  disabled?: boolean;
  className?: string;
}

export function StripeCheckoutButton({
  bookingId,
  amount,
  disabled = false,
  className = '',
}: StripeCheckoutButtonProps) {
  const { mutate: createCheckoutSession, isPending } =
    useCreateCheckoutSession();

  const handleCheckout = () => {
    createCheckoutSession(bookingId);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isPending}
      className={`rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg ${className}`}
      size="lg"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faStripe} className="mr-2 h-5 w-5" />
          Pay ${amount.toFixed(2)} with Stripe
        </>
      )}
    </Button>
  );
}
