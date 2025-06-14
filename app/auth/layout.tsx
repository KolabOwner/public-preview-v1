'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FirebaseAuthProvider } from '@/contexts/firebase-auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if current path is sign-in or sign-up
  const isAuthPage = pathname === '/auth/sign-in' || pathname === '/auth/sign-up';

  return (
    <FirebaseAuthProvider>
      <div className={`min-h-screen ${isAuthPage ? 'bg-[#1a1f2e]' : 'bg-gray-50'}`}>
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