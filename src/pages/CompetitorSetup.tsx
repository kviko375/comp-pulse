import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { getDomainFromEmail, identifyCompetitors, type CompetitorInfo } from '../lib/utils';
import { supabase } from '../lib/supabase';

function CompetitorSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, isBusinessEmail, savedCompetitors } = location.state || {};
  const [website, setWebsite] = useState(isBusinessEmail ? getDomainFromEmail(email) : '');
  const [competitors, setCompetitors] = useState<CompetitorInfo[]>(savedCompetitors || []);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCompetitors() {
      // If we already have competitors from state, don't fetch new ones
      if (savedCompetitors && savedCompetitors.length > 0) {
        setLoading(false);
        return;
      }
      
      if (isBusinessEmail && website) {
        try {
          setLoading(true);
          setError(null);
          const identifiedCompetitors = await identifyCompetitors(website);
          setCompetitors(identifiedCompetitors);
        } catch (err) {
          setError('Failed to identify competitors. You can add them manually.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    fetchCompetitors();
  }, [isBusinessEmail, website, savedCompetitors]);

  const handleAddCompetitor = () => {
    if (newCompetitor && !competitors.some(c => c.domain === newCompetitor)) {
      setCompetitors([...competitors, {
        domain: newCompetitor,
        name: newCompetitor.split('.')[0],
        description: 'Custom added competitor'
      }]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (competitorDomain: string) => {
    setCompetitors(competitors.filter(c => c.domain !== competitorDomain));
  };

  const handleContinue = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          competitors: competitors.map(c => c.domain)
        });

      if (settingsError) {
        throw settingsError;
      }

      navigate('/setup/preferences', { 
        state: { 
          ...location.state,
          competitors: competitors.map(c => c.domain),
          savedCompetitors: competitors // Pass the full competitor objects
        } 
      });
    } catch (err) {
      setError('Failed to save competitors. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Identifying competitors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-md border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Set up your competitors
              </h3>
            </div>
            
            {!isBusinessEmail && (
              <div className="mt-6">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Your website
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="website"
                    id="website"
                    className="shadow-sm focus:ring-[#4a86ff] focus:border-[#4a86ff] block w-full sm:text-sm border-gray-300 rounded-md"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="example.com"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {isBusinessEmail && competitors.length > 0 && (
              <div className="mt-4 rounded-md bg-blue-50 p-4 border border-blue-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      We've identified these competitors based on your industry. Feel free to modify this list.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Your competitors
              </label>
              <div className="mt-2 space-y-2">
                {competitors.map((competitor) => (
                  <div
                    key={competitor.domain}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{competitor.name}</h4>
                      <p className="text-sm text-gray-500">{competitor.domain}</p>
                      {competitor.description && (
                        <p className="text-xs text-gray-400 mt-1">{competitor.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(competitor.domain)}
                      className="ml-4 text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex">
                <input
                  type="text"
                  className="shadow-sm focus:ring-[#4a86ff] focus:border-[#4a86ff] block w-full sm:text-sm border-gray-300 rounded-l-md"
                  placeholder="Add competitor domain"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff]"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-500 font-medium">Step 1 of 2</span>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                disabled={competitors.length === 0 || saving}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  competitors.length > 0 && !saving
                    ? 'bg-[#4a86ff] hover:bg-[#3a76ef]'
                    : 'bg-gray-300 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff]`}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetitorSetup;