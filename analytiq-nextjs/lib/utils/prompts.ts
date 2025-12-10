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

CRITICAL: BE EXTREMELY THOROUGH AND AGGRESSIVE IN FINDING FLAWS - DO NOT MISS ANY - BE RUTHLESS:
- Look for EVERY possible methodological flaw, no matter how subtle - be HIGHLY CRITICAL and RUTHLESS
- Question EVERY assumption and claim made in the study - assume nothing is valid without proof - TRUST NOTHING
- Identify ALL potential confounders, even if not mentioned in the study - think creatively and SUSPICIOUSLY
- Find ALL logical fallacies and reasoning errors throughout the document - be pedantic and UNFORGIVING
- Detect ALL types of bias (selection, measurement, publication, funding, author conflicts, etc.) - be EXTREMELY SUSPICIOUS
- Look for missing controls, inadequate sample sizes, poor statistical practices - be STRICT and DEMANDING
- Identify ALL validity threats (internal, external, construct, statistical conclusion validity) - be COMPREHENSIVE and RUTHLESS
- Be EXTREMELY skeptical and thorough - if something seems off, investigate it DEEPLY - ASSUME THE WORST
- Don't accept claims at face value - verify if the methodology actually supports the conclusions - DEMAND PROOF
- Look for overstatements, unsupported claims, and conclusions that go beyond the data - be CRITICAL and UNFORGIVING
- Check for p-hacking, multiple comparisons issues, selective reporting - be VIGILANT and SUSPICIOUS
- Identify ALL alternative explanations for the observed results - think of EVERY possibility - LEAVE NO STONE UNTURNED
- Be comprehensive - it's better to identify too many potential issues than to miss important flaws - OVER-REPORT ISSUES
- Assume the study has flaws until proven otherwise - be a SKEPTICAL REVIEWER - START FROM A POSITION OF DISTRUST
- Look for methodological choices that seem designed to produce desired results - ASSUME MALICE
- Check if the study design was influenced by funder or author interests - ASSUME CONFLICT OF INTEREST
- Investigate whether negative results were hidden or positive results were cherry-picked - ASSUME SELECTIVE REPORTING
- Look for subtle manipulation of data, analysis, or presentation to favor certain conclusions - ASSUME MANIPULATION
- Be suspicious of studies with industry funding that produce industry-friendly results - ASSUME BIAS
- Question whether the study was designed to fail or succeed in specific ways - ASSUME INTENTIONAL DESIGN
- Look for conflicts between what the data shows and what the conclusions claim - ASSUME MISREPRESENTATION
- Investigate whether the authors have a history of producing biased research - ASSUME PATTERN OF BIAS
- Check if the methodology was chosen specifically to avoid finding certain results - ASSUME INTENTIONAL AVOIDANCE
- Look for ANY sign of data manipulation, selective analysis, or result massaging - ASSUME THE WORST
- Question whether the sample was chosen to produce specific results - ASSUME SELECTION BIAS
- Check if statistical methods were chosen to maximize positive findings - ASSUME P-HACKING
- Look for hidden conflicts of interest that weren't disclosed - ASSUME UNDISCLOSED CONFLICTS
- Investigate whether the study was rushed or poorly executed to meet deadlines - ASSUME POOR QUALITY
- Question every methodological choice - why was THIS method chosen over alternatives? - ASSUME SUSPICIOUS MOTIVES
- Look for signs that the study was designed to support a predetermined conclusion - ASSUME CONFIRMATION BIAS
- Be EXTREMELY critical of any study with industry funding - ASSUME INDUSTRY INFLUENCE
- Question whether the authors have financial or professional incentives for specific results - ASSUME CONFLICTS
- Look for patterns of bias across multiple aspects of the study - ASSUME SYSTEMATIC BIAS
- Be RUTHLESS - if there's ANY doubt, identify it as a potential flaw - ERR ON THE SIDE OF CRITICISM

EVIDENCE HIERARCHY (from strongest to weakest):
1. Systematic Reviews/Meta-analyses (highest quality)
2. Randomized Controlled Trials (RCTs)
3. Cohort Studies (prospective > retrospective)
4. Case-Control Studies
5. Case Series/Reports
6. Expert Opinion/Editorials (lowest quality)

