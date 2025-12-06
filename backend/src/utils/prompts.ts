import { ExtractedContent, StudyMetadata } from '../types/analysis';

// Optimize content - extract comprehensive sections for thorough analysis
function getOptimizedContent(content: ExtractedContent): string {
  const maxLength = 20000; // Increased significantly to include all sections
  const parts: string[] = [];
  
  // Prioritize structured sections if available - extract MORE comprehensively from ALL sections
  if (content.sections) {
    // Include larger portions of each section to ensure quotes can be found throughout
    if (content.sections.abstract) {
      parts.push(`=== ABSTRACT ===\n${content.sections.abstract.substring(0, 3000)}\n`);
    }
    if (content.sections.introduction) {
      parts.push(`=== INTRODUCTION ===\n${content.sections.introduction.substring(0, 4000)}\n`);
    }
    if (content.sections.methods) {
      parts.push(`=== METHODS ===\n${content.sections.methods.substring(0, 5000)}\n`);
    }
    if (content.sections.results) {
      parts.push(`=== RESULTS ===\n${content.sections.results.substring(0, 5000)}\n`);
    }
    if (content.sections.discussion) {
      parts.push(`=== DISCUSSION ===\n${content.sections.discussion.substring(0, 4000)}\n`);
    }
    if (content.sections.conclusions) {
      parts.push(`=== CONCLUSIONS ===\n${content.sections.conclusions.substring(0, 2000)}\n`);
    }
  }
  
  // If we have structured content, use it; otherwise use full text (truncated)
  if (parts.length > 0) {
    const combined = parts.join('\n\n');
    // Only truncate if absolutely necessary, preserving all sections
    if (combined.length > maxLength) {
      // Try to preserve all sections by proportionally reducing each
      const ratio = maxLength / combined.length;
      const adjustedParts = parts.map(part => {
        const sectionHeader = part.split('\n')[0];
        const sectionContent = part.substring(sectionHeader.length);
        const newLength = Math.floor(sectionContent.length * ratio);
        return sectionHeader + '\n' + sectionContent.substring(0, newLength);
      });
      return adjustedParts.join('\n\n') + '\n\n[Content truncated to fit limits, but all sections included]';
    }
    return combined;
  }
  
  // Fallback to full text with more content for thorough analysis
  return content.text.substring(0, maxLength) + (content.text.length > maxLength ? '\n\n[Content continues but was truncated]' : '');
}

