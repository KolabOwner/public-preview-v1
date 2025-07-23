import { useState } from 'react';
import { createCustomerPortalSession } from '@/lib/stripe';

interface UseStripePortalOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useStripePortal(options?: UseStripePortalOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const openCustomerPortal = async (customerId: string) => {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    setIsLoading(true);

    try {
      const url = await createCustomerPortalSession(customerId);
      window.location.href = url;
      options?.onSuccess?.();
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openCustomerPortal,
    isLoading,
  };
}