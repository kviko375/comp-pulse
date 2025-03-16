import { reportStyles } from './reportStyles';

export function createBrandedTemplate(content: string, title: string, date: string, forPdf = false) {
  // Extract the body content from the original HTML if it exists
  let bodyContent = content;
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch && bodyMatch[1]) {
    bodyContent = bodyMatch[1];
  }

  // Add target="_blank" to all links except CompetitivePulse landing page links
  bodyContent = bodyContent.replace(
    /<a\s+(?![^>]*\btarget=)[^>]*>/gi,
    (match) => {
      // Skip if it's a landing page link
      if (match.includes(`${window.location.origin}/`)) {
        return match;
      }
      return match.slice(0, -1) + ' target="_blank" rel="noopener noreferrer">';
    }
  );

  // Format the date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - CompetitivePulse</title>
      <style>
        ${reportStyles}
      </style>
    </head>
    <body>
      ${forPdf ? `
      <div class="print-header">
        <a href="${window.location.origin}" class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a86ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M13 17V9"></path>
            <path d="M18 17V5"></path>
            <path d="M8 17v-3"></path>
          </svg>
          <span>CompetitivePulse</span>
        </a>
      </div>
      ` : `
      <div class="container">
        <div class="header">
          <a href="${window.location.origin}" class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M13 17V9"></path>
              <path d="M18 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
            <span>CompetitivePulse</span>
          </a>
        </div>
        <div class="report-info">
          <p class="report-date">Generated on ${formattedDate}</p>
        </div>
        <div class="report-content">
      `}
      
      ${bodyContent}
      
      ${forPdf ? '' : `
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} CompetitivePulse. All rights reserved. <a href="${window.location.origin}">Visit CompetitivePulse</a></p>
        </div>
      </div>
      `}
    </body>
    </html>
  `;
}