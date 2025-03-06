
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
  
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];
  const result: React.ReactNode[] = [];
  
  // Build the array of text and links
  for (let i = 0; i < parts.length; i++) {
    // Add text part if it exists
    if (parts[i]) {
      result.push(parts[i]);
    }
    
    // Add link part if it exists
    if (i < matches.length) {
      result.push(
        React.createElement('a', {
          key: `link-${i}`,
          href: matches[i],
          target: "_blank",
          rel: "noopener noreferrer",
          className: "underline break-all"
        }, matches[i])
      );
    }
  }
  
  return result;
};
