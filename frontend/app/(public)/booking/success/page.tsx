'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Calendar } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { bookingKeys } from '@/hooks/useBookings';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = searchParams.get('session_id');
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (sessionId && !isUpdated) {
      // Invalidate bookings cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      setIsUpdated(true);
    }
  }, [sessionId, queryClient, isUpdated]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-8 px-4">
      <Card className="max-w-2xl w-full rounded-2xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Your reservation has been confirmed and payment processed successfully.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Check your email for booking confirmation and details</span>
              </p>
              <p className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>View your booking in the dashboard</span>
              </p>
              <p className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>You can modify or cancel your booking anytime before check-in</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push('/dashboard/bookings')}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              View My Bookings
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 rounded-xl"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
