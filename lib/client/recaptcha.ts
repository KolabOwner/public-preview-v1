// lib/client/recaptcha.ts

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad?: () => void;
  }
}

class RecaptchaClientService {
  private static instance: RecaptchaClientService;
  private siteKey: string;
  private loaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {
    this.siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';
    if (!this.siteKey) {
      console.warn('reCAPTCHA site key not configured');
    }
  }

  static getInstance(): RecaptchaClientService {
    if (!RecaptchaClientService.instance) {
      RecaptchaClientService.instance = new RecaptchaClientService();
    }
    return RecaptchaClientService.instance;
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
}

// Export singleton instance
export const recaptcha = RecaptchaClientService.getInstance();