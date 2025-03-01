import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import SignUp from './pages/SignUp';
import CompetitorSetup from './pages/CompetitorSetup';
import PreferencesSetup from './pages/PreferencesSetup';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignUp isLoginPage={true} />} />
        <Route path="/signup" element={<SignUp isLoginPage={false} />} />
        <Route path="/admin" element={<Admin />} />
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