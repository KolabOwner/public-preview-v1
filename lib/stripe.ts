import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const STRIPE_PRICE_IDS = {
  monthly: 'price_1RhJUoCs6xC7uaBI39tmO7iO', // Monthly: $29/month
  quarterly: 'price_1RhJZQCs6xC7uaBIkf4xtWcM', // Quarterly: $57 every 3 months
};

export interface CheckoutSessionRequest {
  priceId: string;
  userId: string;
  email: string;
  interval: 'monthly' | 'quarterly';
}

export async function createCheckoutSession(data: CheckoutSessionRequest) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}

export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to initialize');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCustomerPortalSession(customerId: string) {
  const response = await fetch('/api/stripe/customer-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create customer portal session');
  }

  const { url } = await response.json();
  return url;
}