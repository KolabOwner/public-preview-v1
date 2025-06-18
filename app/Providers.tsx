// app/providers.tsx
'use client';

import { FirebaseAuthProvider, useAuth } from "@/contexts/firebase-auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { FontLoadingProvider } from "@/contexts/font-loading-context";
import { JobInfoProvider } from "@/contexts/job-info-context";
import { ResumeDataProvider } from "@/contexts/resume-data-context";

// Inner component that has access to auth context
function ProvidersWithAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  return (
    <FontLoadingProvider>
      <JobInfoProvider userId={user?.uid || undefined}>
        <ResumeDataProvider>
          {children}
        </ResumeDataProvider>
      </JobInfoProvider>
    </FontLoadingProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <FirebaseAuthProvider>
        <ProvidersWithAuth>
          {children}
        </ProvidersWithAuth>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}