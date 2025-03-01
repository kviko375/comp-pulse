import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadReport(userId, reportPath, title, reportDate) {
  try {
    // Read the HTML file
    const reportContent = readFileSync(reportPath, 'utf8');
    const fileName = `${userId}/${reportDate}-${path.basename(reportPath)}`;

    // Upload to Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('reports')
      .upload(fileName, reportContent, {
        contentType: 'text/html',
        upsert: true
      });

    if (storageError) {
      throw storageError;
    }

    // Create record in reports table
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .upsert({
        user_id: userId,
        title,
        storage_path: fileName,
        report_date: reportDate
      }, {
        onConflict: 'user_id,report_date'
      });

    if (reportError) {
      throw reportError;
    }

    console.log(`Successfully uploaded report for user ${userId}`);
    return reportData;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
}

// Example usage:
// SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node upload-report.js
async function main() {
  const [,, userId, reportPath, title, reportDate] = process.argv;

  if (!userId || !reportPath || !title || !reportDate) {
    console.error('Usage: node upload-report.js <userId> <reportPath> <title> <reportDate>');
    process.exit(1);
  }

  try {
    await uploadReport(userId, reportPath, title, reportDate);
  } catch (error) {
    console.error('Failed to upload report:', error);
    process.exit(1);
  }
}

main();