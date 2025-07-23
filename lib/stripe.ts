import { loadStripe } from '@stripe/stripe-js';

// Suppress Stripe HTTPS warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('You may test your Stripe.js integration over HTTP')) {
      return; // Suppress this specific warning
    }
    originalConsoleWarn.apply(console, args);
  };
}

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
  const response = await fetch('/api/payments/create-checkout-session', {
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
  const response = await fetch('/api/payments/customer-portal', {
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