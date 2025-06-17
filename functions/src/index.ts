/**
 * Cloud Functions Entry Point
 * Production-ready enterprise resume processing functions
 */

// Initialize Firebase Admin
import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin with default credentials
initializeApp();

// Export all functions
export * from './api';
export * from './workers';
export * from './triggers';