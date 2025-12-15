import { AnalysisRequest, AnalysisResult, ExtractedContent } from '@/lib/types/analysis';
import { scrapeUrl } from './urlScraper';
import { parsePdf } from './pdfParser';
import { resolveDoi } from './doiResolver';
import { extractMetadata, validateAndCrossCheckMetadata } from './metadataExtractor';
import { analyzeWithAI } from './openaiService';
import { calculateTrustScore } from './scorer';

export async function analyzeStudy(request: AnalysisRequest): Promise<AnalysisResult> {
  try {
    let extractedContent: ExtractedContent;
    let sourceUrl: string | undefined;

    // Step 1: Extract content based on input type
    switch (request.inputType) {
      case 'url':
        if (!request.content || !request.content.trim().startsWith('http')) {
          throw new Error('Invalid URL format. Please provide a valid HTTP/HTTPS URL.');
        }
        sourceUrl = request.content.trim();
        extractedContent = await scrapeUrl(sourceUrl);
        break;
      
      case 'pdf':
        if (!request.content) {
          throw new Error('No PDF content provided');
        }
        try {
          // Handle base64 PDF
          const pdfBuffer = Buffer.from(request.content, 'base64');
          if (pdfBuffer.length === 0) {
            throw new Error('Invalid PDF file: Empty file');
          }
          extractedContent = await parsePdf(pdfBuffer);
        } catch (error: any) {
          throw new Error(`PDF processing failed: ${error.message}`);
        }
        break;
      
      case 'doi':
        if (!request.content || request.content.trim().length === 0) {
          throw new Error('DOI is required');
        }
        extractedContent = await resolveDoi(request.content.trim());
        break;
      
      case 'text':
        if (!request.content || request.content.trim().length < 100) {
          throw new Error('Text input must be at least 100 characters long');
        }
        extractedContent = {
          text: request.content.trim(),
          metadata: {},
        };
        break;
      
      default:
        throw new Error(`Unsupported input type: ${request.inputType}`);
    }

    // Validate extracted content
    const textLength = extractedContent.text ? extractedContent.text.trim().length : 0;
    if (!extractedContent.text || textLength < 100) {
      const inputType = request.inputType;
      let errorMessage = '';
      
      if (textLength === 0) {
        errorMessage = `No text content could be extracted from ${inputType}. `;
        if (inputType === 'url') {
          errorMessage += 'The URL may be inaccessible, blocked by anti-scraping measures, or not contain readable content. Try: (1) Using a different URL, (2) Uploading a PDF instead, or (3) Pasting the text directly.';
        } else if (inputType === 'doi') {
          errorMessage += 'The DOI may be invalid, or the full text may not be publicly available. Try: (1) A different DOI, (2) Uploading a PDF, or (3) Pasting the text directly.';
        } else if (inputType === 'pdf') {
          errorMessage += 'The PDF may be empty, corrupted, password-protected, or image-based (scanned). Please try a different PDF file.';
        }
      } else {
        errorMessage = `Only ${textLength} characters were extracted from ${inputType}, but at least 100 characters are needed. `;
        if (inputType === 'url') {
          errorMessage += 'The URL may be inaccessible, blocked by anti-scraping measures, or not contain readable content. Try: (1) Using a different URL, (2) Uploading a PDF instead, or (3) Pasting the text directly.';
        } else if (inputType === 'doi') {
          errorMessage += 'The DOI may be invalid, or the full text may not be publicly available. Try: (1) A different DOI, (2) Uploading a PDF, or (3) Pasting the text directly.';
        } else {
          errorMessage += 'Please provide more content or try a different input method.';
        }
      }
      
      throw new Error(errorMessage);
    }

    // Step 2: Extract metadata
    let metadata = extractMetadata(extractedContent);

    // Step 2.5: Double-check and validate study info
    metadata = validateAndCrossCheckMetadata(metadata, extractedContent.text);

    // Skip summarization to reduce API calls and improve performance
    // This helps avoid Netlify timeout issues (10s free tier, 26s pro tier)
    // Metadata fields are kept as-is - they're usually short enough

    // Step 3: Perform AI analysis with timeout protection
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeWithAI(extractedContent, metadata, sourceUrl);
    } catch (error: any) {
      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      }
      if (error.message?.includes('timeout') || error.message?.includes('rate limit')) {
        throw new Error('AI analysis service is temporarily unavailable. Please try again in a moment.');
      }
      throw new Error(`AI analysis failed: ${error.message || 'Unknown error occurred'}`);
    }

    // Step 4: Calculate trust score
    if (!aiAnalysis.trustScore?.breakdown) {
      throw new Error('AI analysis did not return valid breakdown. Please try again.');
    }

    const flawDetection = aiAnalysis.flawDetection || {
      fallacies: [],
      issues: [],
    };

    const trustScore = calculateTrustScore(
      aiAnalysis.trustScore.breakdown,
      flawDetection,
      aiAnalysis.evidenceHierarchy
    );

    // Step 5: Build final result
    const result: AnalysisResult = {
      metadata,
      trustScore,
      evidenceHierarchy: aiAnalysis.evidenceHierarchy,
      flawDetection,
      expertContext: aiAnalysis.expertContext || {
        consensus: '',
        controversies: [],
        recentUpdates: [],
        relatedStudies: [],
      },
      simpleSummary: aiAnalysis.simpleSummary || 'Analysis completed, but summary could not be generated.',
      technicalCritique: aiAnalysis.technicalCritique || 'Analysis completed, but technical critique could not be generated.',
      biasReport: aiAnalysis.biasReport || 'Analysis completed, but bias report could not be generated.',
      recommendations: aiAnalysis.recommendations || [],
    };

    return result;
  } catch (error: any) {
    // Re-throw with more context if needed
    if (error.message) {
      throw error;
    }
    throw new Error(`Analysis failed: ${error.message || 'Unknown error occurred'}`);
  }
}

