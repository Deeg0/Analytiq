import { StudyMetadata, ExtractedContent } from '@/lib/types/analysis';

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
    /Funding[:\s]+([\s\S]+?)(?:\n|Acknowledg|Competing|Conflict)/gi,
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

/**
 * Double-check and validate extracted metadata by cross-referencing with the full text
 * This ensures accuracy and catches any extraction errors
 */
export function validateAndCrossCheckMetadata(metadata: StudyMetadata, fullText: string): StudyMetadata {
  const validated: StudyMetadata = { ...metadata };
  const lowerText = fullText.toLowerCase();

  // Double-check title - verify it appears in the text
  if (validated.title) {
    const titleLower = validated.title.toLowerCase();
    // Check if title appears in first 2000 characters (abstract/intro area)
    const textStart = fullText.substring(0, 2000).toLowerCase();
    if (!textStart.includes(titleLower.substring(0, Math.min(50, titleLower.length)))) {
      // Title might be incorrect, try to find a better match
      const titlePattern = /(?:title|study|paper|article)[:\s]+(.{10,200}?)(?:\n|abstract|introduction|$)/i;
      const match = fullText.match(titlePattern);
      if (match && match[1]) {
        const candidateTitle = match[1].trim().split('\n')[0].trim();
        if (candidateTitle.length > 10 && candidateTitle.length < 300) {
          validated.title = candidateTitle;
        }
      }
    }
  }

  // Double-check authors - verify they appear in the text
  if (validated.authors && validated.authors.length > 0) {
    const verifiedAuthors: string[] = [];
    for (const author of validated.authors) {
      const authorLower = author.toLowerCase();
      // Check if author name appears in text (allowing for variations)
      const authorParts = authorLower.split(/\s+/).filter(p => p.length > 2);
      if (authorParts.length >= 2) {
        // Check if at least first and last name appear
        const firstName = authorParts[0];
        const lastName = authorParts[authorParts.length - 1];
        if (lowerText.includes(firstName) && lowerText.includes(lastName)) {
          verifiedAuthors.push(author);
        }
      } else {
        // Single name or initials - include if it appears
        if (lowerText.includes(authorLower)) {
          verifiedAuthors.push(author);
        }
      }
    }
    // Keep verified authors, or keep original if verification failed (might be in metadata only)
    if (verifiedAuthors.length > 0) {
      validated.authors = verifiedAuthors;
    }
  }

  // Double-check journal - verify it appears in the text
  if (validated.journal) {
    const journalLower = validated.journal.toLowerCase();
    // Check if journal name appears in text
    if (!lowerText.includes(journalLower.substring(0, Math.min(30, journalLower.length)))) {
      // Try to find journal in text
      const journalPatterns = [
        /(?:published in|journal|periodical)[:\s]+([A-Z][^.\n]{5,100}?)(?:\n|\.|$)/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Journal|Review|Annals|Proceedings|Magazine|Quarterly))[^a-z]/i,
      ];
      for (const pattern of journalPatterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
          const candidateJournal = match[1].trim();
          if (candidateJournal.length > 5 && candidateJournal.length < 150) {
            validated.journal = candidateJournal;
            break;
          }
        }
      }
    }
  }

  // Double-check DOI - verify format and presence
  if (validated.doi) {
    // Validate DOI format (should be like 10.1234/example)
    if (!/^10\.\d{4,}\/.+/.test(validated.doi)) {
      // Try to find DOI in text
      const doiPattern = /(?:doi|digital object identifier)[:\s]*10\.\d{4,}\/[^\s\n]+/i;
      const match = fullText.match(doiPattern);
      if (match) {
        validated.doi = match[0].replace(/^(?:doi|digital object identifier)[:\s]*/i, '').trim();
      } else {
        // Invalid DOI format, remove it
        validated.doi = undefined;
      }
    } else {
      // Verify DOI appears in text
      if (!lowerText.includes(validated.doi.toLowerCase())) {
        // DOI might be in metadata but not text, keep it but log
        console.log('DOI found in metadata but not in text:', validated.doi);
      }
    }
  }

  // Double-check publication date - verify format
  if (validated.publicationDate) {
    // Validate date format (should be YYYY-MM-DD or YYYY)
    const dateStr = validated.publicationDate.trim();
    if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(dateStr) && !/^\d{4}$/.test(dateStr)) {
      // Try to extract year from text
      const yearPattern = /(?:published|publication|date)[:\s]+.*?(\d{4})/i;
      const match = fullText.match(yearPattern);
      if (match && match[1]) {
        const year = parseInt(match[1], 10);
        if (year >= 1900 && year <= new Date().getFullYear() + 1) {
          validated.publicationDate = match[1];
        } else {
          validated.publicationDate = undefined;
        }
      } else {
        validated.publicationDate = undefined;
      }
    }
  }

  // Double-check sample size - verify it's reasonable
  if (validated.sampleSize !== undefined) {
    if (validated.sampleSize < 1 || validated.sampleSize > 100000000) {
      // Sample size seems invalid, try to re-extract
      const samplePattern = /(?:sample size|n\s*[=:]|participants?[:\s]+|subjects?[:\s]+)(?:n\s*[=:]?\s*)?(\d+(?:\s*,\s*\d{3})*)/i;
      const match = fullText.match(samplePattern);
      if (match && match[1]) {
        const numStr = match[1].replace(/,/g, '');
        const num = parseInt(numStr, 10);
        if (num > 0 && num < 100000000) {
          validated.sampleSize = num;
        } else {
          validated.sampleSize = undefined;
        }
      } else {
        validated.sampleSize = undefined;
      }
    }
  }

  // Double-check study type - verify it matches content
  if (validated.studyType) {
    const studyTypeLower = validated.studyType.toLowerCase();
    // Check if study type keywords appear in text
    const typeKeywords: { [key: string]: string[] } = {
      'meta-analysis': ['meta-analysis', 'systematic review', 'meta analysis'],
      'randomized controlled trial': ['randomized', 'rct', 'randomised', 'random assignment'],
      'cohort study': ['cohort', 'prospective', 'follow-up'],
      'case-control study': ['case-control', 'case control'],
      'cross-sectional study': ['cross-sectional', 'cross sectional', 'survey'],
      'observational study': ['observational'],
    };

    let foundMatch = false;
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (studyTypeLower.includes(type) || type.includes(studyTypeLower)) {
        // Check if keywords appear in text
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            foundMatch = true;
            break;
          }
        }
        if (foundMatch) break;
      }
    }

    // If study type doesn't match content, try to re-extract
    if (!foundMatch) {
      const extractedType = extractStudyType(fullText);
      if (extractedType) {
        validated.studyType = extractedType;
      }
    }
  }

  return validated;
}

