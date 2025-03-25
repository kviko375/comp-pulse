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

  // Format the generation date
  const generatedDate = new Date().toLocaleDateString('en-US', {
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
        * {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
        }
        body {
          line-height: 1.5;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 1100px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background-color: #4a86ff;
          color: white;
        }
        .logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: white;
          font-weight: bold;
        }
        .logo svg {
          margin-right: 8px;
        }
        .report-content {
          padding: 24px;
        }
        .footer {
          padding: 16px 24px;
          background-color: #f8fafc;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .footer a {
          color: #4a86ff;
          text-decoration: none;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          page-break-inside: avoid;
        }
        th, td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f8fafc;
          font-weight: 600;
        }
        img {
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
          page-break-inside: avoid;
        }
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid;
          break-after: avoid;
          page-break-inside: avoid;
          break-inside: avoid;
          margin-top: 2em;
          margin-bottom: 1em;
          color: #111827;
          line-height: 1.2;
        }
        h1 + *,
        h2 + *,
        h3 + *,
        h4 + *,
        h5 + *,
        h6 + * {
          page-break-before: avoid;
          break-before: avoid;
        }
        h1 { font-size: 2em; font-weight: 800; }
        h2 { font-size: 1.5em; font-weight: 700; }
        h3 { font-size: 1.25em; font-weight: 600; }
        h4 { font-size: 1.125em; font-weight: 600; }
        h5, h6 { font-size: 1em; font-weight: 600; }
        p {
          margin: 1em 0;
          line-height: 1.6;
          orphans: 3;
          widows: 3;
        }
        a {
          color: #4a86ff !important;
          text-decoration: none;
        }
        code {
          background-color: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9em;
        }
        pre {
          background-color: #f1f5f9;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1.5em 0;
          font-size: 0.9em;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1.5em 0;
          padding: 0.5em 0 0.5em 1em;
          color: #6b7280;
          font-style: italic;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        ul, ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        li {
          margin-bottom: 0.5em;
        }
        .print-header {
          display: ${forPdf ? 'flex' : 'none'};
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2em;
          page-break-after: avoid;
          break-after: avoid;
        }
        .print-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #111827;
          font-weight: bold;
          font-size: 1.25rem;
        }
        .print-logo svg {
          margin-right: 8px;
        }
        .print-date {
          color: #6b7280;
          font-size: 0.875rem;
        }
        @media print {
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif !important;
          }
          body {
            background: white;
            color: black;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            color: black;
          }
          h2 {
            page-break-before: auto !important;
            break-before: auto !important;
          }
          h1 + *,
          h2 + *,
          h3 + *,
          h4 + *,
          h5 + *,
          h6 + * {
            page-break-before: avoid !important;
            break-before: avoid !important;
          }
          img, table, figure, pre, blockquote {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          p {
            orphans: 3;
            widows: 3;
          }
          pre, code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          }
          a { color: #4a86ff !important; }
        }
      </style>
    </head>
    <body>
      ${forPdf ? `
      <div class="print-header">
        <div class="print-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a86ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M13 17V9"></path>
            <path d="M18 17V5"></path>
            <path d="M8 17v-3"></path>
          </svg>
          <span>CompetitivePulse</span>
        </div>
        <div class="print-date">Generated on ${generatedDate}</div>
      </div>
      ${bodyContent}
      ` : `
      <div class="container">
        <div class="report-content">
          ${bodyContent}
        </div>
      </div>
      `}
    </body>
    </html>
  `;
}

export const reportStyles = `
  /* Base styles */
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    color: #374151;
    margin: 0;
    padding: 0;
    background-color: #f9fafb;
  }

  /* Container */
  .container {
    max-width: 1000px;
    margin: 0 auto;
    background-color: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    color: #111827;
    font-weight: 600;
    line-height: 1.25;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }
  h5, h6 { font-size: 1rem; }

  p {
    margin-top: 0;
    margin-bottom: 1.25em;
    line-height: 1.625;
  }

  /* Links */
  a {
    color: #4a86ff;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  a:hover {
    color: #3a76ef;
    text-decoration: underline;
  }

  /* Lists */
  ul, ol {
    padding-left: 1.5em;
    margin-bottom: 1.25em;
  }

  li {
    margin-bottom: 0.5em;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.25em;
  }

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #111827;
  }

  tr:hover {
    background-color: #f9fafb;
  }

  /* Code blocks */
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.875em;
    background-color: #f1f5f9;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    color: #111827;
  }

  pre {
    background-color: #f1f5f9;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin-bottom: 1.25em;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
  }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid #e5e7eb;
    margin-left: 0;
    padding-left: 1em;
    color: #6b7280;
    font-style: italic;
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1em 0;
  }

  /* Horizontal rule */
  hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 2em 0;
  }

  /* Report header and footer */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background-color: #4a86ff;
    color: white;
  }

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: white;
    font-weight: bold;
  }

  .logo svg {
    margin-right: 0.5rem;
  }

  .report-info {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background-color: #f8fafc;
  }

  .report-title {
    margin: 0;
    font-size: 1.5rem;
    color: #111827;
  }

  .report-date {
    margin: 0.25rem 0 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .report-content {
    padding: 1.5rem;
  }

  .footer {
    padding: 1rem 1.5rem;
    background-color: #f8fafc;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .footer a {
    color: #4a86ff;
    text-decoration: none;
  }

  /* Print-specific styles */
  @media print {
    body {
      background-color: white;
    }

    .container {
      box-shadow: none;
      border-radius: 0;
    }

    a {
      text-decoration: none;
    }

    pre, code {
      background-color: #f8f8f8 !important;
      border: 1px solid #eee;
    }
  }
`;