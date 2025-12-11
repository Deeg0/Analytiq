# Netlify Production Setup Guide

This guide will help you configure your `analytiq-app.com` site on Netlify to use the Railway backend.

## Step 1: Add Environment Variable in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your project: **lively-torrone-986fc5**
3. Go to **Site configuration** → **Environment variables** (or **Build & deploy** → **Environment**)
4. Click **Add variable**
5. Add the following variable:

   **Variable name:**
   ```
   NEXT_PUBLIC_BACKEND_URL
   ```

   **Value:**
   ```
   https://web-production-751a4.up.railway.app
   ```

6. Click **Save**

## Step 2: Verify Existing Environment Variables

Make sure you also have these variables set (they should already be there):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEXT_PUBLIC_SITE_URL` - Should be `https://analytiq-app.com`

## Step 3: Trigger a New Deploy

After adding the environment variable:

1. Go to **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete (usually 2-3 minutes)

## Step 4: Test Your Site

1. Visit `https://analytiq-app.com`
2. Try analyzing a study URL or text
3. Open browser DevTools → Network tab
4. You should see requests going to `web-production-751a4.up.railway.app/api/analyze`

## Troubleshooting

### CORS Errors
If you see CORS errors, verify:
- The backend CORS configuration includes `analytiq-app.com` ✅ (already configured)
- The `NEXT_PUBLIC_BACKEND_URL` is set correctly in Netlify

### 404 Errors
- Check that the Railway backend is running (visit `https://web-production-751a4.up.railway.app/api/health`)
- Verify the environment variable name is exactly `NEXT_PUBLIC_BACKEND_URL` (case-sensitive)

### Still Using Next.js API Routes
- Make sure you added `NEXT_PUBLIC_BACKEND_URL` (not just `BACKEND_URL`)
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Restart/redeploy after adding the variable

## Current Configuration

- **Frontend:** Netlify (`analytiq-app.com`)
- **Backend:** Railway (`web-production-751a4.up.railway.app`)
- **CORS:** ✅ Configured to allow `analytiq-app.com`

## Quick Checklist

- [ ] Added `NEXT_PUBLIC_BACKEND_URL` to Netlify environment variables
- [ ] Triggered a new deploy
- [ ] Tested the site at `https://analytiq-app.com`
- [ ] Verified requests are going to Railway backend (check Network tab)
