// CommonJS version for better Node.js compatibility
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function setAdmin(email) {
  try {
    // First get the user's ID from their email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (userError) throw userError;
    if (!users?.length) throw new Error('User not found');

    const userId = users[0].id;

    // Update the user's profile to make them an admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userId);

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