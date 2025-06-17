/**
 * Cloud Functions for Storage Temporary Access
 * Handles signed URL generation and access control
 */

import { onCall } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { z } from 'zod';
import { FUNCTION_CONFIGS } from '../shared/config';
import { logger } from '../shared/monitoring';

const db = getFirestore();

// Validation schemas
const GenerateSignedUrlSchema = z.object({
  path: z.string().min(1),
  expiresIn: z.number().min(60).max(86400) // 1 minute to 24 hours
});

const AdvancedSignedUrlSchema = z.object({
  path: z.string().min(1),
  options: z.object({
    expiresIn: z.number().min(60).max(86400),
    allowedIPs: z.array(z.string()).optional(),
    maxDownloads: z.number().min(1).max(1000).optional(),
    requireAuth: z.boolean().optional()
  })
});

/**
 * Generate basic signed URL for temporary file access
 */
export const generateSignedStorageUrl = onCall(
  FUNCTION_CONFIGS.api,
  async (request) => {
    const { path, expiresIn } = GenerateSignedUrlSchema.parse(request.data);
    
    // Require authentication
    if (!request.auth) {
      throw new Error('Authentication required');
    }

    const userId = request.auth.uid;
    const bucket = getStorage().bucket();
    const file = bucket.file(path);

    try {
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Generate signed URL
      const expiresAt = new Date(Date.now() + (expiresIn * 1000));
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: expiresAt,
        contentType: 'application/octet-stream'
      });

      // Log access request
      await db.collection('storage_access_logs').add({
        userId,
        path,
        action: 'generate_signed_url',
        expiresAt: expiresAt.toISOString(),
        createdAt: FieldValue.serverTimestamp(),
        ip: request.rawRequest.ip
      });

      logger.info('Generated signed URL', {
        userId,
        path,
        expiresIn,
        expiresAt: expiresAt.toISOString()
      });

      return {
        url: signedUrl,
        expiresAt: expiresAt.toISOString()
      };

    } catch (error) {
      logger.error('Failed to generate signed URL', {
        userId,
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);

/**
 * Generate advanced signed URL with additional access controls
 */
export const generateAdvancedSignedUrl = onCall(
  FUNCTION_CONFIGS.api,
  async (request) => {
    const { path, options } = AdvancedSignedUrlSchema.parse(request.data);
    
    // Require authentication for advanced features
    if (!request.auth) {
      throw new Error('Authentication required');
    }

    const userId = request.auth.uid;
    const bucket = getStorage().bucket();
    const file = bucket.file(path);

    try {
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('File not found');
      }

      // Generate unique access token
      const accessToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (options.expiresIn * 1000));

      // Create access record in Firestore
      const accessRecord = {
        token: accessToken,
        userId,
        path,
        expiresAt: expiresAt.toISOString(),
        createdAt: FieldValue.serverTimestamp(),
        createdBy: userId,
        allowedIPs: options.allowedIPs || [],
        maxDownloads: options.maxDownloads || null,
        downloadCount: 0,
        requireAuth: options.requireAuth || false,
        active: true
      };

      await db.collection('temporary_access_tokens').doc(accessToken).set(accessRecord);

      // Generate signed URL with custom parameters
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: expiresAt,
        extensionHeaders: {
          'x-access-token': accessToken
        }
      });

      // Construct URL with access token
      const urlWithToken = `${signedUrl}&token=${accessToken}`;

      logger.info('Generated advanced signed URL', {
        userId,
        path,
        accessToken: accessToken.substring(0, 8) + '...',
        options
      });

      return {
        url: urlWithToken,
        expiresAt: expiresAt.toISOString(),
        accessToken
      };

    } catch (error) {
      logger.error('Failed to generate advanced signed URL', {
        userId,
        path,
        options,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);

/**
 * Track file downloads for access control
 */
export const trackFileDownload = onCall(
  { ...FUNCTION_CONFIGS.api, timeoutSeconds: 10 },
  async (request) => {
    const { path } = z.object({ path: z.string() }).parse(request.data);

    try {
      // Find active access token for this path
      const tokenQuery = await db.collection('temporary_access_tokens')
        .where('path', '==', path)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (tokenQuery.empty) {
        // No download tracking needed
        return { downloadCount: 0 };
      }

      const tokenDoc = tokenQuery.docs[0];
      const tokenData = tokenDoc.data();

      // Increment download count
      await tokenDoc.ref.update({
        downloadCount: FieldValue.increment(1),
        lastDownloadAt: FieldValue.serverTimestamp()
      });

      const newCount = tokenData.downloadCount + 1;

      // Check if max downloads reached
      if (tokenData.maxDownloads && newCount >= tokenData.maxDownloads) {
        await tokenDoc.ref.update({ active: false });
        logger.info('Max downloads reached, deactivating token', {
          token: tokenDoc.id.substring(0, 8) + '...',
          path,
          downloadCount: newCount
        });
      }

      return { downloadCount: newCount };

    } catch (error) {
      logger.error('Failed to track download', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);

/**
 * Validate temporary access token
 */
export const validateTemporaryAccess = onCall(
  { ...FUNCTION_CONFIGS.api, timeoutSeconds: 10 },
  async (request) => {
    const { token, ip } = z.object({
      token: z.string(),
      ip: z.string().optional()
    }).parse(request.data);

    try {
      const tokenDoc = await db.collection('temporary_access_tokens').doc(token).get();

      if (!tokenDoc.exists) {
        throw new Error('Invalid access token');
      }

      const tokenData = tokenDoc.data()!;

      // Check if token is active
      if (!tokenData.active) {
        throw new Error('Access token is no longer active');
      }

      // Check expiration
      const expiresAt = new Date(tokenData.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        await tokenDoc.ref.update({ active: false });
        throw new Error('Access token has expired');
      }

      // Check IP restrictions
      if (tokenData.allowedIPs.length > 0 && ip) {
        if (!tokenData.allowedIPs.includes(ip)) {
          throw new Error('Access denied from this IP address');
        }
      }

      // Check authentication requirement
      if (tokenData.requireAuth && !request.auth) {
        throw new Error('Authentication required');
      }

      // Check download limit
      if (tokenData.maxDownloads && tokenData.downloadCount >= tokenData.maxDownloads) {
        await tokenDoc.ref.update({ active: false });
        throw new Error('Download limit exceeded');
      }

      return {
        valid: true,
        path: tokenData.path,
        remainingDownloads: tokenData.maxDownloads 
          ? tokenData.maxDownloads - tokenData.downloadCount 
          : null
      };

    } catch (error) {
      logger.error('Access validation failed', {
        token: token.substring(0, 8) + '...',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);

/**
 * Clean up temporary access records
 */
export const cleanupTemporaryAccess = onCall(
  { ...FUNCTION_CONFIGS.api, timeoutSeconds: 30 },
  async (request) => {
    const { path } = z.object({ path: z.string() }).parse(request.data);

    // Require authentication
    if (!request.auth) {
      throw new Error('Authentication required');
    }

    try {
      // Find all tokens for this path
      const tokensQuery = await db.collection('temporary_access_tokens')
        .where('path', '==', path)
        .get();

      // Deactivate all tokens
      const batch = db.batch();
      tokensQuery.docs.forEach(doc => {
        batch.update(doc.ref, { 
          active: false,
          deactivatedAt: FieldValue.serverTimestamp(),
          deactivatedBy: request.auth!.uid
        });
      });

      await batch.commit();

      logger.info('Cleaned up temporary access records', {
        path,
        tokenCount: tokensQuery.size,
        userId: request.auth.uid
      });

      return { success: true, cleanedTokens: tokensQuery.size };

    } catch (error) {
      logger.error('Failed to cleanup temporary access', {
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
);