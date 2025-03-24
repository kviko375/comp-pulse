import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, BarChart2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';

function PublicReportViewer() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>('Report');
  const [reportDate, setReportDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadPublicReport();
    }
  }, [reportId]);

  const loadPublicReport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the file from storage first
      const { data, error: downloadError } = await supabase
        .storage
        .from('reports')
        .download(`public/${reportId}.html`);

      if (downloadError) {
        throw new Error('Report content not found');
      }

      // Get the report metadata
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('title, report_date, public_url, created_at')
        .like('public_url', `%${reportId}%`)
        .single();

      if (reportError) {
        console.warn('Could not fetch report metadata:', reportError);
        // Don't throw here, we still have the content
      } else {
        // Set the title and date from the database
        setReportTitle(reportData.title);
        setReportDate(reportData.report_date);
      }

      let content = await data.text();

      // Add script to handle link clicks
      content = content.replace('</head>',
        `<script>
          document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
              e.preventDefault();
              const href = e.target.getAttribute('href');
              if (href && href.startsWith('${window.location.origin}')) {
                window.top.location.href = '/';
              } else if (href) {
                window.open(href, '_blank');
              }
            }
          });
        </script>
        <style>
          * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          body {
            line-height: 1.5;
            color: #374151;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #111827;
            font-weight: 600;
            line-height: 1.25;
          }
          h1 { font-size: 2rem; font-weight: 800; }
          h2 { font-size: 1.5rem; font-weight: 700; }
          h3 { font-size: 1.25rem; }
          h4 { font-size: 1.125rem; }
          h5, h6 { font-size: 1rem; }
          p { line-height: 1.625; }
          a { color: #4a86ff; text-decoration: none; }
          a:hover { color: #3a76ef; }
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          }
        </style>
        </head>`
      );

      setReportContent(content);
    } catch (err) {
      console.error('Report loading error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load report');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!reportContent) return;
    
    try {
      setDownloadingPdf(true);
      setError(null);
      
      // Extract the body content from the original HTML if it exists
      let bodyContent = reportContent;
      const bodyMatch = reportContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        // Remove any existing print-header from the content
        bodyContent = bodyMatch[1].replace(/<div class="print-header".*?<\/div>/s, '');
      }

      // Format the date for the header
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create the PDF template with only one header
      const pdfContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${reportTitle} - CompetitivePulse</title>
          <style>
            * {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            body {
              line-height: 1.5;
              color: #374151;
              margin: 0;
              padding: 0;
            }
            .print-header {
              display: flex;
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
            h1 { font-size: 2rem; font-weight: 800; }
            h2 { font-size: 1.5rem; font-weight: 700; }
            h3 { font-size: 1.25rem; }
            h4 { font-size: 1.125rem; }
            h5, h6 { font-size: 1rem; }
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
            img {
              max-width: 100%;
              height: auto;
              margin: 1.5em 0;
              page-break-inside: avoid;
            }
            @media print {
              body { background: white; }
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid !important;
                break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              img, table, figure, pre, blockquote {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              a {
                color: #4a86ff !important;
                text-decoration: none;
              }
            }
          </style>
        </head>
        <body>
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
        </body>
        </html>
      `;
      
      // Create a temporary container for the content
      const container = document.createElement('div');
      container.innerHTML = pdfContent;
      document.body.appendChild(container);
      
      // Configure PDF options
      const options = {
        margin: [15, 15, 15, 15],
        filename: `${reportTitle}-${reportDate || new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['h1', 'h3', 'h4', 'h5', 'h6', 'img', 'table', 'figure', 'pre', 'blockquote']
        }
      };
      
      // Generate PDF
      await html2pdf().from(container).set(options).save();
      
      // Clean up
      document.body.removeChild(container);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a86ff] mb-4" />
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <BarChart2 className="h-8 w-8 text-[#4a86ff]" />
              <span className="ml-2 text-xl font-bold text-gray-900">CompetitivePulse</span>
            </button>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
              Report Not Available
            </h1>
            <p className="text-gray-600 text-center mb-6">
              {error}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff]"
              >
                Go to CompetitivePulse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <BarChart2 className="h-8 w-8 text-[#4a86ff]" />
            <span className="ml-2 text-xl font-bold text-gray-900">CompetitivePulse</span>
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloadingPdf}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPdf ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </button>
        </div>

        {reportContent ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <iframe 
              srcDoc={reportContent}
              title={reportTitle}
              className="w-full h-[calc(100vh-120px)] border-none"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PublicReportViewer;