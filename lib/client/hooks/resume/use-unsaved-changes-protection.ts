'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/lib/client/stores/resume-store';

interface UseUnsavedChangesProtectionOptions {
  enabled?: boolean;
  onUnsavedChanges?: () => void;
  customMessage?: string;
}

interface UnsavedChangesProtection {
  showModal: boolean;
  pendingNavigation: (() => void) | null;
  handleSaveAndContinue: () => Promise<void>;
  handleDiscardAndContinue: () => void;
  handleCancelNavigation: () => void;
}

export function useUnsavedChangesProtection({
  enabled = true,
  onUnsavedChanges,
  customMessage = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesProtectionOptions = {}): UnsavedChangesProtection {
  const router = useRouter();
  const { hasUnsavedChanges, saveAllDirty, revertAll, getDirtySections } = useResumeStore();
  
  const [showModal, setShowModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Browser navigation protection (page refresh, back/forward, closing tab)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = customMessage;
        return customMessage;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, hasUnsavedChanges, customMessage]);

  // Router navigation protection
  useEffect(() => {
    if (!enabled) return;

    // Store original methods only once to avoid wrapping already-wrapped methods
    const originalMethods = {
      push: router.push.bind(router),
      replace: router.replace.bind(router),
      back: router.back.bind(router),
      forward: router.forward.bind(router)
    };

    // Check if methods are already wrapped by checking for a marker property
    if ((router.push as any).__isProtected) {
      return;
    }

    const createProtectedNavigation = (originalMethod: any, ...args: any[]) => {
      return () => {
        if (hasUnsavedChanges()) {
          setShowModal(true);
          setPendingNavigation(() => () => originalMethod(...args));
          onUnsavedChanges?.();
        } else {
          originalMethod(...args);
        }
      };
    };

    // Wrap router methods
    const protectedPush = (...args: Parameters<typeof router.push>) => {
      const protectedNav = createProtectedNavigation(originalMethods.push, ...args);
      protectedNav();
      // Return a promise that resolves when navigation completes
      return Promise.resolve();
    };
    protectedPush.__isProtected = true;
    router.push = protectedPush;

    const protectedReplace = (...args: Parameters<typeof router.replace>) => {
      const protectedNav = createProtectedNavigation(originalMethods.replace, ...args);
      protectedNav();
      return Promise.resolve();
    };
    protectedReplace.__isProtected = true;
    router.replace = protectedReplace;

    const protectedBack = () => {
      const protectedNav = createProtectedNavigation(originalMethods.back);
      protectedNav();
    };
    protectedBack.__isProtected = true;
    router.back = protectedBack;

    const protectedForward = () => {
      const protectedNav = createProtectedNavigation(originalMethods.forward);
      protectedNav();
    };
    protectedForward.__isProtected = true;
    router.forward = protectedForward;

    // Cleanup: restore original methods
    return () => {
      router.push = originalMethods.push;
      router.replace = originalMethods.replace;
      router.back = originalMethods.back;
      router.forward = originalMethods.forward;
    };
  }, [enabled, hasUnsavedChanges, router, onUnsavedChanges]);

  // Handle saving changes and continuing with navigation
  const handleSaveAndContinue = useCallback(async () => {
    try {
      await saveAllDirty();
      setShowModal(false);
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Don't close modal or proceed with navigation if save fails
      throw error;
    }
  }, [saveAllDirty, pendingNavigation]);

  // Handle discarding changes and continuing with navigation
  const handleDiscardAndContinue = useCallback(() => {
    revertAll();
    setShowModal(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [revertAll, pendingNavigation]);

  // Handle canceling navigation
  const handleCancelNavigation = useCallback(() => {
    setShowModal(false);
    setPendingNavigation(null);
  }, []);

  return {
    showModal,
    pendingNavigation,
    handleSaveAndContinue,
    handleDiscardAndContinue,
    handleCancelNavigation
  };
}

// Hook for tab switching protection within the resume editor
export function useTabSwitchProtection() {
  const { hasUnsavedChanges, getDirtySections } = useResumeStore();
  const [showModal, setShowModal] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<(() => void) | null>(null);

  const protectTabSwitch = useCallback((switchFunction: () => void) => {
    if (hasUnsavedChanges()) {
      setShowModal(true);
      setPendingTabSwitch(() => switchFunction);
      return false; // Prevent immediate switch
    } else {
      switchFunction();
      return true; // Allow immediate switch
    }
  }, [hasUnsavedChanges]);

  const handleSaveAndSwitch = useCallback(async () => {
    const { saveAllDirty } = useResumeStore.getState();
    try {
      await saveAllDirty();
      setShowModal(false);
      if (pendingTabSwitch) {
        pendingTabSwitch();
        setPendingTabSwitch(null);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      throw error;
    }
  }, [pendingTabSwitch]);

  const handleDiscardAndSwitch = useCallback(() => {
    const { revertAll } = useResumeStore.getState();
    revertAll();
    setShowModal(false);
    if (pendingTabSwitch) {
      pendingTabSwitch();
      setPendingTabSwitch(null);
    }
  }, [pendingTabSwitch]);

  const handleCancelSwitch = useCallback(() => {
    setShowModal(false);
    setPendingTabSwitch(null);
  }, []);

  return {
    protectTabSwitch,
    showModal,
    dirtySections: getDirtySections(),
    handleSaveAndSwitch,
    handleDiscardAndSwitch,
    handleCancelSwitch
  };
}