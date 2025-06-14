// app/auth/sign-up/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { userService } from "@/lib/services/user-service";
import { onAuthStateChange } from '@/lib/firebase/auth';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    loading: authLoading,
    error: authError,
    register,
    signInWithGoogle,
    signInWithFacebook,
    signInWithGithub,
    clearError
  } = useFirebaseAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const returnUrl = searchParams.get('from') || '/dashboard/resumes';

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  // Clear errors on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    try {
      await register(email, password);

      // Wait for auth state to update
      const unsubscribe = onAuthStateChange(async (currentUser) => {
        if (currentUser) {
          unsubscribe();

          // Create user document in Firestore
          await userService.createUserDocument(currentUser);

          // Create session cookie
          const idToken = await currentUser.getIdToken();
          if (idToken) {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
          }
        }
      });
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    setLocalError('');
    setIsLoading(true);

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'github':
          await signInWithGithub();
          break;
      }

      // Wait for auth state to update
      const unsubscribe = onAuthStateChange(async (currentUser) => {
        if (currentUser) {
          unsubscribe();

          // Create or update user document in Firestore
          await userService.createUserDocument(currentUser);

          // Create session cookie
          const idToken = await currentUser.getIdToken();
          if (idToken) {
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
          }
        }
      });
    } catch (err: any) {
      setLocalError(err.message || `${provider} login failed`);
      setIsLoading(false);
    }
  };

  const displayError = authError || localError;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f2e]">
        <Loader2 className="w-8 h-8 text-[#48c9b0] animate-spin" />
      </div>
    );
  }

  const features = [
    { name: 'Javascript', active: true },
    { name: 'Typescript', active: true },
    { name: 'CSS3', active: true },
    { name: 'HTML5', active: true },
    { name: 'Automating', active: true },
    { name: 'Coding Standard', active: true },
    { name: 'User Experience', active: true },
    { name: 'React', active: true },
    { name: 'RESTful', active: true },
    { name: 'Continuous improvement', active: true },
  ];

  return (
    <div className="min-h-screen bg-[#1a1f2e] flex">
      {/* Left Side - Sign Up Form - Fixed width on desktop */}
      <div className="w-full lg:w-[560px] xl:w-[640px] flex items-center justify-center px-8 lg:px-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px]"
        >
          {/* Logo */}
          <Link href="/" className="inline-block mb-12">
            <div className="flex items-center gap-3">
              {/* Modern H Logo Mark */}
              <div className="relative">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="6" height="28" rx="3" fill="#48c9b0"/>
                  <rect x="28" y="6" width="6" height="28" rx="3" fill="#48c9b0"/>
                  <rect x="6" y="17" width="28" height="6" rx="3" fill="#16a085"/>
                  <circle cx="34" cy="6" r="4" fill="#48c9b0" opacity="0.6"/>
                </svg>
              </div>

              {/* Company Name */}
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">Hirable</span>
                <span className="text-3xl font-bold text-[#48c9b0] ml-1">AI</span>
              </div>
            </div>
          </Link>

          {/* Create Account Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Create a free account
            </h2>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-[#4267B2] hover:bg-[#365899] disabled:bg-[#2d4a7c] text-white py-3 px-4 rounded-lg transition-colors font-bold uppercase text-sm tracking-[0.14px]"
            >
              <i className="fab fa-facebook text-lg" aria-hidden="true"></i>
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors font-bold uppercase text-sm tracking-[0.14px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#1a1f2e] text-gray-400 uppercase text-xs tracking-wider">or</span>
            </div>
          </div>

          {/* Error Message */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{displayError}</p>
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#48c9b0] focus:ring-1 focus:ring-[#48c9b0] transition-colors"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 bg-[#252b3b] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#48c9b0] focus:ring-1 focus:ring-[#48c9b0] transition-colors"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 whitespace-nowrap w-full border-0 bg-[#4e70ff] active:bg-[#3954d4] focus:bg-[#4e70ff] text-white hover:bg-[#3954d4] px-3 py-2.5 h-10 leading-5 rounded-md text-[14px] tracking-[0.14px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="px-1">Create an Account</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-400">Do you have an Account? </span>
            <Link href="/auth/sign-in" className="text-[#48c9b0] hover:text-[#16a085] transition-colors">
              Log in
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Dashboard Preview - Takes remaining space */}
      <div className="hidden lg:flex flex-1 bg-[#0f1419] relative overflow-hidden">
        {/* Dashboard Container with proper scaling */}
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="relative max-w-[1400px] w-full">
            {/* Main Dashboard */}
            <div className="relative mx-auto" style={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
              <div className="flex h-[780px] w-[1100px] rounded-lg border border-[#2d3447] bg-[#1a1f2e] p-4 shadow-2xl">
                {/* Sidebar */}
                <aside className="relative h-full w-[240px] overflow-hidden rounded-l-lg bg-[#252b3b] border-r border-solid border-r-[#2d3447]">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 z-0">
                    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1a1f2e] via-[#252b3b] to-[#2d3447]">
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] animate-pulse [animation-delay:2s]" />
                        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400 rounded-full filter blur-[100px] animate-pulse [animation-delay:4s]" />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Content */}
                  <div className="relative z-10 flex w-full flex-col gap-y-5 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Modern H Logo Mark */}
                      <div className="relative">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="6" y="6" width="6" height="28" rx="3" fill="#48c9b0"/>
                          <rect x="28" y="6" width="6" height="28" rx="3" fill="#48c9b0"/>
                          <rect x="6" y="17" width="28" height="6" rx="3" fill="#16a085"/>
                          <circle cx="34" cy="6" r="4" fill="#48c9b0" opacity="0.6"/>
                        </svg>
                      </div>

                      {/* Company Name */}
                      <div className="flex items-baseline">
                        <span className="text-xl font-bold text-white">Hirable</span>
                        <span className="text-xl font-bold text-[#48c9b0]">AI</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-5">
                      <button className="relative flex items-center justify-center font-bold uppercase focus:ring-0 focus:outline-none transition transition-200 whitespace-nowrap w-full border-0 bg-[#48c9b0] hover:bg-[#16a085] text-white px-3 py-2 h-9 leading-5 rounded-md text-[13px] tracking-[0.13px]">
                        <span className="px-1">Create new resume</span>
                      </button>
                      <nav className="relative flex flex-auto grow flex-col gap-y-3">
                        <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                          <div className="inline-block relative w-5 h-5">
                            <i className="fad fa-file text-lg" aria-hidden="true"></i>
                          </div>
                          <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">My dashboard</span>
                        </a>
                        <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                          <div className="inline-block relative w-5 h-5">
                            <i className="fad fa-file-lines text-lg" aria-hidden="true"></i>
                          </div>
                          <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">Sample Library</span>
                        </a>
                        <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                          <div className="inline-block relative w-5 h-5">
                            <i className="fad fa-file-check text-lg" aria-hidden="true"></i>
                          </div>
                          <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">Review my resume</span>
                        </a>
                        <a className="group cursor-pointer inline-flex items-center text-gray-400 hover:text-[#48c9b0] h-8 gap-x-2 justify-start w-full transition-colors">
                          <div className="inline-block relative w-5 h-5">
                            <i className="fad fa-file-waveform text-lg" aria-hidden="true"></i>
                          </div>
                          <span className="text-xs leading-5 font-bold tracking-[0.12px] uppercase text-nowrap text-ellipsis whitespace-nowrap overflow-hidden">AI Interview</span>
                        </a>
                      </nav>
                    </div>
                  </div>
                </aside>

                {/* Main Content */}
                <main className="h-full flex-1 rounded-r-lg bg-[#252b3b] px-10 py-6">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-row gap-x-2">
                      <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase whitespace-nowrap tracking-[.12px] bg-[#48c9b0] text-white">Resumes</div>
                      <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase whitespace-nowrap tracking-[.12px] bg-[#2d3447] text-gray-400">Cover Letters</div>
                      <div className="rounded-md flex items-center h-6 px-2 text-xs font-semibold leading-4 uppercase whitespace-nowrap tracking-[.12px] bg-[#2d3447] text-gray-400">Resignation Letters</div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#48c9b0] font-semibold text-white text-sm">A</div>
                      <i className="fas fa-caret-down text-gray-400 text-sm" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div className="flex flex-row gap-5">
                    {/* Resume Cards */}
                    {['Junior QA Engineer', 'Mechanical Engineer Student', 'AI-Optimized Resume'].map((title, index) => (
                      <div key={index} className="relative h-56 w-44 overflow-hidden rounded-lg border border-[#2d3447] bg-[#2d3447] text-white shadow-lg">
                        {/* Resume Preview Area */}
                        <div className="h-full p-3 bg-gradient-to-b from-[#252b3b] to-[#2d3447]">
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-1/2"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-5/6"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-2/3"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-4/5"></div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 z-10 w-full">
                          <div className="relative flex min-h-[2.5rem] flex-row items-center justify-between rounded-lg rounded-t-none bg-[#1a1f2e] py-0">
                            <div className="flex max-w-[calc(100%-2.5rem)] flex-row items-center pl-3">
                              <div className="overflow-hidden overflow-ellipsis whitespace-nowrap text-xs font-semibold leading-5 text-white">{title}</div>
                            </div>
                            <div className="flex h-9 min-w-9 items-center justify-center text-base text-gray-400">
                              <i className="fas fa-ellipsis-vertical" aria-hidden="true"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </main>
              </div>

              {/* AI Keyword Targeting Panel - Positioned to appear as overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="bg-[#252b3b] rounded-lg border border-[#2d3447] p-4 absolute -left-4 bottom-12 h-[420px] w-[260px] shadow-2xl"
              >
                <div className="flex flex-col gap-y-2">
                  <div>
                    <h3 className="text-sm leading-5 font-semibold text-white">
                      AI Keyword Targeting
                    </h3>
                  </div>
                </div>
                <span className="inline-block py-2 text-left text-[11px] leading-4 text-gray-400">Great work! You're ranking well for these keywords in the job description:</span>
                <ul className="space-y-1">
                  {features.slice(0, 10).map((feature, index) => (
                    <li key={index} className="flex justify-between items-center py-0.5">
                      <span className="text-xs leading-4 font-medium capitalize text-white">{feature.name}</span>
                      <i className="fad fa-circle-check text-[#48c9b0] text-xs" aria-hidden="true"></i>
                    </li>
                  ))}
                </ul>
                <span className="inline-block pt-3 pb-1 text-left text-[11px] leading-4 text-gray-400">Want to improve your chances? Consider adding these keywords:</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}