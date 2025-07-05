import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updateUserSubscription } from '@/lib/features/auth/services/user-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscriptionCreated);
        break;

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscriptionUpdated);
        break;

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscriptionDeleted);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId found in checkout session metadata');
    return;
  }

  // All checkout sessions are now subscription-based
  console.log('Checkout session completed for subscription-based plan');
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const plan = determinePlanFromSubscription(subscription);
  
  await updateUserSubscription(userId, {
    stripeCustomerId: subscription.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status as any,
    plan: plan,
    startDate: new Date(subscription.current_period_start * 1000) as any,
    endDate: new Date(subscription.current_period_end * 1000) as any,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const plan = determinePlanFromSubscription(subscription);
  
  await updateUserSubscription(userId, {
    stripeCustomerId: subscription.customer as string,
    subscriptionId: subscription.id,
    status: subscription.status as any,
    plan: plan,
    startDate: new Date(subscription.current_period_start * 1000) as any,
    endDate: new Date(subscription.current_period_end * 1000) as any,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, {
    stripeCustomerId: subscription.customer as string,
    subscriptionId: subscription.id,
    status: 'cancelled',
    plan: 'free',
    startDate: new Date(subscription.current_period_start * 1000) as any,
    endDate: new Date(subscription.current_period_end * 1000) as any,
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle successful recurring payment
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    await handleSubscriptionUpdated(subscription);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment - could trigger email notifications or other actions
  console.log('Payment failed for invoice:', invoice.id);
}

function determinePlanFromSubscription(subscription: Stripe.Subscription): 'free' | 'pro' | 'enterprise' {
  // This would need to be configured based on your actual price IDs
  // For now, assuming all subscriptions are 'pro'
  return 'pro';
}