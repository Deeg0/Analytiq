# Quick Start: Deploy to Netlify (5 Steps)

## Step 1: Deploy Backend to Railway (2 minutes)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. In Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In Variables tab, add:
   ```
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   ```
6. Copy your Railway URL: `https://your-app.railway.app`

---

## Step 2: Update netlify.toml

Edit `netlify.toml` and replace `YOUR_BACKEND_URL` with your Railway URL:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-app.railway.app/api/:splat"
```

---

## Step 3: Deploy Frontend to Netlify (2 minutes)

1. Go to [netlify.com](https://netlify.com) → Sign up with GitHub
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repository
4. Configure:
   - **Publish directory**: `frontend/public`
   - **Build command**: (leave empty)
5. Click "Deploy site"
6. Get your Netlify URL: `https://your-site.netlify.app`

---

## Step 4: Update Backend CORS (Optional)

If you get CORS errors, add your Netlify URL to backend environment variables:
- In Railway: Add `FRONTEND_URL=https://your-site.netlify.app`

Or update `backend/src/server.ts` CORS to allow all Netlify domains (already configured).

---

## Step 5: Test

1. Visit your Netlify URL
2. Try analyzing a study
3. Check browser console for errors
4. Done! 🎉

---

## That's It!

Your site is now live:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://your-app.railway.app`
- **AI**: Working through backend

For detailed instructions, see `NETLIFY_DEPLOYMENT.md`

