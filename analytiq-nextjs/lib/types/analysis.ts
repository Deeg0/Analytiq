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
  citationQuality?: 'high' | 'medium' | 'low';
  citationScore?: number;
  citationIssues?: string[];
  authorCredibility?: {
    hIndex?: number;
    publicationCount?: number;
    credibilityScore?: number;
    conflictHistory?: string[];
  };
  journalCredibility?: {
    impactFactor?: number;
    reputationScore?: number;
    quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    isPredatory?: boolean;
  };
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
  otherConfoundingFactors?: Array<{
    factor: string;
    description: string;
    potentialImpact: string;
    whyItMatters: string;
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

export interface BradfordHillCriterion {
  criterion: string;
  met: boolean;
  evidence: string;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  notes?: string;
}

export interface CausalInference {
  canEstablishCausality: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  studyDesignLimitations: string[];
  alternativeExplanations: string[];
  requirementsForCausality: {
    met: string[];
    unmet: string[];
  };
  bradfordHillCriteria?: {
    impliesCausation: boolean; // Does the study infer or imply causation?
    criteria: BradfordHillCriterion[];
    overallAssessment: string; // Summary of how well the study meets Bradford Hill Criteria
    criteriaMet: number; // Number of criteria met (out of 9)
    criteriaTotal: number; // Total criteria (9)
  };
}

export interface KeyTakeaway {
  point: string;
  importance: 'high' | 'medium' | 'low';
  category: string;
}

export interface StudyLimitation {
  limitation: string;
  impact: string;
  severity: 'high' | 'medium' | 'low';
  affectsConclusion: boolean;
}

export interface ReplicationInfo {
  replicationAttempts?: Array<{
    study: string;
    outcome: 'confirmed' | 'failed' | 'partial' | 'unknown';
    notes?: string;
  }>;
  followUpStudies?: string[];
  metaAnalyses?: string[];
  updates?: Array<{
    type: 'correction' | 'retraction' | 'erratum' | 'update';
    date?: string;
    description: string;
  }>;
}

export interface AnalysisResult {
  metadata: StudyMetadata;
  trustScore: TrustScore;
  evidenceHierarchy?: EvidenceHierarchy;
  flawDetection: FlawDetection;
  expertContext: ExpertContext;
  causalInference?: CausalInference;
  simpleSummary: string;
  technicalCritique: string;
  biasReport: string;
  recommendations: string[];
  keyTakeaways?: KeyTakeaway[];
  studyLimitations?: StudyLimitation[];
  replicationInfo?: ReplicationInfo;
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
    references?: string;
  };
}

