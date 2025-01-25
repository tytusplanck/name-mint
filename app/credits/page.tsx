'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PricingTier {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  isPopular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'tier-1',
    name: 'Starter',
    credits: 20,
    price: 2,
    description: 'Perfect for trying out the service',
  },
  {
    id: 'tier-2',
    name: 'Popular',
    credits: 100,
    price: 5,
    description: 'Best value for regular users',
    isPopular: true,
  },
  {
    id: 'tier-3',
    name: '✨ Name Wizard ✨',
    credits: 250,
    price: 15,
    description: 'Ideal for power users',
  },
];

export default function CreditsPage() {
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function loadCredits() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: creditsData } = await supabase
      .from('credits')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .single();

    if (creditsData) {
      setCurrentCredits(creditsData.credits_remaining);
    }
    setIsLoadingCredits(false);
  }

  useEffect(() => {
    loadCredits();
  }, []);

  // Refresh credits when the page gains focus (e.g., returning from success page)
  useEffect(() => {
    function onFocus() {
      // Don't refresh if we're being redirected to the success page
      if (!window.location.pathname.includes('/credits/success')) {
        loadCredits();
      }
    }

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handlePurchase = async (tier: PricingTier) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/auth/login');
      return;
    }

    console.log('Starting purchase for tier:', tier);
    setSelectedTier(tier);

    try {
      console.log('Making request to create-payment-intent');
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        return;
      }

      const data = await response.json();
      console.log('Received response:', data);

      if (data.error) {
        console.error('Error from API:', data.error);
        return;
      }

      console.log('Setting client secret');
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error in handlePurchase:', error);
    }
  };

  if (isLoadingCredits) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">Get More Credits</h1>
          <div className="inline-block bg-white rounded-2xl shadow-md px-8 py-4 mb-6">
            <span className="text-gray-600 text-lg">Current Balance:</span>
            <div className="text-4xl font-bold bg-gradient-to-r from-[#63BCA5] to-[#52AB94] bg-clip-text text-transparent">
              {currentCredits} credits
            </div>
          </div>
          <p className="text-gray-500">
            Purchase more credits to continue generating amazing names
          </p>
        </div>

        {clientSecret && selectedTier ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                amount={selectedTier.price}
                onCancel={() => {
                  setClientSecret('');
                  setSelectedTier(null);
                }}
              />
            </Elements>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  tier.isPopular
                    ? 'ring-2 ring-[#63BCA5] transform scale-105 md:scale-110'
                    : ''
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute top-0 right-0 bg-[#63BCA5] text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-gray-500 ml-2">one-time</span>
                  </div>
                  <p className="text-gray-600 mb-4">{tier.description}</p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-600">
                      <span className="mr-2">✨</span>
                      {tier.credits} credits
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="mr-2">🔄</span>
                      Never expires
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="mr-2">⚡</span>
                      Instant delivery
                    </li>
                  </ul>
                  <button
                    onClick={() => handlePurchase(tier)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90 ${
                      tier.isPopular
                        ? 'bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Purchase Credits
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
