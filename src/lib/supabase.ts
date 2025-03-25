import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eicjcgvlvejsmtrffdgk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2pjZ3ZsdmVqc210cmZmZGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzA2MjAsImV4cCI6MjA1NjE0NjYyMH0.H7EWQCGzasEMBK2_unEYHWHpeRcIM81RIR8Ko0Z9AfI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);