import { useState } from 'react';
import { useAuth } from '@/contexts/firebase-auth-context';

interface TargetResumeResult {
  success: boolean;
  targetedResumeId?: string;
  targetingAnalysis?: any;
  recommendations?: any[];
  message?: string;
  error?: string;
}

export const useTargetResume = () => {
  const [isTargeting, setIsTargeting] = useState(false);
  const { user } = useAuth();

  const targetResume = async (resumeId: string): Promise<TargetResumeResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsTargeting(true);

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/resumes/target', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          resumeId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: result.error || 'Failed to target resume' 
        };
      }

      return {
        success: true,
        targetedResumeId: result.targetedResumeId,
        targetingAnalysis: result.targetingAnalysis,
        recommendations: result.recommendations,
        message: result.message
      };

    } catch (error: any) {
      console.error('Error targeting resume:', error);
      return { 
        success: false, 
        error: 'Network error while targeting resume' 
      };
    } finally {
      setIsTargeting(false);
    }
  };

  return {
    targetResume,
    isTargeting
  };
};