import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import OpenAI from 'openai';

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

// Cache for OpenAI responses to avoid repeated API calls
const openAICache: Record<string, CompetitorInfo[]> = {};

async function identifyCompetitorsWithOpenAI(domain: string): Promise<CompetitorInfo[]> {
  // Check cache first
  if (openAICache[domain]) {
    return openAICache[domain];
  }
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found, using fallback methods');
    throw new Error('OpenAI API key not configured');
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that identifies business competitors.'
        },
        {
          role: 'user',
          content: `Identify the top 3-5 competitors for ${domain}. Return ONLY a JSON array of objects with the following structure: [{"domain": "competitor.com", "name": "Competitor Name", "description": "Brief description of what they do"}]. Do not include any explanations or other text.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      const parsedContent = JSON.parse(content);
      
      if (Array.isArray(parsedContent.competitors)) {
        const competitors = parsedContent.competitors;
        
        const result = competitors.map((comp: any) => ({
          domain: comp.domain,
          name: comp.name,
          description: comp.description || `Competitor of ${domain}`
        }));
        
        openAICache[domain] = result;
        return result;
      } else if (Array.isArray(parsedContent)) {
        const competitors = parsedContent;
        
        const result = competitors.map((comp: any) => ({
          domain: comp.domain,
          name: comp.name,
          description: comp.description || `Competitor of ${domain}`
        }));
        
        openAICache[domain] = result;
        return result;
      }
      
      throw new Error('Invalid response format from OpenAI');
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse competitor data from OpenAI');
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', {
        status: error.status,
        message: error.message,
        type: error.type
      });
      
      if (error.status === 429) {
        console.error('OpenAI rate limit exceeded. Using fallback methods.');
      }
    }
    throw error;
  }
}

export async function identifyCompetitors(domain: string): Promise<CompetitorInfo[]> {
  try {
    // Try to use OpenAI for competitor identification
    try {
      const openAICompetitors = await identifyCompetitorsWithOpenAI(domain);
      if (openAICompetitors && openAICompetitors.length > 0) {
        return openAICompetitors;
      }
    } catch (openAIError) {
      console.warn('OpenAI identification failed, falling back to pattern matching');
      throw openAIError;
    }
  } catch (error) {
    console.error('Error identifying competitors:', error);
    // Return empty array on error
    return [];
  }
}