import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role key
function getAdminClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

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