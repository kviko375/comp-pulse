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
    pattern: /doc|sign|pdf/i,
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
      }
    ]
  }
};

export async function identifyCompetitors(domain: string): Promise<CompetitorInfo[]> {
  try {
    // First check our fallback database
    if (fallbackDatabase[domain]) {
      return fallbackDatabase[domain];
    }

    // Then try pattern matching with improved regex
    const domainLower = domain.toLowerCase();
    for (const { pattern, competitors } of Object.values(industryPatterns)) {
      if (pattern.test(domainLower)) {
        return competitors;
      }
    }

    // If no matches found in our database, try the API
    if (import.meta.env.VITE_CLEARBIT_API_KEY) {
      const response = await axios.get(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_CLEARBIT_API_KEY}`
        }
      });

      const companyData = response.data;
      
      const similarCompaniesResponse = await axios.get(
        `https://company.clearbit.com/v2/companies/search?query=category:${companyData.category}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CLEARBIT_API_KEY}`
          }
        }
      );

      return similarCompaniesResponse.data.results
        .filter((company: any) => company.domain !== domain)
        .slice(0, 5)
        .map((company: any) => ({
          domain: company.domain,
          name: company.name,
          description: company.description || `${company.name} - ${company.category}`
        }));
    }

    // If no matches found, return empty array
    return [];
  } catch (error) {
    // Log only the error message and status, avoiding the full error object
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } else {
      console.error('Error identifying competitors:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    // Return empty array on error
    return [];
  }
}