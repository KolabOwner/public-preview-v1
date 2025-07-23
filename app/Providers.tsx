// app/providers.tsx

'use client';

import React from "react";
import { FirebaseAuthProvider, useAuth } from "@/contexts/firebase-auth-context";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { FontLoadingProvider } from "@/contexts/font-loading-context";
import { JobInfoProvider } from "@/contexts/job-info-context";
import { ResumeDataProvider } from "@/contexts/resume-data-context";
import { QueryProvider } from "@/lib/client/providers/query-provider";

function ProvidersWithAuth({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <FontLoadingProvider>
      <JobInfoProvider>
        <ResumeDataProvider>
          {children}
        </ResumeDataProvider>
      </JobInfoProvider>
    </FontLoadingProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <FirebaseAuthProvider>
          <ProvidersWithAuth>
            {children}
          </ProvidersWithAuth>
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}