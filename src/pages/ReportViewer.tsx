import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Loader2, ArrowLeft, Share2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import html2pdf from 'html2pdf.js';

interface Report {
  id: string;
  title: string;
  storage_path: string;
  report_date: string;
  created_at: string;
  public_url?: string;
}

function ReportViewer() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const handleBack = () => {
    navigate('/reports');
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get the report details
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (reportError) {
        if (reportError.message.includes('No rows found')) {
          throw new Error('Report not found or you do not have permission to view it');
        }
        throw reportError;
      }

      setReport(reportData);
      
      // Load the report content
      await loadReportContent(reportData);
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

  const loadReportContent = async (reportData: Report) => {
    try {
      setLoadingContent(true);
      
      const { data, error } = await supabase
        .storage
        .from('reports')
        .download(reportData.storage_path);

      if (error) {
        throw error;
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
        </head>`
      );

      setReportContent(content);
    } catch (err) {
      console.error('Content loading error:', err);
      setError('Failed to load report content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      setError(null);

      if (!report) return;

      // If the report already has a public URL, just copy it
      if (report.public_url) {
        await copyToClipboard(report.public_url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      }

      // First, download the original content
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('reports')
        .download(report.storage_path);

      if (fileError) {
        throw fileError;
      }

      // Add branding to the content
      const originalContent = await fileData.text();
      const brandedContent = createBrandedTemplate(originalContent, report.title, report.report_date);
      
      // Create a new file with branded content
      const publicId = `${report.id}-${Date.now()}`;
      const brandedFileName = `public/${publicId}.html`;
      const brandedFile = new File([brandedContent], brandedFileName.split('/').pop() || 'report.html', { 
        type: 'text/html' 
      });

      // Upload the branded version
      const { error: uploadError } = await supabase
        .storage
        .from('reports')
        .upload(brandedFileName, brandedFile, {
          contentType: 'text/html',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Create a user-friendly public URL
      const publicUrl = `${window.location.origin}/public/reports/${publicId}`;

      // Update the report with the public URL
      const { error: updateError } = await supabase
        .from('reports')
        .update({ public_url: publicUrl })
        .eq('id', report.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setReport({ ...report, public_url: publicUrl });

      // Copy the URL to clipboard
      await copyToClipboard(publicUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error('Share error:', err);
      setError('Failed to create shareable link. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;

    try {
      setDownloadingPdf(true);
      setError(null);
      
      const { data, error } = await supabase
        .storage
        .from('reports')
        .download(report.storage_path);

      if (error) {
        throw error;
      }

      const content = await data.text();
      const brandedContent = createBrandedTemplate(content, report.title, report.report_date, true);
      
      // Create a temporary container for the content
      const container = document.createElement('div');
      container.innerHTML = brandedContent;

      // Add page breaks before h2 elements, excluding the first one
      const h2Elements = container.querySelectorAll('h2');
      h2Elements.forEach((h2, index) => {
        if (index > 0) {
          h2.style.pageBreakBefore = 'always';
          h2.style.breakBefore = 'page';
        }
      });

      document.body.appendChild(container);
      
      // Configure PDF options
      const options = {
        margin: [15, 15, 15, 15],
        filename: `${report.title}-${report.report_date}.pdf`,
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard error:', err);
      return false;
    }
  };

  const createBrandedTemplate = (content: string, title: string, date: string, forPdf = false) => {
    // Extract the body content from the original HTML if it exists
    let bodyContent = content;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1];
    }

    // Format the current date
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
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          }
          body {
            line-height: 1.5;
            color: #333;
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
          h3 { font-size: 1.25rem; font-weight: 600; }
          h4 { font-size: 1.125rem; font-weight: 600; }
          h5, h6 { font-size: 1rem; font-weight: 600; }
          p {
            margin: 1em 0;
            line-height: 1.6;
            orphans: 3;
            widows: 3;
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
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          }
          @media print {
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
            img, table, figure, pre, blockquote {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
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
          <div class="print-date">
            Generated on ${generatedDate}
          </div>
        </div>
        ${bodyContent}
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to reports
        </button>
        <div className="flex space-x-2">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : shared ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {sharing ? 'Creating link...' : shared ? 'Link copied!' : 'Share'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadingPdf}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {downloadingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloadingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loadingContent ? (
        <div className="bg-white shadow-sm rounded-md border border-gray-200 p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading report content...</span>
        </div>
      ) : reportContent ? (
        <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
          <iframe 
            srcDoc={reportContent}
            title={report?.title}
            className="w-full h-[calc(100vh-120px)] border-none"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      ) : null}
    </div>
  );
}

export default ReportViewer;