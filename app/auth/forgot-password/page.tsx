'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/features/auth/firebase-config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <h1 className="text-4xl font-bold text-white">Rezi</h1>
          </Link>

          {/* Back to Login Link */}
          <Link
            href="/auth/sign-in"
            className="flex items-center text-gray-400 hover:text-gray-300 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Login</span>
          </Link>

          <h2 className="text-2xl font-semibold text-white mb-6">
            Reset Your Password
          </h2>

          <p className="text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full px-4 py-3 bg-[#252b3b] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
              <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6366f1] hover:bg-[#5558e3] disabled:bg-[#4c4f8b] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'SEND RESET LINK'
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-[#0f1419] p-8 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-64 h-64 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full opacity-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold text-white mb-2">Password Recovery</h3>
              <p className="text-gray-400 max-w-md">
                We'll send you instructions on how to reset your password so you can get back to building your resume.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}