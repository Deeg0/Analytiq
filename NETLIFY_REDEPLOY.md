# How to Redeploy on Netlify

Your frontend is deployed on Netlify at `analytiq-app.com`. Here's how to trigger a redeploy to see your latest changes:

## Option 1: Trigger Redeploy from Netlify Dashboard (Easiest)

1. **Go to Netlify Dashboard:**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Sign in to your account

2. **Find Your Site:**
   - Look for the site with domain `analytiq-app.com`
   - Click on it

3. **Trigger Redeploy:**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** button (top right)
   - Select **"Deploy site"**
   - Netlify will rebuild and redeploy your site

4. **Wait for Deployment:**
   - Watch the build logs
   - Wait for "Published" status
   - Usually takes 2-5 minutes

## Option 2: Push an Empty Commit (If Auto-Deploy is Enabled)

If Netlify is connected to GitHub and auto-deploy is enabled, you can trigger a redeploy by pushing an empty commit:

```bash
cd /Users/davidlomelin/Desktop/AItok
git commit --allow-empty -m "Trigger Netlify redeploy"
git push origin main
```

## Option 3: Check Netlify Configuration

1. **Verify GitHub Connection:**
   - Netlify Dashboard → Site Settings → Build & Deploy
   - Check "Continuous Deployment" is enabled
   - Verify it's connected to your GitHub repo

2. **Check Build Settings:**
   - **Base directory:** Should be `analytiq-nextjs` (or empty if repo root)
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `.next`

3. **Verify Environment Variables:**
   - Site Settings → Environment Variables
   - Ensure all required variables are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_SITE_URL`
     - `NEXT_PUBLIC_BACKEND_URL` (optional)

## Option 4: Clear Cache and Redeploy

If changes still don't appear:

1. **Clear Build Cache:**
   - Netlify Dashboard → Deploys
   - Click "Trigger deploy" → "Clear cache and deploy site"

2. **Or use Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --build
   ```

## Troubleshooting

### Changes Still Not Showing?

1. **Hard Refresh Browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache

2. **Check Deployment Status:**
   - Netlify Dashboard → Deploys tab
   - Look for latest deployment
   - Check if it succeeded or failed
   - Review build logs for errors

3. **Verify Git Push:**
   ```bash
   git log --oneline -5
   ```
   - Confirm your latest commits are there
   - Check if Netlify detected the push

4. **Check Build Logs:**
   - Netlify Dashboard → Deploys → Click on latest deploy
   - Look for errors or warnings
   - Common issues:
     - Missing environment variables
     - Build failures
     - TypeScript errors

### Common Issues

**Build Failing:**
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible

**Environment Variables Missing:**
- Add them in Netlify Dashboard → Site Settings → Environment Variables
- Redeploy after adding

**Old Version Still Showing:**
- Clear browser cache
- Try incognito/private window
- Check if deployment actually completed

## Quick Checklist

- [ ] Latest code pushed to GitHub
- [ ] Netlify deployment triggered (manually or auto)
- [ ] Build completed successfully
- [ ] Browser cache cleared
- [ ] Checked in incognito window

## Still Not Working?

1. Check Netlify build logs for errors
2. Verify environment variables are set correctly
3. Ensure the correct branch is being deployed (usually `main`)
4. Check if there are any build warnings that might affect the deployment
