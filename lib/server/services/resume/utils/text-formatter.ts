/**
 * Text formatting utilities for PDF generation
 */

/**
 * Format location string from multiple parts
 */
export function formatLocation(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(', ');
}

/**
 * Parse text into bullet points
 */
export function parseBulletPoints(text: string): string[] {
  if (!text) return [];
  
  // Decode HTML entities first
  const decodedText = decodeHTMLEntities(text);
  
  // First try splitting by line breaks or bullet markers
  let splitPoints = decodedText.split(/[\n•·▪]/g);
  
  // If no line breaks/bullets found, try splitting by sentences that end with periods followed by capital letters
  if (splitPoints.length === 1) {
    // Split on periods followed by capital letters (sentence boundaries)
    splitPoints = decodedText.split(/\.(?=[A-Z])/g);
  }
  
  const bulletPoints = splitPoints
    .map((point: string) => point.trim())
    .filter((point: string) => point.length > 0)
    .map((point: string) => {
      // Remove leading markers and ensure proper punctuation
      let cleaned = point.replace(/^[•·▪?-]\s*/, '');
      // Add period if it doesn't end with punctuation
      if (cleaned && !/[.!?]$/.test(cleaned)) {
        cleaned += '.';
      }
      return cleaned;
    });
    
  return bulletPoints;
}

/**
 * Decode HTML entities
 */
export function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  
  // Basic HTML entity decoding for common cases
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

/**
 * Clean extracted text from PDF
 */
export function cleanExtractedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page numbers (common patterns)
    .replace(/^\d+\s*$/gm, '')
    // Remove common header/footer patterns
    .replace(/Page \d+ of \d+/gi, '')
    // Fix common OCR issues
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Remove non-printable characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
}

/**
 * Truncate text to a specific length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert text to title case
 */
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Remove extra whitespace and normalize line breaks
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}