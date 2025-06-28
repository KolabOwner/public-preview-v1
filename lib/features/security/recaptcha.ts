// lib/features/security/recaptcha.ts

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad?: () => void;
  }
}

export class RecaptchaService {
  private static instance: RecaptchaService;
  private siteKey: string;
  private loaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    this.siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    if (!this.siteKey) {
      console.warn('reCAPTCHA site key not configured');
    }
  }

  static getInstance(): RecaptchaService {
    if (!RecaptchaService.instance) {
      RecaptchaService.instance = new RecaptchaService();
    }
    return RecaptchaService.instance;
  }

  /**
   * Load reCAPTCHA script
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      if (!this.siteKey) {
        reject(new Error('reCAPTCHA site key not configured'));
        return;
      }

      // Check if already loaded
      if (window.grecaptcha) {
        this.loaded = true;
        resolve();
        return;
      }

      // Set callback
      window.onRecaptchaLoad = () => {
        this.loaded = true;
        resolve();
      };

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.siteKey}&onload=onRecaptchaLoad`;
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load reCAPTCHA'));

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Execute reCAPTCHA v3
   */
  async execute(action: string): Promise<string> {
    if (!this.siteKey) {
      console.warn('reCAPTCHA not configured, skipping');
      return '';
    }

    try {
      await this.load();

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(this.siteKey, { action })
            .then(resolve)
            .catch(reject);
        });
      });
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return '';
    }
  }

  /**
   * Verify reCAPTCHA token on the server
   */
  static async verify(token: string, action?: string): Promise<{
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
      return { success: true }; // Pass through if not configured
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

      // For v3, check score threshold
      if (data.success && data.score !== undefined) {
        // Adjust threshold as needed (0.5 is recommended default)
        const threshold = 0.5;
        data.success = data.score >= threshold;
      }

      // Verify action matches if provided
      if (action && data.action && data.action !== action) {
        data.success = false;
        data.errorCodes = ['action-mismatch'];
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
}

// Export singleton instance
export const recaptcha = RecaptchaService.getInstance();