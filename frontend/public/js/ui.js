export function showLoading() {
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const errorSection = document.getElementById('error-section');
    const loadingSection = document.getElementById('loading-section');
    
    if (inputSection) inputSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (errorSection) errorSection.classList.add('hidden');
    if (loadingSection) loadingSection.classList.remove('hidden');
}

export function hideLoading() {
    const loadingSection = document.getElementById('loading-section');
    if (loadingSection) loadingSection.classList.add('hidden');
}

export function showError(message) {
    const inputSection = document.getElementById('input-section');
    const resultsSection = document.getElementById('results-section');
    const loadingSection = document.getElementById('loading-section');
    const errorSection = document.getElementById('error-section');
    const errorMessage = document.getElementById('error-message');
    
    if (inputSection) inputSection.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (loadingSection) loadingSection.classList.add('hidden');
    if (errorSection) errorSection.classList.remove('hidden');
    if (errorMessage) errorMessage.textContent = message || 'An error occurred';
}

export function showResults(result) {
    const inputSection = document.getElementById('input-section');
    const errorSection = document.getElementById('error-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    
    if (inputSection) inputSection.classList.remove('hidden');
    if (errorSection) errorSection.classList.add('hidden');
    if (loadingSection) loadingSection.classList.add('hidden');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    }
    
    // Wait for DOM to update before accessing elements
    setTimeout(() => {
        updateAllResults(result);
    }, 50);
}

function updateAllResults(result) {
    // Update overall score with animation
    const overallScore = result.trustScore?.overall || 0;
    const scoreNumberEl = document.getElementById('score-number');
    const scoreRatingEl = document.getElementById('score-rating');
    const scoreCard = document.getElementById('score-card');
    const scoreDescriptionEl = document.getElementById('score-description');
    
    if (scoreNumberEl) {
        // Animate score number
        animateNumber(scoreNumberEl, 0, overallScore, 1000);
    }
    
    if (scoreRatingEl && result.trustScore) {
        scoreRatingEl.textContent = result.trustScore.rating || 'Moderately Reliable';
    }
    
    // Update score card gradient based on score
    if (scoreCard) {
        const gradient = getScoreGradient(overallScore);
        scoreCard.style.background = gradient;
    }
    
    // Update score description
    if (scoreDescriptionEl && result.trustScore) {
        scoreDescriptionEl.textContent = 
            `Based on analysis across ${Object.keys(result.trustScore.breakdown || {}).length} categories`;
    }

    // Render evidence hierarchy
    if (result.evidenceHierarchy) {
        renderEvidenceHierarchy(result.evidenceHierarchy);
    }
    
    // Render category breakdown
    if (result.trustScore?.breakdown) {
        renderCategoryBreakdown(result.trustScore.breakdown);
    }
    
    // Render views
    const simpleSummaryEl = document.getElementById('simple-summary');
    const technicalCritiqueEl = document.getElementById('technical-critique');
    const biasReportEl = document.getElementById('bias-report');
    
    if (simpleSummaryEl) {
        simpleSummaryEl.textContent = result.simpleSummary || 'No summary available.';
    }
    if (technicalCritiqueEl) {
        technicalCritiqueEl.textContent = result.technicalCritique || 'No technical critique available.';
    }
    if (biasReportEl) {
        biasReportEl.textContent = result.biasReport || 'No bias report available.';
    }
    
    // Render category details
    if (result.trustScore?.breakdown) {
        renderCategoryDetails(result.trustScore.breakdown);
    }
    
    // Render prominent flaws summary
    const flawsSectionGroup = document.getElementById('flaws-section-group');
    if (result.flawDetection) {
        const hasFlaws = (result.flawDetection.fallacies && result.flawDetection.fallacies.length > 0) ||
                        (result.flawDetection.issues && result.flawDetection.issues.length > 0) ||
                        (result.flawDetection.validityThreats && result.flawDetection.validityThreats.length > 0);
        
        if (hasFlaws && flawsSectionGroup) {
            flawsSectionGroup.style.display = 'block';
        }
        
        renderFlawsSummary(result.flawDetection);
        renderIssues(result.flawDetection);
        renderValidityThreats(result.flawDetection);
    } else if (flawsSectionGroup) {
        flawsSectionGroup.style.display = 'none';
    }
    
    // Render expert context
    if (result.expertContext) {
        renderExpertContext(result.expertContext);
    }
    
    // Render recommendations
    if (result.recommendations) {
        renderRecommendations(result.recommendations);
    }
    
    // Render metadata
    if (result.metadata) {
        renderMetadata(result.metadata);
    }

    // Scroll to results
    if (resultsSection) {
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

function getScoreColor(score) {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
}

function getScoreGradient(score) {
    if (score >= 80) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (score >= 60) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (score >= 40) return 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
}

function getScoreGradientColor(score) {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
}

function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const startTime = performance.now();
    const range = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (range * easeOutQuart));
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = end;
        }
    }
    
    requestAnimationFrame(update);
}

