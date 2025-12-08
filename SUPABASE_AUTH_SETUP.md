# Supabase Authentication Setup Guide

This guide will help you add login/signup functionality to AnalytIQ using Supabase.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Log in with GitHub
3. Click "New Project"
4. Fill in:
   - **Name**: `analytiq` (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

## Step 2: Get Your Supabase Credentials

### Detailed Steps:

1. **Log into Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Sign in to your account

2. **Select Your Project**
   - Click on your project name in the left sidebar (or from the project list)

3. **Navigate to API Settings**
   - In the left sidebar, click on the **gear icon** (⚙️) labeled **"Settings"**
   - Then click on **"API"** in the settings menu

4. **Find Your Credentials**
   You'll see a page with several sections. Look for:

   **Project URL:**
   - Located in the **"Project URL"** section at the top
   - Looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - Click the **copy icon** (📋) next to it to copy

   **anon public key:**
   - Located in the **"Project API keys"** section
   - Find the row labeled **"anon"** or **"public"**
   - The key starts with `eyJ...` (it's a long string)
   - Click the **eye icon** (👁️) to reveal it, then click the **copy icon** (📋) to copy
   - ⚠️ **Important**: Use the **anon/public** key, NOT the **service_role** key (service_role is secret!)

5. **Save Your Credentials**
   - Copy both values to a safe place
   - You'll paste them into `frontend/public/js/auth.js` in the next step

### Visual Guide:
```
Supabase Dashboard
├── [Your Project Name] ← Click this
│   ├── Table Editor
│   ├── Authentication
│   ├── Database
│   └── ⚙️ Settings ← Click here
│       ├── General
│       ├── API ← Click here
│       ├── Database
│       └── ...
│
API Settings Page Shows:
├── Project URL: https://xxxxx.supabase.co [📋 Copy]
└── Project API keys:
    ├── anon public: eyJhbGc... [👁️ Reveal] [📋 Copy] ← Use this one!
    └── service_role: [🔒 Secret - Don't use this!]
```

## Step 3: Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your frontend URL (e.g., `http://localhost:3000` for dev, or your Netlify URL)
   - **Redirect URLs**: Add your production URL
3. Enable **Email** authentication (enabled by default)
4. (Optional) Enable **Google**, **GitHub**, etc. for social login

## Step 4: Configure Supabase Credentials

1. Open `frontend/public/js/auth.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
   ```

## Step 5: Test Authentication

1. Start your server: `cd backend && npm run dev`
2. Open `http://localhost:3000` in your browser
3. Click the "Sign In" button in the top right
4. Try signing up with a new email
5. Check your email for the verification link (if email confirmation is enabled)
6. Sign in with your credentials

## Features Included

✅ **Sign Up** - Email/password registration
✅ **Sign In** - Email/password login
✅ **Sign Out** - Logout functionality
✅ **Session Management** - Automatic session persistence
✅ **Auth State** - UI updates based on login status
✅ **Error Handling** - User-friendly error messages
✅ **Mobile Responsive** - Works on all devices

## Optional: Protect API Routes

If you want to require authentication for API calls, you can:

1. **Frontend**: Check auth before making API calls
   ```javascript
   import { isAuthenticated } from './auth.js';
   
   if (!isAuthenticated()) {
       showAuthModal();
       return;
   }
   // Make API call
   ```

2. **Backend**: Verify Supabase JWT tokens (more advanced)

## Optional: Social Login

To add Google/GitHub login:

1. In Supabase dashboard: **Authentication** → **Providers**
2. Enable Google/GitHub
3. Add OAuth credentials
4. Update `auth.js` to add social login functions

## Troubleshooting

**"Supabase client not loaded" error:**
- Make sure the Supabase script is in `index.html`
- Check browser console for script loading errors

**"Invalid API key" error:**
- Verify your Supabase URL and anon key in `auth.js`
- Make sure there are no extra spaces or quotes

**Email not sending:**
- Check Supabase dashboard → Authentication → Settings
- Verify email templates are configured
- Check spam folder

**Session not persisting:**
- Check browser localStorage
- Verify Site URL in Supabase settings matches your domain