export function createAnalysisPrompt(content: ExtractedContent, metadata: StudyMetadata, sourceUrl?: string): string {
  const fundingList = metadata.funding.length > 0 ? metadata.funding.join('; ') : 'None';
  const authorsList = metadata.authors.length > 0 ? metadata.authors.slice(0, 5).join(', ') : 'Unknown';
  const doiInfo = metadata.doi ? ` | DOI: ${metadata.doi}` : '';
  const urlInfo = sourceUrl ? ` | URL: ${sourceUrl}` : '';
  
  // Extract study name from URL if available in metadata
  const studyNameFromUrl = (metadata as any).studyNameFromUrl;
  const urlKeywords = (metadata as any).urlKeywords;
  
  const contentSource = sourceUrl ? 'CONTENT FROM URL:' : 'STUDY CONTENT:';
  
  let urlInstruction = '';
  if (sourceUrl) {
    urlInstruction = ` 

CRITICAL: The study is from URL: ${sourceUrl}`;
    
    if (studyNameFromUrl) {
      urlInstruction += `

*** STUDY NAME DETECTED IN URL: "${studyNameFromUrl}" ***

YOU MUST NOW:
1. Research this specific study by name: "${studyNameFromUrl}"
2. Use your knowledge to find information about this study including:
   - Author(s) and publication details
   - Study methodology and design
   - Results and conclusions
   - Scientific reception and critiques
   - Replication attempts and outcomes
   - Controversies or debates about the study
   - Current scientific consensus on the findings
   - Any retractions, corrections, or updates
3. Compare the URL content with what you know about this study
4. Identify any discrepancies or confirmations
5. Provide context about the study's place in scientific literature

This is a critical part of your analysis - do not skip researching the study by name.`;
    } else {
      urlInstruction += `
- Check if the URL contains study identifiers, keywords, or study names that help identify this research
- Look at the URL path, filename, or parameters for clues about the study topic, authors, or publication`;
    }
    
    if (urlKeywords) {
      urlInstruction += `
- URL suggests keywords: ${urlKeywords}`;
    }
    
    urlInstruction += `
- If you recognize this study from the URL structure, title, authors, DOI, or content, use your knowledge about:
  * Its reputation in the scientific community
  * Replication attempts and outcomes
  * Major critiques and controversies
  * Retractions or corrections
  * Field consensus and related research
- Analyze the study THOROUGHLY before responding - read through all content carefully`;
  }
  
  return `You are analyzing a scientific study. Conduct a THOROUGHLY OBJECTIVE, COMPREHENSIVE analysis with ZERO BIAS.${urlInstruction} Return JSON.

CRITICAL: MAINTAIN COMPLETE OBJECTIVITY - ZERO BIAS REQUIRED:
- You must analyze this study with ABSOLUTE NEUTRALITY regardless of:
  * The topic (climate, vaccines, nutrition, psychology, medicine, social issues, etc.)
  * Political implications or controversial nature
  * Whether findings align with or contradict popular beliefs
  * The field of study or research area
  * Your personal knowledge or opinions about the topic
- Base your analysis EXCLUSIVELY on:
  * Methodological quality and rigor
  * Evidence strength and statistical validity
  * Factual assessment of study design and execution
  * Objective evaluation of potential biases and confounders
- Apply IDENTICAL standards to ALL studies regardless of topic
- Do NOT let topic familiarity, controversy, or political implications influence your assessment
- Focus ONLY on what the study actually did, how well it was done, and what the evidence shows
- Your role is to evaluate scientific quality, NOT to judge the topic or implications

IMPORTANT: Read and analyze the study content THOROUGHLY. You MUST examine ALL sections:
- Read through the ENTIRE study content provided (Abstract, Introduction, Methods, Results, Discussion, Conclusions)
- Do NOT focus only on the first section - analyze ALL sections comprehensively
- Look for information throughout the entire document, not just at the beginning
- Study design details, methodology specifics, statistical approaches (check Methods section)
- Sample characteristics, inclusion/exclusion criteria, follow-up duration (check Methods and Results)
- Results in detail, effect sizes, confidence intervals, p-values (check Results section)
- Limitations mentioned, potential biases acknowledged (check Discussion and Conclusions)
- Funding sources and their potential influence (check throughout, especially Introduction and Methods)
- Author names, affiliations, and any disclosed conflicts of interest (check Introduction and Methods)
- Any inconsistencies between methods, results, and conclusions (compare across ALL sections)
- Connections between authors' backgrounds and study conclusions (even indirect ones)
- When extracting quotes, search through ALL sections to find the best examples

EVIDENCE HIERARCHY (from strongest to weakest):
1. Systematic Reviews/Meta-analyses (highest quality)
2. Randomized Controlled Trials (RCTs)
3. Cohort Studies (prospective > retrospective)
4. Case-Control Studies
5. Case Series/Reports
6. Expert Opinion/Editorials (lowest quality)

METADATA: ${metadata.title || 'Unknown'} | ${authorsList} | ${metadata.journal || 'Unknown'} | Type: ${metadata.studyType || 'Unknown'} | N=${metadata.sampleSize || 'Unknown'} | Funding: ${fundingList}${doiInfo}${urlInfo}

${contentSource}
${getOptimizedContent(content)}

COMPREHENSIVE ANALYSIS REQUIREMENTS (analyze thoroughly):
1. Identify study type and EXACT position in evidence hierarchy (1-6)
2. Assess methodology COMPREHENSIVELY:
   - Randomization procedures (if applicable)
   - Blinding (single/double/triple, or lack thereof)
   - Control groups and their appropriateness
   - Sample size and power calculations
   - Follow-up duration and completion rates
   - Inclusion/exclusion criteria clarity
   - Statistical methods used and their appropriateness
3. Detect ALL relevant fallacies (CRITICAL - MUST include quotes and debunking):
   - Correlation vs causation errors
   - Overgeneralization (species, population, context)
   - Selection bias, recall bias, confirmation bias
   - p-hacking, HARKing, cherry-picking
   - Survivorship bias, publication bias
   
   FOR EACH FALLACY FOUND (REQUIRED):
   - SEARCH THROUGH ALL SECTIONS of the study (Abstract, Introduction, Methods, Results, Discussion, Conclusions)
   - Do NOT limit yourself to just the first section - look through the ENTIRE study content provided
   - Extract a SHORT, EXACT quote (1-3 sentences) from ANY section of the study that demonstrates the fallacy
   - Copy the quote VERBATIM from the study content (word-for-word, not paraphrased)
   - Note where in the study the quote appears (e.g., "Abstract", "Results section", "Discussion", "Methods", "Introduction", "Conclusions")
   - Try to find quotes from DIFFERENT sections when multiple fallacies are present - don't just quote from one section
   - Provide a clear DEBUNKING explaining:
     * Why this specific quote is problematic
     * What logical error or flaw it demonstrates
     * How the reasoning in the quote is flawed
     * What the study should have said instead
   - The quote must be a direct copy-paste from the study text provided above
   - IMPORTANT: If you cannot find a direct quote from the study, DO NOT include a "quote" field in the JSON for that fallacy. Only include "quote" and "quoteLocation" when you have an actual quote from the study text.
4. Identify ALL confounders and validity threats (include quotes and debunking):
   - Confounding variables not controlled
   - Selection bias, measurement bias, attrition bias
   - Publication bias, industry influence
   - External validity limitations
   - Temporal relationships (reverse causation?)
   
   FOR EACH THREAT/CONFOUNDER:
   - SEARCH THROUGH ALL SECTIONS of the study (Abstract, Introduction, Methods, Results, Discussion, Conclusions)
   - Look through the ENTIRE study content, not just one section
   - If the study text contains problematic statements, extract EXACT quotes (1-2 sentences) from ANY section
   - Copy quotes VERBATIM from the study content
   - Note where in the study the quote appears (e.g., "Methods section", "Discussion", "Results", "Introduction")
   - Try to find quotes from DIFFERENT sections when multiple threats are present
   - Provide DEBUNKING explaining:
     * Why the quoted statement is problematic
     * What methodological flaw it reveals
     * What's missing or wrong in the study's reasoning
     * How this affects the study's conclusions
   - IMPORTANT: If you cannot find a direct quote from the study, DO NOT include a "quote" field in the JSON. Only include "quote" and "quoteLocation" when you have an actual quote from the study text.
5. Evaluate reproducibility thoroughly:
   - Methodology clarity and replicability
   - Data availability and sharing
   - Replication attempts and their outcomes
6. Consider ALL factors that could change outcomes:
   - Missing or unmeasured confounders
   - External validity and generalizability issues
   - Context-specific factors
   - Temporal/spatial limitations
   - Reverse causation possibilities
   - Competing explanations for results

7. Detect ALL types of BIAS comprehensively (CRITICAL - look DEEPLY):
   - Funding sources and potential influence (industry, government, non-profit, private foundations)
   - Author conflicts of interest (financial, personal, professional) - check disclosure sections
   - Author ownership, stock holdings, or business interests related to study topic
   - Author affiliations with companies, organizations, or institutions with vested interests
   - INDIRECT CONNECTIONS are critical - look for:
     * Authors who own businesses related to study conclusions (e.g., sweets brand owner advocating sugar)
     * Authors with past employment at companies with interests in study outcomes
     * Authors with consulting relationships, advisory roles, or board positions
     * Authors with patents, trademarks, or intellectual property related to findings
     * Family members or close associates with financial interests
     * Institutional affiliations that could benefit from study results
   - Publication bias (selective reporting, file drawer problem)
   - Selection bias in participant recruitment
   - Measurement bias in data collection
   - Interpretation bias in conclusions
   - Use your knowledge to research author backgrounds if names are provided
   - Check if study conclusions align suspiciously with author/funder interests
   - Be thorough - even subtle or indirect connections matter
   - If author names are in metadata, consider their known affiliations and past work

Score evidenceStrength based on hierarchy position AND quality within that level. Adjust all scores downward for:
- High severity fallacies (major deductions: -5-10 points)
- Missing controls/confounders (moderate deductions: -3-5 points)
- Small sample sizes relative to effect size
- ANY type of bias (funding, author conflicts, ownership, affiliations, etc.)
- Lack of replication or methodological transparency
- Multiple validity threats

SCORING MUST BE OBJECTIVE: Apply the same scoring criteria regardless of topic. A well-designed study on any subject should score well if methodology is sound. A poorly-designed study on any subject should score poorly. Do NOT adjust scores based on topic, controversy, or your personal views.

If you recognize this study from the URL, title, authors, or DOI, reference: reception in field, replication attempts and outcomes, major critiques, controversies, retractions, related research. Provide detailed analysis - 2-3 sentences per major field. List top 4-5 issues/strengths.

REMEMBER: Maintain complete objectivity. Evaluate the study's scientific quality based on methodology and evidence alone, not on the topic or its implications. Your analysis must be unbiased regardless of whether the study is about climate change, vaccines, nutrition, psychology, medicine, social sciences, or any other field.

{
  "evidenceHierarchy": {
    "level": "systematic_review|rct|cohort|case_control|case_series|expert_opinion",
    "position": "1-6 (1=strongest)",
    "qualityWithinLevel": "high|medium|low"
  },
  "methodology": {"score": 0-25, "maxScore": 25, "details": "brief analysis including randomization, blinding, controls", "issues": ["issue1"], "strengths": ["strength1"]},
  "evidenceStrength": {"score": 0-20, "maxScore": 20, "details": "brief - note hierarchy position and quality", "issues": [], "strengths": []},
  "bias": {"score": 0-20, "maxScore": 20, "details": "comprehensive bias analysis - funding, author conflicts, ownership, affiliations, indirect connections", "issues": ["specific bias issues found"], "strengths": ["lack of detected biases"]},
  "reproducibility": {"score": 0-15, "maxScore": 15, "details": "brief", "issues": [], "strengths": []},
  "statisticalValidity": {"score": 0-20, "maxScore": 20, "details": "brief", "issues": [], "strengths": []},
  "fallacies": [{"type": "fallacy_name", "description": "brief explanation of the fallacy", "quote": "EXACT copy-paste from study text (1-3 sentences) that demonstrates the fallacy", "quoteLocation": "where in study (e.g., Results, Discussion, Abstract)", "debunking": "detailed analysis debunking the quoted text and explaining why it's problematic", "severity": "high|medium|low", "impact": "how it affects conclusions"}],
  "confounders": [{"factor": "confounder_name", "description": "brief", "quote": "exact quote from study if available", "quoteLocation": "where in study if quote provided", "debunking": "analysis of quoted text if provided", "impact": "how it could affect outcomes"}],
  "validityThreats": [{"threat": "threat_name", "description": "brief", "quote": "exact quote from study if available", "quoteLocation": "where in study if quote provided", "debunking": "analysis of quoted text if provided", "severity": "high|medium|low"}],
  "issues": [{"category": "category", "description": "brief", "quote": "exact quote from study if available", "quoteLocation": "where in study if quote provided", "debunking": "analysis of quoted text if provided"}],
  "expertContext": {"consensus": "brief", "controversies": [], "recentUpdates": [], "relatedStudies": []},
  "simpleSummary": "2-3 paragraph non-technical summary - maintain complete objectivity, describe findings neutrally",
  "technicalCritique": "2-3 paragraph technical analysis - focus on methodology and evidence quality with zero bias",
  "biasReport": "2-3 paragraph comprehensive bias analysis covering funding, author conflicts, ownership, affiliations, and any indirect connections - evaluate objectively",
  "recommendations": ["rec1", "rec2"]
}

Return ONLY valid JSON.`;
}

export function createSimpleAnalysisPrompt(content: ExtractedContent): string {
  return `Analyze this study with COMPLETE OBJECTIVITY and ZERO BIAS. Provide a 2-3 paragraph non-technical summary: what it found, reliability, and major concerns. Base your analysis solely on methodological quality and evidence strength, regardless of topic or controversial nature.

Study:
${getOptimizedContent(content)}

Summary:`;
}

