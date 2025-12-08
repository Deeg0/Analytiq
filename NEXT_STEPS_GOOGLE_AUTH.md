# Next Steps After Enabling People API

## Step 1: Configure OAuth Consent Screen (First Time Only)

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Select your project

2. **Open OAuth Consent Screen**
   - Left sidebar → **"APIs & Services"** → **"OAuth consent screen"**

3. **Configure the Screen**
   - **User Type**: Choose **"External"** (unless you have Google Workspace)
   - Click **"CREATE"**

4. **Fill in App Information**
   - **App name**: `AnalytIQ` (or your app name)
   - **User support email**: Your email address
   - **App logo**: (Optional - can skip)
   - **App domain**: (Optional - can skip for now)
   - **Developer contact information**: Your email address
   - Click **"SAVE AND CONTINUE"**

5. **Scopes** (Optional)
   - Click **"SAVE AND CONTINUE"** (default scopes are fine)

6. **Test Users** (If app is in Testing mode)
   - Add your email address as a test user
   - Click **"SAVE AND CONTINUE"**

7. **Summary**
   - Review and click **"BACK TO DASHBOARD"**

## Step 2: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Left sidebar → **"APIs & Services"** → **"Credentials"**

2. **Create OAuth Client ID**
   - Click **"+ CREATE CREDENTIALS"** at the top
   - Select **"OAuth client ID"**

3. **Configure OAuth Client**
   - **Application type**: Select **"Web application"**
   - **Name**: `AnalytIQ Web Client` (or any name you like)

4. **Add Authorized JavaScript origins**
   Click **"+ ADD URI"** and add:
   - `http://localhost:3000` (for development)
   - Your production URL if you have one (e.g., `https://your-app.netlify.app`)

5. **Add Authorized redirect URIs**
   Click **"+ ADD URI"** and add:
   - `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
   - ⚠️ **IMPORTANT**: This must match EXACTLY (no trailing slashes, no typos)

6. **Create**
   - Click **"CREATE"**

7. **Copy Your Credentials**
   - A popup will show:
     - **Your Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
     - **Your Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)
   - **Copy both** - you'll need them for Supabase
   - ⚠️ **Note**: The Client Secret is only shown once! Save it securely.

## Step 3: Add Credentials to Supabase

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign in and select your project

2. **Open Authentication Settings**
   - Left sidebar → **"Authentication"**
   - Click **"Providers"** tab

3. **Enable Google**
   - Find **"Google"** in the provider list
   - Toggle it to **"Enabled"**

4. **Add Your Credentials**
   - **Client ID (for Google OAuth)**: Paste your Google Client ID
   - **Client Secret (for Google OAuth)**: Paste your Google Client Secret
   - Click **"Save"**

## Step 4: Test Google Sign-In

1. **Start Your Server** (if not running)
   ```bash
   cd backend
   npm run dev
   ```

2. **Open Your App**
   - Go to `http://localhost:3000`
   - Click **"Sign In"** or **"Sign Up"**

3. **Test Google Sign-In**
   - You should see a **"Sign in with Google"** button
   - Click it
   - Select your Google account
   - Authorize the app
   - You should be signed in!

## Troubleshooting

**"Redirect URI mismatch" error:**
- Double-check the redirect URI in Google Console matches exactly:
  - `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
- Make sure there are no extra spaces or typos

**"Access blocked" error:**
- If your app is in "Testing" mode, add your email as a test user
- Go to OAuth consent screen → Test users → Add your email

**Google button not showing:**
- Make sure you saved the credentials in Supabase
- Refresh your browser
- Check browser console for errors

**"Invalid client" error:**
- Verify Client ID and Secret are correct in Supabase
- Make sure you copied the full values (no truncation)

## Quick Checklist

- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized redirect URI added: `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
- [ ] Client ID and Secret copied
- [ ] Google provider enabled in Supabase
- [ ] Credentials added to Supabase
- [ ] Tested Google sign-in

## Important Notes

- **Redirect URI** must be EXACT: `https://iwsmducdsfjmgfgowaqx.supabase.co/auth/v1/callback`
- **Client Secret** is only shown once - save it!
- For production, add your production URL to authorized origins
- Test users are only needed if app is in "Testing" mode

