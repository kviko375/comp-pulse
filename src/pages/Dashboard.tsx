import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { identifyCompetitors } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { UserSettings, CompetitorInfo } from '../lib/types';

const analysisOptions = [
  { id: 'features', label: 'Feature launches and product updates' },
  { id: 'pricing', label: 'Pricing changes' },
  { id: 'acquisition', label: 'Customer acquisition strategies' },
  { id: 'hiring', label: 'New hires & talent moves' },
  { id: 'expansion', label: 'Market expansion' },
  { id: 'feedback', label: 'Customer feedback & reviews' },
  { id: 'partnerships', label: 'Partnerships and acquisitions' },
  { id: 'financial', label: 'Funding & financial health' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [competitors, setCompetitors] = useState<CompetitorInfo[]>([]);
  const [originalCompetitors, setOriginalCompetitors] = useState<CompetitorInfo[]>([]);
  const [frequency, setFrequency] = useState<string>('weekly');
  const [originalFrequency, setOriginalFrequency] = useState<string>('weekly');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [originalSelectedTopics, setOriginalSelectedTopics] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [identifyingCompetitor, setIdentifyingCompetitor] = useState(false);

  // Check for changes whenever the editable fields change
  useEffect(() => {
    if (loading) return;
    
    const competitorsChanged = JSON.stringify(competitors.map(c => c.domain)) !== 
                               JSON.stringify(originalCompetitors.map(c => c.domain));
    const topicsChanged = JSON.stringify(selectedTopics.sort()) !== 
                          JSON.stringify(originalSelectedTopics.sort());
    const frequencyChanged = frequency !== originalFrequency;
    
    setHasChanges(competitorsChanged || topicsChanged || frequencyChanged);
  }, [competitors, selectedTopics, frequency, originalCompetitors, originalSelectedTopics, originalFrequency, loading]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settingsError && !settingsError.message.includes('JSON object requested')) {
          throw settingsError;
        }

        if (userSettings) {
          setSettings(userSettings);
          setFrequency(userSettings.report_frequency);
          setOriginalFrequency(userSettings.report_frequency);
          setSelectedTopics(userSettings.analysis_topics || []);
          setOriginalSelectedTopics(userSettings.analysis_topics || []);
          
          const competitorsList = userSettings.competitors.map((domain: string) => ({
            domain,
            name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
            description: 'Tracked competitor'
          }));
          setCompetitors(competitorsList);
          setOriginalCompetitors(JSON.parse(JSON.stringify(competitorsList)));
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error('Settings error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [navigate]);

  const handleAddCompetitor = async () => {
    if (!newCompetitor) return;
    
    if (!competitors.some(c => c.domain === newCompetitor)) {
      try {
        setIdentifyingCompetitor(true);
        
        // Check if it's a valid domain format
        if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(newCompetitor)) {
          // If not a valid domain, just add it as is
          setCompetitors([...competitors, {
            domain: newCompetitor,
            name: newCompetitor.split('.')[0].charAt(0).toUpperCase() + newCompetitor.split('.')[0].slice(1),
            description: 'Custom added competitor'
          }]);
        } else {
          // Try to get more info about this competitor using our database
          const competitorInfo = await identifyCompetitors(newCompetitor);
          
          // If we got info about this specific competitor, use it
          const matchedCompetitor = competitorInfo.find(c => c.domain === newCompetitor);
          
          if (matchedCompetitor) {
            setCompetitors([...competitors, matchedCompetitor]);
          } else {
            // Otherwise just add with basic info
            setCompetitors([...competitors, {
              domain: newCompetitor,
              name: newCompetitor.split('.')[0].charAt(0).toUpperCase() + newCompetitor.split('.')[0].slice(1),
              description: 'Custom added competitor'
            }]);
          }
        }
      } catch (err) {
        console.error('Error adding competitor:', err);
        // Add with basic info if there's an error
        setCompetitors([...competitors, {
          domain: newCompetitor,
          name: newCompetitor.split('.')[0].charAt(0).toUpperCase() + newCompetitor.split('.')[0].slice(1),
          description: 'Custom added competitor'
        }]);
      } finally {
        setNewCompetitor('');
        setIdentifyingCompetitor(false);
      }
    }
  };

  const handleRemoveCompetitor = (competitorDomain: string) => {
    setCompetitors(competitors.filter(c => c.domain !== competitorDomain));
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({
          competitors: competitors.map(c => c.domain),
          report_frequency: frequency,
          analysis_topics: selectedTopics,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (settingsError) {
        throw settingsError;
      }

      // Update the original values to match current values
      setOriginalCompetitors(JSON.parse(JSON.stringify(competitors)));
      setOriginalSelectedTopics([...selectedTopics]);
      setOriginalFrequency(frequency);
      setHasChanges(false);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">Settings</h1>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
            hasChanges && !saving
              ? 'border-[#4a86ff] text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff]'
              : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
        <div className="px-4 py-5 sm:p-6 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">Competitors being tracked</h2>
            <div className="space-y-2">
              {competitors.map((competitor) => (
                <div
                  key={competitor.domain}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{competitor.name}</h3>
                    <p className="text-sm text-gray-500">{competitor.domain}</p>
                    {competitor.description && (
                      <p className="text-xs text-gray-400 mt-1">{competitor.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCompetitor(competitor.domain)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="flex mt-3">
                <input
                  type="text"
                  className="flex-1 shadow-sm focus:ring-[#4a86ff] focus:border-[#4a86ff] block w-full sm:text-sm border-gray-300 rounded-l-md"
                  placeholder="Add competitor domain"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  disabled={identifyingCompetitor}
                />
                <button
                  onClick={handleAddCompetitor}
                  disabled={identifyingCompetitor}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-white bg-[#4a86ff] hover:bg-[#3a76ef] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {identifyingCompetitor ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Analysis topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleTopic(option.id)}
                  className={`relative flex items-start p-3 border rounded-md hover:bg-gray-50 ${
                    selectedTopics.includes(option.id)
                      ? 'border-[#4a86ff] bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                  </div>
                  {selectedTopics.includes(option.id) && (
                    <Check className="h-4 w-4 text-[#4a86ff]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Report frequency</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFrequency('weekly')}
                className={`p-3 text-left rounded-md border ${
                  frequency === 'weekly'
                    ? 'border-[#4a86ff] bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-sm">Weekly</div>
              </button>
              <button
                onClick={() => setFrequency('monthly')}
                className={`p-3 text-left rounded-md border ${
                  frequency === 'monthly'
                    ? 'border-[#4a86ff] bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-sm">Monthly</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;