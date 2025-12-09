import axios from 'axios';
import * as cheerio from 'cheerio';
import { ExtractedContent } from '@/lib/types/analysis';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

function extractStudyIdentifiersFromUrl(url: string): { studyName?: string; title?: string; keywords?: string } {
  try {
    // Decode URL to handle encoded characters (e.g., %20 for spaces, %27 for apostrophes)
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(url);
    } catch {
      decodedUrl = url;
    }
    
    const urlObj = new URL(decodedUrl);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(s => s.length > 0);
    
    // Extract meaningful keywords from URL path
    const keywords: string[] = [];
    let studyName: string | undefined;
    
    // Look for study names in filename (last segment, especially PDFs)
    if (segments.length > 0) {
      const filename = segments[segments.length - 1];
      
      // Remove file extension
      let cleanFilename = filename.replace(/\.(pdf|html|htm|xml|doc|docx)$/i, '');
      
      // Decode URL encoding in filename
      try {
        cleanFilename = decodeURIComponent(cleanFilename);
      } catch {
        // Keep original if decode fails
      }
      
      // First, remove common file suffixes/prefixes that are not part of study name
      let baseFilename = cleanFilename
        .replace(/\s+(book|review|summary|article|paper|report|doc|document).*$/i, '')
        .replace(/^(book|review|summary|article|paper|report|doc|document)\s+/i, '');
      
      // Look for patterns that suggest study names:
      // - Contains apostrophes and capitalized words (e.g., "Potenger's Cats", "Pottenger's Cats")
      // - Multiple capitalized words (e.g., "Pottenger Cats")
      // - Author names followed by topic
      
      // Pattern 1: Apostrophe pattern (e.g., "Potenger's Cats", "Pottenger's Cats")
      const apostrophePattern = /([A-Z][a-z]+(?:['']s|'s)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/;
      let match = baseFilename.match(apostrophePattern);
      if (match) {
        studyName = match[1].trim();
      }
      
      // Pattern 2: Multiple capitalized words (at least 2, suggesting a study name)
      if (!studyName) {
        const multiCapPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,5})/;
        match = baseFilename.match(multiCapPattern);
        if (match) {
          const candidate = match[1].trim();
          // Make sure it's not just common words
          const commonWords = /^(The|A|An|Study|Research|Analysis|Review|Article|Paper|Report|Document)/i;
          if (!commonWords.test(candidate) && candidate.length >= 5) {
            studyName = candidate;
          }
        }
      }
      
      // Pattern 3: If filename is mostly capitalized words, use the meaningful part
      if (!studyName && baseFilename.length > 5) {
        // Split by common separators and find the longest meaningful segment
        const segments = baseFilename.split(/[-_\s]+/).filter(s => s.length > 0);
        const meaningfulSegments = segments.filter(s => 
          /[A-Z]/.test(s) && s.length >= 3 && !/^\d+$/.test(s)
        );
        
        if (meaningfulSegments.length >= 2) {
          // Take first 2-3 segments as study name
          studyName = meaningfulSegments.slice(0, 3).join(' ');
        }
      }
      
      // Also extract all segments for keywords
      segments.forEach(segment => {
        const cleanSegment = segment
          .replace(/\.(html|pdf|xml|doc|docx)$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\d{4}/g, '') // Remove years
          .trim();
        
        try {
          const decodedSegment = decodeURIComponent(cleanSegment);
          if (decodedSegment.length >= 3 && !/^\d+$/.test(decodedSegment) && 
              !['docs', 'documents', 'files', 'pdfs', 'articles'].includes(decodedSegment.toLowerCase())) {
            keywords.push(decodedSegment);
          }
        } catch {
          if (cleanSegment.length >= 3 && !/^\d+$/.test(cleanSegment)) {
            keywords.push(cleanSegment);
          }
        }
      });
    }
    
    return {
      studyName: studyName,
      title: studyName || keywords[keywords.length - 1],
      keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    };
  } catch (error) {
    return {};
  }
}

