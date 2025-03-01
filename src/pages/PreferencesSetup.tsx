import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

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

const frequencies = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

function PreferencesSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  // Pre-select 'features' and 'pricing' by default
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['features', 'pricing']);
  // Set 'monthly' as the default frequency
  const [frequency, setFrequency] = useState<string>('monthly');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleContinue = async () => {
    if (selectedOptions.length > 0 && frequency) {
      try {
        setSaving(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }

        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            analysis_topics: selectedOptions,
            report_frequency: frequency,
            competitors: location.state?.competitors || [],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (settingsError) {
          throw settingsError;
        }

        navigate('/reports');
      } catch (err) {
        setError('Failed to save preferences. Please try again.');
        console.error('Preferences error:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    // Navigate back to the competitor setup page, preserving the state
    // including the savedCompetitors
    navigate('/setup/competitors', { state: location.state });
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-md border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customize your analysis
              </h3>
            </div>
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-200">
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

            <div className="mt-6">
              <label className="text-base font-medium text-gray-900">
                What would you like to analyze?
              </label>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {analysisOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={cn(
                      "relative flex items-center justify-between p-4 border rounded-md hover:bg-gray-50",
                      selectedOptions.includes(option.id)
                        ? "border-[#4a86ff] bg-blue-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {option.label}
                    </div>
                    {selectedOptions.includes(option.id) && (
                      <Check className="h-4 w-4 text-[#4a86ff]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <label className="text-base font-medium text-gray-900">
                How often would you like to receive updates?
              </label>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {frequencies.map((freq) => (
                  <button
                    key={freq.id}
                    type="button"
                    onClick={() => setFrequency(freq.id)}
                    className={cn(
                      "relative flex items-center justify-between p-4 border rounded-md hover:bg-gray-50",
                      frequency === freq.id
                        ? "border-[#4a86ff] bg-blue-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {freq.label}
                    </div>
                    {frequency === freq.id && (
                      <Check className="h-4 w-4 text-[#4a86ff]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-500 font-medium">Step 2 of 2</span>
              </div>
              
              <button
                type="button"
                onClick={handleContinue}
                disabled={selectedOptions.length === 0 || !frequency || saving}
                className={cn(
                  "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white",
                  selectedOptions.length > 0 && frequency && !saving
                    ? "bg-[#4a86ff] hover:bg-[#3a76ef]"
                    : "bg-gray-300 cursor-not-allowed"
                )}
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

export default PreferencesSetup;