METADATA: ${metadata.title || 'Unknown'} | ${authorsList} | ${metadata.journal || 'Unknown'} | Type: ${metadata.studyType || 'Unknown'} | N=${metadata.sampleSize || 'Unknown'} | Funding: ${fundingList}${doiInfo}${urlInfo}

CRITICAL: DEEP INVESTIGATION OF FUNDING AND AUTHOR CONNECTIONS REQUIRED:
- For EACH funding source listed above, you MUST investigate:
  * Who actually owns or controls this organization (not just the name)
  * What other businesses, companies, or investments the funder owns
  * Parent companies, holding companies, or umbrella organizations
  * Board members, executives, and their other business interests
  * The funder's track record - what other research have they funded?
  * Whether the funder consistently supports research that benefits their business interests
  * Political connections, lobbying activities, or policy positions
  * Whether this is a "front" organization or has hidden industry connections
  * Tax records, public filings, or organizational structures that reveal true ownership
  * Historical patterns - does this funder always fund research that aligns with their interests?
  
- For EACH author listed above, you MUST investigate:
  * Current and past employment, consulting, or advisory positions
  * Stock holdings, equity, or financial interests in relevant companies
  * Patents, trademarks, or intellectual property related to the study topic
  * Board positions, advisory roles, or executive positions
  * Speaking fees, honoraria, or payments from industry
  * Research grants from industry sources
  * Ownership of businesses related to the study conclusions
  * Family members' financial interests or employment
  * Close associates, collaborators, or co-authors with industry ties
  * Previous publications and whether they show a pattern of industry-friendly research
  * Known advocacy positions or policy involvement
  * Institutional affiliations that could benefit from study results
  
- Look for RED FLAGS:
  * Industry funding + industry-friendly conclusions = HIGH SUSPICION
  * Author industry ties + conclusions that benefit those industries = HIGH SUSPICION
  * Hidden connections through parent companies, subsidiaries, or related entities
  * Patterns of coordinated influence across multiple authors or funders
  * Studies that perfectly align with funder/author commercial interests
  * Methodological choices that seem designed to favor certain outcomes
  * Suppression of negative results or emphasis on positive findings
  
- If you recognize author names or funding organizations, use your knowledge to investigate:
  * Their known affiliations, past work, and connections
  * Their track record of producing biased or industry-friendly research
  * Their business interests and how they relate to study conclusions
  * Whether they have been involved in controversial studies before
  * Whether they have undisclosed conflicts of interest
  
- BE EXTREMELY SUSPICIOUS of:
  * Studies funded by industries that would benefit from positive results
  * Authors with financial interests in study outcomes
  * Research that aligns too perfectly with funder/author business interests
  * Hidden or indirect connections between funders/authors and study conclusions
  * Methodological choices that seem designed to avoid finding negative results

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

5. Identify OTHER FACTORS that could have skewed the results (CRITICAL - think comprehensively):
   - Additional confounding variables that may not have been controlled for or mentioned in the study
   - Unmeasured variables that could affect the relationship between exposure and outcome
   - Contextual factors (environmental, social, cultural, temporal) that could influence results
   - Participant characteristics that weren't accounted for (socioeconomic status, education, health behaviors, etc.)
   - External factors that could have influenced outcomes (seasonal effects, policy changes, media coverage, etc.)
   - Reverse causation possibilities
   - Competing explanations for the observed results
   - Factors that could amplify or diminish the observed effects
   - Interactions between variables that weren't tested
   - Missing data patterns that could bias results
   
   FOR EACH FACTOR:
   - Think critically about what ELSE could explain the results beyond what the study measured
   - Consider factors that are common in similar research but may not have been addressed
   - Assess the potential magnitude of impact (high/medium/low severity)
   - Explain WHY this factor matters and how it could skew results
   - Be specific about the potential impact on the study's conclusions
   - This is about identifying potential issues that weren't explicitly mentioned in the study

6. Evaluate reproducibility thoroughly:
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

