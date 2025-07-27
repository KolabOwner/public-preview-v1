// lib/client/hooks/resume/use-debounced-batch.ts
import { useCallback, useRef } from 'react';

interface BatchOperation<T> {
  id: string;
  data: T;
  timestamp: number;
}

interface UseDebouncedBatchOptions {
  delay?: number;
  maxBatchSize?: number;
  maxWait?: number;
}

/**
 * Hook for batching operations with debouncing to optimize performance
 * Useful for Firestore writes, API calls, and other expensive operations
 */
export function useDebouncedBatch<T>(
  executor: (items: T[]) => Promise<void>,
  options: UseDebouncedBatchOptions = {}
) {
  const {
    delay = 1000,
    maxBatchSize = 10,
    maxWait = 5000
  } = options;

  const batchRef = useRef<Map<string, BatchOperation<T>>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firstOperationRef = useRef<number | null>(null);

  const executeBatch = useCallback(async () => {
    const currentBatch = Array.from(batchRef.current.values());
    
    if (currentBatch.length === 0) return;

    // Clear the batch and reset timers
    batchRef.current.clear();
    firstOperationRef.current = null;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Execute the batch
    try {
      const items = currentBatch
        .sort((a, b) => a.timestamp - b.timestamp) // Process in order
        .map(op => op.data);
      
      await executor(items);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Batch executed: ${items.length} operations`);
      }
    } catch (error) {
      console.error('Batch execution failed:', error);
      throw error;
    }
  }, [executor]);

  const addToBatch = useCallback((id: string, data: T) => {
    const now = Date.now();
    
    // Add or update the operation in the batch
    batchRef.current.set(id, {
      id,
      data,
      timestamp: now
    });

    // Track first operation time for maxWait
    if (firstOperationRef.current === null) {
      firstOperationRef.current = now;
    }

    // Check if we should execute immediately
    const shouldExecuteImmediately = 
      batchRef.current.size >= maxBatchSize ||
      (firstOperationRef.current && now - firstOperationRef.current >= maxWait);

    if (shouldExecuteImmediately) {
      executeBatch();
      return;
    }

    // Clear existing timeout and set new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(executeBatch, delay);
  }, [delay, maxBatchSize, maxWait, executeBatch]);

  const flush = useCallback(() => {
    executeBatch();
  }, [executeBatch]);

  const clear = useCallback(() => {
    batchRef.current.clear();
    firstOperationRef.current = null;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const getBatchSize = useCallback(() => {
    return batchRef.current.size;
  }, []);

  return {
    addToBatch,
    flush,
    clear,
    getBatchSize
  };
}

/**
 * Specialized hook for template changes
 */
export function useTemplateChangeBatch(
  saveFunction: (templateId: string, settings: any) => Promise<void>
) {
  return useDebouncedBatch<{ templateId: string; settings: any }>(
    async (items) => {
      // Only execute the latest template change per unique resumeId
      const latestByTemplate = new Map<string, { templateId: string; settings: any }>();
      
      items.forEach(item => {
        latestByTemplate.set(item.templateId, item);
      });

      // Execute saves for all unique templates
      const promises = Array.from(latestByTemplate.values()).map(
        ({ templateId, settings }) => saveFunction(templateId, settings)
      );

      await Promise.all(promises);
    },
    {
      delay: 2000, // 2 second delay for template changes
      maxBatchSize: 5, // Max 5 template changes at once
      maxWait: 10000 // Maximum 10 seconds wait
    }
  );
}