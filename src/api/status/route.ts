// src/api/status/route.ts
// API route for checking the status of the service

import express, { Request, Response } from 'express';

// Use native fetch instead of node-fetch
const fetch = global.fetch;

// Create router
const router = express.Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test Ollama connection
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    const ollamaResponse = await fetch(`${ollamaHost}/api/tags`);

    if (!ollamaResponse.ok) {
      throw new Error('Ollama not responding');
    }

    // Define type for Ollama API response
    interface OllamaTagsResponse {
      models: Array<{
        name: string;
        modified_at: string;
        size: number;
        digest: string;
        details: {
          format: string;
          family: string;
          families: string[];
          parameter_size: string;
          quantization_level: string;
        };
      }>;
    }

    const models = await ollamaResponse.json() as OllamaTagsResponse;
    const targetModel = process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K';
    const hasModel = models.models?.some((m) => m.name === targetModel);

    return res.json({
      status: 'healthy',
      ollama: {
        connected: true,
        models: models.models?.map((m) => m.name) || [],
        targetModel,
        hasTargetModel: hasModel
      },
      firebase: {
        configured: !!process.env.FIREBASE_PROJECT_ID
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      suggestion: 'Check that Ollama is running and the model is downloaded',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;