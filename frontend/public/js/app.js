import { analyzeUrl, analyzeText } from './api.js';
import { showLoading, hideLoading, showError, showResults, setupTabs, setupViewToggle } from './ui.js';

// Setup tabs and view toggles
setupTabs();
setupViewToggle();

window.analyzeUrl = async function() {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    try {
        showLoading();
        const result = await analyzeUrl(url);
        showResults(result);
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to analyze URL');
    }
};

window.analyzeText = async function() {
    const textInput = document.getElementById('text-input');
    const text = textInput.value.trim();
    
    if (!text || text.length < 100) {
        alert('Please enter at least 100 characters of study text');
        return;
    }
    
    try {
        showLoading();
        const result = await analyzeText(text);
        showResults(result);
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to analyze text');
    }
};

