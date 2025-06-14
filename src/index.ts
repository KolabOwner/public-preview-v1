// src/index.ts
// Main entry point for the resume analysis service

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import parseRoute from './api/parse/route';
import validateRoute from './api/validate/route';
import statusRoute from './api/status/route';

// Create Express app
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON with increased limit for resume text

// Register routes
app.use('/api/parse', parseRoute);
app.use('/api/validate', validateRoute);
app.use('/api/status', statusRoute);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'Resume Analysis Service',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/parse - Parse resume text',
      '/api/validate - Validate RMS data',
      '/api/status - Check service status'
    ]
  });
});

// Start server - listen on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} (0.0.0.0)`);
  console.log(`Ollama host: ${process.env.OLLAMA_HOST || 'http://localhost:11434'}`);
  console.log(`Ollama model: ${process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct-q2_K'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: any) => {
  console.error('Unhandled rejection:', error.message);
  console.error(error.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error.message);
  console.error(error.stack);
  // Graceful shutdown on uncaught exceptions
  process.exit(1);
});