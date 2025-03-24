import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, ArrowRight, CheckCircle, Zap, LineChart, Users, 
  UserPlus, Globe, MessageSquare, Handshake, DollarSign,
  Crown, Target, TrendingUp
} from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-[#4a86ff]" />
              <span className="ml-2 text-xl font-bold text-gray-900">CompetitivePulse</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-[#4a86ff] text-white px-4 py-2 rounded-md font-medium hover:bg-[#3a76ef] transition-colors"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-[#4a86ff]">
                  Introducing
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900">AI-driven</span>
                  <span className="block text-[#4a86ff]">Competitive Intelligence</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Automatically track competitors' product & pricing changes, monitor market trends, and receive actionable insights without the manual research.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#4a86ff] hover:bg-[#3a76ef] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4a86ff] transition-colors"
                >
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <div className="mt-6">
                <div className="inline-flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="ml-2 text-sm text-gray-500">No credit card required</p>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full">
                <div className="relative block w-full">
                  <svg className="w-full" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                    {/* Background gradient */}
                    <defs>
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f0f7ff" />
                        <stop offset="100%" stopColor="#e6f0ff" />
                      </linearGradient>
                    </defs>
                    
                    {/* Abstract shapes */}
                    <circle cx="150" cy="100" r="60" fill="#4a86ff" opacity="0.7" />
                    <circle cx="450" cy="320" r="80" fill="#3a76ef" opacity="0.6" />
                    <circle cx="400" cy="80" r="40" fill="#2a66df" opacity="0.5" />
                    <circle cx="100" cy="300" r="50" fill="#1a56cf" opacity="0.4" />
                    
                    {/* Lines connecting elements */}
                    <path d="M150,100 L400,80" stroke="#4a86ff" strokeWidth="2" opacity="0.6" />
                    <path d="M150,100 L100,300" stroke="#4a86ff" strokeWidth="2" opacity="0.6" />
                    <path d="M400,80 L450,320" stroke="#4a86ff" strokeWidth="2" opacity="0.6" />
                    <path d="M100,300 L450,320" stroke="#4a86ff" strokeWidth="2" opacity="0.6" />
                    
                    {/* Data points */}
                    <circle cx="150" cy="100" r="6" fill="#ffffff" />
                    <circle cx="400" cy="80" r="6" fill="#ffffff" />
                    <circle cx="100" cy="300" r="6" fill="#ffffff" />
                    <circle cx="450" cy="320" r="6" fill="#ffffff" />
                    
                    {/* Small decorative elements */}
                    <circle cx="250" cy="150" r="4" fill="#ffffff" />
                    <circle cx="300" cy="250" r="4" fill="#ffffff" />
                    <circle cx="350" cy="180" r="4" fill="#ffffff" />
                    <circle cx="200" cy="220" r="4" fill="#ffffff" />
                    
                    {/* Chart- like elements */}
                    <rect x="180" y="180" width="240" height="120" rx="10" fill="white" opacity="0.9" />
                    <line x1="200" y1="240" x2="400" y2="240" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="200" y1="210" x2="400" y2="210" stroke="#e5e7eb" strokeWidth="2" />
                    <line x1="200" y1="270" x2="400" y2="270" stroke="#e5e7eb" strokeWidth="2" />
                    
                    {/* Chart bars */}
                    <rect x="220" y="250" width="20" height="30" rx="3" fill="#4a86ff" />
                    <rect x="260" y="230" width="20" height="50" rx="3" fill="#3a76ef" />
                    <rect x="300" y="210" width="20" height="70" rx="3" fill="#5a96ff" />
                    <rect x="340" y="240" width="20" height="40" rx="3" fill="#4a86ff" />
                    <rect x="380" y="220" width="20" height="60" rx="3" fill="#3a76ef" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personas Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#4a86ff] tracking-wide uppercase">Built for leaders</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Who uses CompetitivePulse?
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Built for decision-makers at SaaS Companies.
            </p>
          </div>

          <div className="mt-16">
            {/* Leaders & Decision Makers */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#4a86ff] transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Crown className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Founders & CEOs</h3>
                <p className="mt-2 text-base text-gray-500">
                  Make strategic decisions with comprehensive market intelligence and competitor analysis.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#4a86ff] transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Growth & Marketing Executives</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track competitor strategies and optimize your market positioning.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-[#4a86ff] transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Product Managers</h3>
                <p className="mt-2 text-base text-gray-500">
                  Stay informed about feature launches and product updates from competitors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Tracking Aspects Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#4a86ff] tracking-wide uppercase">Comprehensive tracking</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Monitor 8 critical competitive aspects
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our AI-powered platform delivers complete competitive intelligence across all dimensions that matter.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Feature launches</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track competitors' new features, improvements, and product updates that could impact market expectations.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Pricing changes</h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor pricing shifts, new models, and promotional strategies that affect customer acquisition.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Acquisition strategies</h3>
                <p className="mt-2 text-base text-gray-500">
                  Analyze competitors' marketing tactics, sales approaches, and go-to-market strategies.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Key hires & talent</h3>
                <p className="mt-2 text-base text-gray-500">
                  Identify strategic talent moves that signal new directions or upcoming innovations.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Market expansion</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track geographical expansion and new vertical entries that indicate growth strategies.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Customer feedback</h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor reviews and social sentiment to identify competitor weaknesses and opportunities.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <Handshake className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Partnerships & acquisitions</h3>
                <p className="mt-2 text-base text-gray-500">
                  Stay informed about strategic alliances and M&A activities that reshape the competitive landscape.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#4a86ff] text-white mb-4">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Funding & financial health</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track funding rounds and financial indicators that signal upcoming competitive moves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#4a86ff] tracking-wide uppercase">How it works</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Actionable intelligence, delivered
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our AI does the heavy lifting so you can focus on strategic decisions.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#4a86ff] mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Set up tracking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Tell us which competitors to monitor and what aspects matter most to your business.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#4a86ff] mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">AI analysis</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our AI continuously scans and analyzes competitor activities across all 8 key dimensions.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-[#4a86ff] mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Receive reports</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get comprehensive, actionable reports delivered on your preferred schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="bg-[#4a86ff] rounded-lg shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center lg:max-w-3xl">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to gain a competitive edge?</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                  Start monitoring your competitors today with our AI-powered platform.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-[#4a86ff] bg-white hover:bg-blue-50 shadow-lg transition-all"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart2 className="h-8 w-8 text-[#4a86ff]" />
              <span className="ml-2 text-xl font-bold text-gray-900">CompetitivePulse</span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 CompetitivePulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;