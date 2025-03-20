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
        .select('title, report_date, public_url')
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
      
      // Create a temporary container for the content
      const container = document.createElement('div');
      container.innerHTML = reportContent;
      document.body.appendChild(container);
      
      // Configure PDF options
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${reportTitle}-${reportDate || new Date().toISOString().split('T')[0]}.pdf`,
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

  const goToLanding = () => {
    window.top.location.href = '/';
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
              onClick={goToLanding}
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
                onClick={goToLanding}
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
            onClick={goToLanding}
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
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Content Available</h2>
            <p className="text-gray-600">The report content could not be loaded.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicReportViewer;