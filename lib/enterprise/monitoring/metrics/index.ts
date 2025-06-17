/**
 * Performance Metrics Collection
 * Collects, aggregates, and exports performance metrics
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  type: MetricType;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

export interface MetricOptions {
  tags?: Record<string, string>;
  buckets?: number[]; // For histograms
  percentiles?: number[]; // For summaries
  windowSize?: number; // For rate calculations
}

export interface MetricsExporter {
  name: string;
  export(metrics: Metric[]): Promise<void>;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics = new Map<string, any>();
  private exporters: MetricsExporter[] = [];
  private exportInterval = 60000; // 1 minute
  private exportTimer?: NodeJS.Timeout;

  private constructor() {
    this.startExportTimer();
  }

  static getInstance(): MetricsCollector {
    if (!this.instance) {
      this.instance = new MetricsCollector();
    }
    return this.instance;
  }

  /**
   * Adds a metrics exporter
   */
  addExporter(exporter: MetricsExporter): void {
    this.exporters.push(exporter);
  }

  /**
   * Increments a counter
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    const current = this.metrics.get(key) || { type: MetricType.COUNTER, value: 0, tags };
    current.value += value;
    this.metrics.set(key, current);
  }

  /**
   * Decrements a counter
   */
  decrement(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.increment(name, -value, tags);
  }

  /**
   * Sets a gauge value
   */
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getKey(name, tags);
    this.metrics.set(key, { type: MetricType.GAUGE, value, tags });
  }

  /**
   * Records a value in a histogram
   */
  histogram(name: string, value: number, options?: MetricOptions): void {
    const key = this.getKey(name, options?.tags);
    let histogram = this.metrics.get(key);
    
    if (!histogram) {
      histogram = {
        type: MetricType.HISTOGRAM,
        values: [],
        buckets: options?.buckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        tags: options?.tags
      };
      this.metrics.set(key, histogram);
    }
    
    histogram.values.push(value);
    
    // Keep only recent values (last 1000)
    if (histogram.values.length > 1000) {
      histogram.values = histogram.values.slice(-1000);
    }
  }

  /**
   * Records a timing
   */
  timing(name: string, duration: number, tags?: Record<string, string>): void {
    this.histogram(name, duration, { tags });
  }

  /**
   * Starts a timer
   */
  startTimer(name: string, tags?: Record<string, string>): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.timing(name, duration, tags);
    };
  }

  /**
   * Records a summary
   */
  summary(name: string, value: number, options?: MetricOptions): void {
    const key = this.getKey(name, options?.tags);
    let summary = this.metrics.get(key);
    
    if (!summary) {
      summary = {
        type: MetricType.SUMMARY,
        values: [],
        percentiles: options?.percentiles || [0.5, 0.75, 0.95, 0.99],
        windowSize: options?.windowSize || 600000, // 10 minutes
        tags: options?.tags
      };
      this.metrics.set(key, summary);
    }
    
    const now = Date.now();
    summary.values.push({ value, timestamp: now });
    
    // Remove old values outside window
    summary.values = summary.values.filter(
      (v: any) => now - v.timestamp < summary.windowSize
    );
  }

  /**
   * Gets all metrics
   */
  getMetrics(): Metric[] {
    const metrics: Metric[] = [];
    const now = new Date();
    
    for (const [key, data] of this.metrics.entries()) {
      const [name] = key.split(':');
      
      switch (data.type) {
        case MetricType.COUNTER:
        case MetricType.GAUGE:
          metrics.push({
            name,
            value: data.value,
            timestamp: now,
            tags: data.tags,
            type: data.type
          });
          break;
          
        case MetricType.HISTOGRAM:
          const histogramMetrics = this.calculateHistogramMetrics(name, data);
          metrics.push(...histogramMetrics);
          break;
          
        case MetricType.SUMMARY:
          const summaryMetrics = this.calculateSummaryMetrics(name, data);
          metrics.push(...summaryMetrics);
          break;
      }
    }
    
    return metrics;
  }

  /**
   * Exports metrics to all exporters
   */
  async export(): Promise<void> {
    const metrics = this.getMetrics();
    
    await Promise.all(
      this.exporters.map(async exporter => {
        try {
          await exporter.export(metrics);
        } catch (error) {
          console.error(`Failed to export metrics to ${exporter.name}:`, error);
        }
      })
    );
    
    // Clear histograms and summaries after export
    for (const [key, data] of this.metrics.entries()) {
      if (data.type === MetricType.HISTOGRAM || data.type === MetricType.SUMMARY) {
        data.values = [];
      }
    }
  }

  /**
   * Calculates histogram metrics
   */
  private calculateHistogramMetrics(name: string, histogram: any): Metric[] {
    const metrics: Metric[] = [];
    const now = new Date();
    const values = histogram.values.sort((a: number, b: number) => a - b);
    
    if (values.length === 0) return metrics;
    
    // Count
    metrics.push({
      name: `${name}_count`,
      value: values.length,
      timestamp: now,
      tags: histogram.tags,
      type: MetricType.GAUGE
    });
    
    // Sum
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    metrics.push({
      name: `${name}_sum`,
      value: sum,
      timestamp: now,
      tags: histogram.tags,
      type: MetricType.GAUGE
    });
    
    // Buckets
    for (const bucket of histogram.buckets) {
      const count = values.filter((v: number) => v <= bucket).length;
      metrics.push({
        name: `${name}_bucket`,
        value: count,
        timestamp: now,
        tags: { ...histogram.tags, le: bucket.toString() },
        type: MetricType.GAUGE
      });
    }
    
    return metrics;
  }

  /**
   * Calculates summary metrics
   */
  private calculateSummaryMetrics(name: string, summary: any): Metric[] {
    const metrics: Metric[] = [];
    const now = new Date();
    const values = summary.values.map((v: any) => v.value).sort((a: number, b: number) => a - b);
    
    if (values.length === 0) return metrics;
    
    // Count
    metrics.push({
      name: `${name}_count`,
      value: values.length,
      timestamp: now,
      tags: summary.tags,
      type: MetricType.GAUGE
    });
    
    // Sum
    const sum = values.reduce((a: number, b: number) => a + b, 0);
    metrics.push({
      name: `${name}_sum`,
      value: sum,
      timestamp: now,
      tags: summary.tags,
      type: MetricType.GAUGE
    });
    
    // Percentiles
    for (const percentile of summary.percentiles) {
      const index = Math.ceil(percentile * values.length) - 1;
      metrics.push({
        name: `${name}_quantile`,
        value: values[index],
        timestamp: now,
        tags: { ...summary.tags, quantile: percentile.toString() },
        type: MetricType.GAUGE
      });
    }
    
    return metrics;
  }

  /**
   * Gets a unique key for a metric
   */
  private getKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }
    
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return `${name}:{${tagStr}}`;
  }

  /**
   * Starts the export timer
   */
  private startExportTimer(): void {
    this.exportTimer = setInterval(() => {
      this.export();
    }, this.exportInterval);
  }

  /**
   * Stops the export timer
   */
  stopExportTimer(): void {
    if (this.exportTimer) {
      clearInterval(this.exportTimer);
    }
  }
}

