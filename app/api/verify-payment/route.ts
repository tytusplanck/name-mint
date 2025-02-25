import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(req: Request) {
  // Get payment_intent from URL
  const url = new URL(req.url);
  const paymentIntentId = url.searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: 'Missing payment_intent parameter' },
      { status: 400 }
    );
  }

  try {
    // Get the authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment was successful and belongs to the user
    if (
      paymentIntent.status === 'succeeded' &&
      paymentIntent.metadata.userId === session.user.id
    ) {
      // Get current credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('credits_remaining')
        .eq('user_id', session.user.id)
        .single();

      return NextResponse.json({
        success: true,
        credits: creditsData?.credits_remaining || 0,
        payment: {
          amount: paymentIntent.amount / 100,
          status: paymentIntent.status,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Error verifying payment' },
      { status: 500 }
    );
  }
}
