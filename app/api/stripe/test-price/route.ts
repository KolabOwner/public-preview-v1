import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET() {
  try {
    // Test if we can retrieve the price
    const price = await stripe.prices.retrieve('price_1RhJUoCs6xC7uaBI39tmO7iO');
    return NextResponse.json({ success: true, price });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}