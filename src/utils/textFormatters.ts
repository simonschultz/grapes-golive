
import React from 'react';

/**
 * Formats text to convert URLs into clickable links
 * @param text The text to format
 * @returns Formatted text with URLs as JSX elements
 */
export const formatTextWithLinks = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Regular expression to match URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // If no URLs found, return the original text
  if (!text.match(urlRegex)) return text;
  
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // Use regex.exec to get each match with its position
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    const beforeUrl = text.substring(lastIndex, match.index);
    if (beforeUrl) {
      result.push(beforeUrl);
    }
    
    // Add the URL as a link
    result.push(
      React.createElement('a', {
        key: `link-${match.index}`,
        href: match[0],
        target: "_blank",
        rel: "noopener noreferrer",
        className: "underline break-all"
      }, match[0])
    );
    
    // Update lastIndex to after this URL
    lastIndex = urlRegex.lastIndex;
  }
  
  // Add any remaining text after the last URL
  const afterLastUrl = text.substring(lastIndex);
  if (afterLastUrl) {
    result.push(afterLastUrl);
  }
  
  return result;
};
