/**
 * Test Firestore connection endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { testFirestoreConnection } from '@/lib/core/auth/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting Firestore connection test...');
    
    const result = await testFirestoreConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Firestore connection successful',
        details: result.details
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Firestore connection failed',
        error: result.error,
        details: result.details
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}