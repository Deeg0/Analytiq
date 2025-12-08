// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://iwsmducdsfjmgfgowaqx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt'; // Your publishable key (safe for frontend)

// Initialize Supabase client
let supabase;
if (typeof window.supabase !== 'undefined') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.error('Supabase client not loaded. Make sure the script is included in index.html');
}

// Auth state
let currentUser = null;

// Initialize auth state on page load
export async function initAuth() {
    if (!supabase) return;
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
        
        if (event === 'SIGNED_IN') {
            hideAuthModal();
        } else if (event === 'SIGNED_OUT') {
            // Redirect or update UI as needed
        }
    });
}

// Sign up with email
export async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with email
export async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
export async function signOut() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
export function isAuthenticated() {
    return currentUser !== null;
}

// Update UI based on auth state
function updateAuthUI() {
    const authButton = document.getElementById('auth-button');
    const signupButton = document.getElementById('signup-button');
    const userInfo = document.getElementById('user-info');
    const authModal = document.getElementById('auth-modal');
    
    if (currentUser) {
        // User is logged in
        if (authButton) {
            authButton.textContent = 'Sign Out';
            authButton.onclick = handleSignOut;
        }
        if (signupButton) {
            signupButton.style.display = 'none';
        }
        if (userInfo) {
            userInfo.textContent = currentUser.email || 'User';
            userInfo.style.display = 'block';
        }
    } else {
        // User is not logged in
        if (authButton) {
            authButton.textContent = 'Sign In';
            authButton.onclick = () => {
                showAuthModal();
                switchAuthTab('signin');
            };
        }
        if (signupButton) {
            signupButton.style.display = 'inline-block';
            signupButton.onclick = () => {
                showAuthModal();
                switchAuthTab('signup');
            };
        }
        if (userInfo) {
            userInfo.style.display = 'none';
        }
    }
}

// Show auth modal
export function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Show sign in tab by default
        switchAuthTab('signin');
    }
}

// Hide auth modal
export function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Switch between sign in and sign up tabs
export function switchAuthTab(tab) {
    const signInTab = document.getElementById('signin-tab');
    const signUpTab = document.getElementById('signup-tab');
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    
    // Remove active class from both tabs first
    signInTab?.classList.remove('active');
    signUpTab?.classList.remove('active');
    
    if (tab === 'signin') {
        signInTab?.classList.add('active');
        signInForm?.classList.remove('hidden');
        signUpForm?.classList.add('hidden');
    } else if (tab === 'signup') {
        signUpTab?.classList.add('active');
        signUpForm?.classList.remove('hidden');
        signInForm?.classList.add('hidden');
    }
}

// Handle sign out with confirmation
async function handleSignOut() {
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) {
        return;
    }
    
    const result = await signOut();
    if (result.success) {
        updateAuthUI();
    } else {
        alert('Error signing out: ' + result.error);
    }
}

// Handle sign up form submission
export async function handleSignUp(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form['confirm-password']?.value;
    
    // Validation
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing up...';
    
    const result = await signUp(email, password);
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        showAuthSuccess('Sign up successful! Please check your email to verify your account.');
        // Switch to sign in after successful sign up
        setTimeout(() => {
            switchAuthTab('signin');
            form.reset();
        }, 2000);
    } else {
        showAuthError(result.error || 'Failed to sign up');
    }
}

// Handle sign in form submission
export async function handleSignIn(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    const result = await signIn(email, password);
    
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    if (result.success) {
        showAuthSuccess('Signed in successfully!');
        hideAuthModal();
        form.reset();
    } else {
        showAuthError(result.error || 'Failed to sign in');
    }
}

// Show auth error message
function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        errorDiv.classList.add('error');
        errorDiv.classList.remove('success');
    }
}

// Show auth success message
function showAuthSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        errorDiv.classList.add('success');
        errorDiv.classList.remove('error');
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

