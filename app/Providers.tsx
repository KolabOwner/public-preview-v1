// app/providers.tsx
'use client';

import { FirebaseAuthProvider } from "@/contexts/firebase-auth-context";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { FontLoadingProvider } from "@/contexts/font-loading-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <FirebaseAuthProvider>
        <FontLoadingProvider>
          {children}
        </FontLoadingProvider>
      </FirebaseAuthProvider>
    </ThemeProvider>
  );
}