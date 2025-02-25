'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialize } = useAuthStore();
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: boolean;
    credits?: number;
    payment?: {
      amount: number;
      status: string;
    };
    error?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');

    if (!paymentIntent) {
      setPaymentStatus({ error: 'No payment information found' });
      setIsLoading(false);
      return;
    }

    async function verifyPayment() {
      try {
        const response = await fetch(
          `/api/verify-payment?payment_intent=${paymentIntent}`
        );
        const data = await response.json();

        setPaymentStatus(data);

        // Update the auth store with new credits amount
        if (data.success) {
          initialize();
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus({ error: 'Failed to verify payment status' });
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [searchParams, initialize]);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#63BCA5] mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (paymentStatus.error) {
    return (
      <>
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600">{paymentStatus.error}</p>
        </div>
        <Link
          href="/credits"
          className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Return to Credits Page
        </Link>
      </>
    );
  }

  if (paymentStatus.success) {
    return (
      <>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <p className="text-lg mb-2">
            <span className="font-medium">Amount paid:</span> $
            {paymentStatus.payment?.amount.toFixed(2)}
          </p>
          <p className="text-lg mb-6">
            <span className="font-medium">Your current balance:</span>{' '}
            {paymentStatus.credits} credits
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#63BCA5] to-[#52AB94] h-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/credits')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Buy More Credits
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white hover:opacity-90 font-semibold py-3 px-6 rounded-lg transition-opacity"
          >
            Start Generating Names
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-bold text-yellow-700 mb-2">
          Payment Processing
        </h2>
        <p className="text-yellow-600">
          Your payment is still processing. Please check back shortly.
        </p>
      </div>
      <Link
        href="/credits"
        className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Return to Credits Page
      </Link>
    </>
  );
}
