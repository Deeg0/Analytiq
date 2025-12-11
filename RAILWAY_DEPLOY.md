# Deploy Backend to Railway

## Step-by-Step Guide

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account (recommended for easy repo connection)

### Step 2: Create New Project
1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub repositories
4. Select your repository: `Deeg0/Analytiq` (or your repo name)

### Step 3: Configure the Service
Railway should auto-detect Node.js, but you need to configure it for the backend:

1. In the Railway dashboard, click on your service
2. Go to **Settings** tab
3. Configure:
   - **Root Directory:** `backend` (important!)
   - **Build Command:** `npm install && npm run build` (or Railway will auto-detect)
   - **Start Command:** `npm start` (or Railway will auto-detect)

### Step 4: Set Environment Variables
1. In Railway dashboard, go to **Variables** tab
2. Add the following environment variables:

```
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3000
```

**Important:** Railway automatically sets `PORT`, but you can specify it if needed.

### Step 5: Deploy
1. Railway will automatically start building and deploying
2. You can watch the build logs in the **Deployments** tab
3. Once deployed, Railway will provide a URL like: `https://your-app-name.up.railway.app`

### Step 6: Update CORS Settings (if needed)
If your frontend is on a different domain, update the backend CORS settings:

1. In Railway dashboard → **Variables**, add:
```
FRONTEND_URL=https://your-frontend-domain.com
```

2. Or update `backend/src/server.ts` to allow your frontend domain

### Step 7: Test Your Deployment
1. Visit: `https://your-app-name.up.railway.app/api/health`
2. Should return: `{"status":"ok"}`
3. Test the analyze endpoint with a POST request

### Step 8: Get Your Backend URL
1. In Railway dashboard, go to **Settings** → **Networking**
2. Copy your **Public Domain** (e.g., `https://your-app-name.up.railway.app`)
3. Use this URL in your frontend to call the backend API

---

## Configuration Files Already Set Up ✅

Your project already has:
- ✅ `railway.json` - Railway configuration
- ✅ `nixpacks.toml` - Build configuration
- ✅ `Procfile` - Process configuration
- ✅ Backend is configured to use `PORT` environment variable
- ✅ CORS is configured for production

---

## Troubleshooting

### Build Fails
- Check that `Root Directory` is set to `backend`
- Verify `package.json` has correct build scripts
- Check build logs in Railway dashboard

### Service Won't Start
- Verify `PORT` environment variable is set (Railway sets this automatically)
- Check that `dist/server.js` exists after build
- Review logs in Railway dashboard

### CORS Errors
- Add your frontend URL to `FRONTEND_URL` environment variable
- Update CORS settings in `backend/src/server.ts`

### Environment Variables Not Working
- Make sure variables are set in Railway dashboard (not just `.env` file)
- Restart the service after adding variables

---

## Next Steps

1. **Custom Domain (Optional):**
   - Railway → Settings → Networking → Add Custom Domain

2. **Monitor Usage:**
   - Railway dashboard shows metrics and logs
   - Set up alerts if needed

3. **Update Frontend:**
   - Update your Next.js frontend to use the Railway backend URL
   - Update API calls to point to Railway domain

---

## Cost
- Railway offers a free tier with $5 credit/month
- After free tier: Pay-as-you-go pricing
- Backend API should be very affordable for moderate usage

---

## Alternative: If Railway Auto-Detection Doesn't Work

If Railway doesn't auto-detect correctly, you can manually configure:

1. **Service Type:** Web Service
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`

The configuration files (`railway.json`, `nixpacks.toml`, `Procfile`) should handle this automatically, but manual configuration is a backup option.
