'use client';

import React from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FirebaseAuthProvider } from '@/contexts/firebase-auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if the current path is sign-in, sign-up, or sign-out
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/sign-out';

  return (
    <FirebaseAuthProvider>
      <div className={`min-h-screen ${isAuthPage ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col min-h-screen">
          {/* Only show header for non-auth pages */}
          {!isAuthPage && (
            <header className="bg-white shadow-sm py-4">
              <div className="container mx-auto px-4">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  Resume Analysis Service
                </Link>
              </div>
            </header>
          )}

          <main className="flex-grow">
            {children}
          </main>

          {/* Only show footer for non-auth pages */}
          {!isAuthPage && (
            <footer className="bg-white py-4 mt-auto">
              <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Resume Analysis Service. All rights reserved.
              </div>
            </footer>
          )}
        </div>
      </div>
    </FirebaseAuthProvider>
  );
}