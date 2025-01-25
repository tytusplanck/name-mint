'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount: number;
  onCancel: () => void;
}

export default function PaymentForm({ amount, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/credits/success`,
      },
    });

    // If we get here, there's an immediate error (e.g., invalid card)
    // For successful payments, we won't reach this code as the user will be redirected
    setMessage(error?.message ?? 'An unexpected error occurred.');
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="text-lg font-medium text-gray-900 mb-2">
          Amount to Pay: ${amount.toFixed(2)}
        </div>
      </div>

      <PaymentElement />

      {message && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className={`flex-1 bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90 ${
            (isProcessing || !stripe || !elements) &&
            'opacity-50 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
