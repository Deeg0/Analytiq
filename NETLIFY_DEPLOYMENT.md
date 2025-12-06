# Deploying analytIQ to Netlify

This guide covers deploying your frontend to Netlify while keeping the AI backend working.

## Architecture Overview

Since Netlify is primarily for static sites, you'll need:
- **Frontend**: Deploy to Netlify (static files)
- **Backend**: Deploy to Railway, Render, or similar (Node.js API)

---

## Step 1: Deploy Backend First

### Option A: Railway (Recommended - Easiest)

1. **Push backend to GitHub** (if not already):
   ```bash
   cd /Users/davidlomelin/Desktop/AItok
   git init
   git add .
   git commit -m "Initial commit"
   # Create GitHub repo and push
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js

3. **Configure Railway**:
   - **Settings** → **Root Directory**: `backend`
   - **Settings** → **Build Command**: `npm install && npm run build`
   - **Settings** → **Start Command**: `npm start`

4. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add: `OPENAI_API_KEY=your_openai_api_key_here`
   - Add: `NODE_ENV=production`

5. **Get Backend URL**:
   - Railway provides: `https://your-app.railway.app`
   - Copy this URL - you'll need it for Netlify

### Option B: Render (Free Alternative)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `analytiq-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variable: `OPENAI_API_KEY`
7. Get your URL: `https://your-app.onrender.com`

---

## Step 2: Update Frontend API Configuration

Update the frontend to use your backend URL:

### Method 1: Environment Variable (Recommended)

1. **Create `netlify.toml` in project root**:
   ```toml
   [build]
     publish = "frontend/public"
     command = "echo 'No build needed'"

   [[redirects]]
     from = "/api/*"
     to = "https://your-backend-url.railway.app/api/:splat"
     status = 200
     force = true
   ```

2. **Update `frontend/public/js/api.js`**:
   ```javascript
   // Automatically detect API URL based on environment
   const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/api'
       : '/api'; // Use Netlify proxy in production
   ```

### Method 2: Direct Backend URL

Update `frontend/public/js/api.js`:
```javascript
// Production API URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.railway.app/api'; // Replace with your actual backend URL
```

---

## Step 3: Deploy Frontend to Netlify

### Option 1: Deploy via Netlify Dashboard

1. **Prepare your files**:
   ```bash
   cd /Users/davidlomelin/Desktop/AItok
   # Make sure your code is committed to Git
   git add .
   git commit -m "Ready for Netlify deployment"
   git push
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

3. **Configure Build Settings**:
   - **Base directory**: `frontend/public` (or leave empty if you set up redirects)
   - **Build command**: (leave empty - static files)
   - **Publish directory**: `frontend/public`
   - **OR** if using `netlify.toml`, set:
     - **Base directory**: (leave empty)
     - **Publish directory**: `frontend/public`

4. **Add Environment Variables** (if needed):
   - Go to **Site settings** → **Environment variables**
   - Add any frontend-specific variables

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your site
   - You'll get a URL like: `https://your-site.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Netlify**:
   ```bash
   cd /Users/davidlomelin/Desktop/AItok
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Set publish directory: `frontend/public`
   - Build command: (leave empty)

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

---

## Step 4: Configure CORS on Backend

Update your backend to allow requests from Netlify:

1. **Update `backend/src/server.ts`**:
   ```typescript
   // Update CORS configuration
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'https://your-site.netlify.app', // Add your Netlify URL
       /\.netlify\.app$/, // Allow all Netlify subdomains
     ],
     credentials: true
   }));
   ```

2. **Redeploy backend** (Railway/Render will auto-deploy on git push)

---

## Step 5: Test Your Deployment

1. **Visit your Netlify URL**: `https://your-site.netlify.app`
2. **Test the analysis**:
   - Try analyzing a study URL
   - Check browser console for errors
   - Verify API calls are working

3. **Check Network Tab**:
   - Open browser DevTools → Network
   - Look for API calls to `/api/analyze`
   - Verify they're going to your backend

---

## Step 6: Custom Domain (Optional)

1. **In Netlify Dashboard**:
   - Go to **Site settings** → **Domain management**
   - Click "Add custom domain"
   - Enter your domain

2. **Configure DNS**:
   - Add CNAME record pointing to your Netlify site
   - Netlify provides SSL automatically

3. **Update Backend CORS**:
   - Add your custom domain to CORS origins

---

## Troubleshooting

### Issue: CORS Errors

**Solution**: Update backend CORS to include your Netlify URL:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-site.netlify.app',
    'https://your-custom-domain.com',
  ],
  credentials: true
}));
```

### Issue: API Calls Failing

**Solution**: 
1. Check browser console for errors
2. Verify backend URL is correct in `api.js`
3. Check backend logs (Railway/Render dashboard)
4. Verify `OPENAI_API_KEY` is set in backend

### Issue: 404 on API Routes

**Solution**: 
- If using Netlify redirects, ensure `netlify.toml` is correct
- Or use direct backend URL in `api.js`

### Issue: Environment Variables Not Working

**Solution**:
- Backend env vars: Set in Railway/Render dashboard
- Frontend env vars: Set in Netlify dashboard (if needed)

---

## File Structure for Netlify

Your project should look like this:
```
AItok/
├── backend/          # Deployed separately (Railway/Render)
├── frontend/
│   └── public/       # Deployed to Netlify
├── netlify.toml      # Netlify configuration (optional)
└── .gitignore
```

---

## Quick Deployment Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL obtained
- [ ] Frontend `api.js` updated with backend URL
- [ ] Backend CORS updated to allow Netlify domain
- [ ] `netlify.toml` created (if using redirects)
- [ ] Code pushed to GitHub
- [ ] Netlify site created and connected to GitHub
- [ ] Build settings configured
- [ ] Site deployed and tested
- [ ] Custom domain configured (optional)

---

## Cost Estimate

- **Netlify**: Free tier (100GB bandwidth, 300 build minutes/month)
- **Railway**: $5/month free credit
- **Render**: Free tier available
- **OpenAI API**: Pay-per-use (~$0.01-0.10 per analysis)

---

## Alternative: All-in-One Netlify (Advanced)

If you want everything on Netlify, you'd need to:
1. Convert backend to Netlify Functions (serverless)
2. This requires significant refactoring
3. Not recommended for this use case

**Recommendation**: Keep backend on Railway/Render and frontend on Netlify.

---

## Support

- Netlify Docs: https://docs.netlify.com
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

Good luck with your deployment! 🚀

