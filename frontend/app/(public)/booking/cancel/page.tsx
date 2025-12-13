'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');

  const handleRetry = () => {
    if (bookingId) {
      // Could redirect back to a payment page for the booking
      router.push(`/dashboard/bookings`);
    } else {
      router.push('/booking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-8 px-4">
      <Card className="max-w-2xl w-full rounded-2xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-6">
              <XCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Your payment was cancelled and no charges were made.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your booking is still pending. You can complete the payment anytime before it expires.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>If you experienced any issues during checkout:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your payment method details</li>
                <li>Ensure you have sufficient funds</li>
                <li>Try a different payment method</li>
                <li>Contact our support team for assistance</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleRetry}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              size="lg"
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 rounded-xl"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
