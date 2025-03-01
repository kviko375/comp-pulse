import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Download, Loader2, ArrowLeft, Share2, Copy, Check, Link, ExternalLink, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Report {
  id: string;
  title: string;
  storage_path: string;
  report_date: string;
  created_at: string;
  public_url?: string;
}

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [sharingReport, setSharingReport] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

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

  const handleViewReport = async (report: Report) => {
    try {
      setLoadingContent(true);
      setSelectedReport(report);
      setError(null);

      const { data, error } = await supabase
        .storage
        .from('reports')
        .download(report.storage_path);

      if (error) {
        throw error;
      }

      const content = await data.text();
      setReportContent(content);
    } catch (err) {
      console.error('View error:', err);
      setError('Failed to load report content. Please try again.');
      setSelectedReport(null);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDownload = async (report: Report) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .storage
        .from('reports')
        .download(report.storage_path);

      if (error) {
        throw error;
      }

      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}-${report.report_date}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download report. Please try again.');
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

      // First, make the file publicly accessible
      const { data: publicData, error: publicError } = await supabase
        .storage
        .from('reports')
        .getPublicUrl(report.storage_path);

      if (publicError) {
        throw publicError;
      }

      const publicUrl = publicData.publicUrl;

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

      if (selectedReport && selectedReport.id === report.id) {
        setSelectedReport({ ...selectedReport, public_url: publicUrl });
      }

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

  const handleBack = () => {
    setSelectedReport(null);
    setReportContent(null);
    setError(null);
  };

  const handleOpenPublicUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

  if (selectedReport) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
              onClick={() => handleShareReport(selectedReport)}
              disabled={sharingReport === selectedReport.id}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {sharingReport === selectedReport.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : copiedLink === selectedReport.id ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              {copiedLink === selectedReport.id ? 'Link copied!' : 'Share'}
            </button>
            <button
              onClick={() => handleDownload(selectedReport)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
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

        {selectedReport.public_url && (
          <div className="mb-6 rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link className="h-4 w-4 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">This report has a shareable link</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenPublicUrl(selectedReport.public_url!)}
                  className="inline-flex items-center text-xs px-2 py-1 border border-blue-300 rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open link
                </button>
                <button
                  onClick={() => copyToClipboard(selectedReport.public_url!).then(() => {
                    setCopiedLink(selectedReport.id);
                    setTimeout(() => setCopiedLink(null), 2000);
                  })}
                  className="inline-flex items-center text-xs px-2 py-1 border border-blue-300 rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  {copiedLink === selectedReport.id ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedLink === selectedReport.id ? 'Copied!' : 'Copy link'}
                </button>
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
              title={selectedReport.title}
              className="w-full h-[calc(100vh-180px)] border-none"
              sandbox="allow-scripts"
            />
          </div>
        ) : null}
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
                        onClick={() => handleViewReport(report)}
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
                          title="Download report"
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