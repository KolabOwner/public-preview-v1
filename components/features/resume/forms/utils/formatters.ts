// components/resume/forms/utils/formatters.ts
export const cleanValue = (value: string): string => {
  if (!value) return '';
  return value.replace(/^(Enter your |Your |Please enter )/i, '').trim();
};

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

export const formatLinkedIn = (value: string): string => {
  if (!value) return '';
  const cleaned = cleanValue(value);
  if (cleaned.includes('linkedin.com/in/')) {
    return cleaned.split('linkedin.com/in/')[1] || '';
  }
  return cleaned;
};

export const formatWebsite = (value: string): string => {
  const cleaned = cleanValue(value);
  if (!cleaned) return '';
  if (!/^https?:\/\//.test(cleaned)) {
    return `https://${cleaned}`;
  }
  return cleaned;
};