function renderCategoryBreakdown(breakdown) {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const categories = [
        { key: 'methodology', label: 'Methodology Quality', max: 25 },
        { key: 'evidenceStrength', label: 'Evidence Strength', max: 20 },
        { key: 'bias', label: 'Bias', max: 20 },
        { key: 'reproducibility', label: 'Reproducibility', max: 15 },
        { key: 'statisticalValidity', label: 'Statistical Validity', max: 20 },
    ];

    categories.forEach(cat => {
        // Handle backward compatibility: check both 'bias' and 'fundingBias'
        const data = breakdown[cat.key] || (cat.key === 'bias' ? breakdown['fundingBias'] : null);
        if (!data) return;
        
        const item = document.createElement('div');
        item.className = 'category-item';
        
        const percentage = Math.round((data.score / data.maxScore) * 100);
        const color = getScoreColor(percentage);
        
        item.innerHTML = `
            <h4>${cat.label}</h4>
            <div class="score" style="color: ${color}">${data.score}/${data.maxScore}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%; background: linear-gradient(90deg, ${color} 0%, ${getScoreGradientColor(percentage)} 100%)"></div>
            </div>
        `;
        
        grid.appendChild(item);
        
        // Animate progress bar after a short delay
        setTimeout(() => {
            const progressFill = item.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
        }, 200 + (categories.indexOf(cat) * 100));
    });
}

function renderCategoryDetails(breakdown) {
    const container = document.getElementById('category-details');
    if (!container) return;
    container.innerHTML = '';

    const categories = [
        { key: 'methodology', label: 'Methodology Quality' },
        { key: 'evidenceStrength', label: 'Evidence Strength' },
        { key: 'bias', label: 'Bias' },
        { key: 'reproducibility', label: 'Reproducibility' },
        { key: 'statisticalValidity', label: 'Statistical Validity' },
    ];

    categories.forEach(cat => {
        // Handle backward compatibility: check both 'bias' and 'fundingBias'
        const data = breakdown[cat.key] || (cat.key === 'bias' ? breakdown['fundingBias'] : null);
        if (!data) return;
        const item = document.createElement('div');
        item.className = 'category-detail-item';
        
        let html = `<h4>${cat.label} (${data.score}/${data.maxScore})</h4>`;
        html += `<div class="details">${data.details || 'No details available.'}</div>`;
        
        if (data.strengths && data.strengths.length > 0) {
            html += `<div class="strengths"><h5>Strengths</h5><ul>`;
            data.strengths.forEach(s => {
                html += `<li>${s}</li>`;
            });
            html += `</ul></div>`;
        }
        
        if (data.issues && data.issues.length > 0) {
            html += `<div class="issues"><h5>Issues</h5><ul>`;
            data.issues.forEach(i => {
                html += `<li>${i}</li>`;
            });
            html += `</ul></div>`;
        }
        
        item.innerHTML = html;
        container.appendChild(item);
    });
}

