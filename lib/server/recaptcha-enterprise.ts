/**
 * Google Cloud reCAPTCHA Enterprise integration
 * Based on: https://cloud.google.com/recaptcha-enterprise/docs/create-assessment
 */

import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

// Sample threshold score for classification of bad / not bad action
const SAMPLE_THRESHOLD_SCORE = 0.5;

// Error messages
const RecaptchaError = {
  INVALID_TOKEN: 'Invalid token',
  ACTION_MISMATCH: 'Action mismatch',
  SCORE_LESS_THAN_THRESHOLD: 'Returned score less than threshold set',
  ASSESSMENT_FAILED: 'Assessment failed',
} as const;

// Result labels
const RecaptchaLabel = {
  NOT_BAD: 'Not Bad',
  BAD: 'Bad',
} as const;

export interface RecaptchaAssessmentResult {
  label: typeof RecaptchaLabel.NOT_BAD | typeof RecaptchaLabel.BAD;
  reason: string;
  score: number;
  valid: boolean;
}

/**
 * Create an assessment to analyze the risk of a UI action
 */
export async function createRecaptchaAssessment(
  projectId: string,
  recaptchaSiteKey: string,
  token: string,
  expectedAction: string
): Promise<RecaptchaAssessmentResult> {
  try {
    // Use Firebase service account credentials for Google Cloud authentication
    const client = new RecaptchaEnterpriseServiceClient({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: projectId,
    });

    // Build the assessment request
    const [response] = await client.createAssessment({
      parent: `projects/${projectId}`,
      assessment: {
        event: {
          siteKey: recaptchaSiteKey,
          token: token,
          expectedAction: expectedAction,
        },
      },
    });

    // Check for bad action based on response
    const result = checkForBadAction(response, expectedAction);
    
    // Add score to result
    const score = response.riskAnalysis?.score || 0.0;
    
    return {
      ...result,
      score: parseFloat(score.toFixed(1)),
      valid: response.tokenProperties?.valid || false,
    };
  } catch (error) {
    console.error('reCAPTCHA Enterprise assessment failed:', error);
    return {
      label: RecaptchaLabel.BAD,
      reason: RecaptchaError.ASSESSMENT_FAILED,
      score: 0.0,
      valid: false,
    };
  }
}

/**
 * Classify the action as BAD/NOT_BAD based on assessment response
 */
function checkForBadAction(assessmentResponse: any, expectedAction: string): {
  label: typeof RecaptchaLabel.NOT_BAD | typeof RecaptchaLabel.BAD;
  reason: string;
} {
  let label: typeof RecaptchaLabel.NOT_BAD | typeof RecaptchaLabel.BAD = RecaptchaLabel.NOT_BAD;
  let reason = '';

  // Check if token is valid
  if (!assessmentResponse.tokenProperties?.valid) {
    reason = RecaptchaError.INVALID_TOKEN;
    label = RecaptchaLabel.BAD;
  }
  // Check if action matches expected
  else if (assessmentResponse.tokenProperties?.action !== expectedAction) {
    reason = RecaptchaError.ACTION_MISMATCH;
    label = RecaptchaLabel.BAD;
  }
  // Check if score is above threshold
  else if ((assessmentResponse.riskAnalysis?.score || 0) <= SAMPLE_THRESHOLD_SCORE) {
    reason = RecaptchaError.SCORE_LESS_THAN_THRESHOLD;
    label = RecaptchaLabel.BAD;
  }

  return { label, reason };
}

/**
 * Validate reCAPTCHA token for sign-up action
 */
export async function validateSignUpRecaptcha(token: string): Promise<RecaptchaAssessmentResult> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

  if (!projectId || !siteKey) {
    throw new Error('Missing reCAPTCHA Enterprise configuration');
  }

  return createRecaptchaAssessment(projectId, siteKey, token, 'sign_up');
}

/**
 * Validate reCAPTCHA token for sign-in action
 */
export async function validateSignInRecaptcha(token: string): Promise<RecaptchaAssessmentResult> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;

  if (!projectId || !siteKey) {
    throw new Error('Missing reCAPTCHA Enterprise configuration');
  }

  return createRecaptchaAssessment(projectId, siteKey, token, 'log_in');
}