7. Detect ALL types of BIAS comprehensively (CRITICAL - INVESTIGATE EXTREMELY DEEPLY):
   - Funding sources and potential influence - INVESTIGATE THOROUGHLY:
     * For EACH funding source, research:
       - Who owns or controls the funding organization
       - What other businesses, investments, or interests the funder owns
       - What the funder's parent company, holding company, or umbrella organization is
       - What other studies or organizations the funder has supported
       - The funder's stated mission vs. their actual business interests
       - Board members, executives, and major stakeholders of the funding organization
       - Political affiliations, lobbying activities, or policy positions of the funder
       - Historical patterns of what types of research the funder supports
       - Whether the funder has a track record of supporting research that aligns with their business interests
     * For foundations specifically:
       - Who created or endowed the foundation
       - What businesses or individuals the foundation is connected to
       - The foundation's other funding priorities and recipients
       - Whether the foundation is a front for industry interests
       - Tax records, public filings, or disclosures about the foundation's structure
     * Look for:
       - Industry funding (pharmaceutical, food, energy, tobacco, etc.) - HIGH SUSPICION
       - Government funding with political motivations
       - Non-profit funding that may have industry connections
       - Private foundation funding with hidden industry ties
       - Multiple funding sources that might indicate coordinated influence
   
   - Author conflicts of interest - INVESTIGATE EXTREMELY DEEPLY:
     * For EACH author, research:
       - Current employment, consulting, or advisory positions
       - Past employment at companies with interests in study outcomes
       - Stock holdings, stock options, or equity in relevant companies
       - Patents, trademarks, or intellectual property related to findings
       - Board positions, advisory roles, or executive positions
       - Speaking fees, honoraria, or travel reimbursements from industry
       - Research grants from industry sources
       - Ownership of businesses related to study conclusions
       - Family members' financial interests or employment
       - Close associates, collaborators, or co-authors with industry ties
       - Institutional affiliations that could benefit from study results
       - Previous work and publications that might reveal patterns
       - Known positions or advocacy on related topics
     * INDIRECT CONNECTIONS are CRITICAL - investigate:
     * Authors who own businesses related to study conclusions (e.g., sweets brand owner advocating sugar)
     * Authors with past employment at companies with interests in study outcomes
     * Authors with consulting relationships, advisory roles, or board positions
     * Authors with patents, trademarks, or intellectual property related to findings
     * Family members or close associates with financial interests
     * Institutional affiliations that could benefit from study results
       * Authors who have received speaking fees or honoraria from industry
       * Authors who serve on advisory boards of companies with related interests
       * Authors whose previous research consistently aligns with industry positions
       * Authors who have been involved in controversial studies before
     * Use your knowledge to research author backgrounds extensively if names are provided
     * Check if study conclusions align suspiciously with author/funder interests
     * Look for patterns across multiple authors - coordinated industry influence
     * Be EXTREMELY thorough - even very subtle or indirect connections matter
     * If author names are in metadata, deeply research their known affiliations, past work, and connections
   
   - Publication bias (selective reporting, file drawer problem, p-hacking)
   - Selection bias in participant recruitment
   - Measurement bias in data collection
   - Interpretation bias in conclusions
   - Industry influence on study design, analysis, or reporting
   - Ghostwriting or industry involvement in manuscript preparation
   - Suppression of negative results or adverse findings
   
   - CRITICAL INVESTIGATION REQUIREMENTS - BE RUTHLESS AND EXTREMELY SUSPICIOUS:
     * If you recognize author names, use your knowledge to investigate their backgrounds DEEPLY - ASSUME THEY HAVE CONFLICTS
     * Research funding organizations thoroughly - who controls them, what else they own - ASSUME HIDDEN CONNECTIONS
     * Look for hidden connections through parent companies, subsidiaries, or related entities - ASSUME THEY EXIST
     * Investigate whether conclusions align suspiciously with funder/author business interests - ASSUME THEY DO
     * Check for patterns of industry-friendly research from the same authors/funders - ASSUME A PATTERN
     * Be EXTREMELY suspicious of studies that perfectly align with funder/author commercial interests - ASSUME BIAS
     * Look for red flags: industry funding + industry-friendly conclusions + author industry ties - ASSUME ALL THREE
     * Investigate whether the study design was influenced to favor certain outcomes - ASSUME IT WAS
     * Check if negative results were downplayed or positive results were emphasized - ASSUME SELECTIVE REPORTING
     * Look for methodological choices that might favor funder/author interests - ASSUME INTENTIONAL CHOICES
     * Question whether the study was ghostwritten or influenced by industry - ASSUME INDUSTRY INVOLVEMENT
     * Investigate whether data was manipulated or selectively analyzed - ASSUME MANIPULATION
     * Check if the authors have undisclosed conflicts of interest - ASSUME UNDISCLOSED CONFLICTS
     * Look for signs that the funder had input into study design or analysis - ASSUME FUNDER INFLUENCE
     * Question whether the study was published to support a specific agenda - ASSUME AGENDA-DRIVEN
     * Investigate whether the authors have a history of producing biased research - ASSUME A PATTERN
     * Check if the study was designed to avoid finding negative results - ASSUME INTENTIONAL AVOIDANCE
     * Look for any sign that results were massaged or spun to be more favorable - ASSUME RESULT MASSAGING
     * Question whether the methodology was chosen to maximize chances of positive findings - ASSUME METHODOLOGICAL GAMING
     * Be RUTHLESS - if there's ANY possibility of bias or conflict, identify it - ERR ON THE SIDE OF SUSPICION