function renderFlawsSummary(flawDetection) {
    const summarySection = document.getElementById('flaws-summary');
    const grid = document.getElementById('flaws-grid');
    const countEl = document.getElementById('flaws-count');
    if (!summarySection || !grid || !countEl) return;

    const allFlaws = [];
    
    // Collect all fallacies
    if (flawDetection.fallacies && flawDetection.fallacies.length > 0) {
        flawDetection.fallacies.forEach(f => allFlaws.push({...f, type: 'fallacy'}));
    }
    
    // Collect all issues
    if (flawDetection.issues && flawDetection.issues.length > 0) {
        flawDetection.issues.forEach(i => allFlaws.push({...i, type: 'issue'}));
    }
    
    // Collect validity threats
    if (flawDetection.validityThreats && flawDetection.validityThreats.length > 0) {
        flawDetection.validityThreats.forEach(t => allFlaws.push({...t, type: 'threat'}));
    }

    if (allFlaws.length === 0) {
        summarySection.style.display = 'none';
        return;
    }

    summarySection.style.display = 'block';
    grid.innerHTML = '';

    // Sort by severity (high first)
    const severityOrder = { high: 3, medium: 2, low: 1 };
    allFlaws.sort((a, b) => {
        const aSev = severityOrder[a.severity] || 1;
        const bSev = severityOrder[b.severity] || 1;
        return bSev - aSev;
    });

    // Show top 6 most critical issues
    const topFlaws = allFlaws.slice(0, 6);
    
    countEl.innerHTML = `
        <span class="count-number">${allFlaws.length}</span>
        <span class="count-label">${allFlaws.length === 1 ? 'Issue' : 'Issues'} Found</span>
    `;

    topFlaws.forEach(flaw => {
        const card = document.createElement('div');
        card.className = 'flaw-card';
        
        const severity = flaw.severity || 'medium';
        const severityInfo = getSeverityInfo(severity);
        const flawType = flaw.type || flaw.category || flaw.threat || 'Issue';
        const description = simplifyDescription(flaw.description || '');
        
        let cardHtml = `
            <div class="flaw-icon" style="background: ${severityInfo.bgColor}">
                ${severityInfo.icon}
            </div>
            <div class="flaw-content">
                <div class="flaw-header">
                    <h4>${simplifyFlawName(flawType)}</h4>
                    <span class="severity-badge" style="background: ${severityInfo.bgColor}; color: ${severityInfo.textColor}">
                        ${severityInfo.label}
                    </span>
                </div>
                <p class="flaw-description">${description}</p>`;
        
        // Add quote with citation if available and valid
        if (flaw.quote && flaw.quote.trim() && !flaw.quote.toLowerCase().includes('no direct quote found') && !flaw.quote.toLowerCase().includes('no quote')) {
            cardHtml += `
                <div class="quote-section">
                    <div class="quote-label">📄 Quote:</div>
                    <div class="quote">"${flaw.quote}"</div>
                    ${flaw.quoteLocation && flaw.quoteLocation !== 'N/A' ? `<div class="quote-citation"><strong>Location:</strong> ${flaw.quoteLocation}</div>` : ''}
                </div>`;
        }
        
        // Add debunking if available
        if (flaw.debunking) {
            cardHtml += `
                <div class="debunking-section">
                    <div class="debunking-label">🔍 Analysis:</div>
                    <div class="debunking">${simplifyDescription(flaw.debunking)}</div>
                </div>`;
        }
        
        if (flaw.impact) {
            cardHtml += `<p class="flaw-impact"><strong>Why this matters:</strong> ${simplifyDescription(flaw.impact)}</p>`;
        }
        
        cardHtml += `</div>`;
        card.innerHTML = cardHtml;
        
        grid.appendChild(card);
    });
}

function getSeverityInfo(severity) {
    const info = {
        high: {
            icon: '🔴',
            label: 'Critical',
            bgColor: '#fee2e2',
            textColor: '#991b1b',
            borderColor: '#ef4444'
        },
        medium: {
            icon: '🟡',
            label: 'Moderate',
            bgColor: '#fef3c7',
            textColor: '#92400e',
            borderColor: '#f59e0b'
        },
        low: {
            icon: '🔵',
            label: 'Minor',
            bgColor: '#dbeafe',
            textColor: '#1e40af',
            borderColor: '#3b82f6'
        }
    };
    return info[severity] || info.medium;
}

