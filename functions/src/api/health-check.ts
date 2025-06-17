/**
 * Health Check API
 * Provides system health and status information
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { FUNCTION_CONFIGS } from '../shared/config';

const db = getFirestore();
const storage = getStorage();

/**
 * Health check endpoint for monitoring
 */
export const healthCheck = onRequest({
  ...FUNCTION_CONFIGS.api,
  timeoutSeconds: 10
}, async (req, res) => {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  
  try {
    // Check Firestore connectivity
    const firestoreStart = Date.now();
    try {
      await db.collection('health_check').doc('test').set({
        timestamp: new Date(),
        source: 'cloud_function'
      });
      checks.firestore = {
        status: 'healthy',
        responseTime: Date.now() - firestoreStart
      };
    } catch (error) {
      checks.firestore = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - firestoreStart
      };
    }
    
    // Check Storage connectivity
    const storageStart = Date.now();
    try {
      const bucket = storage.bucket();
      const [exists] = await bucket.exists();
      checks.storage = {
        status: exists ? 'healthy' : 'unhealthy',
        bucket: bucket.name,
        responseTime: Date.now() - storageStart
      };
    } catch (error) {
      checks.storage = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - storageStart
      };
    }
    
    // Check job queue status
    const queueStart = Date.now();
    try {
      const pendingJobs = await db.collection('job_queue')
        .where('status', '==', 'pending')
        .count()
        .get();
      
      const processingJobs = await db.collection('job_queue')
        .where('status', '==', 'processing')
        .count()
        .get();
      
      checks.jobQueue = {
        status: 'healthy',
        pending: pendingJobs.data().count,
        processing: processingJobs.data().count,
        responseTime: Date.now() - queueStart
      };
    } catch (error) {
      checks.jobQueue = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - queueStart
      };
    }
    
    // Overall health status
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    const totalResponseTime = Date.now() - startTime;
    
    const response = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.K_REVISION || 'local',
      environment: process.env.NODE_ENV || 'development',
      region: process.env.FUNCTION_REGION || 'us-central1',
      checks,
      responseTime: totalResponseTime
    };
    
    res.status(allHealthy ? 200 : 503).json(response);
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      responseTime: Date.now() - startTime
    });
  }
});

/**
 * Get system metrics
 */
export const getMetrics = onRequest({
  ...FUNCTION_CONFIGS.api,
  timeoutSeconds: 30
}, async (req, res) => {
  try {
    const period = req.query.period as string || '1h';
    const now = new Date();
    let startTime = new Date();
    
    // Calculate start time based on period
    switch (period) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      default:
        startTime.setHours(now.getHours() - 1);
    }
    
    // Get job metrics
    const jobMetrics = await db.collection('job_queue')
      .where('createdAt', '>=', startTime)
      .get();
    
    const metrics = {
      jobs: {
        total: jobMetrics.size,
        completed: jobMetrics.docs.filter(doc => doc.data().status === 'completed').length,
        failed: jobMetrics.docs.filter(doc => doc.data().status === 'failed').length,
        pending: jobMetrics.docs.filter(doc => doc.data().status === 'pending').length,
        processing: jobMetrics.docs.filter(doc => doc.data().status === 'processing').length
      },
      performance: {
        avgProcessingTime: 0,
        p95ProcessingTime: 0,
        p99ProcessingTime: 0
      }
    };
    
    // Calculate processing times
    const processingTimes = jobMetrics.docs
      .filter(doc => doc.data().status === 'completed' && doc.data().processingTime)
      .map(doc => doc.data().processingTime)
      .sort((a, b) => a - b);
    
    if (processingTimes.length > 0) {
      metrics.performance.avgProcessingTime = 
        processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      
      const p95Index = Math.floor(processingTimes.length * 0.95);
      metrics.performance.p95ProcessingTime = processingTimes[p95Index];
      
      const p99Index = Math.floor(processingTimes.length * 0.99);
      metrics.performance.p99ProcessingTime = processingTimes[p99Index];
    }
    
    res.json({
      status: 'success',
      period,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      metrics
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});