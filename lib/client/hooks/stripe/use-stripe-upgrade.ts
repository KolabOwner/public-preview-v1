import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createCheckoutSession, redirectToCheckout, STRIPE_PRICE_IDS } from '@/lib/stripe';

interface UseStripeUpgradeOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useStripeUpgrade(options?: UseStripeUpgradeOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);

    try {
      // Map plan IDs to Stripe price IDs
      const priceIdMap: Record<string, string> = {
        monthly: STRIPE_PRICE_IDS.monthly,
        quarterly: STRIPE_PRICE_IDS.quarterly,
        lifetime: STRIPE_PRICE_IDS.lifetime,
      };

      const priceId = priceIdMap[planId];
      if (!priceId) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      // Create checkout session
      const sessionId = await createCheckoutSession({
        priceId,
        userId: user.uid,
        email: user.email!,
        interval: planId as 'monthly' | 'quarterly',
      });

      // Redirect to Stripe checkout
      await redirectToCheckout(sessionId);
      
      options?.onSuccess?.();
    } catch (error) {
      console.error('Stripe upgrade failed:', error);
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleUpgrade,
    isProcessing,
  };
}