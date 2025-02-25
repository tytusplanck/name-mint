import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { webhookLogger } from './error-logger';

// Add these export configurations
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';
export const runtime = 'nodejs';

// Check for required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  throw new Error('Supabase environment variables are not set properly');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  // Recommended for production environments
  maxNetworkRetries: 3,
});

// Initialize Supabase client (we use direct client here as this is a webhook)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to create consistent response format
const createResponse = (data: object, status: number = 200) => {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Only export the POST method to restrict to POST requests
export async function POST(req: Request) {
  webhookLogger.info('Received webhook event');

  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      webhookLogger.error('Missing stripe-signature header');
      return createResponse({ error: 'No signature provided' }, 400);
    }

    // Construct the event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      webhookLogger.error(
        `Webhook signature verification failed`,
        error as Error,
        { signature }
      );
      return createResponse({ error: 'Invalid signature' }, 400);
    }

    webhookLogger.info(`Processing event`, { type: event.type, id: event.id });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        webhookLogger.info(`Processing payment`, {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        });

        const userId = paymentIntent.metadata.userId;
        const credits = parseInt(paymentIntent.metadata.credits || '0');

        if (!userId || isNaN(credits) || credits <= 0) {
          webhookLogger.error(`Invalid payment metadata`, undefined, {
            paymentIntentId: paymentIntent.id,
            userId,
            credits,
          });
          return createResponse({ error: 'Invalid metadata' }, 400);
        }

        webhookLogger.info(`Updating credits`, { userId, credits });

        // Update user credits using the service role client
        const { error: updateError } = await supabase.rpc('increment_credits', {
          p_user_id: userId,
          p_credits: credits,
        });

        if (updateError) {
          webhookLogger.error(
            `Failed to update credits`,
            updateError as Error,
            { userId, credits }
          );
          return createResponse({ error: 'Error updating credits' }, 500);
        }

        webhookLogger.info(`Credits updated successfully`, { userId, credits });
        return createResponse({ success: true });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const failureMessage =
          paymentIntent.last_payment_error?.message || 'Unknown failure reason';

        webhookLogger.warn(`Payment failed`, {
          paymentIntentId: paymentIntent.id,
          failureMessage,
          userId: paymentIntent.metadata.userId,
        });

        // You could implement additional logic here, like notifying the user
        return createResponse({ success: true });
      }

      case 'charge.succeeded':
      case 'charge.updated':
        // We handle these events but don't need to take any action
        webhookLogger.info(`Processed event without action`, {
          type: event.type,
        });
        return createResponse({ success: true });

      default:
        webhookLogger.info(`Unhandled event type`, { type: event.type });
        return createResponse({ success: true });
    }
  } catch (err) {
    webhookLogger.error(`Unexpected webhook processing error`, err as Error);
    return createResponse({ error: 'Webhook processing failed' }, 500);
  }
}
