import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, Trash2, Upload, AlertCircle, ShieldAlert, Mail } from 'lucide-react';
import { getAdmin } from '../lib/adminClient';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';

interface User {
  id: string;
  email: string;
}

interface Report {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  report_date: string;
  created_at: string;
  notified: boolean;
  public_url?: string;
}

function Admin() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          navigate('/');
          return;
        }

        setAdminAccess(true);
      } catch (err) {
        setError('Admin access not available.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    verifyAccess();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.length >= 3 && adminAccess) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm, adminAccess]);

  useEffect(() => {
    if (selectedUser && adminAccess) {
      loadUserReports();
    }
  }, [selectedUser, adminAccess]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const adminClient = getAdmin();
      const { data: { users }, error: searchError } = await adminClient.auth.admin.listUsers({
        filters: {
          email: searchTerm
        }
      });

      if (searchError) {
        throw searchError;
      }

      setUsers(users || []);
    } catch (err) {
      setError('Failed to search users');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserReports = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);

      const adminClient = getAdmin();
      const { data: reportsData, error: reportsError } = await adminClient
        .from('reports')
        .select('*')
        .eq('user_id', selectedUser.id)
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const file = formData.get('report') as File;
    const title = formData.get('title') as string;
    const reportDate = formData.get('reportDate') as string;

    if (!file || !title || !reportDate) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const adminClient = getAdmin();
      // Check if a report already exists for this date
      const { data: existingReport, error: checkError } = await adminClient
        .from('reports')
        .select('id, title')
        .eq('user_id', selectedUser.id)
        .eq('report_date', reportDate)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingReport) {
        const confirmOverwrite = window.confirm(
          `A report titled "${existingReport.title}" already exists for this date. Would you like to overwrite it?`
        );

        if (!confirmOverwrite) {
          return;
        }

        // Delete the existing report and its storage file
        const { error: storageDeleteError } = await adminClient.storage
          .from('reports')
          .remove([existingReport.storage_path]);

        if (storageDeleteError) {
          throw storageDeleteError;
        }

        const { error: reportDeleteError } = await adminClient
          .from('reports')
          .delete()
          .eq('id', existingReport.id);

        if (reportDeleteError) {
          throw reportDeleteError;
        }
      }

      let htmlContent: string;
      const fileName = `${selectedUser.id}/${reportDate}-${file.name}`;

      // Convert DOCX to HTML if the file is a DOCX
      if (file.name.toLowerCase().endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        // Add target="_blank" to all links in the converted HTML
        htmlContent = result.value.replace(
          /<a\s+(?![^>]*\btarget=)[^>]*>/gi,
          (match) => match.slice(0, -1) + ' target="_blank" rel="noopener noreferrer">'
        );

        // Create a new HTML file with the converted content
        const htmlFileName = fileName.replace(/\.docx$/i, '.html');
        const htmlFile = new File([htmlContent], htmlFileName.split('/').pop() || 'report.html', {
          type: 'text/html'
        });

        // Upload HTML file to storage
        const { error: storageError } = await adminClient.storage
          .from('reports')
          .upload(htmlFileName, htmlFile, {
            contentType: 'text/html',
            upsert: true
          });

        if (storageError) {
          throw storageError;
        }

        // Create record in reports table with HTML file path
        const { error: reportError } = await adminClient
          .from('reports')
          .insert({
            user_id: selectedUser.id,
            title,
            storage_path: htmlFileName,
            report_date: reportDate,
            notified: false
          });

        if (reportError) {
          throw reportError;
        }
      } else if (file.name.toLowerCase().endsWith('.html')) {
        // Handle HTML files directly
        const { error: storageError } = await adminClient.storage
          .from('reports')
          .upload(fileName, file, {
            contentType: 'text/html',
            upsert: true
          });

        if (storageError) {
          throw storageError;
        }

        // Create record in reports table
        const { error: reportError } = await adminClient
          .from('reports')
          .insert({
            user_id: selectedUser.id,
            title,
            storage_path: fileName,
            report_date: reportDate,
            notified: false
          });

        if (reportError) {
          throw reportError;
        }
      } else {
        throw new Error('Unsupported file format. Please upload HTML or DOCX files only.');
      }

      // Reset form and reload reports
      (e.target as HTMLFormElement).reset();
      await loadUserReports();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (report: Report) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const adminClient = getAdmin();
      // Delete from storage
      const { error: storageError } = await adminClient.storage
        .from('reports')
        .remove([report.storage_path]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: reportError } = await adminClient
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (reportError) {
        throw reportError;
      }

      await loadUserReports();
    } catch (err) {
      setError('Failed to delete report');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (report: Report) => {
    if (!selectedUser) return;
    
    try {
      setSendingNotification(report.id);
      setError(null);

      const adminClient = getAdmin();
      // Call the function using adminClient instead of regular supabase client
      const { data, error: functionError } = await adminClient.functions.invoke('send-report-notification', {
        body: {
          reportId: report.id,
          userEmail: selectedUser.email,
          reportTitle: report.title,
          reportDate: report.report_date
        }
      });

      if (functionError) {
        throw functionError;
      }

      // Update the report's notified status
      const { error: updateError } = await adminClient
        .from('reports')
        .update({ notified: true })
        .eq('id', report.id);

      if (updateError) {
        throw updateError;
      }

      // Reload reports to update UI
      await loadUserReports();
    } catch (err) {
      console.error('Notification error:', err);
      setError('Failed to send notification. Please try again.');
    } finally {
      setSendingNotification(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying admin access...</span>
        </div>
      </div>
    );
  }

  if (!adminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 text-center">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">CompetitivePulse Admin Dashboard</h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
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

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="max-w-xl">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter user email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {loading && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </div>
              )}
              {users.length > 0 && (
                <ul className="mt-4 border border-gray-200 rounded-md divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className={`flex-1 text-left ${
                          selectedUser?.id === user.id ? 'text-indigo-600' : 'text-gray-900'
                        }`}
                      >
                        <span className="text-sm font-medium">{user.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {selectedUser && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Reports for {selectedUser.email}
              </h2>

              <form onSubmit={handleUpload} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Report Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700">
                      Report Date
                    </label>
                    <input
                      type="date"
                      name="reportDate"
                      id="reportDate"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="report" className="block text-sm font-medium text-gray-700">
                      Report File (HTML or DOCX)
                    </label>
                    <input
                      type="file"
                      name="report"
                      id="report"
                      ref={fileInputRef}
                      required
                      accept=".html,.docx"
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Report
                      </>
                    )}
                  </button>
                </div>
              </form>

              {reports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.report_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.notified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Notified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {!report.notified && (
                                <button
                                  onClick={() => handleSendNotification(report)}
                                  disabled={sendingNotification === report.id}
                                  className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                                  title="Send email notification"
                                >
                                  {sendingNotification === report.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                  ) : (
                                    <Mail className="h-5 w-5" />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(report)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete report"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No reports found for this user.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;