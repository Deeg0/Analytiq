import OpenAI from 'openai';
import { ExtractedContent, StudyMetadata, AnalysisResult, CategoryScore, FlawDetection, ExpertContext, EvidenceHierarchy } from '@/lib/types/analysis';
import { createAnalysisPrompt } from '@/lib/utils/prompts';

// Lazy initialization - create OpenAI client only when needed (after dotenv has loaded in server.ts)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set. Please check your .env file in the backend directory.');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

export async function analyzeWithAI(
  content: ExtractedContent,
  metadata: StudyMetadata,
  sourceUrl?: string
): Promise<Partial<AnalysisResult>> {
  try {
    const prompt = createAnalysisPrompt(content, metadata, sourceUrl);
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Much cheaper than gpt-4-turbo-preview
      messages: [
        {
          role: 'system',
          content: 'You are an expert scientific research analyst with ZERO BIAS. You must analyze studies with complete objectivity, regardless of topic, political implications, or controversial nature. Your analysis must be based SOLELY on: methodological rigor, evidence quality, statistical validity, and factual assessment. You have NO personal opinions, political leanings, or topic preferences. Evaluate all studies - whether about climate change, vaccines, nutrition, psychology, medicine, or any other field - with identical standards of scientific rigor. CRITICAL: You must examine ALL sections of the study (Abstract, Introduction, Methods, Results, Discussion, Conclusions) when extracting quotes and identifying issues. Do NOT limit your analysis to just the first section. Search through the ENTIRE study content provided. Return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000, // Increased to allow for more quotes and detailed debunking from all sections
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No response from OpenAI API');
    }

    // Parse JSON response
    let analysisData: any;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      // Try to extract JSON if wrapped in markdown or text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Transform to our expected structure
    const methodology: CategoryScore = {
      score: analysisData.methodology?.score || 0,
      maxScore: analysisData.methodology?.maxScore || 25,
      percentage: Math.round(((analysisData.methodology?.score || 0) / 25) * 100),
      details: analysisData.methodology?.details || '',
      issues: analysisData.methodology?.issues || [],
      strengths: analysisData.methodology?.strengths || [],
    };

    const evidenceStrength: CategoryScore = {
      score: analysisData.evidenceStrength?.score || 0,
      maxScore: analysisData.evidenceStrength?.maxScore || 20,
      percentage: Math.round(((analysisData.evidenceStrength?.score || 0) / 20) * 100),
      details: analysisData.evidenceStrength?.details || '',
      issues: analysisData.evidenceStrength?.issues || [],
      strengths: analysisData.evidenceStrength?.strengths || [],
    };

    const bias: CategoryScore = {
      score: analysisData.bias?.score || analysisData.fundingBias?.score || 0,
      maxScore: analysisData.bias?.maxScore || analysisData.fundingBias?.maxScore || 20,
      percentage: Math.round(((analysisData.bias?.score || analysisData.fundingBias?.score || 0) / 20) * 100),
      details: analysisData.bias?.details || analysisData.fundingBias?.details || '',
      issues: analysisData.bias?.issues || analysisData.fundingBias?.issues || [],
      strengths: analysisData.bias?.strengths || analysisData.fundingBias?.strengths || [],
    };

    const reproducibility: CategoryScore = {
      score: analysisData.reproducibility?.score || 0,
      maxScore: analysisData.reproducibility?.maxScore || 15,
      percentage: Math.round(((analysisData.reproducibility?.score || 0) / 15) * 100),
      details: analysisData.reproducibility?.details || '',
      issues: analysisData.reproducibility?.issues || [],
      strengths: analysisData.reproducibility?.strengths || [],
    };

    const statisticalValidity: CategoryScore = {
      score: analysisData.statisticalValidity?.score || 0,
      maxScore: analysisData.statisticalValidity?.maxScore || 20,
      percentage: Math.round(((analysisData.statisticalValidity?.score || 0) / 20) * 100),
      details: analysisData.statisticalValidity?.details || '',
      issues: analysisData.statisticalValidity?.issues || [],
      strengths: analysisData.statisticalValidity?.strengths || [],
    };

    // Parse evidence hierarchy if present
    const evidenceHierarchy = analysisData.evidenceHierarchy ? {
      level: analysisData.evidenceHierarchy.level || 'expert_opinion',
      position: analysisData.evidenceHierarchy.position || 6,
      qualityWithinLevel: analysisData.evidenceHierarchy.qualityWithinLevel || 'medium',
    } : undefined;

    const flawDetection: FlawDetection = {
      fallacies: (analysisData.fallacies || []).map((f: any) => ({
        type: f.type || 'Unknown',
        description: f.description || '',
        quote: f.quote || undefined,
        quoteLocation: f.quoteLocation || undefined,
        debunking: f.debunking || undefined,
        severity: f.severity || 'medium',
        impact: f.impact || '',
      })),
      confounders: (analysisData.confounders || []).map((c: any) => ({
        factor: c.factor || 'Unknown',
        description: c.description || '',
        quote: c.quote || undefined,
        quoteLocation: c.quoteLocation || undefined,
        debunking: c.debunking || undefined,
        impact: c.impact || '',
      })),
      validityThreats: (analysisData.validityThreats || []).map((t: any) => ({
        threat: t.threat || 'Unknown',
        description: t.description || '',
        quote: t.quote || undefined,
        quoteLocation: t.quoteLocation || undefined,
        debunking: t.debunking || undefined,
        severity: t.severity || 'medium',
      })),
      otherConfoundingFactors: (analysisData.otherConfoundingFactors || []).map((f: any) => ({
        factor: f.factor || 'Unknown',
        description: f.description || '',
        potentialImpact: f.potentialImpact || '',
        whyItMatters: f.whyItMatters || '',
        severity: f.severity || 'medium',
      })),
      issues: (analysisData.issues || []).map((i: any) => ({
        category: i.category || 'Unknown',
        description: i.description || '',
        quote: i.quote || undefined,
        quoteLocation: i.quoteLocation || undefined,
        debunking: i.debunking || undefined,
      })),
    };

    const expertContext: ExpertContext = {
      consensus: analysisData.expertContext?.consensus || '',
      controversies: analysisData.expertContext?.controversies || [],
      recentUpdates: analysisData.expertContext?.recentUpdates || [],
      relatedStudies: analysisData.expertContext?.relatedStudies || [],
    };

    return {
      evidenceHierarchy,
      trustScore: {
        overall: 0, // Will be calculated by scorer
        rating: 'Moderately Reliable' as const,
        breakdown: {
          methodology,
          evidenceStrength,
          bias,
          reproducibility,
          statisticalValidity,
        },
      },
      flawDetection,
      expertContext,
      simpleSummary: analysisData.simpleSummary || '',
      technicalCritique: analysisData.technicalCritique || '',
      biasReport: analysisData.biasReport || '',
      recommendations: analysisData.recommendations || [],
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific OpenAI API errors
    if (error.response?.status === 401) {
      throw new Error('OpenAI API authentication failed: Invalid API key');
    } else if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded: Please try again later');
    } else if (error.response?.status === 500 || error.response?.status === 503) {
      throw new Error('OpenAI API service temporarily unavailable: Please try again later');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('AI analysis timeout: The request took too long. Please try again.');
    } else if (error.message?.includes('JSON')) {
      throw new Error('AI analysis failed: Invalid response format. Please try again.');
    }
    
    throw new Error(`AI analysis failed: ${error.message || 'Unknown error occurred'}`);
  }
}

