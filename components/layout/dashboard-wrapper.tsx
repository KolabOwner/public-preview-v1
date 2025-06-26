'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserProfile, userService } from '@/lib/features/auth/services/user-service';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await userService.getUserDocument(user.uid);
          setUserProfile(profile);
          // Show overlay if user hasn't seen it yet
          if (profile?.showFirstTimeOverlay) {
            setShowOverlay(true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleCloseOverlay = async () => {
    setShowOverlay(false);
    // Update the local user profile immediately to prevent re-showing
    if (userProfile) {
      setUserProfile({ ...userProfile, showFirstTimeOverlay: false });
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {children}
      {showOverlay && userProfile?.showFirstTimeOverlay && (
        <OnboardingOverlay onClose={handleCloseOverlay} />
      )}
    </>
  );
}