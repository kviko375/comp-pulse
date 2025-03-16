import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';
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

// Extended competitor database with more entries
const fallbackDatabase: Record<string, CompetitorInfo[]> = {
  'seranking.com': [
    {
      domain: 'semrush.com',
      name: 'SEMrush',
      description: 'All-in-one digital marketing suite'
    },
    {
      domain: 'ahrefs.com',
      name: 'Ahrefs',
      description: 'SEO tools and resources'
    },
    {
      domain: 'moz.com',
      name: 'Moz',
      description: 'SEO software and data insights platform'
    }
  ],
  'pandadoc.com': [
    {
      domain: 'docusign.com',
      name: 'DocuSign',
      description: 'Electronic signature and agreement cloud'
    },
    {
      domain: 'hellosign.com',
      name: 'HelloSign',
      description: 'eSignature and digital workflow platform'
    },
    {
      domain: 'adobe.com',
      name: 'Adobe Sign',
      description: 'Digital document and e-signature solution'
    }
  ],
  'salesforce.com': [
    {
      domain: 'hubspot.com',
      name: 'HubSpot',
      description: 'CRM and marketing automation platform'
    },
    {
      domain: 'zoho.com',
      name: 'Zoho CRM',
      description: 'Cloud-based CRM solution'
    },
    {
      domain: 'microsoft.com/dynamics365',
      name: 'Microsoft Dynamics 365',
      description: 'Business applications and CRM platform'
    },
    {
      domain: 'oracle.com/cx',
      name: 'Oracle CX',
      description: 'Customer experience and CRM suite'
    }
  ]
};

// Industry patterns for competitor matching
const industryPatterns: Record<string, { pattern: RegExp; competitors: CompetitorInfo[] }> = {
  crm: {
    pattern: /sales|crm|dynamics/i,
    competitors: [
      {
        domain: 'hubspot.com',
        name: 'HubSpot',
        description: 'CRM and marketing automation platform'
      },
      {
        domain: 'zoho.com',
        name: 'Zoho CRM',
        description: 'Cloud-based CRM solution'
      },
      {
        domain: 'microsoft.com/dynamics365',
        name: 'Microsoft Dynamics 365',
        description: 'Business applications and CRM platform'
      }
    ]
  },
  doc: {
    pattern: /doc|sign|pdf|contract|agreement|paper|proposal/i,
    competitors: [
      {
        domain: 'docusign.com',
        name: 'DocuSign',
        description: 'Electronic signature platform'
      },
      {
        domain: 'hellosign.com',
        name: 'HelloSign',
        description: 'Digital signature solution'
      },
      {
        domain: 'pandadoc.com',
        name: 'PandaDoc',
        description: 'Document automation software'
      }
    ]
  },
  seo: {
    pattern: /seo|rank|search|analytics/i,
    competitors: [
      {
        domain: 'semrush.com',
        name: 'SEMrush',
        description: 'SEO and content marketing platform'
      },
      {
        domain: 'ahrefs.com',
        name: 'Ahrefs',
        description: 'SEO tools and resources'
      },
      {
        domain: 'moz.com',
        name: 'Moz',
        description: 'SEO software and tools'
      }
    ]
  }
};

// Domain-specific competitor mapping for common industries
const domainPatterns: Record<string, CompetitorInfo[]> = {
  'doc': industryPatterns.doc.competitors,
  'sign': industryPatterns.doc.competitors,
  'contract': industryPatterns.doc.competitors,
  'crm': industryPatterns.crm.competitors,
  'sales': industryPatterns.crm.competitors,
  'seo': industryPatterns.seo.competitors,
  'rank': industryPatterns.seo.competitors,
  'search': industryPatterns.seo.competitors
};

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
    // First check our fallback database
    if (fallbackDatabase[domain]) {
      return fallbackDatabase[domain];
    }

    // Try to use OpenAI for competitor identification
    try {
      const openAICompetitors = await identifyCompetitorsWithOpenAI(domain);
      if (openAICompetitors && openAICompetitors.length > 0) {
        return openAICompetitors;
      }
    } catch (openAIError) {
      console.warn('OpenAI identification failed, falling back to pattern matching');
    }

    // Then try pattern matching with improved regex
    const domainLower = domain.toLowerCase();
    for (const { pattern, competitors } of Object.values(industryPatterns)) {
      if (pattern.test(domainLower)) {
        return competitors;
      }
    }

    // Try to match based on domain name keywords
    const domainName = domain.split('.')[0].toLowerCase();
    for (const [keyword, competitors] of Object.entries(domainPatterns)) {
      if (domainName.includes(keyword)) {
        return competitors;
      }
    }

    // Return a default set of generic competitors
    return [
      {
        domain: 'competitor1.com',
        name: 'Competitor One',
        description: 'Similar service provider'
      },
      {
        domain: 'competitor2.com',
        name: 'Competitor Two',
        description: 'Alternative solution'
      },
      {
        domain: 'competitor3.com',
        name: 'Competitor Three',
        description: 'Industry leader'
      }
    ];
  } catch (error) {
    console.error('Error identifying competitors:', error);
    // Return empty array on error
    return [];
  }
}