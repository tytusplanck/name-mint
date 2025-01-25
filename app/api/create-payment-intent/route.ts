import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: Request) {
  console.log('Received payment intent request');

  try {
    const { tier } = await req.json();
    console.log('Tier:', tier);

    const supabase = createRouteHandlerClient({ cookies });

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        return NextResponse.json(
          { error: 'Session error: ' + sessionError.message },
          { status: 401 }
        );
      }

      if (!session?.user) {
        console.error('No authenticated user found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('User:', session.user.id);

      // Map tier to amount and credits
      const tierMap = {
        'tier-1': { amount: 200, credits: 20 }, // $2.00
        'tier-2': { amount: 500, credits: 100 }, // $5.00
        'tier-3': { amount: 1500, credits: 250 }, // $15.00
      };

      const selectedTier = tierMap[tier as keyof typeof tierMap];

      if (!selectedTier) {
        console.error('Invalid tier selected:', tier);
        return NextResponse.json(
          { error: 'Invalid tier selected' },
          { status: 400 }
        );
      }

      console.log('Creating payment intent for amount:', selectedTier.amount);

      try {
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: selectedTier.amount,
          currency: 'usd',
          metadata: {
            userId: session.user.id,
            credits: selectedTier.credits,
            tier: tier,
          },
        });

        console.log('Payment intent created:', paymentIntent.id);

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return NextResponse.json(
          { error: 'Error creating payment intent with Stripe' },
          { status: 500 }
        );
      }
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in create-payment-intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
}
