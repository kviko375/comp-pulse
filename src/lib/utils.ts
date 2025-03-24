import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBusinessEmail(email: string): boolean {
  const commonPersonalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'mail.com', 'protonmail.com', 'zoho.com'
  ];
  const domain = email.split('@')[1];
  return !commonPersonalDomains.includes(domain.toLowerCase());
}

export function getDomainFromEmail(email: string): string {
  return email.split('@')[1];
}

export interface CompetitorInfo {
  domain: string;
  name: string;
  description: string;
}

// Cache for Perplexity AI responses to avoid repeated API calls
const perplexityCache: Record<string, CompetitorInfo[]> = {};

export async function identifyCompetitors(domain: string): Promise<CompetitorInfo[]> {
  // Input validation
  if (!domain || typeof domain !== 'string') {
    console.error('Invalid domain provided');
    return [];
  }

  // Check cache first
  if (perplexityCache[domain]) {
    return perplexityCache[domain];
  }

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that identifies business competitors. Respond only with a JSON array.'
          },
          {
            role: 'user',
            content: `List the top 3-5 competitors of https://${domain} as a JSON array. Each competitor should have: domain, name, and description fields. Example format: [{"domain":"competitor.com","name":"Competitor Inc","description":"Brief description"}]`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('Empty response from Perplexity API');
      return [];
    }

    // Extract JSON array from response, handling potential text wrapping
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) {
      console.warn('No JSON array found in response');
      return [];
    }

    try {
      const competitors = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(competitors)) {
        console.warn('Parsed content is not an array');
        return [];
      }

      const result = competitors.map(comp => ({
        domain: typeof comp.domain === 'string' ? comp.domain : `${comp.name?.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        name: typeof comp.name === 'string' ? comp.name : comp.domain?.split('.')[0] || 'Unknown',
        description: typeof comp.description === 'string' ? comp.description : `Competitor of ${domain}`
      }));

      // Cache the result
      perplexityCache[domain] = result;
      return result;
    } catch (parseError) {
      console.error('Failed to parse Perplexity response:', parseError);
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Perplexity API error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    } else {
      console.error('Error identifying competitors:', error);
    }
    return [];
  }
}