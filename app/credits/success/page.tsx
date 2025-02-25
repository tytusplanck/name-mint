'use client';

import { Suspense } from 'react';
import PaymentSuccessContent from './PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <Suspense
            fallback={
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#63BCA5] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading payment details...</p>
              </div>
            }
          >
            <PaymentSuccessContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
