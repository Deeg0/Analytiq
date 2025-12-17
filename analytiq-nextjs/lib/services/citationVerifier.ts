import { ExtractedContent, StudyMetadata } from '@/lib/types/analysis';

export interface Citation {
  text: string;
  context: string;
  verified: boolean;
  issues?: string[];
  source?: string;
}

export interface CitationVerificationResult {
  citations: Citation[];
  totalCitations: number;
  verifiedCount: number;
  issuesFound: number;
}

/**
 * Extract citations from study content
 */
export function extractCitations(content: ExtractedContent, metadata: StudyMetadata): string[] {
  const citations: string[] = [];
  const text = content.text || '';
  
  // Common citation patterns
  const patterns = [
    // (Author, Year) format
    /\([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+et\s+al\.)?,\s*\d{4}[a-z]?\)/g,
    // [1], [2-5], [1,2,3] format
    /\[\d+(?:[-\s,]\d+)*\]/g,
    // Author et al., Year format
    /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+et\s+al\.)?\s+\(\d{4}[a-z]?\)/g,
    // Author (Year) format
    /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+et\s+al\.)?\s+\(\d{4}[a-z]?\)/g,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      citations.push(...matches);
    }
  }
  
  // Remove duplicates
  return [...new Set(citations)];
}

/**
 * Verify citations (basic verification - checks format and context)
 * Note: Full verification would require external API calls to citation databases
 */
export async function verifyCitations(
  citations: string[],
  content: ExtractedContent,
  metadata: StudyMetadata
): Promise<CitationVerificationResult> {
  const verifiedCitations: Citation[] = [];
  let verifiedCount = 0;
  let issuesFound = 0;
  
  for (const citation of citations) {
    const issues: string[] = [];
    let verified = true;
    
    // Check if citation appears in references section
    const hasReference = content.sections?.references?.toLowerCase().includes(citation.toLowerCase()) || false;
    
    if (!hasReference) {
      issues.push('Citation not found in references section');
      verified = false;
    }
    
    // Check citation format validity
    if (!citation.match(/\(.*\d{4}.*\)|\[.*\]/)) {
      issues.push('Invalid citation format');
      verified = false;
    }
    
    // Extract context around citation
    const text = content.text || '';
    const citationIndex = text.indexOf(citation);
    const context = citationIndex >= 0
      ? text.substring(Math.max(0, citationIndex - 100), Math.min(text.length, citationIndex + citation.length + 100))
      : '';
    
    verifiedCitations.push({
      text: citation,
      context,
      verified,
      issues: issues.length > 0 ? issues : undefined,
    });
    
    if (verified) {
      verifiedCount++;
    } else {
      issuesFound += issues.length;
    }
  }
  
  return {
    citations: verifiedCitations,
    totalCitations: citations.length,
    verifiedCount,
    issuesFound,
  };
}

/**
 * Analyze citation quality
 */
export function analyzeCitationQuality(
  verificationResult: CitationVerificationResult,
  content: ExtractedContent
): {
  quality: 'high' | 'medium' | 'low';
  score: number;
  issues: string[];
} {
  const { totalCitations, verifiedCount, issuesFound } = verificationResult;
  
  if (totalCitations === 0) {
    return {
      quality: 'low',
      score: 0,
      issues: ['No citations found in the study'],
    };
  }
  
  const verificationRate = verifiedCount / totalCitations;
  const issuesPerCitation = issuesFound / totalCitations;
  
  let quality: 'high' | 'medium' | 'low' = 'medium';
  let score = 50;
  const issues: string[] = [];
  
  if (verificationRate >= 0.9 && issuesPerCitation < 0.1) {
    quality = 'high';
    score = 90;
  } else if (verificationRate >= 0.7 && issuesPerCitation < 0.3) {
    quality = 'medium';
    score = 70;
  } else {
    quality = 'low';
    score = Math.max(30, verificationRate * 100 - issuesPerCitation * 20);
  }
  
  if (verificationRate < 0.7) {
    issues.push(`Low citation verification rate: ${Math.round(verificationRate * 100)}%`);
  }
  
  if (issuesPerCitation > 0.3) {
    issues.push(`High number of citation issues: ${issuesFound} issues found`);
  }
  
  // Check if references section exists
  if (!content.sections?.references) {
    issues.push('No references section found');
    score = Math.max(0, score - 20);
  }
  
  return {
    quality,
    score,
    issues,
  };
}
