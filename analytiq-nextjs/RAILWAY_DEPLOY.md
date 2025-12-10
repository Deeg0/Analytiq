# Deploy AnalytIQ to Railway

Railway offers longer timeout limits (up to 5 minutes) compared to Vercel's free tier, making it perfect for AI-powered analysis.

## Step-by-Step Deployment

### 1. Prepare Your Repository
Make sure your code is pushed to GitHub:
```bash
cd /Users/davidlomelin/Desktop/AItok
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Authorize Railway to access your repositories

### 3. Create New Project
1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (`AItok` or `Analytiq`)
4. Railway will start detecting your project

### 4. Configure Project Settings
1. In your Railway project, go to **Settings**
2. Set **Root Directory** to: `analytiq-nextjs`
3. Railway should auto-detect Next.js, but verify:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 5. Add Environment Variables
Go to **Variables** tab and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://iwsmducdsfjmgfgowaqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hw4_ooYUkfkk79zX7hQRsw_Y_X2gVDt
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000
```

**Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key from `.env.local`

### 6. Deploy
1. Railway will automatically start building and deploying
2. Watch the build logs in the **Deployments** tab
3. Once deployed, Railway will provide a URL like: `https://your-app.up.railway.app`

### 7. Update Supabase Redirect URLs
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Railway URL to **Redirect URLs**:
   ```
   https://your-app.up.railway.app/auth/callback
   ```
5. Update **Site URL** to your Railway URL

### 8. Test Your Deployment
1. Visit your Railway URL
2. Test authentication (sign in/sign up)
3. Test analysis with a study URL or text
4. Check that analysis completes without timeout errors

## Railway Pricing

- **Free Trial**: $5 credit (enough for testing)
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

Railway charges based on:
- Compute time (when your app is running)
- Bandwidth
- Database usage (if you add one)

For a Next.js app with occasional AI analysis, expect **$5-15/month** on the Hobby plan.

## Advantages of Railway

✅ **Longer timeouts**: Up to 5 minutes (vs 10s on Vercel free tier)  
✅ **Better for AI workloads**: No strict function timeout limits  
✅ **Simple deployment**: Auto-detects Next.js  
✅ **GitHub integration**: Auto-deploys on push  
✅ **Environment variables**: Easy management in dashboard  

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure `analytiq-nextjs` is set as root directory
- Verify all dependencies are in `package.json`

### Timeout Still Happening
- Railway should handle 60+ second requests
- Check Railway logs for actual timeout errors
- Verify `maxDuration = 60` in `app/api/analyze/route.ts`

### Environment Variables Not Working
- Make sure variables are set in Railway dashboard (not just `.env.local`)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Authentication Issues
- Verify Supabase redirect URLs include Railway domain
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Test analysis functionality
3. ✅ Monitor usage and costs
4. ⬜ Set up custom domain (optional)
5. ⬜ Configure monitoring/alerts

## Need Help?

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs in dashboard for detailed error messages
