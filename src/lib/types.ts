export interface UserSettings {
  id: string;
  user_id: string;
  competitors: string[];
  analysis_topics: string[];
  report_frequency: 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface CompetitorInfo {
  domain: string;
  name: string;
  description: string;
}