'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export default function VerifyEmailPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify your email address</h1>
      <p className="text-gray-600 mb-6">
        We've sent a verification link to{' '}
        <span className="font-medium">{user?.email || 'your email address'}</span>.
        Please check your inbox and click the link to verify your email.
      </p>
      
      <div className="bg-amber-100 p-4 rounded-lg text-amber-800 mb-6 text-sm">
        <p>
          <strong>Important:</strong> If you don't see the email, please check your spam or junk folder.
        </p>
      </div>
      
      <div className="space-y-4 w-full">
        <Link 
          href="/auth/sign-in"
          className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Sign In
        </Link>
        
        <Link 
          href="/dashboard"
          className="block w-full px-4 py-2 text-center bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Continue to Dashboard
        </Link>
      </div>
    </div>
  );
}