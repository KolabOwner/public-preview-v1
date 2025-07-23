// lib/server/recaptcha.ts

/**
 * Verify reCAPTCHA token on the server
 */
export async function verifyRecaptcha(token: string, action?: string): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  errorCodes?: string[];
}> {
  if (!token) {
    return { success: false, errorCodes: ['missing-token'] };
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured');
    // In a real-world scenario, you might want to fail open or closed depending on your security posture.
    // Failing open means allowing the action if reCAPTCHA is not configured.
    // Failing closed means blocking the action if reCAPTCHA is not configured.
    // For this example, we will fail open for server-side misconfiguration.
    return { success: true };
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }).toString(),
    });

    const data = await response.json();

    // For v3, check the score threshold
    if (data.success && data.score !== undefined) {
      // Adjust threshold as needed (0.5 is recommended default)
      const threshold = 0.5;
      data.success = data.score >= threshold;
    }

    // Verify action matches if provided
    if (action && data.action && data.action !== action) {
      data.success = false;
      data.errorCodes = data.errorCodes || [];
      data.errorCodes.push('action-mismatch');
    }

    return {
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      errorCodes: data['error-codes'],
    };
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return { success: false, errorCodes: ['verification-failed'] };
  }
}