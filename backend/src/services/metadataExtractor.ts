import { StudyMetadata, ExtractedContent } from '../types/analysis';

export function extractMetadata(content: ExtractedContent): StudyMetadata {
  const metadata: any = {
    authors: content.metadata.authors || [],
    affiliations: [],
    funding: [],
    journal: content.metadata.journal,
    publicationDate: content.metadata.publicationDate,
    doi: content.metadata.doi,
    title: content.metadata.title,
    studyType: extractStudyType(content.text),
    sampleSize: extractSampleSize(content.text),
  };
  
  // Preserve custom fields from URL extraction (like studyNameFromUrl)
  if ((content.metadata as any).studyNameFromUrl) {
    metadata.studyNameFromUrl = (content.metadata as any).studyNameFromUrl;
  }
  if ((content.metadata as any).urlKeywords) {
    metadata.urlKeywords = (content.metadata as any).urlKeywords;
  }

  // Extract additional metadata from text
  if (content.text) {
    metadata.authors = metadata.authors.length > 0 
      ? metadata.authors 
      : extractAuthorsFromText(content.text);
    
    metadata.affiliations = extractAffiliations(content.text);
    metadata.funding = extractFunding(content.text);
    
    if (!metadata.journal) {
      metadata.journal = extractJournal(content.text);
    }
    
    if (!metadata.publicationDate) {
      metadata.publicationDate = extractDate(content.text);
    }
  }

  return metadata;
}

function extractAuthorsFromText(text: string): string[] {
  const authors: string[] = [];
  const lines = text.split('\n').slice(0, 30);
  
  // Common author patterns
  const patterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+)*)/,
    /Authors?:\s*(.+?)(?:\n|$)/i,
    /^([A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+)/,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const authorText = match[1] || match[0];
        const authorList = authorText
          .split(/,|and|&/)
          .map(a => a.trim())
          .filter(a => a.length > 2 && a.length < 100);
        if (authorList.length > 0) {
          authors.push(...authorList);
          break;
        }
      }
    }
    if (authors.length >= 5) break; // Limit to first 5 authors
  }

  return authors.slice(0, 10);
}

function extractAffiliations(text: string): string[] {
  const affiliations: string[] = [];
  const affiliationPatterns = [
    /\d+\s+([A-Z][^.]{10,100}(?:University|College|Institute|Hospital|Center|Centre)[^.]{0,50})/g,
    /Affiliation[s]?:\s*(.+?)(?:\n|$)/gi,
    /(\d+[^\d]{5,100}(?:University|College|Institute)[^\d]{0,50})/g,
  ];

  for (const pattern of affiliationPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const aff = match[1]?.trim();
      if (aff && aff.length > 10 && aff.length < 200) {
        affiliations.push(aff);
      }
    }
    if (affiliations.length > 0) break;
  }

  return [...new Set(affiliations)].slice(0, 10);
}

function extractFunding(text: string): string[] {
  const funding: string[] = [];
  const fundingPatterns = [
    /Funding[:\s]+(.+?)(?:\n|Acknowledg|Competing|Conflict)/gis,
    /Supported by[:\s]+(.+?)(?:\n|$)/gi,
    /Grant[s]?[:\s]+(.+?)(?:\n|$)/gi,
    /(?:NIH|NSF|European Commission|Wellcome|Bill.*Melinda Gates).{0,200}/gi,
  ];

  for (const pattern of fundingPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const fund = match[1]?.trim() || match[0]?.trim();
      if (fund && fund.length > 5 && fund.length < 500) {
        funding.push(fund);
      }
    }
  }

  // Also look for specific funding agency mentions
  const agencies = [
    /(NIH|National Institutes of Health)/gi,
    /(NSF|National Science Foundation)/gi,
    /(European Commission|EU Framework)/gi,
    /(Wellcome Trust)/gi,
    /(Bill.*Melinda Gates Foundation)/gi,
    /(Pharmaceutical|Pharma|Biotech|Biotechnology).{0,50}(?:Inc|Ltd|Corp)/gi,
  ];

  for (const pattern of agencies) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      funding.push(match[0]);
    }
  }

  return [...new Set(funding)].slice(0, 10);
}

function extractJournal(text: string): string | undefined {
  const patterns = [
    /Published in[:\s]+(.+?)(?:\n|$)/i,
    /Journal[:\s]+(.+?)(?:\n|$)/i,
    /(?:The|A)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Journal|Review|Annals|Proceedings))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

function extractDate(text: string): string | undefined {
  const patterns = [
    /(\d{4}-\d{2}-\d{2})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+(\d{4})/i,
    /Published[:\s]+(.+?)(?:\n|$)/i,
    /(\d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[0].includes('-')) {
        return match[0];
      } else if (match[2]) {
        return match[2];
      } else if (match[1] && /^\d{4}$/.test(match[1])) {
        return match[1];
      }
    }
  }

  return undefined;
}

function extractStudyType(text: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('meta-analysis') || lowerText.includes('systematic review')) {
    return 'Meta-analysis';
  }
  if (lowerText.includes('randomized') || lowerText.includes('rct') || lowerText.includes('randomised')) {
    return 'Randomized Controlled Trial';
  }
  if (lowerText.includes('cohort study') || lowerText.includes('prospective')) {
    return 'Cohort Study';
  }
  if (lowerText.includes('case-control')) {
    return 'Case-Control Study';
  }
  if (lowerText.includes('cross-sectional') || lowerText.includes('survey')) {
    return 'Cross-sectional Study';
  }
  if (lowerText.includes('observational')) {
    return 'Observational Study';
  }
  if (lowerText.includes('in vitro') || lowerText.includes('cell culture')) {
    return 'In Vitro Study';
  }
  if (lowerText.includes('animal') || lowerText.includes('mouse') || lowerText.includes('rat')) {
    return 'Animal Study';
  }
  
  return undefined;
}

function extractSampleSize(text: string): number | undefined {
  const patterns = [
    /(?:sample size|n\s*[=:]|participants?[:\s]+|subjects?[:\s]+)(?:n\s*[=:]?\s*)?(\d+(?:\s*,\s*\d{3})*)/i,
    /(?:n\s*=\s*)(\d+(?:\s*,\s*\d{3})*)/i,
    /(?:total of|totaling)\s+(\d+(?:\s*,\s*\d{3})*)\s+(?:participants|subjects|patients|individuals)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr, 10);
      if (num > 0 && num < 100000000) {
        return num;
      }
    }
  }

  return undefined;
}