function simplifyFlawName(name) {
    const simplifications = {
        'correlation_vs_causation': 'Correlation vs Causation',
        'correlation vs causation': 'Correlation vs Causation',
        'overgeneralization': 'Overgeneralization',
        'selection_bias': 'Selection Bias',
        'selection bias': 'Selection Bias',
        'confirmation_bias': 'Confirmation Bias',
        'confirmation bias': 'Confirmation Bias',
        'p-hacking': 'P-Hacking',
        'p_hacking': 'P-Hacking',
        'HARKing': 'HARKing',
        'cherry_picking': 'Cherry Picking',
        'cherry picking': 'Cherry Picking',
        'publication_bias': 'Publication Bias',
        'publication bias': 'Publication Bias',
        'survivorship_bias': 'Survivorship Bias',
        'survivorship bias': 'Survivorship Bias',
        'recall_bias': 'Recall Bias',
        'recall bias': 'Recall Bias'
    };
    
    const simplified = simplifications[name.toLowerCase()] || name;
    return simplified.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function simplifyDescription(text) {
    if (!text) return '';
    
    // Remove overly technical jargon and simplify
    let simplified = text
        .replace(/\bconfounding variable\b/gi, 'hidden factor')
        .replace(/\bconfounder\b/gi, 'hidden factor')
        .replace(/\bstatistical significance\b/gi, 'statistical importance')
        .replace(/\bp-value\b/gi, 'statistical test')
        .replace(/\bexternal validity\b/gi, 'applicability')
        .replace(/\binternal validity\b/gi, 'study quality')
        .replace(/\bgeneralizability\b/gi, 'applicability')
        .replace(/\bmethodological\b/gi, 'research')
        .replace(/\bempirical\b/gi, 'research-based');
    
    // Break up long sentences
    simplified = simplified.replace(/\. ([A-Z])/g, '.<br><br>$1');
    
    return simplified;
}

function renderIssues(flawDetection) {
    const container = document.getElementById('issues-list');
    if (!container) return;
    container.innerHTML = '';

    if (flawDetection.fallacies && flawDetection.fallacies.length > 0) {
        flawDetection.fallacies.forEach(fallacy => {
            const item = document.createElement('div');
            item.className = 'fallacy-item';
            
            const severityColor = fallacy.severity === 'high' ? '#ef4444' : fallacy.severity === 'medium' ? '#f59e0b' : '#64748b';
            let html = `<h5>${simplifyFlawName(fallacy.type || 'Fallacy')} <span style="color: ${severityColor}">(${fallacy.severity || 'medium'})</span></h5>`;
            html += `<p>${simplifyDescription(fallacy.description)}</p>`;
            
            // Display quote with citation if available and valid
            if (fallacy.quote && fallacy.quote.trim() && !fallacy.quote.toLowerCase().includes('no direct quote found') && !fallacy.quote.toLowerCase().includes('no quote')) {
                html += `<div class="quote-section">`;
                html += `<div class="quote-label">📄 Quote from Study:</div>`;
                html += `<div class="quote">"${fallacy.quote}"</div>`;
                if (fallacy.quoteLocation && fallacy.quoteLocation !== 'N/A') {
                    html += `<div class="quote-citation"><strong>Location:</strong> ${fallacy.quoteLocation}</div>`;
                }
                html += `</div>`;
            }
            
            // Display debunking if available
            if (fallacy.debunking) {
                html += `<div class="debunking-section">`;
                html += `<div class="debunking-label">🔍 Analysis:</div>`;
                html += `<div class="debunking">${simplifyDescription(fallacy.debunking)}</div>`;
                html += `</div>`;
            }
            
            if (fallacy.impact) {
                html += `<p class="impact-note"><strong>Impact:</strong> ${simplifyDescription(fallacy.impact)}</p>`;
            }
            
            item.innerHTML = html;
            container.appendChild(item);
        });
    }

    if (flawDetection.issues && flawDetection.issues.length > 0) {
        flawDetection.issues.forEach(issue => {
            const item = document.createElement('div');
            item.className = 'issue-item';
            
            let html = `<h5>${simplifyFlawName(issue.category || 'Issue')}</h5>`;
            html += `<p>${simplifyDescription(issue.description)}</p>`;
            
            // Display quote with citation if available and valid
            if (issue.quote && issue.quote.trim() && !issue.quote.toLowerCase().includes('no direct quote found') && !issue.quote.toLowerCase().includes('no quote')) {
                html += `<div class="quote-section">`;
                html += `<div class="quote-label">📄 Quote from Study:</div>`;
                html += `<div class="quote">"${issue.quote}"</div>`;
                if (issue.quoteLocation && issue.quoteLocation !== 'N/A') {
                    html += `<div class="quote-citation"><strong>Location:</strong> ${issue.quoteLocation}</div>`;
                }
                html += `</div>`;
            }
            
            // Display debunking if available
            if (issue.debunking) {
                html += `<div class="debunking-section">`;
                html += `<div class="debunking-label">🔍 Analysis:</div>`;
                html += `<div class="debunking">${simplifyDescription(issue.debunking)}</div>`;
                html += `</div>`;
            }
            
            item.innerHTML = html;
            container.appendChild(item);
        });
    }

    if (container.innerHTML === '') {
        container.innerHTML = '<p>No major issues or fallacies detected.</p>';
    }
}

function renderEvidenceHierarchy(hierarchy) {
    const section = document.getElementById('evidence-hierarchy');
    const container = document.getElementById('hierarchy-info');
    if (!section || !container) return;
    
    const hierarchyLabels = {
        systematic_review: 'Systematic Review/Meta-analysis',
        rct: 'Randomized Controlled Trial',
        cohort: 'Cohort Study',
        case_control: 'Case-Control Study',
        case_series: 'Case Series/Report',
        expert_opinion: 'Expert Opinion/Editorial'
    };
    
    const qualityLabels = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };
    
    const levelName = hierarchyLabels[hierarchy.level] || hierarchy.level;
    const quality = qualityLabels[hierarchy.qualityWithinLevel] || hierarchy.qualityWithinLevel;
    
    let html = `<div class="hierarchy-card">`;
    html += `<h4>${levelName}</h4>`;
    html += `<p><strong>Hierarchy Position:</strong> ${hierarchy.position}/6 (1 = strongest evidence)</p>`;
    html += `<p><strong>Quality Within Level:</strong> ${quality}</p>`;
    html += `</div>`;
    
    container.innerHTML = html;
    section.style.display = 'block';
}

