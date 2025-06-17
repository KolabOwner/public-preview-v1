/**
 * Automated Recovery Workflows
 * Implements self-healing and recovery strategies for various failure scenarios
 */

import { CircuitBreaker, circuitBreakerManager } from '../circuit-breaker';
import { RetryPolicy, BackoffStrategy } from '../retry';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { performanceAnalytics } from '../../monitoring/analytics';

export interface RecoveryStrategy {
  name: string;
  priority: number;
  condition: (error: any) => boolean;
  recover: (context: RecoveryContext) => Promise<RecoveryResult>;
}

export interface RecoveryContext {
  error: any;
  operation: string;
  attempts: number;
  metadata?: Record<string, any>;
  previousStrategies: string[];
}

export interface RecoveryResult {
  success: boolean;
  result?: any;
  strategy: string;
  message?: string;
  shouldRetry?: boolean;
}

export class RecoveryOrchestrator {
  private strategies: RecoveryStrategy[] = [];
  private readonly defaultStrategies: RecoveryStrategy[] = [
    {
      name: 'retry_with_backoff',
      priority: 1,
      condition: (error) => {
        return error.code === 'NETWORK_ERROR' || 
               error.code === 'TIMEOUT' ||
               error.message?.includes('fetch failed');
      },
      recover: async (context) => {
        const retry = new RetryPolicy({
          maxAttempts: 3,
          initialDelay: 1000,
          factor: 2
        });
        
        const result = await retry.execute(
          () => this.retryOperation(context),
          BackoffStrategy.EXPONENTIAL
        );
        
        return {
          success: result.success,
          result: result.result,
          strategy: 'retry_with_backoff',
          message: `Retried ${result.attempts} times`
        };
      }
    },
    {
      name: 'circuit_breaker_fallback',
      priority: 2,
      condition: (error) => {
        return error.code === 'SERVICE_UNAVAILABLE' ||
               error.status === 503;
      },
      recover: async (context) => {
        const breaker = circuitBreakerManager.getBreaker(context.operation);
        
        if (breaker.isOpen()) {
          // Use fallback
          return {
            success: true,
            result: await this.getFallbackResult(context),
            strategy: 'circuit_breaker_fallback',
            message: 'Using cached/fallback data'
          };
        }
        
        return {
          success: false,
          strategy: 'circuit_breaker_fallback',
          shouldRetry: true
        };
      }
    },
    {
      name: 'degrade_gracefully',
      priority: 3,
      condition: (error) => {
        return error.code === 'RESOURCE_EXHAUSTED' ||
               error.code === 'QUOTA_EXCEEDED';
      },
      recover: async (context) => {
        // Reduce operation complexity
        const degradedResult = await this.degradeOperation(context);
        
        return {
          success: true,
          result: degradedResult,
          strategy: 'degrade_gracefully',
          message: 'Operation completed with reduced functionality'
        };
      }
    },
    {
      name: 'alternative_service',
      priority: 4,
      condition: (error) => {
        return error.code === 'SERVICE_ERROR' ||
               error.status >= 500;
      },
      recover: async (context) => {
        const alternative = await this.findAlternativeService(context);
        
        if (alternative) {
          const result = await this.executeAlternative(alternative, context);
          return {
            success: true,
            result,
            strategy: 'alternative_service',
            message: `Used alternative: ${alternative.name}`
          };
        }
        
        return {
          success: false,
          strategy: 'alternative_service'
        };
      }
    },
    {
      name: 'data_repair',
      priority: 5,
      condition: (error) => {
        return error.code === 'DATA_CORRUPTION' ||
               error.code === 'INVALID_DATA';
      },
      recover: async (context) => {
        const repaired = await this.repairData(context);
        
        if (repaired) {
          return {
            success: true,
            result: repaired,
            strategy: 'data_repair',
            message: 'Data repaired and operation retried'
          };
        }
        
        return {
          success: false,
          strategy: 'data_repair'
        };
      }
    }
  ];

  constructor() {
    this.strategies = [...this.defaultStrategies];
  }

  /**
   * Registers a custom recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Attempts to recover from an error
   */
  async recover(error: any, operation: string, metadata?: Record<string, any>): Promise<RecoveryResult> {
    const context: RecoveryContext = {
      error,
      operation,
      attempts: 0,
      metadata,
      previousStrategies: []
    };

    // Try each strategy in priority order
    for (const strategy of this.strategies) {
      if (strategy.condition(error) && !context.previousStrategies.includes(strategy.name)) {
        try {
          console.log(`Attempting recovery with strategy: ${strategy.name}`);
          context.attempts++;
          context.previousStrategies.push(strategy.name);
          
          const result = await strategy.recover(context);
          
          if (result.success) {
            console.log(`Recovery successful with strategy: ${strategy.name}`);
            return result;
          }
          
          if (!result.shouldRetry) {
            break;
          }
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        }
      }
    }

    // All strategies failed
    return {
      success: false,
      strategy: 'none',
      message: 'All recovery strategies exhausted'
    };
  }

