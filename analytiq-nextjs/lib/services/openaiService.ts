import OpenAI from 'openai';
import { ExtractedContent, StudyMetadata, AnalysisResult, CategoryScore, FlawDetection, ExpertContext, EvidenceHierarchy } from '@/lib/types/analysis';
import { createAnalysisPrompt } from '@/lib/utils/prompts';

// Configuration
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'; // Default to gpt-4o for better analysis
const MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '16000', 10); // Increased to 16000
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Lazy initialization - create OpenAI client only when needed
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set.');
    }
    openaiClient = new OpenAI({
      apiKey: apiKey,
      timeout: 240000, // 4 minutes timeout
    });
  }
  return openaiClient;
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = INITIAL_RETRY_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on authentication errors
      if (error.response?.status === 401) {
        throw error;
      }
      
      // Don't retry on client errors (4xx) except rate limits
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const backoffDelay = delay * Math.pow(2, attempt);
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      const totalDelay = backoffDelay + jitter;
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Phase 1: Initial overview and quick scoring
 */
async function analyzePhase1(
  content: ExtractedContent,
  metadata: StudyMetadata,
  sourceUrl?: string
): Promise<Partial<AnalysisResult>> {
  const prompt = createAnalysisPrompt(content, metadata, sourceUrl);
  const openai = getOpenAIClient();
  const model = DEFAULT_MODEL;

  const response = await retryWithBackoff(
    () => openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert scientific research analyst. Provide a comprehensive analysis focusing on methodology, evidence strength, and initial bias assessment. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `PHASE 1: Initial Overview\n\n${prompt}\n\nFocus on: methodology assessment, evidence hierarchy position, initial bias detection, and overall study quality indicators.`,
        },
      ],
      temperature: 0.3,
      max_tokens: Math.floor(MAX_TOKENS * 0.4), // 40% of tokens for phase 1
      response_format: { type: 'json_object' },
    }),
    MAX_RETRIES
  );

  return parseAnalysisResponse(response.choices[0]?.message?.content || '');
}

/**
 * Phase 2: Deep dive into methodology and statistical validity
 */
async function analyzePhase2(
  content: ExtractedContent,
  metadata: StudyMetadata,
  sourceUrl?: string,
  phase1Results?: Partial<AnalysisResult>
): Promise<Partial<AnalysisResult>> {
  const prompt = createAnalysisPrompt(content, metadata, sourceUrl);
  const openai = getOpenAIClient();
  const model = DEFAULT_MODEL;

  const response = await retryWithBackoff(
    () => openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert in research methodology and statistics. Analyze the study\'s methodology, statistical methods, reproducibility, and identify all methodological flaws. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `PHASE 2: Deep Methodology Analysis\n\n${prompt}\n\nFocus on: detailed methodology assessment, statistical validity, reproducibility, fallacies, confounders, and validity threats. Extract quotes from ALL sections of the study.`,
        },
      ],
      temperature: 0.3,
      max_tokens: Math.floor(MAX_TOKENS * 0.35), // 35% of tokens for phase 2
      response_format: { type: 'json_object' },
    }),
    MAX_RETRIES
  );

  return parseAnalysisResponse(response.choices[0]?.message?.content || '');
}

/**
 * Phase 3: Bias detection and expert context
 */
async function analyzePhase3(
  content: ExtractedContent,
  metadata: StudyMetadata,
  sourceUrl?: string,
  phase1Results?: Partial<AnalysisResult>,
  phase2Results?: Partial<AnalysisResult>
): Promise<Partial<AnalysisResult>> {
  const prompt = createAnalysisPrompt(content, metadata, sourceUrl);
  const openai = getOpenAIClient();
  const model = DEFAULT_MODEL;

  const response = await retryWithBackoff(
    () => openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert in detecting bias, conflicts of interest, and understanding scientific consensus. Investigate funding sources, author conflicts, and provide expert context. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `PHASE 3: Bias and Context Analysis\n\n${prompt}\n\nFocus on: comprehensive bias detection (funding, author conflicts, selection bias), expert consensus, controversies, related studies, and recommendations.`,
        },
      ],
      temperature: 0.3,
      max_tokens: Math.floor(MAX_TOKENS * 0.25), // 25% of tokens for phase 3
      response_format: { type: 'json_object' },
    }),
    MAX_RETRIES
  );

  return parseAnalysisResponse(response.choices[0]?.message?.content || '');
}

/**
 * Parse and transform AI response to our structure
 */
