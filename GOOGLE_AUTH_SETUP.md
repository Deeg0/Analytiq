# How to Add Google Authentication to Supabase

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it (e.g., "AnalytIQ")
   - Click "Create"

3. **Enable Google+ API**
   - Go to **"APIs & Services"** → **"Library"**
   - Search for "Google+ API" or "People API"
   - Click on it and click **"Enable"**

4. **Create OAuth 2.0 Credentials**
   - Go to **"APIs & Services"** → **"Credentials"**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - If prompted, configure OAuth consent screen first:
     - Choose "External" (unless you have Google Workspace)
     - Fill in:
       - **App name**: AnalytIQ (or your app name)
       - **User support email**: Your email
       - **Developer contact**: Your email
     - Click "Save and Continue"
     - Add scopes (optional, click "Save and Continue")
     - Add test users (optional, click "Save and Continue")
     - Review and go back to dashboard

5. **Create OAuth Client ID**
   - Application type: **"Web application"**
   - Name: **"AnalytIQ Web Client"** (or any name)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-netlify-url.netlify.app` (your production URL)
     - `https://your-custom-domain.com` (if you have one)
   - **Authorized redirect URIs**:
     - `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
   - Click **"Create"**
   - **Copy your credentials**:
     - **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

## Step 2: Configure Google in Supabase

1. **Go to Supabase Dashboard**
   - Select your project
   - Click **"Authentication"** in left sidebar
   - Click **"Providers"** tab

2. **Enable Google Provider**
   - Find **"Google"** in the list
   - Toggle it to **"Enabled"**

3. **Add Google Credentials**
   - **Client ID (for Google OAuth)**: Paste your Google Client ID
   - **Client Secret (for Google OAuth)**: Paste your Google Client Secret
   - Click **"Save"**

## Step 3: Update Your Code

The code has been updated to support Google sign-in! Just refresh your browser.

## Step 4: Test Google Sign-In

1. Start your server: `cd backend && npm run dev`
2. Open `http://localhost:3000`
3. Click "Sign In" or "Sign Up"
4. Click the "Sign in with Google" button
5. Select your Google account
6. Authorize the app
7. You should be signed in!

## Troubleshooting

**"Redirect URI mismatch" error:**
- Make sure the redirect URI in Google Console matches exactly:
  - `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
- Check for typos or extra spaces

**"Invalid client" error:**
- Verify Client ID and Secret are correct in Supabase
- Make sure you copied the full values

**Google sign-in button not showing:**
- Check browser console for errors
- Make sure the code was updated correctly
- Refresh the page

**"Access blocked" error:**
- If your app is in testing mode, add your email as a test user in Google Console
- Go to OAuth consent screen → Test users → Add your email

## Important Notes

- **Development**: Works with `http://localhost:3000`
- **Production**: Add your production URL to Google Console authorized origins
- **Security**: Never commit your Client Secret to git
- **Testing**: Google may require app verification for production use

