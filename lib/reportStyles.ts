import { css } from '@emotion/css';

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