function parseAnalysisResponse(analysisText: string): Partial<AnalysisResult> {
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

  // Merge scores from multiple phases (take maximum or average)
  const mergeScores = (existing: CategoryScore, newData: CategoryScore): CategoryScore => {
    return {
      score: Math.max(existing.score, newData.score),
      maxScore: existing.maxScore,
      percentage: Math.max(existing.percentage, newData.percentage),
      details: newData.details || existing.details,
      issues: [...(existing.issues || []), ...(newData.issues || [])],
      strengths: [...(existing.strengths || []), ...(newData.strengths || [])],
    };
  };

  // Parse evidence hierarchy
  const evidenceHierarchy = analysisData.evidenceHierarchy ? {
    level: analysisData.evidenceHierarchy.level || 'expert_opinion',
    position: analysisData.evidenceHierarchy.position || 6,
    qualityWithinLevel: analysisData.evidenceHierarchy.qualityWithinLevel || 'medium',
  } : undefined;

  // Parse flaw detection (merge arrays from multiple phases)
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

  const causalInference = analysisData.causalInference ? {
    canEstablishCausality: analysisData.causalInference.canEstablishCausality || false,
    confidence: (analysisData.causalInference.confidence || 'low') as 'high' | 'medium' | 'low',
    reasoning: analysisData.causalInference.reasoning || '',
    studyDesignLimitations: analysisData.causalInference.studyDesignLimitations || [],
    alternativeExplanations: analysisData.causalInference.alternativeExplanations || [],
    requirementsForCausality: {
      met: analysisData.causalInference.requirementsForCausality?.met || [],
      unmet: analysisData.causalInference.requirementsForCausality?.unmet || [],
    },
    bradfordHillCriteria: analysisData.causalInference.bradfordHillCriteria ? {
      impliesCausation: analysisData.causalInference.bradfordHillCriteria.impliesCausation || false,
      criteria: (analysisData.causalInference.bradfordHillCriteria.criteria || []).map((c: any) => ({
        criterion: c.criterion || '',
        met: c.met || false,
        evidence: c.evidence || '',
        strength: (c.strength || 'none') as 'strong' | 'moderate' | 'weak' | 'none',
        notes: c.notes || undefined,
      })),
      overallAssessment: analysisData.causalInference.bradfordHillCriteria.overallAssessment || '',
      criteriaMet: analysisData.causalInference.bradfordHillCriteria.criteriaMet || 0,
      criteriaTotal: analysisData.causalInference.bradfordHillCriteria.criteriaTotal || 9,
    } : undefined,
  } : undefined;

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
    causalInference,
    simpleSummary: analysisData.simpleSummary || '',
    technicalCritique: analysisData.technicalCritique || '',
    biasReport: analysisData.biasReport || '',
    recommendations: analysisData.recommendations || [],
  };
}

/**
 * Main analysis function with multi-step approach
 */
export async function analyzeWithAI(
  content: ExtractedContent,
  metadata: StudyMetadata,
  sourceUrl?: string
): Promise<Partial<AnalysisResult>> {
  try {
    console.log(`Starting multi-phase analysis with model: ${DEFAULT_MODEL}`);
    
    // Phase 1: Initial overview
    console.log('Phase 1: Initial overview...');
    const phase1Results = await analyzePhase1(content, metadata, sourceUrl);
    
    // Phase 2: Deep methodology analysis
    console.log('Phase 2: Deep methodology analysis...');
    const phase2Results = await analyzePhase2(content, metadata, sourceUrl, phase1Results);
    
    // Phase 3: Bias and context analysis
    console.log('Phase 3: Bias and context analysis...');
    const phase3Results = await analyzePhase3(content, metadata, sourceUrl, phase1Results, phase2Results);
    
    // Merge results from all phases
    const mergedResults: Partial<AnalysisResult> = {
      ...phase1Results,
      ...phase2Results,
      ...phase3Results,
      // Merge flaw detection arrays
      flawDetection: {
        fallacies: [
          ...(phase1Results.flawDetection?.fallacies || []),
          ...(phase2Results.flawDetection?.fallacies || []),
          ...(phase3Results.flawDetection?.fallacies || []),
        ],
        confounders: [
          ...(phase1Results.flawDetection?.confounders || []),
          ...(phase2Results.flawDetection?.confounders || []),
          ...(phase3Results.flawDetection?.confounders || []),
        ],
        validityThreats: [
          ...(phase1Results.flawDetection?.validityThreats || []),
          ...(phase2Results.flawDetection?.validityThreats || []),
          ...(phase3Results.flawDetection?.validityThreats || []),
        ],
        otherConfoundingFactors: [
          ...(phase1Results.flawDetection?.otherConfoundingFactors || []),
          ...(phase2Results.flawDetection?.otherConfoundingFactors || []),
          ...(phase3Results.flawDetection?.otherConfoundingFactors || []),
        ],
        issues: [
          ...(phase1Results.flawDetection?.issues || []),
          ...(phase2Results.flawDetection?.issues || []),
          ...(phase3Results.flawDetection?.issues || []),
        ],
      },
      // Merge expert context
      expertContext: {
        consensus: phase3Results.expertContext?.consensus || phase1Results.expertContext?.consensus || '',
        controversies: [
          ...(phase1Results.expertContext?.controversies || []),
          ...(phase3Results.expertContext?.controversies || []),
        ],
        recentUpdates: [
          ...(phase1Results.expertContext?.recentUpdates || []),
          ...(phase3Results.expertContext?.recentUpdates || []),
        ],
        relatedStudies: [
          ...(phase1Results.expertContext?.relatedStudies || []),
          ...(phase3Results.expertContext?.relatedStudies || []),
        ],
      },
      // Use best summaries from any phase
      simpleSummary: phase1Results.simpleSummary || phase3Results.simpleSummary || '',
      technicalCritique: phase2Results.technicalCritique || phase1Results.technicalCritique || '',
      biasReport: phase3Results.biasReport || phase1Results.biasReport || '',
      recommendations: [
        ...(phase1Results.recommendations || []),
        ...(phase2Results.recommendations || []),
        ...(phase3Results.recommendations || []),
      ],
    };
    
    console.log('Multi-phase analysis completed');
    return mergedResults;
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
