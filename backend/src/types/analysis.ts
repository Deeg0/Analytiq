export interface StudyMetadata {
  authors: string[];
  affiliations: string[];
  funding: string[];
  journal?: string;
  publicationDate?: string;
  doi?: string;
  title?: string;
  studyType?: string;
  sampleSize?: number;
  impactFactor?: number;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  percentage: number;
  details: string;
  issues: string[];
  strengths: string[];
}

export interface AnalysisScores {
  methodology: CategoryScore;
  evidenceStrength: CategoryScore;
  bias: CategoryScore;
  reproducibility: CategoryScore;
  statisticalValidity: CategoryScore;
}

export interface TrustScore {
  overall: number;
  rating: 'Highly Reliable' | 'Moderately Reliable' | 'Questionable' | 'Unreliable';
  breakdown: AnalysisScores;
}

export interface EvidenceHierarchy {
  level: 'systematic_review' | 'rct' | 'cohort' | 'case_control' | 'case_series' | 'expert_opinion';
  position: number; // 1-6 (1=strongest)
  qualityWithinLevel: 'high' | 'medium' | 'low';
}

export interface FlawDetection {
  fallacies: Array<{
    type: string;
    description: string;
    quote?: string;
    quoteLocation?: string; // Where in the study (e.g., "Results section", "Discussion", "Abstract")
    debunking?: string; // Analysis explaining why the quote is problematic
    severity: 'high' | 'medium' | 'low';
    impact?: string;
  }>;
  confounders?: Array<{
    factor: string;
    description: string;
    quote?: string;
    quoteLocation?: string;
    debunking?: string;
    impact: string;
  }>;
  validityThreats?: Array<{
    threat: string;
    description: string;
    quote?: string;
    quoteLocation?: string;
    debunking?: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  issues: Array<{
    category: string;
    description: string;
    quote?: string;
    quoteLocation?: string;
    debunking?: string;
  }>;
}

export interface ExpertContext {
  consensus: string;
  controversies: string[];
  recentUpdates: string[];
  relatedStudies: string[];
}

export interface AnalysisResult {
  metadata: StudyMetadata;
  trustScore: TrustScore;
  evidenceHierarchy?: EvidenceHierarchy;
  flawDetection: FlawDetection;
  expertContext: ExpertContext;
  simpleSummary: string;
  technicalCritique: string;
  biasReport: string;
  recommendations: string[];
}

export interface AnalysisRequest {
  inputType: 'url' | 'pdf' | 'doi' | 'text';
  content: string;
  fileName?: string;
}

export interface ExtractedContent {
  text: string;
  metadata: Partial<StudyMetadata>;
  sections?: {
    abstract?: string;
    introduction?: string;
    methods?: string;
    results?: string;
    discussion?: string;
    conclusions?: string;
  };
}

