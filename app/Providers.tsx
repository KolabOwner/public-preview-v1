// app/providers.tsx
'use client';

import { FirebaseAuthProvider } from "@/contexts/firebase-auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { FontLoadingProvider } from "@/contexts/font-loading-context";
import { JobInfoProvider } from "@/contexts/job-info-context";
import { ResumeDataProvider } from "@/contexts/resume-data-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <FirebaseAuthProvider>
        <FontLoadingProvider>
          <JobInfoProvider>
            <ResumeDataProvider>
              {children}
            </ResumeDataProvider>
          </JobInfoProvider>
        </FontLoadingProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}