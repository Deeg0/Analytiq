# Google OAuth Setup for Supabase

## Quick Setup (Recommended - No Google Cloud Console Needed)

Supabase handles Google OAuth configuration for you. You just need to enable it in the Supabase Dashboard:

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**
   - Click **Save**

3. **That's it!** 
   - Google OAuth should now work in your app
   - The "to continue to [supabase-domain]" message is normal - it's Google showing the redirect URL

## Why You See "to continue to euycbhhpixmbwdpzgpsp.supabase.co"

This message appears because:
- Supabase acts as the OAuth provider
- Google shows the redirect domain (your Supabase project URL) for security
- This is **normal and expected** - users will see this when signing in with Google

## Customizing the Message (Advanced - Requires Google Cloud Console)

If you want to customize this message, you need to:

1. **Create your own Google OAuth credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Configure OAuth consent screen:
     - User Type: External (for public apps) or Internal (for Google Workspace)
     - App name: Your app name (e.g., "AnalytIQ")
     - Authorized domains: Add your domain
   - Create OAuth client ID:
     - Application type: Web application
     - Authorized redirect URIs: Add your Supabase callback URL
       - Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

2. **Add credentials to Supabase:**
   - Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Enter your **Client ID** and **Client Secret**
   - Click **Save**

3. **Update OAuth Consent Screen:**
   - In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
   - Configure:
     - App name: "AnalytIQ" (or your preferred name)
     - User support email: Your email
     - Developer contact information: Your email
   - Add scopes if needed (email, profile are usually sufficient)
   - Add test users (if app is in testing mode)

## Troubleshooting

### Can't Access OAuth Consent Screen in Google Cloud Console?

If you're having trouble accessing the OAuth consent screen:

1. **Check your permissions:**
   - You need **Owner** or **Editor** role on the project
   - Go to **IAM & Admin** → **IAM** to check

2. **Try direct URL:**
   ```
   https://console.cloud.google.com/apis/credentials/consent?project=[YOUR_PROJECT_ID]
   ```

3. **Use a personal Google account** (if using a Workspace account)

4. **Clear browser cache** or use incognito mode

## Note

For most use cases, **you don't need to configure Google Cloud Console**. Supabase's default setup works perfectly fine. The redirect message is a security feature by Google and is expected behavior.

