# Quick Deployment Guide - analytIQ

## Fastest Way to Deploy (Railway - ~10 minutes)

### Step 1: Push to GitHub
```bash
cd /Users/davidlomelin/Desktop/AItok
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/analytiq.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js

### Step 3: Configure
1. In Railway dashboard → Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

2. In Railway dashboard → Variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   ```

### Step 4: Deploy
- Railway automatically deploys
- Get your URL: `https://your-app.railway.app`
- Done! 🎉

---

## Alternative: Render (Free Tier)

1. Go to [render.com](https://render.com) → Sign up
2. "New" → "Web Service" → Connect GitHub
3. Configure:
   - **Root Directory:** `backend`
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
4. Add environment variables (same as Railway)
5. Deploy!

---

## What's Already Configured ✅

- ✅ API automatically detects local vs production
- ✅ Frontend served from backend (single deployment)
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Error handling in place
- ✅ Static file serving configured

---

## Environment Variables Needed

Only one required:
```
OPENAI_API_KEY=sk-...
```

Optional:
```
PORT=3000 (auto-set by hosting)
NODE_ENV=production (auto-set)
```

---

## Test Your Deployment

1. Visit your deployed URL
2. Test with a study URL or text
3. Check `/api/health` endpoint

---

## Next Steps

- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Configure analytics
- [ ] Review rate limits
- [ ] Monitor API costs

For detailed instructions, see `DEPLOYMENT.md`

