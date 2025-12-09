import { TrustScore, AnalysisScores, FlawDetection, EvidenceHierarchy } from '@/lib/types/analysis';

export function calculateTrustScore(
  breakdown: AnalysisScores,
  flawDetection?: FlawDetection,
  evidenceHierarchy?: EvidenceHierarchy
): TrustScore {
  // Apply adjustments based on fallacies, confounders, and validity threats
  let adjustmentFactor = 1.0;
  
  if (flawDetection) {
    // Penalize for high-severity fallacies
    const highSeverityFallacies = flawDetection.fallacies?.filter(f => f.severity === 'high').length || 0;
    const mediumSeverityFallacies = flawDetection.fallacies?.filter(f => f.severity === 'medium').length || 0;
    
    // Each high-severity fallacy reduces score by 5%
    adjustmentFactor -= (highSeverityFallacies * 0.05);
    // Each medium-severity fallacy reduces score by 2%
    adjustmentFactor -= (mediumSeverityFallacies * 0.02);
    
    // Penalize for validity threats
    const highThreats = flawDetection.validityThreats?.filter(t => t.severity === 'high').length || 0;
    const mediumThreats = flawDetection.validityThreats?.filter(t => t.severity === 'medium').length || 0;
    
    adjustmentFactor -= (highThreats * 0.03);
    adjustmentFactor -= (mediumThreats * 0.01);
    
    // Penalize for significant confounders (if many identified)
    const confounderCount = flawDetection.confounders?.length || 0;
    if (confounderCount >= 3) {
      adjustmentFactor -= 0.05; // Multiple confounders suggest design issues
    }
  }
  
  // Adjust based on evidence hierarchy position
  if (evidenceHierarchy) {
    // Lower hierarchy positions get a slight boost, but quality within level matters more
    if (evidenceHierarchy.qualityWithinLevel === 'low' && evidenceHierarchy.position >= 4) {
      adjustmentFactor -= 0.05; // Low quality in lower hierarchy levels
    }
  }
  
  // Ensure adjustment factor doesn't go below 0.3 (minimum 30% of score)
  adjustmentFactor = Math.max(0.3, adjustmentFactor);

  // Calculate weighted overall score
  const totalScore = 
    breakdown.methodology.score +
    breakdown.evidenceStrength.score +
    breakdown.bias.score +
    breakdown.reproducibility.score +
    breakdown.statisticalValidity.score;
  
  const maxTotalScore = 
    breakdown.methodology.maxScore +
    breakdown.evidenceStrength.maxScore +
    breakdown.bias.maxScore +
    breakdown.reproducibility.maxScore +
    breakdown.statisticalValidity.maxScore;

  // Apply adjustments and convert to 0-100 scale
  const adjustedScore = (totalScore / maxTotalScore) * 100 * adjustmentFactor;
  const overall = Math.round(adjustedScore);

  // Determine rating
  let rating: TrustScore['rating'];
  if (overall >= 80) {
    rating = 'Highly Reliable';
  } else if (overall >= 60) {
    rating = 'Moderately Reliable';
  } else if (overall >= 40) {
    rating = 'Questionable';
  } else {
    rating = 'Unreliable';
  }

  // Calculate percentages for each category
  breakdown.methodology.percentage = Math.round(
    (breakdown.methodology.score / breakdown.methodology.maxScore) * 100
  );
  breakdown.evidenceStrength.percentage = Math.round(
    (breakdown.evidenceStrength.score / breakdown.evidenceStrength.maxScore) * 100
  );
  breakdown.bias.percentage = Math.round(
    (breakdown.bias.score / breakdown.bias.maxScore) * 100
  );
  breakdown.reproducibility.percentage = Math.round(
    (breakdown.reproducibility.score / breakdown.reproducibility.maxScore) * 100
  );
  breakdown.statisticalValidity.percentage = Math.round(
    (breakdown.statisticalValidity.score / breakdown.statisticalValidity.maxScore) * 100
  );

  return {
    overall,
    rating,
    breakdown,
  };
}

