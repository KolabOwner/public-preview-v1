/**
 * Date formatting utilities for resume generation
 */

/**
 * Format a date range for display
 */
export function formatDateRange(startDate?: string, endDate?: string, current?: boolean): string {
  const dateRange = [];
  
  if (startDate) dateRange.push(formatDate(startDate));
  
  if (current) {
    dateRange.push('Present');
  } else if (endDate) {
    dateRange.push(formatDate(endDate));
  }
  
  return dateRange.join(' - ');
}

/**
 * Format a single date for display
 */
export function formatDate(date: string): string {
  if (!date) return '';
  
  // Handle special cases
  if (date.toLowerCase() === 'present' || date.toLowerCase() === 'current') {
    return 'Present';
  }
  
  // If it's already in a nice format (e.g., "May 2023"), return as is
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i.test(date)) {
    return date;
  }
  
  try {
    // Try to parse the date
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
    }
  } catch (e) {
    // If parsing fails, return the original date
  }
  
  return date;
}

/**
 * Parse date parts from various formats
 */
export function parseDateParts(dateStr: string): { month?: string; year?: string } {
  if (!dateStr) return {};
  
  // Match patterns like "May 2023", "2023-05", "05/2023"
  const patterns = [
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i,
    /^(\d{4})-(\d{1,2})$/,
    /^(\d{1,2})\/(\d{4})$/
  ];
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        return { month: match[1], year: match[2] };
      } else if (pattern === patterns[1]) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthNum = parseInt(match[2]) - 1;
        if (monthNum >= 0 && monthNum < 12) {
          return { month: monthNames[monthNum], year: match[1] };
        }
      } else if (pattern === patterns[2]) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthNum = parseInt(match[1]) - 1;
        if (monthNum >= 0 && monthNum < 12) {
          return { month: monthNames[monthNum], year: match[2] };
        }
      }
    }
  }
  
  // Try year only
  if (/^\d{4}$/.test(dateStr)) {
    return { year: dateStr };
  }
  
  return {};
}

/**
 * Calculate duration between dates
 */
export function calculateDuration(startDate: string, endDate?: string): string {
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '';
    }
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 1) return 'Less than a month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 1 && remainingMonths === 0) return '1 year';
    if (years === 1 && remainingMonths > 0) return `1 year ${remainingMonths} months`;
    if (remainingMonths === 0) return `${years} years`;
    
    return `${years} years ${remainingMonths} months`;
  } catch (e) {
    return '';
  }
}

/**
 * Sort items by date (newest first)
 */
export function sortByDate<T extends { startDate?: string; endDate?: string; current?: boolean }>(items: T[]): T[] {
  return items.sort((a, b) => {
    // Current items come first
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    
    // Compare end dates (or start dates if no end date)
    const aDate = a.endDate || a.startDate || '';
    const bDate = b.endDate || b.startDate || '';
    
    try {
      const aTime = new Date(aDate).getTime();
      const bTime = new Date(bDate).getTime();
      return bTime - aTime; // Newest first
    } catch (e) {
      return 0;
    }
  });
}