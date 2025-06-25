// app/components/resume/utils/resumeFormatters.ts

/**
 * Decode HTML entities in text
 */
export function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * Parse text into bullet points
 */
export function parseBulletPoints(text: string): string[] {
  if (!text) return [];
  const decodedText = decodeHTMLEntities(text);

  // Check for newline-separated items
  if (decodedText.includes('\n')) {
    const lines = decodedText
      .split('\n')
      .map(line => line.replace(/^[•·\-\*]\s*/, '').trim())
      .filter(Boolean);
    if (lines.length > 1) {
      return lines;
    }
  }

  // Check for bullet-separated items
  if (decodedText.includes('•') || decodedText.includes('·')) {
    return decodedText
      .split(/[•·]/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  // Return as single item
  return [decodedText];
}

/**
 * Format date strings
 */
export function formatDate(
  date: string | Date | null | undefined,
  format?: string
): string {
  if (!date) return '';

  if (typeof date === 'string') {
    if (date.toLowerCase() === 'present') return 'Present';

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date;

    switch (format) {
      case 'MMM YYYY': {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      }

      case 'YYYY':
        return dateObj.getFullYear().toString();

      default:
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
    }
  }

  return String(date);
}

/**
 * Get full name from contact info
 */
export function getFullName(contact: any): string {
  if (contact.fullName) return contact.fullName;

  const firstName = contact.firstName || '';
  const lastName = contact.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Your Name';
}

/**
 * Format contact location
 */
export function formatLocation(contact: any): string {
  const parts = [];

  if (contact.city) parts.push(contact.city);
  if (contact.state) parts.push(contact.state);
  if (contact.country && contact.country !== 'United States') {
    parts.push(contact.country);
  }

  return parts.join(', ');
}

/**
 * Clean LinkedIn URL
 */
export function cleanLinkedInUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^.*\/in\//, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert text to title case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Check if a date range is current
 */
export function isCurrentPosition(endDate: string | null | undefined): boolean {
  if (!endDate) return true;
  const lowerDate = endDate.toLowerCase();
  return lowerDate === 'present' || lowerDate === 'current';
}

/**
 * Format file name for download
 */
export function formatFileName(name: string, extension: string = 'pdf'): string {
  const cleanName = name
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_')            // Replace spaces with underscores
    .replace(/_+/g, '_')             // Remove multiple underscores
    .trim();

  return `${cleanName}_Resume.${extension}`;
}