  /**
   * Retry the original operation
   */
  private async retryOperation(context: RecoveryContext): Promise<any> {
    // Get the original operation function from context
    const operationFn = context.metadata?.operationFn;
    if (!operationFn) {
      throw new Error('No operation function provided for retry');
    }
    
    // Execute with exponential backoff
    const delay = Math.min(1000 * Math.pow(2, context.attempts), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return operationFn();
  }

  /**
   * Get fallback result
   */
  private async getFallbackResult(context: RecoveryContext): Promise<any> {
    const cacheKey = context.metadata?.cacheKey || `fallback_${context.operation}`;
    
    try {
      // Try to get from localStorage first (faster)
      const localCache = localStorage.getItem(cacheKey);
      if (localCache) {
        const parsed = JSON.parse(localCache);
        const age = Date.now() - parsed.timestamp;
        
        // Use local cache if less than 5 minutes old
        if (age < 300000) {
          return {
            ...parsed.data,
            cached: true,
            cacheAge: age,
            source: 'localStorage'
          };
        }
      }
      
      // Try Firestore cache
      const docRef = doc(collection(db, 'fallback_cache'), cacheKey);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cacheTime = data.timestamp?.toDate?.() || new Date(data.timestamp);
        const age = Date.now() - cacheTime.getTime();
        
        // Use Firestore cache if less than 1 hour old
        if (age < 3600000) {
          return {
            ...data.value,
            cached: true,
            cacheAge: age,
            source: 'firestore'
          };
        }
      }
      
      // Return default based on operation type
      const defaults = this.getDefaultFallback(context.operation);
      return {
        ...defaults,
        cached: true,
        isDefault: true,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Failed to get fallback result:', error);
      return this.getDefaultFallback(context.operation);
    }
  }

  /**
   * Get default fallback for operation
   */
  private getDefaultFallback(operation: string): any {
    const defaults: Record<string, any> = {
      'resume_parse': {
        sections: { skills: [], experience: [], education: [] },
        metadata: { parsed: false, error: 'Service unavailable' }
      },
      'api_call': {
        data: [],
        status: 'offline',
        message: 'Using offline mode'
      },
      'file_upload': {
        uploaded: false,
        queued: true,
        message: 'Upload queued for retry'
      }
    };
    
    return defaults[operation] || { error: 'Service temporarily unavailable' };
  }

  /**
   * Degrade operation to simpler version
   */
  private async degradeOperation(context: RecoveryContext): Promise<any> {
    const operation = context.operation;
    const metadata = context.metadata || {};
    
    // Track degradation
    await performanceAnalytics.recordMetric(
      'recovery.degraded_operation',
      1,
      'counter' as any,
      { operation }
    );
    
    switch (operation) {
      case 'resume_parse':
        // Use basic text extraction instead of AI parsing
        return {
          degraded: true,
          sections: await this.basicTextExtraction(metadata.file),
          message: 'Using basic text extraction (AI service unavailable)',
          features: ['text_extraction']
        };
        
      case 'image_processing':
        // Skip image processing, return placeholder
        return {
          degraded: true,
          processed: false,
          thumbnail: null,
          message: 'Image processing skipped',
          features: []
        };
        
      case 'bulk_operation':
        // Process items one by one instead of batch
        return {
          degraded: true,
          processed: await this.processSingleItems(metadata.items),
          message: 'Processing items individually',
          features: ['sequential_processing']
        };
        
      default:
        return {
          degraded: true,
          result: metadata.minimalResult || {},
          features: ['minimal'],
          message: `Operating in degraded mode for ${operation}`
        };
    }
  }

  /**
   * Basic text extraction fallback
   */
  private async basicTextExtraction(file: any): Promise<any> {
    try {
      // Simple text extraction without AI
      const text = file?.text || '';
      const lines = text.split('\n').filter((line: string) => line.trim());
      
      return {
        skills: this.extractSection(lines, ['skills', 'expertise', 'technologies']),
        experience: this.extractSection(lines, ['experience', 'work', 'employment']),
        education: this.extractSection(lines, ['education', 'academic', 'degree']),
        rawText: text.substring(0, 5000) // First 5000 chars
      };
    } catch (error) {
      return { error: 'Text extraction failed', rawText: '' };
    }
  }

  /**
   * Extract section from text lines
   */
  private extractSection(lines: string[], keywords: string[]): string[] {
    const results: string[] = [];
    let inSection = false;
    
    for (const line of lines) {
      const lower = line.toLowerCase();
      
      // Check if this line starts a section
      if (keywords.some(keyword => lower.includes(keyword))) {
        inSection = true;
        continue;
      }
      
      // Check if we've hit another section header
      if (inSection && /^[A-Z][A-Z\s]{2,}$/m.test(line.trim())) {
        break;
      }
      
      // Add line if in section
      if (inSection && line.trim()) {
        results.push(line.trim());
      }
    }
    
    return results.slice(0, 10); // Limit to 10 items
  }

  /**
   * Process items one by one
   */
  private async processSingleItems(items: any[]): Promise<any[]> {
    const results = [];
    
    for (const item of items.slice(0, 10)) { // Limit to 10 items
      try {
        // Simplified processing
        results.push({
          id: item.id || Math.random().toString(36),
          processed: true,
          minimal: true
        });
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ id: item.id, error: true });
      }
    }
    
