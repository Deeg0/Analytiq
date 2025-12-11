# Production Setup Guide - analytiq-app.com

This guide will help you configure your production site `analytiq-app.com` to work with the Railway backend.

## ✅ Backend Status

Your Railway backend is running at:
```
https://web-production-751a4.up.railway.app
```

The backend CORS is already configured to allow requests from `analytiq-app.com`.

## 🔧 Frontend Configuration (Netlify)

### Step 1: Add Environment Variable in Netlify

1. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign in and select your site

2. **Navigate to Site Settings**
   - Click on your site → **Site settings** → **Environment variables**

3. **Add the Railway Backend URL**
   - Click **"Add a variable"**
   - **Key:** `NEXT_PUBLIC_BACKEND_URL`
   - **Value:** `https://web-production-751a4.up.railway.app`
   - **Scopes:** Select **"Production"** (and optionally "Deploy previews" and "Branch deploys")
   - Click **"Save"**

### Step 2: Verify Other Environment Variables

Make sure these are also set in Netlify (for production):

```
NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SITE_URL=https://analytiq-app.com
```

### Step 3: Trigger a New Deployment

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the deployment to complete

### Step 4: Test Your Site

1. Visit `https://analytiq-app.com`
2. Try analyzing a study URL or text
3. Open browser DevTools → Network tab
4. Verify requests are going to `web-production-751a4.up.railway.app`
5. Check Railway logs to confirm requests are being received

## 🔍 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Verify `analytiq-app.com` is in the backend CORS configuration (already done)
- Check that requests are going to the Railway backend URL
- Ensure the backend is running (check Railway dashboard)

### 404 Errors

If you see 404 errors:
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly in Netlify
- Check that the environment variable is set for "Production" scope
- Restart/redeploy the site after adding the variable

### Still Using Next.js API Routes

If requests are still going to `/api/analyze` instead of Railway:
- Check that `NEXT_PUBLIC_BACKEND_URL` is set in Netlify
- Verify the variable name is exactly `NEXT_PUBLIC_BACKEND_URL` (case-sensitive)
- Redeploy the site after adding the variable

## 📊 Verify It's Working

1. **Check Network Tab:**
   - Open DevTools → Network
   - Analyze a study
   - Look for requests to `web-production-751a4.up.railway.app/api/analyze`

2. **Check Railway Logs:**
   - Go to Railway dashboard → Your service → Logs
   - You should see incoming requests when analyzing studies

3. **Check Netlify Logs:**
   - Go to Netlify → Functions/Edge logs
   - Should see no errors related to `/api/analyze` (since it's now using Railway)

## 🎯 What Happens Now

- **Before:** Frontend → Next.js API route (`/api/analyze`) → Requires authentication
- **After:** Frontend → Railway backend (`web-production-751a4.up.railway.app/api/analyze`) → No auth required, rate-limited

## ✅ Success Checklist

- [ ] `NEXT_PUBLIC_BACKEND_URL` added to Netlify environment variables
- [ ] Site redeployed after adding the variable
- [ ] Tested analyzing a study on `analytiq-app.com`
- [ ] Verified requests go to Railway backend (Network tab)
- [ ] Confirmed Railway logs show incoming requests
- [ ] No CORS errors in browser console
