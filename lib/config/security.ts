// lib/security-utils.ts
// Security utilities for XSS prevention and input sanitization

/**
 * Sanitizes a string for safe inclusion in HTML attributes
 */
export function sanitizeHTMLAttribute(input: string): string {
  return input
    .replace(/[<>"']/g, '') // Remove dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();
}

/**
 * Sanitizes CSS identifiers (class names, IDs, etc.)
 */
export function sanitizeCSSIdentifier(input: string): string {
  // Only allow alphanumeric, hyphens, and underscores
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Validates and sanitizes CSS color values
 */
export function sanitizeCSSColor(color: string): string {
  const trimmedColor = color.trim();
  
  // Allow common CSS color formats
  const colorPatterns = [
    /^#[0-9a-fA-F]{3,8}$/, // Hex colors (#fff, #ffffff, etc.)
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)$/, // RGBA
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[0-9.]+\s*\)$/, // HSLA
    /^[a-zA-Z]+$/, // Named colors (red, blue, etc.)
    /^transparent$/, // Transparent
    /^inherit$/, // Inherit
    /^initial$/, // Initial
    /^unset$/, // Unset
  ];
  
  const isValid = colorPatterns.some(pattern => pattern.test(trimmedColor));
  return isValid ? trimmedColor : '';
}

/**
 * Sanitizes theme values to prevent XSS
 */
export function sanitizeThemeValue(theme: string): 'light' | 'dark' | 'system' {
  const allowedThemes = ['light', 'dark', 'system'] as const;
  return allowedThemes.includes(theme as any) ? (theme as any) : 'system';
}

/**
 * Escapes HTML special characters
 */
export function escapeHTML(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => entityMap[char] || char);
}

/**
 * Safely encodes data for inclusion in JavaScript strings
 */
export function encodeForJavaScript(input: string): string {
  return JSON.stringify(input).slice(1, -1); // Remove quotes from JSON.stringify
}

/**
 * Validates and sanitizes URLs to prevent XSS
 */
export function sanitizeURL(url: string): string {
  try {
    const parsedURL = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    if (!allowedProtocols.includes(parsedURL.protocol)) {
      return '';
    }
    
    return parsedURL.toString();
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Content Security Policy nonce generator
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates file upload MIME types
 */
export function isAllowedMimeType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Sanitizes filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
}