/**
 * reCAPTCHA Enterprise Assessment API Route
 * Handles server-side reCAPTCHA token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRecaptchaAssessment } from '@/lib/server/recaptcha-enterprise';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action, ...userData } = body;

    console.log('[API] reCAPTCHA assessment request:', {
      action,
      tokenPrefix: token?.substring(0, 20) + '...',
      userData: Object.keys(userData),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
    });

    // Validate required fields
    if (!token || !action) {
      console.error('[API] Missing required fields:', { hasToken: !!token, hasAction: !!action });
      return NextResponse.json(
        { error: 'Token and action are required' },
        { status: 400 }
      );
    }

    // Get environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

    console.log('[API] Environment variables check:', {
      hasProjectId: !!projectId,
      hasSiteKey: !!siteKey,
      projectId,
      siteKey,
    });

    if (!projectId || !siteKey) {
      console.error('[API] Missing reCAPTCHA Enterprise configuration:', {
        projectId,
        siteKey,
        allEnvVars: Object.keys(process.env).filter(key => 
          key.includes('RECAPTCHA') || key.includes('GOOGLE') || key.includes('FIREBASE')
        ),
      });
      return NextResponse.json(
        { error: 'reCAPTCHA configuration error' },
        { status: 500 }
      );
    }

    // Create assessment
    const assessment = await createRecaptchaAssessment(
      projectId,
      siteKey,
      token,
      action
    );

    // Log assessment for debugging (remove in production)
    console.log(`reCAPTCHA assessment for ${action}:`, {
      label: assessment.label,
      score: assessment.score,
      valid: assessment.valid,
      reason: assessment.reason
    });

    // Return assessment result
    // Note: In production, you should NOT return the full assessment to client
    // This is for demo/debugging purposes
    return NextResponse.json({
      success: assessment.label === 'Not Bad',
      assessment: {
        label: assessment.label,
        score: assessment.score,
        valid: assessment.valid,
        reason: assessment.reason
      }
    });

  } catch (error) {
    console.error('reCAPTCHA assessment error:', error);
    return NextResponse.json(
      { error: 'Assessment failed' },
      { status: 500 }
    );
  }
}