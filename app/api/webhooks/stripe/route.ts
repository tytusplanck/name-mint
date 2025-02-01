import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Add these export configurations
export const dynamic = 'force-dynamic';
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
    return new NextResponse(
      JSON.stringify({ error: 'No signature provided' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
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
          return new NextResponse(
            JSON.stringify({ error: 'Invalid metadata' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            }
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
          return new NextResponse(
            JSON.stringify({ error: 'Error updating credits' }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }

        console.log('Successfully updated credits for user:', userId);
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new NextResponse(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
    }
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
