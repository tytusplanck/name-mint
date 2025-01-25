import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: Request) {
  try {
    const { paymentIntent: paymentIntentId } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Get the credits amount from metadata
    const credits = parseInt(paymentIntent.metadata.credits);

    if (isNaN(credits)) {
      return NextResponse.json(
        { error: 'Invalid credits amount' },
        { status: 400 }
      );
    }

    // No need to update credits here since the webhook already did it
    // Just verify the payment was successful
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error processing payment verification' },
      { status: 500 }
    );
  }
}
