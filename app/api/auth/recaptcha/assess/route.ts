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

    // Validate required fields
    if (!token || !action) {
      return NextResponse.json(
        { error: 'Token and action are required' },
        { status: 400 }
      );
    }

    // Get environment variables
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

    if (!projectId || !siteKey) {
      console.error('Missing reCAPTCHA Enterprise configuration');
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