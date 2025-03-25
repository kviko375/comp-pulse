import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key
function getAdminClient() {
  const supabaseUrl = 'https://eicjcgvlvejsmtrffdgk.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2pjZ3ZsdmVqc210cmZmZGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDU3MDYyMCwiZXhwIjoyMDU2MTQ2NjIwfQ.NAsFwIcCMcAHDD9nWJXvzM4-x83DyYih8WpD_jrePzw';

  if (!supabaseUrl || !supabaseServiceKey) {
    // Only throw if we're on an admin page
    if (window.location.pathname.startsWith('/admin')) {
      throw new Error('Missing required environment variables for admin client');
    }
    // Return null for non-admin pages
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

// Export adminClient getter for other admin functions
export const getAdmin = () => {
  const client = getAdminClient();
  if (!client) {
    throw new Error('Admin client not available');
  }
  return client;
};