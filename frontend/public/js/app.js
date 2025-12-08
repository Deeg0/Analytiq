import { analyzeUrl, analyzeText } from './api.js';
import { showLoading, hideLoading, showError, showResults, setupTabs, setupViewToggle } from './ui.js';
import { showAuthModal, switchAuthTab, handleSignIn, handleSignUp, hideAuthModal, isAuthenticated, signInWithGoogle } from './auth.js';

// Make auth functions available globally for onclick handlers
window.showAuthModal = showAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleSignIn = handleSignIn;
window.handleSignUp = handleSignUp;
window.hideAuthModal = hideAuthModal;

// Handle Google sign in
window.handleGoogleSignIn = async function() {
    const result = await signInWithGoogle();
    if (!result.success) {
        alert('Error signing in with Google: ' + result.error);
    }
    // Note: Google OAuth will redirect, so we don't need to handle success here
};

// Toggle password visibility
window.togglePassword = function(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('.password-toggle-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
        icon.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
        icon.setAttribute('aria-label', 'Show password');
    }
};

// Setup tabs and view toggles
setupTabs();
setupViewToggle();

window.analyzeUrl = async function() {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        showAuthModal();
        switchAuthTab('signin');
        return;
    }
    
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
    // Check if user is authenticated
    if (!isAuthenticated()) {
        showAuthModal();
        switchAuthTab('signin');
        return;
    }
    
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