/**
 * Console metrics exporter
 */
export class ConsoleMetricsExporter implements MetricsExporter {
  name = 'console';

  async export(metrics: Metric[]): Promise<void> {
    console.log('=== Metrics Export ===');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Total metrics: ${metrics.length}`);
    
    for (const metric of metrics) {
      const tags = metric.tags ? ` {${Object.entries(metric.tags).map(([k, v]) => `${k}="${v}"`).join(', ')}}` : '';
      console.log(`  ${metric.name}${tags}: ${metric.value}`);
    }
  }
}

/**
 * Prometheus metrics exporter
 */
export class PrometheusExporter implements MetricsExporter {
  name = 'prometheus';
  
  constructor(private endpoint: string) {}

  async export(metrics: Metric[]): Promise<void> {
    const lines: string[] = [];
    
    for (const metric of metrics) {
      const labels = metric.tags 
        ? `{${Object.entries(metric.tags).map(([k, v]) => `${k}="${v}"`).join(',')}}`
        : '';
      
      lines.push(`${metric.name}${labels} ${metric.value} ${metric.timestamp.getTime()}`);
    }
    
    // In real implementation, would POST to Prometheus pushgateway
    // await fetch(this.endpoint, {
    //   method: 'POST',
    //   body: lines.join('\n'),
    //   headers: { 'Content-Type': 'text/plain' }
    // });
  }
}

// Export singleton metrics instance
export const metrics = MetricsCollector.getInstance();

// Add default console exporter in development
if (process.env.NODE_ENV !== 'production') {
  metrics.addExporter(new ConsoleMetricsExporter());
}