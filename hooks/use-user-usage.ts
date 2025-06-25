'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/features/auth/firebase-config';
import { useAuth } from '@/contexts/auth-context';

interface UserUsage {
  aiGenerations: number;
  monthlyAiGenerations: number;
  resumeCount: number;
  maxAiGenerations: number;
  pdfGenerations: number;
  maxPdfGenerations: number;
}

export function useUserUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UserUsage>({
    aiGenerations: 0,
    monthlyAiGenerations: 0,
    resumeCount: 0,
    maxAiGenerations: 10, // Default free plan limit
    pdfGenerations: 0,
    maxPdfGenerations: 3, // Free users limited to 3 PDF generations
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUsage = async () => {
      try {
        // Fetch user profile for AI generations data
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        let aiGenerations = 0;
        let monthlyAiGenerations = 0;
        let maxAiGenerations = 10;
        let pdfGenerations = 0;
        let maxPdfGenerations = 3;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          aiGenerations = userData.usage?.aiGenerations || 0;
          monthlyAiGenerations = userData.usage?.monthlyAiGenerations || 0;
          pdfGenerations = userData.usage?.pdfGenerations || userData.usage?.resumeCount || 0;
          
          // Set limits based on subscription plan
          const plan = userData.subscription?.plan || 'free';
          if (plan === 'pro') {
            maxAiGenerations = 100;
            maxPdfGenerations = -1; // Unlimited
          } else if (plan === 'enterprise') {
            maxAiGenerations = 1000;
            maxPdfGenerations = -1; // Unlimited
          }
        }

        // Fetch actual resume count from resumes collection
        const resumesQuery = query(
          collection(db, 'resumes'),
          where('userId', '==', user.uid)
        );
        const resumesSnapshot = await getDocs(resumesQuery);
        const resumeCount = resumesSnapshot.size;

        setUsage({
          aiGenerations,
          monthlyAiGenerations,
          resumeCount,
          maxAiGenerations,
          pdfGenerations,
          maxPdfGenerations,
        });
      } catch (error) {
        console.error('Error fetching user usage:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time listener for user document changes
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const aiGenerations = userData.usage?.aiGenerations || 0;
        const monthlyAiGenerations = userData.usage?.monthlyAiGenerations || 0;
        const pdfGenerations = userData.usage?.pdfGenerations || userData.usage?.resumeCount || 0;
        
        // Update limits based on subscription plan
        const plan = userData.subscription?.plan || 'free';
        let maxAiGenerations = 10;
        let maxPdfGenerations = 3;
        
        if (plan === 'pro') {
          maxAiGenerations = 100;
          maxPdfGenerations = -1; // Unlimited
        } else if (plan === 'enterprise') {
          maxAiGenerations = 1000;
          maxPdfGenerations = -1; // Unlimited
        }

        setUsage(prev => ({
          ...prev,
          aiGenerations,
          monthlyAiGenerations,
          maxAiGenerations,
          pdfGenerations,
          maxPdfGenerations,
        }));
      }
    });

    // Set up real-time listener for resume count changes
    const resumesQuery = query(
      collection(db, 'resumes'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribeResumes = onSnapshot(resumesQuery, (snapshot) => {
      const resumeCount = snapshot.size;
      setUsage(prev => ({
        ...prev,
        resumeCount,
      }));
    });

    // Initial fetch
    fetchUsage();

    return () => {
      unsubscribeUser();
      unsubscribeResumes();
    };
  }, [user]);

  const incrementAiGeneration = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentAiGenerations = 0;
      let currentMonthlyGenerations = 0;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentAiGenerations = userData.usage?.aiGenerations || 0;
        currentMonthlyGenerations = userData.usage?.monthlyAiGenerations || 0;
      }

      await updateDoc(userDocRef, {
        'usage.aiGenerations': currentAiGenerations + 1,
        'usage.monthlyAiGenerations': currentMonthlyGenerations + 1,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error incrementing AI generation count:', error);
    }
  };

  const incrementPdfDownload = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentPdfGenerations = 0;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentPdfGenerations = userData.usage?.pdfGenerations || 0;
      }

      await updateDoc(userDocRef, {
        'usage.pdfGenerations': currentPdfGenerations + 1,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error incrementing PDF download count:', error);
    }
  };

  // Validation functions

  const canGenerateAiContent = (): boolean => {
    return usage.monthlyAiGenerations < usage.maxAiGenerations;
  };

  const getRemainingAiGenerations = (): number => {
    return Math.max(0, usage.maxAiGenerations - usage.monthlyAiGenerations);
  };

  const canDownloadPdf = (): boolean => {
    // -1 means unlimited
    if (usage.maxPdfGenerations === -1) return true;
    return usage.pdfGenerations < usage.maxPdfGenerations;
  };

  const getRemainingPdfGenerations = (): number => {
    if (usage.maxPdfGenerations === -1) return -1; // Unlimited
    return Math.max(0, usage.maxPdfGenerations - usage.pdfGenerations);
  };

  // Create display usage that shows lower limits for UI
  const displayUsage = {
    ...usage,
  };

  return {
    usage,
    displayUsage, // Use this for UI display
    loading,
    incrementAiGeneration,
    incrementPdfDownload,
    canGenerateAiContent,
    getRemainingAiGenerations,
    canDownloadPdf,
    getRemainingPdfGenerations,
  };
}