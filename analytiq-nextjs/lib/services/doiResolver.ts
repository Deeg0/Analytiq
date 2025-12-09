import axios from 'axios';
import { ExtractedContent } from '@/lib/types/analysis';

const CROSSREF_API = 'https://api.crossref.org/works';
const UNPAYWALL_API = 'https://api.unpaywall.org/v2';

export async function resolveDoi(doi: string): Promise<ExtractedContent> {
  try {
    // Clean DOI
    const cleanDoi = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//, '');

    // Fetch metadata from CrossRef
    const metadataResponse = await axios.get(`${CROSSREF_API}/${cleanDoi}`, {
      timeout: 15000,
    });

    const work = metadataResponse.data.message;
    
    // Build metadata
    const metadata: Partial<ExtractedContent['metadata']> = {
      doi: cleanDoi,
      title: work.title?.[0] || work['container-title']?.[0],
      authors: work.author?.map((a: any) => 
        `${a.given || ''} ${a.family || ''}`.trim()
      ).filter((a: string) => a.length > 0) || [],
      journal: work['container-title']?.[0],
      publicationDate: work.published?.['date-parts']?.[0]?.join('-'),
    };

    // Try to get full text from Unpaywall
    let fullText = '';
    try {
      const unpaywallResponse = await axios.get(`${UNPAYWALL_API}/${cleanDoi}`, {
        params: {
          email: 'scientific-analyzer@example.com',
        },
        timeout: 15000,
      });

      const bestOaLocation = unpaywallResponse.data.best_oa_location;
      if (bestOaLocation?.url_for_pdf || bestOaLocation?.url_for_landing_page) {
        // If we have a PDF URL, we could fetch it, but for now we'll just note it
        metadata.funding = unpaywallResponse.data.z_authors?.map((a: any) => 
          a.affiliation?.join(', ')
        ).filter((f: string) => f) || [];
      }
    } catch (error) {
      // Unpaywall lookup failed, continue with metadata only
      console.warn('Unpaywall lookup failed:', error);
    }

    // Build text content from available metadata
    const textParts: string[] = [];
    
    if (metadata.title) {
      textParts.push(`Title: ${metadata.title}`);
    }
    
    if (metadata.authors && metadata.authors.length > 0) {
      textParts.push(`Authors: ${metadata.authors.join(', ')}`);
    }
    
    if (metadata.journal) {
      textParts.push(`Journal: ${metadata.journal}`);
    }
    
    if (work.abstract) {
      textParts.push(`Abstract: ${work.abstract}`);
    }

    // If we have full text URL, note it
    if (fullText) {
      textParts.push(fullText);
    } else {
      // Try to get abstract from CrossRef if available
      if (work.abstract) {
        textParts.push(work.abstract);
      }
    }

    return {
      text: textParts.join('\n\n'),
      metadata,
      sections: {
        abstract: work.abstract || undefined,
      },
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(`DOI not found: ${doi}. Please verify the DOI is correct.`);
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Request timeout: DOI lookup service took too long to respond');
    } else if (error.response?.status >= 500) {
      throw new Error('DOI service temporarily unavailable. Please try again later.');
    }
    throw new Error(`Failed to resolve DOI: ${error.message || 'Unknown error occurred'}`);
  }
}

