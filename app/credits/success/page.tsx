'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('Processing your payment...');
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    async function verifyPayment() {
      if (!paymentIntent) {
        setStatus('error');
        setMessage('Payment information missing. Please try again.');
        return;
      }

      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentIntent }),
        });

        const data = await response.json();

        if (data.error) {
          setStatus('error');
          setMessage(
            'There was an error processing your payment. Please contact support.'
          );
          return;
        }

        setStatus('success');
        setMessage(
          'Payment successful! Your credits have been added to your account.'
        );
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage(
          'There was an error processing your payment. Please contact support.'
        );
      }
    }

    verifyPayment();
  }, [paymentIntent]);

  return (
    <div className="text-center">
      <div className="mb-4">
        {status === 'loading' ? (
          <svg
            className="animate-spin mx-auto h-12 w-12 text-[#63BCA5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : status === 'success' ? (
          <svg
            className="mx-auto h-12 w-12 text-[#63BCA5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {status === 'success' ? 'Thank You!' : 'Payment Status'}
      </h1>
      <p className="text-gray-600 mb-8">{message}</p>
      {status === 'success' ? (
        <div className="space-y-4">
          <Link
            href="/baby-names"
            className="block w-full bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90"
          >
            Start Generating Names
          </Link>
          <Link
            href="/credits"
            className="block w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Buy More Credits
          </Link>
        </div>
      ) : status === 'error' ? (
        <Link
          href="/credits"
          className="block w-full bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90"
        >
          Try Again
        </Link>
      ) : null}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        <Suspense
          fallback={
            <div className="text-center">
              <div className="animate-spin mx-auto h-12 w-12 text-[#63BCA5]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Loading payment status...</p>
            </div>
          }
        >
          <PaymentStatus />
        </Suspense>
      </div>
    </div>
  );
}
