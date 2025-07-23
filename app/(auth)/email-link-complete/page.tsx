'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/firebase-auth-context';

export default function EmailLinkCompletePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { completeSignInWithLink } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if email is saved in localStorage
    const savedEmail = localStorage.getItem('emailForSignIn');
    if (savedEmail) {
      setEmail(savedEmail);
      handleSignIn(savedEmail);
    }
  }, []);

  const handleSignIn = async (emailToUse: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const link = window.location.href;
      await completeSignInWithLink(emailToUse, link);
      setSuccess(true);
      
      // Remove email from localStorage
      localStorage.removeItem('emailForSignIn');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with email link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignIn(email);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="mb-8 p-4 rounded-full bg-green-100 text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign in successful!</h1>
        <p className="text-gray-600">
          You've been signed in successfully. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="mb-8 p-4 rounded-full bg-blue-100 text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete your sign in</h1>
      
      {!email ? (
        <>
          <p className="text-gray-600 mb-6">
            Enter the email address that you used to sign in with the email link.
          </p>
          
          <form onSubmit={handleSubmit} className="w-full">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Complete Sign In'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            Completing sign in with email: <span className="font-medium">{email}</span>
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="w-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            ) : (
              <button
                onClick={() => handleSignIn(email)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}