export async function scrapeUrl(url: string): Promise<ExtractedContent> {
  try {
    // Extract study identifiers from URL path
    const urlStudyIdentifiers = extractStudyIdentifiersFromUrl(url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove();
    
    // Try to find main content area (common selectors for scientific journals)
    let mainContent = '';
    const contentSelectors = [
      '.article-content',
      '.article-body',
      '.main-content',
      '.content',
      'article',
      '.abstract',
      '[role="main"]',
      '.article-text',
      '.full-text',
      '.paper-content',
      '.research-article',
    ];

    for (const selector of contentSelectors) {
      const found = $(selector);
      if (found.length > 0) {
        mainContent = found.text();
        break;
      }
    }

    // Fallback to body if no specific content area found
    if (!mainContent || mainContent.length < 500) {
      mainContent = $('body').text();
    }
    
    // Extract more comprehensive content - look for all article sections
    let comprehensiveContent = mainContent;
    
    // Try to get additional content from common article sections
    const sectionSelectors = [
      '.abstract-section, .abstract',
      '.introduction-section, .introduction',
      '.methods-section, .methods, .methodology',
      '.results-section, .results, .findings',
      '.discussion-section, .discussion',
      '.conclusion-section, .conclusion',
      '.references-section, .references',
    ];
    
    const additionalSections: string[] = [];
    sectionSelectors.forEach(selector => {
      const sections = $(selector);
      if (sections.length > 0) {
        sections.each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 100) {
            additionalSections.push(text);
          }
        });
      }
    });
    
    // Combine all content for comprehensive analysis
    if (additionalSections.length > 0) {
      comprehensiveContent = [mainContent, ...additionalSections].join('\n\n');
    }

    // Extract metadata
    const metadata: Partial<ExtractedContent['metadata']> = {};
    
    // Try to extract title from multiple sources (URL identifiers as fallback)
    const extractedTitle = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="citation_title"]').attr('content') ||
                    $('meta[name="DC.Title"]').attr('content') ||
                    $('h1').first().text() ||
                    $('title').text() ||
                    urlStudyIdentifiers.title ||
                    undefined;
    
    // Use extracted study name from URL if found, otherwise use extracted title
    if (urlStudyIdentifiers.studyName) {
      metadata.title = urlStudyIdentifiers.studyName;
      // Store study name in metadata for AI reference
      (metadata as any).studyNameFromUrl = urlStudyIdentifiers.studyName;
    } else {
      metadata.title = extractedTitle;
    }
    
    // Add URL context for AI reference
    if (urlStudyIdentifiers.keywords) {
      (metadata as any).urlKeywords = urlStudyIdentifiers.keywords;
    }

    // Try to extract authors from multiple sources
    const authorElements = $('.author, [rel="author"], .authors, .byline, [itemprop="author"], .citation__authors');
    if (authorElements.length > 0) {
      metadata.authors = authorElements.map((_, el) => $(el).text().trim()).get();
    }
    
    // Try to extract journal
    metadata.journal = $('meta[name="citation_journal_title"]').attr('content') ||
                      $('meta[name="DC.Source"]').attr('content') ||
                      undefined;

    // Try to extract publication date
    metadata.publicationDate = $('meta[name="citation_publication_date"]').attr('content') ||
                              $('meta[name="DC.Date"]').attr('content') ||
                              undefined;

    // Clean up comprehensive content
    const text = comprehensiveContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Try to extract DOI from metadata or text content
    const doi = $('meta[name="citation_doi"]').attr('content') ||
                $('meta[name="DC.Identifier"]').attr('content') ||
                text.match(/doi[:\s]*10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/i)?.[0]?.replace(/doi[:\s]*/i, '') ||
                url.match(/10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/)?.[0];
    
    if (doi) {
      metadata.doi = doi.trim();
    }

    return {
      text,
      metadata,
      sections: {
        abstract: extractSection(text, ['abstract', 'summary']),
        introduction: extractSection(text, ['introduction', 'background']),
        methods: extractSection(text, ['methods', 'methodology', 'materials and methods']),
        results: extractSection(text, ['results', 'findings']),
        discussion: extractSection(text, ['discussion']),
        conclusions: extractSection(text, ['conclusion', 'conclusions']),
      },
    };
    } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: The URL took too long to respond');
    }
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('URL not found (404)');
      } else if (error.response.status === 403) {
        throw new Error('Access denied: This URL blocks automated access');
      }
      throw new Error(`Failed to fetch URL: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Failed to fetch URL: No response from server. The site may be down or blocking requests.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Request timeout: The URL took too long to respond');
    } else {
      throw new Error(`Failed to scrape URL: ${error.message}`);
    }
  }
}

function extractSection(text: string, keywords: string[]): string | undefined {
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    // More comprehensive regex to extract larger sections
    const regex = new RegExp(`(${keyword}[\\s\\S]{0,100})([\\s\\S]{500,5000}?)(?=\\n\\s*[A-Z][a-z]+:|\\n\\s*[A-Z]{2,}|$)`, 'i');
    const match = text.match(regex);
    if (match && match[2]) {
      // Extract more content for thorough analysis
      return match[2].trim().substring(0, 5000);
    }
  }
  
  return undefined;
}

