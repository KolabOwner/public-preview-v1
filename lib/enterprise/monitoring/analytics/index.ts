/**
 * Firebase Performance Analytics
 * Collects, stores, and analyzes performance metrics using Firestore
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { metrics, Metric, MetricType } from '../metrics';

export interface PerformanceMetric {
  id?: string;
  name: string;
  value: number;
  type: MetricType;
  tags?: Record<string, string>;
  timestamp: Timestamp;
  aggregation?: {
    min?: number;
    max?: number;
    avg?: number;
    count?: number;
    sum?: number;
    p50?: number;
    p95?: number;
    p99?: number;
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    environment?: string;
    version?: string;
  };
}

export interface PerformanceReport {
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    [key: string]: {
      current: number;
      previous?: number;
      change?: number;
      trend?: 'up' | 'down' | 'stable';
      percentiles?: Record<string, number>;
    };
  };
  insights: string[];
  recommendations: string[];
}

export class PerformanceAnalytics {
  private readonly COLLECTION_NAME = 'performance_metrics';
  private readonly BATCH_SIZE = 500;
  private metricsBuffer: PerformanceMetric[] = [];
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private sessionId = this.generateSessionId();

  constructor() {
    this.startFlushTimer();
    this.setupMetricsExporter();
  }

  /**
   * Records a performance metric
   */
  async recordMetric(
    name: string, 
    value: number, 
    type: MetricType = MetricType.GAUGE,
    tags?: Record<string, string>
  ): Promise<void> {
    const metric: PerformanceMetric = {
      name,
      value,
      type,
      tags,
      timestamp: Timestamp.now(),
      metadata: {
        sessionId: this.sessionId,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version
      }
    };

    this.metricsBuffer.push(metric);

    // Flush if buffer is getting large
    if (this.metricsBuffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Records a timing metric with automatic calculation
   */
  startTimer(name: string, tags?: Record<string, string>): () => Promise<void> {
    const start = performance.now();
    
    return async () => {
      const duration = performance.now() - start;
      await this.recordMetric(name, duration, MetricType.HISTOGRAM, {
        ...tags,
        unit: 'milliseconds'
      });
    };
  }

  /**
   * Records web vitals metrics
   */
  async recordWebVitals(vitals: {
    FCP?: number;  // First Contentful Paint
    LCP?: number;  // Largest Contentful Paint
    FID?: number;  // First Input Delay
    CLS?: number;  // Cumulative Layout Shift
    TTFB?: number; // Time to First Byte
  }): Promise<void> {
    const vitalMetrics = [
      { name: 'web_vitals.fcp', value: vitals.FCP, threshold: 1800 },
      { name: 'web_vitals.lcp', value: vitals.LCP, threshold: 2500 },
      { name: 'web_vitals.fid', value: vitals.FID, threshold: 100 },
      { name: 'web_vitals.cls', value: vitals.CLS, threshold: 0.1 },
      { name: 'web_vitals.ttfb', value: vitals.TTFB, threshold: 800 }
    ];

    for (const { name, value, threshold } of vitalMetrics) {
      if (value !== undefined) {
        await this.recordMetric(name, value, MetricType.GAUGE, {
          status: value <= threshold ? 'good' : 'needs-improvement'
        });
      }
    }
  }

  /**
   * Records resource loading metrics
   */
  async recordResourceTiming(resource: {
    name: string;
    type: string;
    duration: number;
    size?: number;
    cached?: boolean;
  }): Promise<void> {
    await this.recordMetric('resource.load_time', resource.duration, MetricType.HISTOGRAM, {
      resource: resource.name,
      type: resource.type,
      cached: String(resource.cached || false)
    });

    if (resource.size) {
      await this.recordMetric('resource.size', resource.size, MetricType.GAUGE, {
        resource: resource.name,
        type: resource.type
      });
    }
  }

  /**
   * Records API call metrics
   */
  async recordApiCall(api: {
    endpoint: string;
    method: string;
    duration: number;
    status: number;
    error?: boolean;
  }): Promise<void> {
    await this.recordMetric('api.response_time', api.duration, MetricType.HISTOGRAM, {
      endpoint: api.endpoint,
      method: api.method,
      status: String(api.status),
      error: String(api.error || false)
    });

    // Track error rate
    if (api.error) {
      await this.recordMetric('api.errors', 1, MetricType.COUNTER, {
        endpoint: api.endpoint,
        method: api.method,
        status: String(api.status)
      });
    }
  }

  /**
   * Records memory usage
   */
  async recordMemoryUsage(): Promise<void> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      await this.recordMetric('browser.memory.used', memory.usedJSHeapSize, MetricType.GAUGE);
      await this.recordMetric('browser.memory.total', memory.totalJSHeapSize, MetricType.GAUGE);
      await this.recordMetric('browser.memory.limit', memory.jsHeapSizeLimit, MetricType.GAUGE);
    }
  }

  /**
   * Flushes metrics buffer to Firestore
   */
  async flush(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const batch = writeBatch(db);
    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      // Process metrics and calculate aggregations
      const aggregatedMetrics = this.aggregateMetrics(metricsToFlush);

      // Write to Firestore
      for (const metric of aggregatedMetrics) {
        const docRef = doc(collection(db, this.COLLECTION_NAME));
        batch.set(docRef, {
          ...metric,
          timestamp: metric.timestamp || serverTimestamp()
        });
      }

      await batch.commit();
      console.log(`Flushed ${aggregatedMetrics.length} metrics to Firestore`);

    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Put metrics back in buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Aggregates metrics before storing
   */
  private aggregateMetrics(metrics: PerformanceMetric[]): PerformanceMetric[] {
    const aggregated: Map<string, PerformanceMetric> = new Map();

    for (const metric of metrics) {
      const key = this.getMetricKey(metric);
      
      if (metric.type === MetricType.HISTOGRAM || metric.type === MetricType.SUMMARY) {
        // Aggregate histogram/summary metrics
        if (!aggregated.has(key)) {
          aggregated.set(key, {
            ...metric,
            aggregation: {
              min: metric.value,
              max: metric.value,
              sum: metric.value,
              count: 1,
              avg: metric.value
            }
          });
        } else {
          const existing = aggregated.get(key)!;
          existing.aggregation!.min = Math.min(existing.aggregation!.min!, metric.value);
          existing.aggregation!.max = Math.max(existing.aggregation!.max!, metric.value);
          existing.aggregation!.sum! += metric.value;
          existing.aggregation!.count! += 1;
          existing.aggregation!.avg = existing.aggregation!.sum! / existing.aggregation!.count!;
        }
      } else if (metric.type === MetricType.COUNTER) {
        // Sum counter values
        if (!aggregated.has(key)) {
          aggregated.set(key, metric);
        } else {
          aggregated.get(key)!.value += metric.value;
        }
      } else {
        // For gauges, keep the latest value
        aggregated.set(key, metric);
      }
    }

    return Array.from(aggregated.values());
  }

  /**
   * Queries metrics from Firestore
   */
  async queryMetrics(options: {
    name?: string;
    startTime?: Date;
    endTime?: Date;
    tags?: Record<string, string>;
    limit?: number;
  } = {}): Promise<PerformanceMetric[]> {
    let q = query(collection(db, this.COLLECTION_NAME));

    if (options.name) {
      q = query(q, where('name', '==', options.name));
    }

    if (options.startTime) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(options.startTime)));
    }

    if (options.endTime) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(options.endTime)));
    }

    // Add tag filters
    if (options.tags) {
      for (const [key, value] of Object.entries(options.tags)) {
        q = query(q, where(`tags.${key}`, '==', value));
      }
    }

    q = query(q, orderBy('timestamp', 'desc'));

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as PerformanceMetric));
  }

  /**
   * Generates performance report
   */
  async generateReport(timeRange: { hours?: number; days?: number } = { hours: 24 }): Promise<PerformanceReport> {
    const end = new Date();
    const start = new Date();
    
    if (timeRange.hours) {
      start.setHours(start.getHours() - timeRange.hours);
    } else if (timeRange.days) {
      start.setDate(start.getDate() - timeRange.days);
    }

    // Query metrics
    const currentMetrics = await this.queryMetrics({
      startTime: start,
      endTime: end
    });

    // Query previous period for comparison
    const previousStart = new Date(start);
    const previousEnd = new Date(start);
    previousStart.setTime(previousStart.getTime() - (end.getTime() - start.getTime()));
    
    const previousMetrics = await this.queryMetrics({
      startTime: previousStart,
      endTime: previousEnd
    });

    // Process metrics into report
    const report: PerformanceReport = {
      timeRange: { start, end },
      metrics: {},
      insights: [],
      recommendations: []
    };

    // Group metrics by name
    const currentByName = this.groupMetricsByName(currentMetrics);
    const previousByName = this.groupMetricsByName(previousMetrics);

    // Calculate statistics for each metric
    for (const [name, metrics] of currentByName.entries()) {
      const current = this.calculateMetricStats(metrics);
      const previous = previousByName.has(name) 
        ? this.calculateMetricStats(previousByName.get(name)!)
        : undefined;

      const change = previous ? ((current.avg - previous.avg) / previous.avg) * 100 : 0;
      
      report.metrics[name] = {
        current: current.avg,
        previous: previous?.avg,
        change,
        trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
        percentiles: current.percentiles
      };
    }

    // Generate insights
    report.insights = this.generateInsights(report.metrics);
    report.recommendations = this.generateRecommendations(report.metrics);

    return report;
  }

  /**
   * Groups metrics by name
   */
  private groupMetricsByName(metrics: PerformanceMetric[]): Map<string, PerformanceMetric[]> {
    const grouped = new Map<string, PerformanceMetric[]>();
    
    for (const metric of metrics) {
      if (!grouped.has(metric.name)) {
        grouped.set(metric.name, []);
      }
      grouped.get(metric.name)!.push(metric);
    }
    
    return grouped;
  }

  /**
   * Calculates statistics for a set of metrics
   */
  private calculateMetricStats(metrics: PerformanceMetric[]): {
    avg: number;
    min: number;
    max: number;
    percentiles: Record<string, number>;
  } {
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: values[0],
      max: values[values.length - 1],
      percentiles: {
        p50: values[Math.floor(values.length * 0.5)],
        p95: values[Math.floor(values.length * 0.95)],
        p99: values[Math.floor(values.length * 0.99)]
      }
    };
  }

  /**
   * Generates insights from metrics
   */
  private generateInsights(metrics: Record<string, any>): string[] {
    const insights: string[] = [];

    // Check web vitals
    if (metrics['web_vitals.lcp']?.current > 2500) {
      insights.push('Largest Contentful Paint is above recommended threshold (2.5s)');
    }
    
    if (metrics['web_vitals.fid']?.current > 100) {
      insights.push('First Input Delay exceeds 100ms, affecting interactivity');
    }

    // Check API performance
    if (metrics['api.response_time']?.percentiles?.p95 > 1000) {
      insights.push('95th percentile API response time exceeds 1 second');
    }

    // Check error rates
    if (metrics['api.errors']?.trend === 'up') {
      insights.push('API error rate is trending upward');
    }

    // Check memory usage
    const memoryUsage = metrics['browser.memory.used']?.current;
    const memoryLimit = metrics['browser.memory.limit']?.current;
    if (memoryUsage && memoryLimit && memoryUsage / memoryLimit > 0.8) {
      insights.push('Memory usage is above 80% of limit');
    }

    return insights;
  }

  /**
   * Generates recommendations based on metrics
   */
  private generateRecommendations(metrics: Record<string, any>): string[] {
    const recommendations: string[] = [];

    // LCP recommendations
    if (metrics['web_vitals.lcp']?.current > 2500) {
      recommendations.push('Optimize largest content element loading: compress images, use CDN, implement lazy loading');
    }

    // FID recommendations
    if (metrics['web_vitals.fid']?.current > 100) {
      recommendations.push('Reduce JavaScript execution time: code split, defer non-critical JS, optimize event handlers');
    }

    // API recommendations
    if (metrics['api.response_time']?.percentiles?.p95 > 1000) {
      recommendations.push('Optimize API performance: implement caching, reduce payload size, consider pagination');
    }

    // Memory recommendations
    const memoryUsage = metrics['browser.memory.used']?.current;
    const memoryLimit = metrics['browser.memory.limit']?.current;
    if (memoryUsage && memoryLimit && memoryUsage / memoryLimit > 0.8) {
      recommendations.push('Reduce memory usage: remove memory leaks, optimize data structures, implement cleanup');
    }

    return recommendations;
  }

  /**
   * Sets up metrics exporter integration
   */
  private setupMetricsExporter(): void {
    // Add Firebase exporter to metrics collector
    metrics.addExporter({
      name: 'firebase-analytics',
      export: async (metricsData: Metric[]) => {
        for (const metric of metricsData) {
          await this.recordMetric(
            metric.name,
            metric.value,
            metric.type,
            metric.tags
          );
        }
      }
    });
  }

  /**
   * Starts flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stops flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Final flush
    this.flush();
  }

  /**
   * Gets unique key for metric
   */
  private getMetricKey(metric: PerformanceMetric): string {
    const tags = metric.tags ? JSON.stringify(metric.tags) : '';
    return `${metric.name}:${metric.type}:${tags}`;
  }

  /**
   * Generates session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const performanceAnalytics = new PerformanceAnalytics();

// Auto-record web vitals if available
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  // Observe Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    performanceAnalytics.recordWebVitals({ LCP: lastEntry.renderTime || lastEntry.loadTime });
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // Observe First Input Delay
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      performanceAnalytics.recordWebVitals({ FID: entry.processingStart - entry.startTime });
    });
  }).observe({ entryTypes: ['first-input'] });

  // Observe Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
    performanceAnalytics.recordWebVitals({ CLS: clsValue });
  }).observe({ entryTypes: ['layout-shift'] });
}