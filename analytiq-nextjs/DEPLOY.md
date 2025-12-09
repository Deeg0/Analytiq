# Deploy Next.js App to Production

## Option 1: Vercel (Recommended - Easiest for Next.js)

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the Next.js directory**:
   ```bash
   cd analytiq-nextjs
   vercel
   ```
   
   Or use the web interface:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your repository
   - Set **Root Directory** to `analytiq-nextjs`
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
     OPENAI_API_KEY=your_openai_api_key
     NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
     ```
   - Click "Deploy"

3. **Update Supabase Redirect URLs**:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Redirect URLs"
   - Update "Site URL" to your Vercel URL

## Option 2: Netlify (Update Existing)

1. **Update netlify.toml** in the root directory:
   ```toml
   [build]
     command = "cd analytiq-nextjs && npm install && npm run build"
     publish = "analytiq-nextjs/.next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **In Netlify Dashboard**:
   - Go to Site Settings → Build & Deploy
   - Set **Base directory** to `analytiq-nextjs`
   - Set **Build command** to `npm install && npm run build`
   - Set **Publish directory** to `.next`
   - Add environment variables (same as Vercel)
   - Redeploy

## Option 3: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Set **Root Directory** to `analytiq-nextjs`
5. Add environment variables
6. Railway will auto-detect Next.js and deploy

## Environment Variables Required

Add these to your hosting platform:

```
NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## After Deployment

1. Update Supabase redirect URLs to include your new domain
2. Test authentication (sign in/sign up)
3. Test analysis functionality
4. Update any custom domain settings

