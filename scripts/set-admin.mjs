import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin(email) {
  try {
    // First get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('email', email)
      .single();

    if (profileError) {
      if (profileError.message.includes('Results contain 0 rows')) {
        throw new Error(`No user found with email: ${email}`);
      }
      throw profileError;
    }

    if (profile.is_admin) {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }

    // Update the user's admin status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', profile.id);

    if (updateError) throw updateError;

    console.log(`Successfully set admin status for user: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

setAdmin(email);