// lib/features/validation/email-validator.ts

/**
 * Enhanced email validation with common typo detection
 */
export class EmailValidator {
  // Common email domains for typo suggestions
  private static commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'live.com',
    'msn.com',
    'mail.com',
  ];

  // Common TLDs
  private static commonTLDs = [
    'com',
    'net',
    'org',
    'edu',
    'gov',
    'co',
    'io',
    'me',
    'info',
    'biz',
  ];

  /**
   * Validate email format
   */
  static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    // Basic email regex (RFC 5322 simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) return false;

    // Additional checks
    const [localPart, domain] = email.split('@');

    // Check local part length (max 64 characters)
    if (localPart.length > 64) return false;

    // Check total length (max 254 characters)
    if (email.length > 254) return false;

    // Check for consecutive dots
    if (email.includes('..')) return false;

    // Check domain has at least one dot
    if (!domain.includes('.')) return false;

    return true;
  }

  /**
   * Get validation error message
   */
  static getErrorMessage(email: string): string | null {
    if (!email) return 'Email is required';
    
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }

    const [localPart, domain] = email.split('@');

    if (!localPart) {
      return 'Email username is missing';
    }

    if (!domain) {
      return 'Email domain is missing';
    }

    if (!domain.includes('.')) {
      return 'Email domain must contain a dot';
    }

    if (localPart.length > 64) {
      return 'Email username is too long';
    }

    if (email.length > 254) {
      return 'Email is too long';
    }

    if (email.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return 'Email username cannot start or end with a dot';
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }

    return null;
  }

  /**
   * Suggest corrections for common typos
   */
  static getSuggestion(email: string): string | null {
    if (!email || !email.includes('@')) return null;

    const [localPart, domain] = email.split('@');
    if (!domain) return null;

    // Check for common domain typos
    const commonTypos: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmil.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gnail.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'yahoo.co': 'yahoo.com',
      'yahoo.cm': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'hotmil.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'hotmail.co': 'hotmail.com',
      'hotmail.cm': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com',
      'outlook.co': 'outlook.com',
      'outlook.cm': 'outlook.com',
    };

    const lowerDomain = domain.toLowerCase();
    if (commonTypos[lowerDomain]) {
      return `${localPart}@${commonTypos[lowerDomain]}`;
    }

    // Check for missing TLD dot
    for (const commonDomain of this.commonDomains) {
      const domainWithoutDot = commonDomain.replace('.', '');
      if (lowerDomain === domainWithoutDot) {
        return `${localPart}@${commonDomain}`;
      }
    }

    // Check for wrong TLD
    const [domainName, tld] = domain.split('.');
    if (domainName && tld) {
      // Check if it's a common domain with wrong TLD
      for (const commonDomain of this.commonDomains) {
        const [commonName] = commonDomain.split('.');
        if (domainName.toLowerCase() === commonName && tld !== commonDomain.split('.')[1]) {
          // Check Levenshtein distance to avoid false positives
          if (this.levenshteinDistance(tld, commonDomain.split('.')[1]) <= 2) {
            return `${localPart}@${commonDomain}`;
          }
        }
      }
    }

    return null;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Check if email domain has valid MX records (server-side only)
   */
  static async hasValidMXRecords(email: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      console.warn('MX record validation can only be performed server-side');
      return true;
    }

    try {
      const [, domain] = email.split('@');
      if (!domain) return false;

      // This would require a DNS lookup library like 'dns' in Node.js
      // For now, we'll just return true as a placeholder
      // In production, you'd use: const dns = require('dns').promises;
      // const mxRecords = await dns.resolveMx(domain);
      // return mxRecords.length > 0;

      return true;
    } catch {
      return false;
    }
  }
}