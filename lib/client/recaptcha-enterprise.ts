/**
 * reCAPTCHA Enterprise client-side integration
 * Based on Google Cloud reCAPTCHA Enterprise documentation
 */

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export interface RecaptchaAssessmentResponse {
  success: boolean;
  assessment: {
    label: string;
    score: number;
    valid: boolean;
    reason: string;
  };
}

class RecaptchaEnterpriseService {
  private static instance: RecaptchaEnterpriseService;
  private siteKey: string;
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    this.siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY || '';
    if (!this.siteKey) {
      console.warn('reCAPTCHA Enterprise site key not configured');
    }
  }

  static getInstance(): RecaptchaEnterpriseService {
    if (!RecaptchaEnterpriseService.instance) {
      RecaptchaEnterpriseService.instance = new RecaptchaEnterpriseService();
    }
    return RecaptchaEnterpriseService.instance;
  }

  /**
   * Load reCAPTCHA Enterprise script
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (!this.siteKey) {
        reject(new Error('reCAPTCHA Enterprise site key not configured'));
        return;
      }

      // Check if already loaded
      if (window.grecaptcha?.enterprise) {
        this.loaded = true;
        resolve();
        return;
      }

      // Create script element for reCAPTCHA Enterprise
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA Enterprise'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Execute reCAPTCHA Enterprise assessment
   */
  async execute(action: string): Promise<string> {
    if (!this.siteKey) {
      throw new Error('reCAPTCHA Enterprise not configured');
    }

    try {
      await this.load();

      return new Promise((resolve, reject) => {
        window.grecaptcha.enterprise.ready(() => {
          window.grecaptcha.enterprise
            .execute(this.siteKey, { action })
            .then(resolve)
            .catch(reject);
        });
      });
    } catch (error) {
      console.error('reCAPTCHA Enterprise execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute reCAPTCHA and get server-side assessment
   */
  async executeAndAssess(action: string, userData: any = {}): Promise<RecaptchaAssessmentResponse> {
    try {
      // Get reCAPTCHA token
      const token = await this.execute(action);

      // Send to server for assessment
      const response = await fetch('/api/auth/recaptcha/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          action,
          ...userData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Assessment request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('reCAPTCHA assessment failed:', error);
      throw error;
    }
  }

  /**
   * Execute reCAPTCHA for sign-up
   */
  async executeSignUp(userData: { email?: string; password?: string } = {}): Promise<RecaptchaAssessmentResponse> {
    return this.executeAndAssess('sign_up', userData);
  }

  /**
   * Execute reCAPTCHA for sign-in
   */
  async executeSignIn(userData: { email?: string; password?: string } = {}): Promise<RecaptchaAssessmentResponse> {
    return this.executeAndAssess('log_in', userData);
  }
}

// Export singleton instance
export const recaptchaEnterprise = RecaptchaEnterpriseService.getInstance();