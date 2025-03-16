import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Download, Loader2, ArrowLeft, Share2, Copy, Check, Link, ExternalLink, AlertCircle, Info } from 'lucide-react';
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

function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharingReport, setSharingReport] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      if (reportsError) {
        throw reportsError;
      }

      setReports(reportsData || []);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBrandedTemplate = (content: string, title: string, date: string, forPdf = false) => {
    // Extract the body content from the original HTML if it exists
    let bodyContent = content;
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1];
    }

    // Format the date
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create a complete HTML document with proper styling and branding
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - CompetitivePulse</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 1000px;
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
          .report-info {
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
            background-color: #f8fafc;
          }
          .report-title {
            margin: 0;
            font-size: 1.5rem;
            color: #111827;
          }
          .report-date {
            margin: 4px 0 0;
            color: #6b7280;
            font-size: 0.875rem;
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
          }
          h1, h2, h3, h4, h5, h6 {
            color: #111827;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          p {
            margin-top: 0;
            margin-bottom: 1em;
          }
          a {
            color: #4a86ff;
          }
          code {
            background-color: #f1f5f9;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: monospace;
          }
          pre {
            background-color: #f1f5f9;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
          }
          blockquote {
            border-left: 4px solid #e5e7eb;
            margin-left: 0;
            padding-left: 1em;
            color: #6b7280;
          }
          ul, ol {
            padding-left: 1.5em;
          }
          .print-header {
            display: ${forPdf ? 'flex' : 'none'};
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
          }
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
            <h1 class="report-title">${title}</h1>
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
  };

  const handleDownload = async (report: Report) => {
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
      document.body.appendChild(container);
      
      // Configure PDF options
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${report.title}-${report.report_date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

  const handleShareReport = async (report: Report) => {
    try {
      setSharingReport(report.id);
      setError(null);

      // If the report already has a public URL, just copy it
      if (report.public_url) {
        await copyToClipboard(report.public_url);
        setCopiedLink(report.id);
        setTimeout(() => setCopiedLink(null), 2000);
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

      // Create a user-friendly public URL using our application's domain
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
      setReports(reports.map(r => 
        r.id === report.id ? { ...r, public_url: publicUrl } : r
      ));

      // Copy the URL to clipboard
      await copyToClipboard(publicUrl);
      setCopiedLink(report.id);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Share error:', err);
      setError('Failed to create shareable link. Please try again.');
    } finally {
      setSharingReport(null);
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

  const handleOpenPublicUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  // Loading dots animation component
  const LoadingDots = () => {
    return (
      <div className="flex space-x-1.5 justify-center items-center">
        <div className="w-2.5 h-2.5 bg-[#4a86ff] rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-2.5 h-2.5 bg-[#4a86ff] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-2.5 h-2.5 bg-[#4a86ff] rounded-full animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    );
  };

  // Animated processing text with dots
  const ProcessingText = () => {
    return (
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-500">Processing</span>
        <span className="inline-flex ml-1">
          <span className="animate-[fadeInOut_1.5s_infinite_0ms] text-lg">.</span>
          <span className="animate-[fadeInOut_1.5s_infinite_300ms] text-lg">.</span>
          <span className="animate-[fadeInOut_1.5s_infinite_600ms] text-lg">.</span>
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-medium text-gray-900 mb-6">Intelligence reports</h1>
      
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
      
      <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
        {reports.length === 0 && (
          <div className="mt-4 mb-2 mx-6 rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">Your report has been queued. You will receive an email when it's ready.</p>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <ProcessingText />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <LoadingDots />
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.report_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="flex items-center text-left group"
                      >
                        <FileText className="h-4 w-4 text-gray-400 group-hover:text-[#4a86ff] mr-2" />
                        <span className="text-sm font-medium text-gray-900 group-hover:text-[#4a86ff]">
                          {report.title}
                        </span>
                        {report.public_url && (
                          <Link className="h-3 w-3 ml-2 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleShareReport(report)}
                          disabled={sharingReport === report.id}
                          className="text-[#4a86ff] hover:text-[#3a76ef] inline-flex items-center"
                          title="Share report"
                        >
                          {sharingReport === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : copiedLink === report.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </button>
                        {report.public_url && (
                          <button 
                            onClick={() => handleOpenPublicUrl(report.public_url!)}
                            className="text-[#4a86ff] hover:text-[#3a76ef] inline-flex items-center"
                            title="Open public link"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(report)}
                          className="text-[#4a86ff] hover:text-[#3a76ef] inline-flex items-center"
                          title="Download report as PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;