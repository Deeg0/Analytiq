import pdfParse from 'pdf-parse';
import { ExtractedContent } from '../types/analysis';

export async function parsePdf(pdfBuffer: Buffer | string): Promise<ExtractedContent> {
  try {
    let buffer: Buffer;
    
    if (typeof pdfBuffer === 'string') {
      // Assume base64 encoded
      buffer = Buffer.from(pdfBuffer, 'base64');
    } else {
      buffer = pdfBuffer;
    }

    const data = await pdfParse(buffer);
    const text = data.text;

    // Extract metadata
    const metadata: Partial<ExtractedContent['metadata']> = {
      title: data.info?.Title || extractTitle(text),
      authors: extractAuthors(text),
    };

    // Extract sections
    const sections = {
      abstract: extractSection(text, ['abstract', 'summary']),
      introduction: extractSection(text, ['introduction', 'background']),
      methods: extractSection(text, ['methods', 'methodology', 'materials and methods']),
      results: extractSection(text, ['results', 'findings']),
      discussion: extractSection(text, ['discussion']),
      conclusions: extractSection(text, ['conclusion', 'conclusions']),
    };

    return {
      text,
      metadata,
      sections,
    };
  } catch (error: any) {
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file: The file may be corrupted or not a valid PDF');
    } else if (error.message?.includes('encrypted') || error.message?.includes('password')) {
      throw new Error('PDF is password-protected. Please provide an unprotected PDF.');
    } else if (error.message?.includes('buffer')) {
      throw new Error('Failed to read PDF file: Invalid file format');
    }
    throw new Error(`Failed to parse PDF: ${error.message || 'Unknown error occurred'}`);
  }
}

function extractTitle(text: string): string | undefined {
  // Try to find title in first few lines
  const lines = text.split('\n').slice(0, 10);
  for (const line of lines) {
    if (line.length > 20 && line.length < 200 && /^[A-Z]/.test(line.trim())) {
      return line.trim();
    }
  }
  return undefined;
}

function extractAuthors(text: string): string[] {
  const authors: string[] = [];
  const lines = text.split('\n').slice(0, 20);
  
  // Look for author patterns
  const authorPatterns = [
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+)*)/,
    /Authors?:\s*(.+)/i,
    /^([A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+)/,
  ];

  for (const line of lines) {
    for (const pattern of authorPatterns) {
      const match = line.match(pattern);
      if (match) {
        const authorText = match[1] || match[0];
        // Split multiple authors
        const authorList = authorText.split(/,|and|&/).map(a => a.trim()).filter(a => a.length > 0);
        authors.push(...authorList);
        if (authors.length > 0) break;
      }
    }
    if (authors.length > 0) break;
  }

  return authors.length > 0 ? authors : [];
}

function extractSection(text: string, keywords: string[]): string | undefined {
  for (const keyword of keywords) {
    // Case-insensitive search for section header
    const regex = new RegExp(
      `(${keyword}[\\s\\S]{0,50}?)\\n([\\s\\S]{500,5000}?)(?=\\n\\s*[A-Z][a-z]+(?::|\\s)|\\n\\s*\\d+\\s|$)`,
      'i'
    );
    const match = text.match(regex);
    if (match && match[2]) {
      return match[2].trim().substring(0, 5000);
    }
  }
  
  return undefined;
}