function renderValidityThreats(flawDetection) {
    const container = document.getElementById('validity-threats');
    if (!container) return;
    container.innerHTML = '';
    
    let hasContent = false;
    
    // Render confounders
    if (flawDetection.confounders && flawDetection.confounders.length > 0) {
        hasContent = true;
        const confoundersDiv = document.createElement('div');
        confoundersDiv.className = 'threats-section';
        confoundersDiv.innerHTML = '<h4>Identified Confounders</h4>';
        
        flawDetection.confounders.forEach(confounder => {
            const item = document.createElement('div');
            item.className = 'threat-item';
            
            let html = `<h5>${confounder.factor || 'Hidden Factor'}</h5>`;
            html += `<p>${simplifyDescription(confounder.description || '')}</p>`;
            
            // Display quote with citation if available and valid
            if (confounder.quote && confounder.quote.trim() && !confounder.quote.toLowerCase().includes('no direct quote found') && !confounder.quote.toLowerCase().includes('no quote')) {
                html += `<div class="quote-section">`;
                html += `<div class="quote-label">📄 Quote from Study:</div>`;
                html += `<div class="quote">"${confounder.quote}"</div>`;
                if (confounder.quoteLocation && confounder.quoteLocation !== 'N/A') {
                    html += `<div class="quote-citation"><strong>Location:</strong> ${confounder.quoteLocation}</div>`;
                }
                html += `</div>`;
            }
            
            // Display debunking if available
            if (confounder.debunking) {
                html += `<div class="debunking-section">`;
                html += `<div class="debunking-label">🔍 Analysis:</div>`;
                html += `<div class="debunking">${simplifyDescription(confounder.debunking)}</div>`;
                html += `</div>`;
            }
            
            html += `<p><strong>Why this matters:</strong> ${simplifyDescription(confounder.impact || 'Could affect the results')}</p>`;
            
            item.innerHTML = html;
            confoundersDiv.appendChild(item);
        });
        
        container.appendChild(confoundersDiv);
    }
    
    // Render validity threats
    if (flawDetection.validityThreats && flawDetection.validityThreats.length > 0) {
        hasContent = true;
        const threatsDiv = document.createElement('div');
        threatsDiv.className = 'threats-section';
        threatsDiv.innerHTML = '<h4>Validity Threats</h4>';
        
        flawDetection.validityThreats.forEach(threat => {
            const item = document.createElement('div');
            item.className = 'threat-item';
            const severityColor = threat.severity === 'high' ? '#ef4444' : threat.severity === 'medium' ? '#f59e0b' : '#64748b';
            
            let html = `<h5>${simplifyFlawName(threat.threat || 'Threat')} <span style="color: ${severityColor}">(${threat.severity || 'medium'})</span></h5>`;
            html += `<p>${simplifyDescription(threat.description || '')}</p>`;
            
            // Display quote with citation if available and valid
            if (threat.quote && threat.quote.trim() && !threat.quote.toLowerCase().includes('no direct quote found') && !threat.quote.toLowerCase().includes('no quote')) {
                html += `<div class="quote-section">`;
                html += `<div class="quote-label">📄 Quote from Study:</div>`;
                html += `<div class="quote">"${threat.quote}"</div>`;
                if (threat.quoteLocation && threat.quoteLocation !== 'N/A') {
                    html += `<div class="quote-citation"><strong>Location:</strong> ${threat.quoteLocation}</div>`;
                }
                html += `</div>`;
            }
            
            // Display debunking if available
            if (threat.debunking) {
                html += `<div class="debunking-section">`;
                html += `<div class="debunking-label">🔍 Analysis:</div>`;
                html += `<div class="debunking">${simplifyDescription(threat.debunking)}</div>`;
                html += `</div>`;
            }
            
            item.innerHTML = html;
            threatsDiv.appendChild(item);
        });
        
        container.appendChild(threatsDiv);
    }
    
    if (!hasContent) {
        container.innerHTML = '<p>No significant confounders or validity threats identified.</p>';
    }
}

