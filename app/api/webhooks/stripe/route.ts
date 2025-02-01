import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Add these export configurations
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export const preferredRegion = 'auto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Initialize Supabase client (we use direct client here as this is a webhook)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log('Received webhook event');
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header found');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    console.log('Constructing Stripe event with signature:', signature);
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received Stripe event type:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Processing successful payment:', paymentIntent.id);

        const userId = paymentIntent.metadata.userId;
        const credits = parseInt(paymentIntent.metadata.credits);

        console.log('Payment metadata - userId:', userId, 'credits:', credits);

        if (!userId || isNaN(credits)) {
          console.error(
            'Invalid metadata in payment intent:',
            paymentIntent.id,
            'userId:',
            userId,
            'credits:',
            credits
          );
          return NextResponse.json(
            { error: 'Invalid metadata' },
            { status: 400 }
          );
        }

        console.log('Updating credits for user:', userId, 'amount:', credits);

        // Update user credits using the service role client
        const { error: updateError } = await supabase.rpc('increment_credits', {
          p_user_id: userId,
          p_credits: credits,
        });

        if (updateError) {
          console.error('Error updating credits:', updateError);
          return NextResponse.json(
            { error: 'Error updating credits' },
            { status: 500 }
          );
        }

        console.log('Successfully updated credits for user:', userId);
        return NextResponse.json({ success: true });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        // You could implement additional error handling here
        // For example, sending an email to the user or logging to an error tracking service
        return NextResponse.json({ success: true });
      }

      default:
        // Unexpected event type
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
