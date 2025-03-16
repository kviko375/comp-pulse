import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, LogIn, BarChart2, CheckCircle } from 'lucide-react';
import { isBusinessEmail } from '../lib/utils';
import { supabase } from '../lib/supabase';
import OpenAI from 'openai';

interface SignUpProps {
  isLoginPage?: boolean;
}

function SignUp({ isLoginPage }: SignUpProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(isLoginPage || location.state?.isLogin || false);

  useEffect(() => {
    // Update isLogin when isLoginPage prop changes
    if (isLoginPage !== undefined) {
      setIsLogin(isLoginPage);
    }
  }, [isLoginPage]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/reports');
      }
    });
  }, [navigate]);

  const identifyCompetitorsWithOpenAI = async (domain: string) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found');
      return null;
    }

    try {
      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that identifies business competitors.'
          },
          {
            role: 'user',
            content: `Identify the top 3-5 competitors for ${domain}. Return ONLY a JSON array of objects with the following structure: [{"domain": "competitor.com", "name": "Competitor Name", "description": "Brief description of what they do"}]. Do not include any explanations or other text.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const parsedContent = JSON.parse(content);
      return Array.isArray(parsedContent.competitors) ? parsedContent.competitors : parsedContent;
    } catch (err) {
      console.error('OpenAI API error:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Incorrect email or password. Please try again.');
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }

        if (signInData.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', signInData.user.id)
            .single();

          if (profile?.is_admin) {
            navigate('/admin');
          } else {
            navigate('/reports');
          }
          return;
        }
      } else {
        // Try to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        // Handle user already exists error
        if (signUpError) {
          if (signUpError.message.includes('user_already_exists') || signUpError.message.includes('User already registered')) {
            setError('Account already exists. Please log in instead.');
            setIsLogin(true);
            setLoading(false);
            return;
          } else {
            throw signUpError;
          }
        }

        if (signUpData.user) {
          const isBusinessUser = isBusinessEmail(email);
          let competitors = null;

          if (isBusinessUser) {
            // Always make the OpenAI call for business emails
            const domain = email.split('@')[1];
            competitors = await identifyCompetitorsWithOpenAI(domain);
          }

          navigate('/setup/competitors', { 
            state: { 
              email,
              isBusinessEmail: isBusinessUser,
              savedCompetitors: competitors
            } 
          });
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err instanceof Error) {
        if (err.message.includes('user_already_exists') || err.message.includes('User already registered')) {
          setError('Account already exists. Please log in instead.');
          setIsLogin(true);
        } else if (err.message.includes('invalid_credentials')) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLanding = () => {
    navigate('/');
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    navigate(isLogin ? '/signup' : '/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left column - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <button 
              onClick={goToLanding}
              className="flex items-center text-[#4a86ff] hover:text-[#3a76ef]"
            >
              <BarChart2 className="h-8 w-8" />
              <span className="ml-2 text-2xl font-bold">CompetitivePulse</span>
            </button>
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin 
                ? 'Sign in to access your competitive intelligence dashboard'
                : 'Create your account to start tracking competitors'
              }
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
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

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4a86ff] focus:border-[#4a86ff] sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4a86ff] focus:border-[#4a86ff] sm:text-sm"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Create Account
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isLogin ? 'New to CompetitivePulse?' : 'Already have an account?'}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff]"
                >
                  {isLogin ? 'Create a new account' : 'Sign in to existing account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Image and benefits */}
      <div className="hidden lg:block relative w-0 flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-6">
              {isLogin ? 'Welcome back to CompetitivePulse' : 'Gain the competitive edge'}
            </h2>
            <p className="mt-2 text-lg text-gray-600 text-center mb-8">
              {isLogin 
                ? 'Access your competitive intelligence dashboard and stay ahead of market trends.'
                : 'Track your competitors, monitor market changes, and receive AI-powered insights.'
              }
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-[#4a86ff]" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Comprehensive tracking</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor competitors across 8 critical dimensions including features, pricing, and market expansion.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-[#4a86ff]" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">AI-powered analysis</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get actionable insights without the manual research, delivered on your schedule.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-[#4a86ff]" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Easy setup</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started in minutes with our guided setup process and customizable preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;