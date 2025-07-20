'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UnsavedChangesOptions {
  /** Initial data to compare against */
  initialData: any;
  /** Current form data getter */
  getCurrentData: () => any;
  /** Whether form is currently saving */
  isSaving?: boolean;
  /** Custom comparison function */
  compareData?: (initial: any, current: any) => boolean;
  /** Message to show in confirmation dialogs */
  warningMessage?: string;
  /** Whether to show visual indicator */
  showIndicator?: boolean;
  /** Callback when changes are detected */
  onChangesDetected?: (hasChanges: boolean) => void;
}

export function useUnsavedChanges({
  initialData,
  getCurrentData,
  isSaving = false,
  compareData,
  warningMessage = 'You have unsaved changes. Are you sure you want to leave?',
  showIndicator = true,
  onChangesDetected
}: UnsavedChangesOptions) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [baselineData, setBaselineData] = useState(initialData);
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const lastDataRef = useRef(initialData);

  // Smart data comparison function
  const defaultCompareData = useCallback((initial: any, current: any) => {
    // Handle null/undefined
    if (initial === current) return true;
    if (!initial || !current) return false;
    
    // Deep comparison using JSON.stringify with sorting
    const sortedInitial = JSON.stringify(initial, Object.keys(initial).sort());
    const sortedCurrent = JSON.stringify(current, Object.keys(current).sort());
    
    return sortedInitial === sortedCurrent;
  }, []);

  const finalCompareData = compareData || defaultCompareData;

  // Check for changes function
  const checkForChanges = useCallback(() => {
    try {
      const currentData = getCurrentData();
      const hasChanges = !finalCompareData(baselineData, currentData);
      
      // Only update if state actually changed to prevent unnecessary re-renders
      if (hasChanges !== hasUnsavedChanges) {
        setHasUnsavedChanges(hasChanges);
        onChangesDetected?.(hasChanges);
      }
      
      lastDataRef.current = currentData;
      return hasChanges;
    } catch (error) {
      console.warn('Error checking for changes:', error);
      return false;
    }
  }, [baselineData, getCurrentData, finalCompareData, hasUnsavedChanges, onChangesDetected]);

  // Update baseline after successful save
  const markAsSaved = useCallback(() => {
    try {
      const currentData = getCurrentData();
      setBaselineData(currentData);
      setHasUnsavedChanges(false);
      onChangesDetected?.(false);
    } catch (error) {
      console.warn('Error marking as saved:', error);
    }
  }, [getCurrentData, onChangesDetected]);

  // Reset to initial data
  const resetToInitial = useCallback(() => {
    setBaselineData(initialData);
    setHasUnsavedChanges(false);
    onChangesDetected?.(false);
  }, [initialData, onChangesDetected]);

  // Browser beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSaving) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isSaving, warningMessage]);

  // Comprehensive navigation interception
  useEffect(() => {
    let isWarningShown = false;

    const handleNavigation = (event: Event) => {
      if (!hasUnsavedChanges || isSaving || isNavigatingRef.current || isWarningShown) {
        return;
      }

      const target = event.target as HTMLElement;
      const clickedElement = target.closest('a, button, [role="button"]') as HTMLElement;
      
      if (!clickedElement) return;

      // Check if it's a navigation element
      const isNavigationElement = (element: HTMLElement) => {
        const tagName = element.tagName.toLowerCase();
        const href = element.getAttribute('href');
        const role = element.getAttribute('role');
        const onclick = element.getAttribute('onclick');
        const elementText = element.textContent?.toLowerCase() || '';
        
        return (
          // Links
          (tagName === 'a' && href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) ||
          // Buttons that likely navigate
          (tagName === 'button' && (
            elementText.includes('back') ||
            elementText.includes('cancel') ||
            elementText.includes('close') ||
            elementText.includes('exit') ||
            elementText.includes('home') ||
            elementText.includes('dashboard') ||
            element.classList.contains('nav-') ||
            element.classList.contains('navigation') ||
            element.closest('nav') !== null
          )) ||
          // Elements with navigation role
          role === 'button' ||
          // Elements with onclick that might navigate
          (onclick && (onclick.includes('location') || onclick.includes('navigate') || onclick.includes('route')))
        );
      };

      if (isNavigationElement(clickedElement)) {
        isWarningShown = true;
        
        // Prevent the default action
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Show browser confirmation dialog
        const confirmLeave = confirm(warningMessage);
        isWarningShown = false;
        
        if (confirmLeave) {
          isNavigatingRef.current = true;
          setHasUnsavedChanges(false);
          
          // Allow the navigation to proceed
          setTimeout(() => {
            if (clickedElement.tagName.toLowerCase() === 'a') {
              const href = clickedElement.getAttribute('href');
              if (href) {
                if (href.startsWith('http') || href.startsWith('//')) {
                  window.location.href = href;
                } else {
                  router.push(href);
                }
              }
            } else {
              // For buttons, trigger click again
              clickedElement.click();
            }
            isNavigatingRef.current = false;
          }, 0);
        }
      }
    };

    // Use capture phase to intercept before other handlers
    document.addEventListener('click', handleNavigation, true);
    
    return () => {
      document.removeEventListener('click', handleNavigation, true);
    };
  }, [hasUnsavedChanges, isSaving, warningMessage, router]);

  // Keyboard shortcuts interception (Ctrl+W, Ctrl+R, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasUnsavedChanges || isSaving) return;

      // Common keyboard shortcuts that might cause navigation
      const isNavigationShortcut = (
        (e.ctrlKey || e.metaKey) && (
          e.key === 'w' || // Close tab
          e.key === 'r' || // Refresh
          e.key === 'l' || // Location bar
          e.key === 't' || // New tab
          e.key === 'n'    // New window
        )
      ) || (
        e.key === 'F5' || // Refresh
        (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) || // Browser back/forward
        e.key === 'Escape' // Might be used for canceling/closing
      );

      if (isNavigationShortcut) {
        const confirmLeave = confirm(warningMessage);
        if (!confirmLeave) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [hasUnsavedChanges, isSaving, warningMessage]);

  // Automatic change detection with debounced checking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkForChanges, 100);
    };

    // Set up mutation observer for DOM changes that might affect form data
    const observer = new MutationObserver(debouncedCheck);
    
    // Observe the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'checked', 'selected']
    });

    // Also check periodically as a fallback
    const intervalId = setInterval(checkForChanges, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [checkForChanges]);

  return {
    hasUnsavedChanges,
    checkForChanges,
    markAsSaved,
    resetToInitial,
    setBaselineData
  };
}