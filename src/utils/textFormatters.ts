
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
  
  // Split the text by URLs
  const parts = text.split(urlRegex);
  
  // Match all URLs in the text
  const matches = text.match(urlRegex) || [];
  
  // Combine parts and URLs into a single array of React elements
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, i) => {
    // Add the text part
    if (part) {
      result.push(part);
    }
    
    // Add the URL part if it exists
    if (matches[i]) {
      result.push(
        <a 
          key={`link-${i}`} 
          href={matches[i]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 underline break-all"
        >
          {matches[i]}
        </a>
      );
    }
  });
  
  return result;
};
