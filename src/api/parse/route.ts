// src/api/parse/route.ts
// API route for parsing resumes with the RMS Parser

import express, { Request, Response } from 'express';
import { RMSParser } from '../../lib/parser';
import { FirebaseStorage } from '../../adapters/firebase/storage';

// Create router
const router = express.Router();

// Initialize services
let parser: RMSParser;
let firebase: FirebaseStorage | null = null;

// Initialize parser
function getParser() {
  if (!parser) {
    parser = new RMSParser({
      ollamaHost: process.env.OLLAMA_HOST,
      model: process.env.OLLAMA_MODEL,
      maxAttempts: 3,
      timeout: 180000 // 3 minutes
    });
  }
  return parser;
}

// Initialize Firebase (optional)
function getFirebase() {
  if (!firebase && process.env.FIREBASE_PROJECT_ID) {
    try {
      firebase = new FirebaseStorage();
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }
  return firebase;
}

// Generate a random user ID for Firebase storage
function generateRandomUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// Parse resume endpoint
router.post('/', async (req: Request, res: Response) => {
  console.log('=== Parse Resume API Called ===');
  const startTime = Date.now();

  try {
    // Parse request body
    const { resumeText, userId, saveToFirebase = true } = req.body;

    // Generate random userId if not provided
    const effectiveUserId = userId || generateRandomUserId();

    console.log(`Request details:
      - Text length: ${resumeText?.length || 0} characters
      - User ID: ${effectiveUserId}
      - Save to Firebase: ${saveToFirebase}
      - Model: ${process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K'}
    `);

    // Validate input
    if (!resumeText) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required'
      });
    }

    if (resumeText.length > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Resume text too long. Maximum 100,000 characters.'
      });
    }

    // Parse resume using RMSParser
    const parser = getParser();
    const result = await parser.parseResume(resumeText);

    const parseTime = Date.now() - startTime;
    console.log(`Parse completed in ${parseTime}ms`);

    // Always store in Firebase if parsing was successful
    let firebaseStorageResult = false;
    if (result.success && result.data && saveToFirebase) {
      const firebase = getFirebase();
      if (firebase) {
        try {
          await firebase.storeResumeMetadata(effectiveUserId, result.data);
          console.log(`Stored resume metadata for user: ${effectiveUserId}`);
          firebaseStorageResult = true;
        } catch (error) {
          console.error('Firebase storage error:', error);
          // Don't fail the request if storage fails
        }
      } else {
        console.log('Firebase not configured, skipping storage');
      }
    }

    // Add parsing metadata
    const response = {
      ...result,
      parseTime,
      model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K',
      timestamp: new Date().toISOString(),
      firebaseStorage: {
        saved: firebaseStorageResult,
        userId: effectiveUserId
      }
    };

    return res.json(response);

  } catch (error: any) {
    console.error('Parse endpoint error:', error);
    const elapsed = Date.now() - startTime;

    // Handle specific error types
    if (error.name === 'AbortError' || elapsed > 240000) {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - parsing took too long',
        suggestion: 'Try with a shorter resume or ensure Ollama is running properly',
        elapsed
      });
    }

    if (error.message?.includes('Cannot connect to Ollama')) {
      return res.status(503).json({
        success: false,
        error: 'Cannot connect to Ollama',
        suggestion: 'Make sure Ollama is running: ollama serve',
        debug: {
          ollamaHost: process.env.OLLAMA_HOST || 'http://localhost:11434',
          model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K'
        }
      });
    }

    if (error.message?.includes('Model') && error.message?.includes('not found')) {
      return res.status(503).json({
        success: false,
        error: error.message,
        suggestion: `Run: ollama pull ${process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K'}`
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse resume',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      elapsed
    });
  }
});

export default router;