function renderExpertContext(context) {
    const container = document.getElementById('expert-context');
    if (!container) return;
    let html = '';

    if (context.consensus) {
        html += `<p><strong>Field Consensus:</strong> ${context.consensus}</p>`;
    }

    if (context.controversies && context.controversies.length > 0) {
        html += `<p><strong>Controversies:</strong></p><ul>`;
        context.controversies.forEach(c => {
            html += `<li>${c}</li>`;
        });
        html += `</ul>`;
    }

    if (context.recentUpdates && context.recentUpdates.length > 0) {
        html += `<p><strong>Recent Updates:</strong></p><ul>`;
        context.recentUpdates.forEach(u => {
            html += `<li>${u}</li>`;
        });
        html += `</ul>`;
    }

    container.innerHTML = html || '<p>No expert context available.</p>';
}

function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    if (!container) return;
    container.innerHTML = '';

    if (recommendations && recommendations.length > 0) {
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            container.appendChild(li);
        });
    } else {
        container.innerHTML = '<li>No specific recommendations available.</li>';
    }
}

function renderMetadata(metadata) {
    const grid = document.getElementById('metadata-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const fields = [
        { key: 'title', label: 'Title' },
        { key: 'authors', label: 'Authors' },
        { key: 'journal', label: 'Journal' },
        { key: 'publicationDate', label: 'Publication Date' },
        { key: 'doi', label: 'DOI' },
        { key: 'studyType', label: 'Study Type' },
        { key: 'sampleSize', label: 'Sample Size' },
    ];

    fields.forEach(field => {
        let value = metadata[field.key];
        
        if (field.key === 'authors' && Array.isArray(value)) {
            value = value.join(', ');
        } else if (field.key === 'sampleSize' && typeof value === 'number') {
            value = value.toLocaleString();
        }
        
        if (value) {
            const item = document.createElement('div');
            item.className = 'metadata-item';
            
            // Add word count indicator for journal and long fields
            const wordCount = typeof value === 'string' ? value.split(/\s+/).filter(w => w.length > 0).length : 0;
            const isLong = (field.key === 'journal' && wordCount > 20) || (wordCount > 500);
            const summaryNote = isLong ? '<span class="summary-note" title="This field has been summarized">(Summarized)</span>' : '';
            
            item.innerHTML = `
                <label>${field.label} ${summaryNote}</label>
                <value>${value}</value>
            `;
            grid.appendChild(item);
        }
    });
}

export function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            if (!tabName) return;
            
            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
}

export function setupViewToggle() {
    const viewButtons = document.querySelectorAll('.view-button');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewName = button.dataset.view;
            if (!viewName) return;
            
            // Update buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content
            document.querySelectorAll('.view-content').forEach(content => {
                content.classList.remove('active');
            });
            const viewContent = document.getElementById(`${viewName}-view`);
            if (viewContent) {
                viewContent.classList.add('active');
            }
        });
    });
}

