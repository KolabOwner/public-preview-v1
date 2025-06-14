'use client';

import { AuthProvider } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';
import AppSidebarNav from '@/components/layout/app-sidebar-nav';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="h-screen min-h-screen flex bg-[#1e293b] overflow-hidden">
          <AppSidebarNav />
          <div className="flex-1 flex flex-col h-screen min-h-screen pl-2 overflow-y-auto">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}