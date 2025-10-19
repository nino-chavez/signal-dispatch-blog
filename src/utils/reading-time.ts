/**
 * Calculate estimated reading time for content
 * Based on average reading speed of 200-250 words per minute
 */

const WORDS_PER_MINUTE = 225; // Average adult reading speed
const WORD_BOUNDARY = /\s+/; // Split on whitespace

/**
 * Count words in text content
 */
function countWords(text: string): number {
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, '');

  // Remove MDX frontmatter if present
  const withoutFrontmatter = cleanText.replace(/^---[\s\S]*?---/, '');

  // Split by whitespace and filter empty strings
  const words = withoutFrontmatter.trim().split(WORD_BOUNDARY).filter(Boolean);

  return words.length;
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordCount = countWords(content);
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Minimum 1 minute, even for very short posts
  return Math.max(1, minutes);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}

/**
 * Calculate reading time from MDX content and format for display
 */
export function getReadingTimeDisplay(content: string): string {
  const minutes = calculateReadingTime(content);
  return formatReadingTime(minutes);
}
