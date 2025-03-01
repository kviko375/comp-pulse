// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the function
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the service role key to access admin functionality
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { reportId, userEmail, reportTitle, reportDate } = await req.json()

    if (!reportId || !userEmail || !reportTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Format the date for display
    const formattedDate = new Date(reportDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Send the email using a simple email template since custom templates might not be set up
    const { error: emailError } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      email_confirm: true,
      user_metadata: { temp_email: true },
      password: Math.random().toString(36).slice(-10), // Random password, user won't need it
    })

    if (emailError && !emailError.message.includes('already exists')) {
      throw emailError
    }

    // Send the actual email
    const { error } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to: userEmail,
        subject: `New Competitive Intelligence Report Available: ${reportTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0;">CompetitivePulse</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
              <h2>New Report Available</h2>
              <p>Hello,</p>
              <p>A new competitive intelligence report is now available for you:</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Report:</strong> ${reportTitle}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
              </div>
              <p>Log in to your CompetitivePulse dashboard to view the full report and gain valuable insights about your competitors.</p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="${Deno.env.get('PUBLIC_APP_URL') || 'https://your-app-url.com'}/reports" 
                   style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View Report
                </a>
              </div>
              <p>Thank you for using CompetitivePulse!</p>
            </div>
            <div style="text-align: center; padding: 10px; color: #6b7280; font-size: 12px;">
              <p>© 2025 CompetitivePulse. All rights reserved.</p>
            </div>
          </div>
        `
      }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})