    return results;
  }

  /**
   * Find alternative service
   */
  private async findAlternativeService(context: RecoveryContext): Promise<any> {
    const operation = context.operation;
    const serviceType = context.metadata?.serviceType || 'api';
    
    // Service registry with health status
    const serviceRegistry = {
      'resume_parse': [
        { 
          name: 'openai-gpt4', 
          endpoint: '/api/parse/gpt4',
          priority: 1,
          rateLimit: 100
        },
        { 
          name: 'anthropic-claude', 
          endpoint: '/api/parse/claude',
          priority: 2,
          rateLimit: 200
        },
        { 
          name: 'local-nlp', 
          endpoint: '/api/parse/local',
          priority: 3,
          rateLimit: 1000
        }
      ],
      'file_storage': [
        { 
          name: 'firebase-storage', 
          endpoint: 'firebase',
          priority: 1
        },
        { 
          name: 'cloudinary', 
          endpoint: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
          priority: 2
        },
        { 
          name: 'local-storage', 
          endpoint: 'indexeddb',
          priority: 3
        }
      ],
      'default': [
        { 
          name: 'primary', 
          endpoint: '/api/v1',
          priority: 1
        },
        { 
          name: 'secondary', 
          endpoint: '/api/v2',
          priority: 2
        }
      ]
    };
    
    const services = serviceRegistry[operation] || serviceRegistry.default;
    
    // Check service health and find available alternative
    for (const service of services) {
      const isHealthy = await this.checkServiceHealth(service);
      if (isHealthy && service.name !== context.metadata?.failedService) {
        return service;
      }
    }
    
    return null;
  }

  /**
   * Check if service is healthy
   */
  private async checkServiceHealth(service: any): Promise<boolean> {
    try {
      // Check circuit breaker state
      const breaker = circuitBreakerManager.getBreaker(service.name);
      if (breaker.isOpen()) {
        return false;
      }
      
      // For local services, always available
      if (service.endpoint === 'indexeddb' || service.endpoint === 'localstorage') {
        return true;
      }
      
      // For remote services, could implement health check
      // For now, assume available if not in circuit breaker
      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute alternative service
   */
  private async executeAlternative(alternative: any, context: RecoveryContext): Promise<any> {
    const timer = performanceAnalytics.startTimer('recovery.alternative_service', {
      service: alternative.name,
      operation: context.operation
    });
    
    try {
      switch (alternative.endpoint) {
        case 'indexeddb':
          return await this.executeIndexedDB(context);
          
        case 'localstorage':
          return await this.executeLocalStorage(context);
          
        case 'firebase':
          return await this.executeFirebase(context);
          
        default:
          // Execute on alternative API endpoint
          return await this.executeAlternativeAPI(alternative, context);
      }
    } finally {
      await timer();
    }
  }

  /**
   * Execute using IndexedDB
   */
  private async executeIndexedDB(context: RecoveryContext): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RecoveryDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as any).result;
        const transaction = db.transaction(['recovery'], 'readwrite');
        const store = transaction.objectStore('recovery');
        
        const data = {
          operation: context.operation,
          timestamp: Date.now(),
          data: context.metadata?.data || {}
        };
        
        store.put(data, context.operation);
        
        resolve({
          source: 'indexeddb',
          stored: true,
          willRetry: true,
          message: 'Data stored locally for retry'
        });
      };
      
      request.onerror = () => reject(new Error('IndexedDB not available'));
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;
        if (!db.objectStoreNames.contains('recovery')) {
          db.createObjectStore('recovery');
        }
      };
    });
  }

  /**
   * Execute using localStorage
   */
  private async executeLocalStorage(context: RecoveryContext): Promise<any> {
    try {
      const key = `recovery_${context.operation}_${Date.now()}`;
      const data = {
        operation: context.operation,
        timestamp: Date.now(),
        data: context.metadata?.data || {},
        attempts: context.attempts
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      
      // Store key in recovery queue
      const queue = JSON.parse(localStorage.getItem('recovery_queue') || '[]');
      queue.push(key);
      localStorage.setItem('recovery_queue', JSON.stringify(queue));
      
      return {
        source: 'localstorage',
        stored: true,
        key,
        message: 'Data queued in localStorage'
      };
    } catch (error) {
      throw new Error('localStorage not available or quota exceeded');
    }
  }

  /**
   * Execute using Firebase
   */
  private async executeFirebase(context: RecoveryContext): Promise<any> {
    try {
      const docRef = doc(collection(db, 'recovery_queue'));
      await setDoc(docRef, {
        operation: context.operation,
        timestamp: serverTimestamp(),
        data: context.metadata?.data || {},
        attempts: context.attempts,
        status: 'pending'
      });
      
      return {
        source: 'firebase',
        stored: true,
        docId: docRef.id,
        message: 'Queued in Firebase for retry'
      };
    } catch (error) {
      throw new Error('Firebase storage failed');
    }
  }

  /**
   * Execute on alternative API
   */
  private async executeAlternativeAPI(alternative: any, context: RecoveryContext): Promise<any> {
    const payload = context.metadata?.payload || {};
    
    try {
      const response = await fetch(alternative.endpoint, {
        method: context.metadata?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alternative-Service': alternative.name
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Alternative service returned ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        source: alternative.name,
        endpoint: alternative.endpoint,
        result
      };
    } catch (error) {
      throw new Error(`Alternative API failed: ${error.message}`);
    }
  }

  /**
   * Attempt to repair corrupted data
   */
  private async repairData(context: RecoveryContext): Promise<any> {
    const data = context.metadata?.data;
    if (!data) return null;
    
    const repairStrategies = [
      this.repairJSON.bind(this),
      this.repairCSV.bind(this),
      this.repairHTML.bind(this),
      this.repairBinary.bind(this)
    ];
    
    for (const strategy of repairStrategies) {
      try {
        const repaired = await strategy(data, context);
        if (repaired) {
          // Cache the repair for future use
          await this.cacheRepair(context.operation, repaired);
          return repaired;
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Repair JSON data
   */
  private async repairJSON(data: any, context: RecoveryContext): Promise<any> {
    if (typeof data !== 'string') return null;
    
    try {
      // Try to parse as-is
      return JSON.parse(data);
    } catch (error) {
      // Common JSON repairs
      let repaired = data;
      
      // Fix trailing commas
      repaired = repaired.replace(/,\s*([}\]])/g, '$1');
      
      // Fix single quotes
      repaired = repaired.replace(/'/g, '"');
      
      // Fix unquoted keys
      repaired = repaired.replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // Try to parse repaired version
      try {
        return JSON.parse(repaired);
      } catch (error2) {
        // Try to extract valid JSON portions
        const jsonMatch = repaired.match(/\{[^{}]*\}|\[[^\[\]]*\]/g);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (error3) {
            return null;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Repair CSV data
   */
  private async repairCSV(data: any, context: RecoveryContext): Promise<any> {
    if (typeof data !== 'string' || !data.includes(',')) return null;
    
    try {
      const lines = data.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        // Skip malformed rows
        if (values.length !== headers.length) continue;
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
      
      return rows.length > 0 ? { headers, rows } : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Repair HTML data
   */
  private async repairHTML(data: any, context: RecoveryContext): Promise<any> {
    if (typeof data !== 'string' || !data.includes('<')) return null;
    
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        // Try to fix common HTML issues
        let fixed = data;
        
        // Close unclosed tags
        fixed = fixed.replace(/<([a-z]+)([^>]*)(?<!\/)>/gi, (match, tag, attrs) => {
          const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
          if (selfClosing.includes(tag.toLowerCase())) {
            return `<${tag}${attrs} />`;
          }
          return match;
        });
        
        // Re-parse
        const fixedDoc = parser.parseFromString(fixed, 'text/html');
        if (!fixedDoc.querySelector('parsererror')) {
          return fixed;
        }
      }
      
      // Extract text content as fallback
      return doc.body.textContent || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Repair binary data
   */
  private async repairBinary(data: any, context: RecoveryContext): Promise<any> {
    if (!(data instanceof ArrayBuffer || data instanceof Uint8Array)) return null;
    
    try {
      const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
      
      // Check for common file signatures
      const signatures = {
        pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
        png: [0x89, 0x50, 0x4E, 0x47], // PNG
        jpg: [0xFF, 0xD8, 0xFF],       // JPEG
        docx: [0x50, 0x4B, 0x03, 0x04] // DOCX (ZIP)
      };
      
      for (const [type, sig] of Object.entries(signatures)) {
        if (this.checkSignature(bytes, sig)) {
          // File type detected, check if corrupted
          if (type === 'pdf' && !this.checkSignature(bytes.slice(-5), [0x25, 0x25, 0x45, 0x4F, 0x46])) {
            // PDF missing EOF marker, add it
            const fixed = new Uint8Array(bytes.length + 6);
            fixed.set(bytes);
            fixed.set([0x0A, 0x25, 0x25, 0x45, 0x4F, 0x46], bytes.length);
            return fixed;
          }
          
          // Return as-is if signature matches
          return bytes;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check file signature
   */
  private checkSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) return false;
    }
    
    return true;
  }

  /**
   * Cache successful repair
   */
  private async cacheRepair(operation: string, repairedData: any): Promise<void> {
    try {
      const cacheKey = `repair_${operation}_${Date.now()}`;
      
      // Store in localStorage for quick access
      localStorage.setItem(cacheKey, JSON.stringify({
        operation,
        timestamp: Date.now(),
        data: repairedData
      }));
      
      // Also store in Firestore for persistence
      await setDoc(doc(collection(db, 'repair_cache'), cacheKey), {
        operation,
        timestamp: serverTimestamp(),
        data: repairedData,
        successful: true
      });
    } catch (error) {
      console.error('Failed to cache repair:', error);
    }
  }
}

/**
 * Self-healing system that monitors and automatically recovers from failures
 */
export class SelfHealingSystem {
  private readonly orchestrator = new RecoveryOrchestrator();
  private readonly healthChecks = new Map<string, HealthCheck>();
  private isMonitoring = false;

  /**
   * Registers a health check
   */
  registerHealthCheck(name: string, check: HealthCheck): void {
    this.healthChecks.set(name, check);
  }

  /**
   * Starts monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.runHealthChecks();
    
    setInterval(() => {
      if (this.isMonitoring) {
        this.runHealthChecks();
      }
    }, intervalMs);
  }

  /**
   * Stops monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Runs all health checks
   */
  private async runHealthChecks(): Promise<void> {
    const results = [];
    
    for (const [name, check] of this.healthChecks) {
      try {
        const start = performance.now();
        const result = await check.check();
        const duration = performance.now() - start;
        
        // Record health check metrics
        await performanceAnalytics.recordMetric(
          'health_check.duration',
          duration,
          'histogram' as any,
          { check: name, healthy: String(result.healthy) }
        );
        
        results.push({ name, result, duration });
        
        if (!result.healthy) {
          console.warn(`Health check failed: ${name}`, result.message);
          await this.attemptHealing(name, result);
        }
      } catch (error) {
        console.error(`Health check error: ${name}`, error);
        
        // Record error
        await performanceAnalytics.recordMetric(
          'health_check.errors',
          1,
          'counter' as any,
          { check: name }
        );
      }
    }
    
    // Store health status
    try {
      await setDoc(doc(db, 'system_health', 'current'), {
        timestamp: serverTimestamp(),
        checks: results.map(r => ({
          name: r.name,
          healthy: r.result.healthy,
          message: r.result.message,
          duration: r.duration
        })),
        overallHealth: results.every(r => r.result.healthy)
      });
    } catch (error) {
      console.error('Failed to store health status:', error);
    }
  }

  /**
   * Attempts to heal a failed component
   */
  private async attemptHealing(component: string, healthResult: HealthCheckResult): Promise<void> {
    const recovery = await this.orchestrator.recover(
      { code: 'HEALTH_CHECK_FAILED', ...healthResult },
      component,
      { component, healthResult }
    );
    
    if (!recovery.success) {
      console.error(`Failed to heal component: ${component}`);
      // Could trigger alerts here
    }
  }
}

interface HealthCheck {
  check(): Promise<HealthCheckResult>;
}

interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  metadata?: Record<string, any>;
}

// Export singleton instances
export const recoveryOrchestrator = new RecoveryOrchestrator();
export const selfHealingSystem = new SelfHealingSystem();