import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import SignUp from './pages/SignUp';
import CompetitorSetup from './pages/CompetitorSetup';
import PreferencesSetup from './pages/PreferencesSetup';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportViewer from './pages/ReportViewer';
import PublicReportViewer from './pages/PublicReportViewer';
import Admin from './pages/Admin';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return <div>Loading...</div>;
  }

  return session ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
    </div>
  );
}

// Preview component for social media image
function PreviewImage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <svg className="w-[1200px] h-[630px]" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f7ff" />
            <stop offset="100%" stopColor="#e6f0ff" />
          </linearGradient>
        </defs>
        
        {/* Abstract shapes */}
        <circle cx="300" cy="200" r="120" fill="#4a86ff" opacity="0.7" />
        <circle cx="900" cy="440" r="160" fill="#3a76ef" opacity="0.6" />
        <circle cx="800" cy="160" r="80" fill="#2a66df" opacity="0.5" />
        <circle cx="200" cy="400" r="100" fill="#1a56cf" opacity="0.4" />
        
        {/* Lines connecting elements */}
        <path d="M300,200 L800,160" stroke="#4a86ff" strokeWidth="4" opacity="0.6" />
        <path d="M300,200 L200,400" stroke="#4a86ff" strokeWidth="4" opacity="0.6" />
        <path d="M800,160 L900,440" stroke="#4a86ff" strokeWidth="4" opacity="0.6" />
        <path d="M200,400 L900,440" stroke="#4a86ff" strokeWidth="4" opacity="0.6" />
        
        {/* Data points */}
        <circle cx="300" cy="200" r="12" fill="#ffffff" />
        <circle cx="800" cy="160" r="12" fill="#ffffff" />
        <circle cx="200" cy="400" r="12" fill="#ffffff" />
        <circle cx="900" cy="440" r="12" fill="#ffffff" />
        
        {/* Small decorative elements */}
        <circle cx="500" cy="300" r="8" fill="#ffffff" />
        <circle cx="600" cy="500" r="8" fill="#ffffff" />
        <circle cx="700" cy="360" r="8" fill="#ffffff" />
        <circle cx="400" cy="440" r="8" fill="#ffffff" />
        
        {/* Chart-like elements */}
        <rect x="360" y="360" width="480" height="240" rx="20" fill="white" opacity="0.9" />
        <line x1="400" y1="480" x2="800" y2="480" stroke="#e5e7eb" strokeWidth="4" />
        <line x1="400" y1="420" x2="800" y2="420" stroke="#e5e7eb" strokeWidth="4" />
        <line x1="400" y1="540" x2="800" y2="540" stroke="#e5e7eb" strokeWidth="4" />
        
        {/* Chart bars */}
        <rect x="440" y="500" width="40" height="60" rx="6" fill="#4a86ff" />
        <rect x="520" y="460" width="40" height="100" rx="6" fill="#3a76ef" />
        <rect x="600" y="420" width="40" height="140" rx="6" fill="#5a96ff" />
        <rect x="680" y="480" width="40" height="80" rx="6" fill="#4a86ff" />
        <rect x="760" y="440" width="40" height="120" rx="6" fill="#3a76ef" />
      </svg>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignUp isLoginPage={true} />} />
        <Route path="/signup" element={<SignUp isLoginPage={false} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/public/reports/:reportId" element={<PublicReportViewer />} />
        <Route path="/preview" element={<PreviewImage />} />
        <Route
          path="/setup/competitors"
          element={
            <PrivateRoute>
              <CompetitorSetup />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/preferences"
          element={
            <PrivateRoute>
              <PreferencesSetup />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/:reportId"
          element={
            <PrivateRoute>
              <AppLayout>
                <ReportViewer />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Redirect authenticated users to Reports page */}
        <Route
          path="*"
          element={
            <PrivateRoute>
              <Navigate to="/reports" replace />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App