# Deploy Next.js App - Quick Guide

Your website is still showing the old frontend because Netlify is deploying the old `frontend/public` directory. You need to deploy the new Next.js app.

## Quick Fix: Update Netlify Settings

1. **Go to your Netlify Dashboard** → Your Site → Site Settings → Build & Deploy

2. **Update Build Settings**:
   - **Base directory**: `analytiq-nextjs`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.next`

3. **Install Netlify Next.js Plugin**:
   - Go to Site Settings → Plugins
   - Click "Add plugin"
   - Search for "@netlify/plugin-nextjs"
   - Install it

4. **Add Environment Variables** (Site Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SITE_URL=https://your-netlify-domain.netlify.app
   ```

5. **Trigger a New Deploy**:
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## Alternative: Use Vercel (Easier for Next.js)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Set **Root Directory** to `analytiq-nextjs`
6. Add environment variables (same as above)
7. Click "Deploy"

Vercel is optimized for Next.js and will auto-detect everything!

## After Deployment

1. **Update Supabase Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your new domain to "Redirect URLs"
   - Update "Site URL" to your new domain

2. **Test the site** - The "Sign In Required" box should be gone!

