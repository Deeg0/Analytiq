# Setting Up analytiq-app.com for Frontend

This guide will help you configure `analytiq-app.com` to point to your Netlify frontend.

## Current Setup

- **Frontend**: Deploy to Netlify
- **Backend**: Railway (`sv4kj913.up.railway.app`)
- **Custom Domain**: `analytiq-app.com` → Netlify (Frontend)
- **API Proxy**: Netlify proxies `/api/*` requests to Railway backend

---

## Step 1: Deploy Frontend to Netlify

1. **Go to [netlify.com](https://netlify.com)**
   - Sign up/Log in with GitHub

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository

3. **Configure Build Settings**
   - **Publish directory**: `frontend/public`
   - **Build command**: (leave empty - it's a static site)
   - Click "Deploy site"

4. **Get Your Netlify URL**
   - You'll get a URL like: `https://random-name-12345.netlify.app`
   - Save this URL - you'll need it for DNS

---

## Step 2: Configure Custom Domain in Netlify

1. **In Netlify Dashboard**
   - Go to your site
   - Click **Site settings** → **Domain management**

2. **Add Custom Domain**
   - Click "Add custom domain"
   - Enter: `analytiq-app.com`
   - Click "Verify"

3. **Netlify Will Show DNS Instructions**
   - Netlify will tell you what DNS records to add
   - Usually it's:
     - **Type**: A or CNAME
     - **Name**: `@` (or blank)
     - **Value**: Netlify's IP or domain

---

## Step 3: Update DNS in Namecheap

### Remove Old Railway CNAME

1. **Go to Namecheap**
   - Log in to [namecheap.com](https://www.namecheap.com)
   - Go to Domain List → Manage `analytiq-app.com`
   - Open **Advanced DNS** tab

2. **Remove Railway CNAME**
   - Find the CNAME record pointing to `sv4kj913.up.railway.app`
   - Delete it (click the trash icon)

### Add Netlify DNS Records

1. **Add Netlify's DNS Record**
   - Click "Add New Record"
   - **Type**: A (or CNAME - follow Netlify's instructions)
   - **Host**: `@` (or leave blank)
   - **Value**: Use the value Netlify provides
     - Usually: Netlify's IP addresses (A record)
     - Or: `your-site.netlify.app` (CNAME)
   - **TTL**: Automatic
   - Click Save ✓

2. **Optional: Add www Subdomain**
   - If you want `www.analytiq-app.com`:
   - **Type**: CNAME
   - **Host**: `www`
   - **Value**: `your-site.netlify.app`
   - Click Save ✓

---

## Step 4: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours**
- Usually takes **15-30 minutes**
- Check status in Netlify dashboard

---

## Step 5: Verify Everything Works

1. **Test Frontend**
   - Visit: `https://analytiq-app.com`
   - Should show your analytIQ website

2. **Test API Proxy**
   - Visit: `https://analytiq-app.com/api/health`
   - Should return: `{"status":"ok","message":"analytIQ API is running"}`

3. **Test Full App**
   - Try analyzing a study on `https://analytiq-app.com`
   - Should work end-to-end

---

## Troubleshooting

### Domain Not Working

1. **Check DNS Propagation**
   - Use [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `analytiq-app.com`
   - Check if it points to Netlify

2. **Verify Netlify Configuration**
   - In Netlify: Site settings → Domain management
   - Make sure domain is verified and active

3. **Check SSL Certificate**
   - Netlify automatically provisions SSL
   - Wait a few minutes after DNS propagates

### API Not Working

1. **Check netlify.toml**
   - Make sure it proxies to: `https://sv4kj913.up.railway.app/api/:splat`

2. **Test Railway Backend Directly**
   - Visit: `https://sv4kj913.up.railway.app/api/health`
   - Should work

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check for CORS or network errors

---

## Final Architecture

```
analytiq-app.com (Namecheap DNS)
    ↓
Netlify (Frontend)
    ├── Serves static files from frontend/public
    └── Proxies /api/* → Railway backend
            ↓
    Railway Backend (sv4kj913.up.railway.app)
        └── Handles API requests
```

---

## Quick Checklist

- [ ] Frontend deployed to Netlify
- [ ] Custom domain added in Netlify (`analytiq-app.com`)
- [ ] Old Railway CNAME removed from Namecheap
- [ ] Netlify DNS records added to Namecheap
- [ ] DNS propagated (15-30 min wait)
- [ ] Frontend accessible at `https://analytiq-app.com`
- [ ] API proxy working: `https://analytiq-app.com/api/health`
- [ ] Full app tested and working

---

## Need Help?

- **Netlify Docs**: [docs.netlify.com/domains-https/custom-domains](https://docs.netlify.com/domains-https/custom-domains/)
- **Namecheap DNS**: Check their support docs for DNS configuration
- **Railway**: Your backend should keep working on `sv4kj913.up.railway.app`

