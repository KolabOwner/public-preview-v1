'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase-config';
import { useAuth } from '@/contexts/firebase-auth-context';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

interface SubscriptionStatus {
  plan: SubscriptionPlan;
  isActive: boolean;
  isPro: boolean;
  isEnterprise: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    plan: 'free',
    isActive: false,
    isPro: false,
    isEnterprise: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription({
        plan: 'free',
        isActive: false,
        isPro: false,
        isEnterprise: false,
      });
      setLoading(false);
      return;
    }

    // Set up real-time listener for user subscription changes
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const plan: SubscriptionPlan = userData.subscription?.plan || 'free';
        const isActive = userData.subscription?.status === 'active' || plan !== 'free';
        const isPro = plan === 'pro';
        const isEnterprise = plan === 'enterprise';

        setSubscription({
          plan,
          isActive,
          isPro,
          isEnterprise,
        });
      } else {
        // User document doesn't exist, default to free
        setSubscription({
          plan: 'free',
          isActive: false,
          isPro: false,
          isEnterprise: false,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Helper functions
  const canAccessPremiumTemplates = (): boolean => {
    return subscription.isPro || subscription.isEnterprise;
  };

  const canAccessTemplate = (templateId: string): boolean => {
    // Standard template is always available
    if (templateId === 'professional') {
      return true;
    }
    
    // All other templates require pro or enterprise
    return canAccessPremiumTemplates();
  };

  return {
    subscription,
    loading,
    canAccessPremiumTemplates,
    canAccessTemplate,
  };
}