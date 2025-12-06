# Deployment Guide for analytIQ

This guide covers the steps to deploy analytIQ as a live website.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Hosting Options](#hosting-options)
3. [Deployment Steps](#deployment-steps)
4. [Domain Configuration](#domain-configuration)
5. [Environment Variables](#environment-variables)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

- [ ] Test the application locally
- [ ] Ensure all environment variables are configured
- [ ] Build the backend TypeScript code
- [ ] Test API endpoints
- [ ] Verify OpenAI API key has sufficient credits
- [ ] Review rate limiting settings
- [ ] Check CORS configuration
- [ ] Optimize frontend assets

---

## Hosting Options

### Option 1: Railway (Recommended for Full-Stack)
**Pros:** Easy deployment, automatic HTTPS, supports Node.js, free tier available
**Best for:** Quick deployment with minimal configuration

### Option 2: Render
**Pros:** Free tier, automatic SSL, easy setup
**Best for:** Budget-conscious deployments

### Option 3: Vercel (Frontend) + Railway/Render (Backend)
**Pros:** Excellent frontend hosting, great performance
**Best for:** Separating frontend and backend

### Option 4: AWS/Azure/GCP
**Pros:** Enterprise-grade, scalable, full control
**Best for:** Production applications with high traffic

### Option 5: DigitalOcean App Platform
**Pros:** Simple deployment, good pricing
**Best for:** Medium-scale applications

---

## Deployment Steps

### Method 1: Railway Deployment (Recommended)

#### Step 1: Prepare Your Repository
```bash
# Ensure your code is in a Git repository
cd /Users/davidlomelin/Desktop/AItok
git init
git add .
git commit -m "Initial commit"
```

#### Step 2: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/yourusername/analytiq.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Node.js

#### Step 4: Configure Environment Variables
In Railway dashboard:
- Go to your project → Variables
- Add:
  ```
  OPENAI_API_KEY=your_openai_api_key
  PORT=3000
  NODE_ENV=production
  ```

#### Step 5: Configure Build Settings
In Railway dashboard → Settings:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Watch Paths:** `backend/**`

#### Step 6: Set Up Static Files
Railway will serve your frontend automatically since your server.ts serves static files from `../../frontend/public`

---

### Method 2: Render Deployment

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

#### Step 2: Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name:** analytiq-backend
   - **Environment:** Node
   - **Root Directory:** backend
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

#### Step 3: Add Environment Variables
In Render dashboard → Environment:
```
OPENAI_API_KEY=your_key
PORT=3000
NODE_ENV=production
```

#### Step 4: Deploy
Click "Create Web Service" and Render will deploy automatically.

---

### Method 3: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** frontend/public
   - **Build Command:** (leave empty, static files)
   - **Output Directory:** (leave empty)

#### Backend on Railway:
Follow Method 1 steps above, but update frontend API calls to point to Railway backend URL.

Update `frontend/public/js/api.js`:
```javascript
const API_BASE_URL = 'https://your-railway-app.railway.app';
```

---

## Domain Configuration

### Option 1: Use Provided Domain
Most hosting services provide a free subdomain:
- Railway: `your-app.railway.app`
- Render: `your-app.onrender.com`
- Vercel: `your-app.vercel.app`

### Option 2: Custom Domain

#### Step 1: Purchase Domain
- Namecheap, Google Domains, Cloudflare, etc.

#### Step 2: Configure DNS
1. In your hosting provider (Railway/Render):
   - Add custom domain
   - Get DNS configuration instructions

2. In your domain registrar:
   - Add CNAME record pointing to hosting provider
   - Or add A record with IP address

#### Step 3: SSL Certificate
- Most providers (Railway, Render, Vercel) automatically provide SSL
- Wait for DNS propagation (can take up to 48 hours)

---

## Environment Variables

### Required Variables
```bash
OPENAI_API_KEY=sk-...          # Your OpenAI API key
PORT=3000                      # Server port (usually auto-set)
NODE_ENV=production            # Environment mode
```

### Optional Variables
```bash
CORS_ORIGIN=https://yourdomain.com  # Restrict CORS if needed
RATE_LIMIT_WINDOW_MS=900000         # Rate limit window (15 min default)
RATE_LIMIT_MAX_REQUESTS=10          # Max requests per window
```

### Security Best Practices
- ✅ Never commit `.env` files to Git
- ✅ Use environment variables in hosting platform
- ✅ Rotate API keys regularly
- ✅ Use different keys for development/production

---

## Security Considerations

### 1. API Key Protection
- Store OpenAI API key in environment variables only
- Never expose in client-side code
- Consider using a proxy service for additional security

### 2. Rate Limiting
Your app already has rate limiting. Verify settings in `backend/src/routes/analysis.ts`:
```typescript
// Current: 10 requests per 15 minutes
// Adjust based on your needs
```

### 3. CORS Configuration
Update `backend/src/server.ts` if needed:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Restrict in production
  credentials: true
}));
```

### 4. Input Validation
- Already implemented for file sizes (10MB limit)
- Consider adding more validation for URL inputs

### 5. Error Handling
- Don't expose sensitive error details to clients
- Log errors server-side only

---

## Performance Optimization

### 1. Frontend Optimization
```bash
# Optimize images
# Consider using WebP format for logo
# Compress CSS/JS if needed
```

### 2. Backend Optimization
- Consider adding caching for repeated analyses
- Implement request queuing for high traffic
- Use CDN for static assets (if using separate frontend hosting)

### 3. Database (Future Enhancement)
Consider adding:
- Redis for caching analysis results
- PostgreSQL for storing analysis history
- User accounts and saved analyses

---

## Monitoring & Maintenance

### 1. Set Up Monitoring
- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Error Tracking:** Sentry, LogRocket
- **Analytics:** Google Analytics, Plausible

### 2. Logging
- Set up proper logging (Winston, Pino)
- Monitor API usage and costs
- Track error rates

### 3. Regular Maintenance
- Monitor OpenAI API usage and costs
- Review and update dependencies
- Check for security vulnerabilities
- Monitor server resources

### 4. Backup Strategy
- Backup environment variables
- Version control all code
- Document deployment process

---

## Quick Start Commands

### Local Testing Before Deployment
```bash
# Backend
cd backend
npm install
npm run build
npm start

# Test API
curl http://localhost:3000/api/health
```

### Production Build
```bash
cd backend
npm install --production
npm run build
NODE_ENV=production npm start
```

---

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (needs v18+)
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

2. **API Not Responding**
   - Verify environment variables are set
   - Check OpenAI API key is valid
   - Review server logs

3. **CORS Errors**
   - Update CORS configuration
   - Verify frontend URL matches CORS origin

4. **Static Files Not Loading**
   - Verify path in server.ts is correct
   - Check file permissions
   - Ensure files are included in deployment

---

## Cost Estimation

### Free Tier Options:
- **Railway:** $5/month free credit
- **Render:** Free tier available
- **Vercel:** Free tier for frontend

### Paid Options:
- **OpenAI API:** Pay-per-use (~$0.01-0.10 per analysis)
- **Domain:** $10-15/year
- **Hosting:** $5-20/month depending on traffic

### Cost Optimization:
- Implement caching to reduce API calls
- Use rate limiting to control usage
- Monitor API usage regularly

---

## Next Steps After Deployment

1. ✅ Test all functionality on live site
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (if desired)
4. ✅ Set up analytics
5. ✅ Create backup/restore procedures
6. ✅ Document API endpoints
7. ✅ Plan for scaling if needed

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- OpenAI API Docs: https://platform.openai.com/docs

---

## Deployment Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Backend builds successfully
- [ ] API endpoints tested
- [ ] Frontend loads correctly
- [ ] SSL certificate active
- [ ] Custom domain configured (if using)
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Rate limiting tested
- [ ] Documentation updated

Good luck with your deployment! 🚀