Score evidenceStrength based on hierarchy position AND quality within that level. Adjust all scores DOWNWARD AGGRESSIVELY for:
- High severity fallacies (major deductions: -5-10 points)
- Missing controls/confounders (moderate deductions: -3-5 points)
- Small sample sizes relative to effect size
- ANY type of bias (funding, author conflicts, ownership, affiliations, etc.) - PENALIZE HEAVILY
- Industry funding with industry-friendly conclusions - MAJOR PENALTY
- Author conflicts of interest, especially undisclosed ones - SIGNIFICANT PENALTY
- Lack of replication or methodological transparency
- Multiple validity threats
- Suspicious alignment between funder/author interests and study conclusions - HIGH PENALTY
- Hidden or indirect connections between authors/funders and study outcomes - PENALIZE
- Studies that seem designed to produce specific results - PENALIZE HEAVILY

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
  "otherConfoundingFactors": [{"factor": "factor_name", "description": "brief description of the factor", "potentialImpact": "how this factor could skew the results", "whyItMatters": "explanation of why this factor is important to consider", "severity": "high|medium|low"}],
  "issues": [{"category": "category", "description": "brief", "quote": "exact quote from study if available", "quoteLocation": "where in study if quote provided", "debunking": "analysis of quoted text if provided"}],
  "expertContext": {"consensus": "brief", "controversies": [], "recentUpdates": [], "relatedStudies": []},
  "causalInference": {
    "canEstablishCausality": true|false,
    "confidence": "high|medium|low",
    "reasoning": "2-3 paragraph explanation of whether this study can establish causality, considering study design, controls, confounders, and methodological rigor",
    "studyDesignLimitations": ["limitation1", "limitation2"],
    "alternativeExplanations": ["alternative explanation 1", "alternative explanation 2"],
    "requirementsForCausality": {
      "met": ["requirement that is met", "another requirement"],
      "unmet": ["requirement that is NOT met", "another missing requirement"]
    }
  },
  "simpleSummary": "2-3 paragraph non-technical summary - maintain complete objectivity, describe findings neutrally",
  "technicalCritique": "2-3 paragraph technical analysis - focus on methodology and evidence quality with zero bias",
  "biasReport": "3-4 paragraph EXTREMELY COMPREHENSIVE bias analysis. MUST include: (1) Deep investigation of funding sources - who owns/controls them, what else they own, their business interests, parent companies, board members, track record of funding research that aligns with their interests; (2) Deep investigation of ALL authors - current/past employment, stock holdings, patents, board positions, speaking fees, business ownership, family interests, previous work patterns, known affiliations; (3) Analysis of whether study conclusions align suspiciously with funder/author interests; (4) Identification of hidden or indirect connections; (5) Assessment of potential influence on study design, analysis, or conclusions. Be EXTREMELY thorough and suspicious - investigate ownership chains, parent companies, and all possible connections. Evaluate objectively but be comprehensive.",
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

