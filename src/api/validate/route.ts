// src/api/validate/route.ts
// API route for validating RMS data

import express, { Request, Response } from 'express';
import { validateRMSData } from '../../lib/schema';
import { RMSParser } from '../../lib/parser';

// Create router
const router = express.Router();

// Initialize parser
let parser: RMSParser;

function getParser() {
  if (!parser) {
    parser = new RMSParser();
  }
  return parser;
}

// Validate RMS data
router.post('/', async (req: Request, res: Response) => {
  console.log('=== Validate RMS Data API Called ===');
  const startTime = Date.now();

  try {
    const { data, attemptFix = true } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'No RMS data provided'
      });
    }

    // Basic validation with schema
    const validationResult = validateRMSData(data);

    // If data is valid or we don't want to fix, return results directly
    if (validationResult.success || !attemptFix) {
      return res.json({
        success: validationResult.success,
        errors: validationResult.error ? validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })) : undefined,
        data: validationResult.data,
        validationTime: Date.now() - startTime
      });
    }

    // If data is invalid and attemptFix is true, try to fix the issues
    const parser = getParser();
    const fixResult = await parser.validateAndFix(data);

    return res.json({
      success: fixResult.isValid,
      suggestions: fixResult.suggestions,
      data: fixResult.fixedData,
      validationTime: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('Validation endpoint error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate RMS data',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      validationTime: Date.now() - startTime
    });
  }
});

export default router;