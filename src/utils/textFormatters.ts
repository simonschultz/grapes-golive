
import React from 'react';

/**
 * Formats text to convert URLs into clickable links
 * @param text The text to format
 * @returns Formatted text with URLs as JSX elements
 */
export const formatTextWithLinks = (text: string): React.ReactNode => {
  if (!text) return text;
  
  // Regular expression to match URLs starting with https://
  const urlRegex = /(https:\/\/[^\s]+)/g;
  
  // Split the text by URLs
  const parts = text.split(urlRegex);
  
  // Match all URLs in the text
  const matches = text.match(urlRegex) || [];
  
  // If no URLs found, return the original text
  if (matches.length === 0) return text;
  
  // Combine parts and URLs into a single array of React elements
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, i) => {
    // Add the text part
    if (part) {
      result.push(<span key={`text-${i}`}>{part}</span>);
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
