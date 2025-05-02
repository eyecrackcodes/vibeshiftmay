import DOMPurify from 'dompurify';

// Sanitize text to prevent XSS attacks
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text);
};

// Format date to a human-readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Save draft to localStorage
export const saveDraft = (key: string, content: string): void => {
  localStorage.setItem(`draft_${key}`, content);
};

// Get draft from localStorage
export const getDraft = (key: string): string | null => {
  return localStorage.getItem(`draft_${key}`);
};

// Clear draft from localStorage
export const clearDraft = (key: string): void => {
  localStorage.removeItem(`draft_${key}`);
}; 