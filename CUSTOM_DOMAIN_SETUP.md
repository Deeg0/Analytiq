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

### Navigation Path:

1. **In Netlify Dashboard**
   - You should see your site: `lively-torrone-986fc5`
   - In the left sidebar, look for these sections:
     - Project overview
     - Project configuration
     - Deploys
     - Preview Servers
     - Agent runs
     - Logs
     - Metrics
     - Web security
     - **Domain management** ← **Click here!**
     - Forms
     - Blobs

2. **Click "Domain management"**
   - This will open the domain settings page
   - You'll see your current domain: `lively-torrone-986fc5.netlify.app`

3. **Add Custom Domain**
   - Click the **"Add custom domain"** button (usually at the top right)
   - Enter your domain: `analytiq-app.com` (or `www.analytiq-app.com`)
   - Click **"Verify"** or **"Add domain"**

4. **Netlify Will Show DNS Instructions**
   - After adding the domain, Netlify will display specific DNS records you need to add
   - The instructions will show:
     - **For root domain (`analytiq-app.com`)**: 
       - **Type**: A records
       - **Name**: `@` (or leave blank)
       - **Value**: Netlify's IP addresses (usually 4 IPs)
     - **For www subdomain (`www.analytiq-app.com`)**:
       - **Type**: CNAME
       - **Name**: `www`
       - **Value**: `lively-torrone-986fc5.netlify.app`
   - **Copy these values** - you'll need them for your DNS provider

### How to Find DNS Records on the Domain Management Page

Once you're on the [Domain management page](https://app.netlify.com/projects/lively-torrone-986fc5/domain-management):

1. **After Adding Your Custom Domain:**
   - Look for your custom domain in the list (e.g., `analytiq-app.com`)
   - Click on the domain name or the **"Verify DNS configuration"** link
   - Netlify will show you a popup or section with the DNS records you need to add

2. **Where to Find DNS Instructions:**
   - **Option 1**: Click on your custom domain name in the list
   - **Option 2**: Look for a button/link that says "Verify DNS" or "DNS configuration"
   - **Option 3**: Check the status indicator next to your domain - if it says "DNS configuration needed", click it

3. **What You'll See:**
   - A section titled "DNS configuration" or "DNS records to add"
   - It will show:
     - **For root domain (`@` or blank)**:
       - Type: **A**
       - Value: Four IP addresses (e.g., `75.2.60.5`, `99.83.190.102`, etc.)
     - **For www subdomain**:
       - Type: **CNAME**
       - Name: `www`
       - Value: `lively-torrone-986fc5.netlify.app`

4. **Copy the Records:**
   - Write down or copy these values
   - You'll add them to your DNS provider (Namecheap) in the next step

5. **Important: About the "Add DNS records" Section**
   - You might see a section in Netlify that says "Add DNS records (optional)"
   - This section is **only if you're using Netlify's DNS service**
   - **If you're using Namecheap DNS** (most common), you can **ignore this section**
   - You'll add DNS records in Namecheap instead (see Step 3 below)

---

## Step 3: Choose Your DNS Provider

You have two options for managing DNS:

### Option A: Use Namecheap DNS (Recommended - Easier)

**If your domain is registered with Namecheap**, keep using Namecheap's DNS and add records there. Skip to "Step 3A: Update DNS in Namecheap" below.

### Option B: Use Netlify DNS (Advanced)

**If you want Netlify to manage all DNS**, you would:
1. Change your nameservers in Namecheap to point to Netlify's nameservers
2. Then add DNS records in Netlify's "Add DNS records" section
3. This is more complex and usually not necessary

**Recommendation**: Use Option A (Namecheap DNS) unless you have a specific reason to use Netlify DNS.

---

## Step 3A: Update DNS in Namecheap (Recommended)

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
   - **Value**: `lively-torrone-986fc5.netlify.app`
   - Click Save ✓

---

## Step 3B: Using Netlify DNS (Alternative - Not Recommended)

**Only use this if you want Netlify to manage all your DNS records.**

If you choose to use Netlify DNS:

1. **Change Nameservers in Namecheap**
   - In Namecheap: Domain List → Manage → Advanced DNS
   - Change nameservers from "Namecheap BasicDNS" to "Custom DNS"
   - Enter Netlify's nameservers (Netlify will provide these)
   - Wait 24-48 hours for nameserver changes to propagate

2. **Add DNS Records in Netlify**
   - In Netlify: Domain management → DNS records section
   - Click "Add new record"
   - Add the records Netlify specified when you added the domain
   - Netlify will automatically add the necessary A/CNAME records for your site

**Note**: This is more complex and usually unnecessary. Most users should stick with Namecheap DNS (Step 3A).

---

## Step 4: Wait for DNS Propagation

### What "Netlify DNS propagating..." Means

When you see **"Netlify DNS propagating..."** in your domain management page, it means:
- ✅ Your domain has been added to Netlify
- ✅ DNS records have been configured
- ⏳ Netlify is waiting for DNS changes to propagate across the internet

### How Long to Wait

**Typical wait times:**
- **Minimum**: 15 minutes
- **Average**: 15-30 minutes
- **Maximum**: 24-48 hours (rare, usually only for nameserver changes)

**For DNS record changes (A/CNAME records):**
- Usually **15-30 minutes** is enough
- Can take up to 4-6 hours in some cases

### What Happens During Propagation

1. **DNS servers worldwide update** with your new records
2. **Netlify checks** if your domain points to their servers
3. **SSL certificate** is automatically provisioned once DNS is verified
4. **Status changes** from "propagating" to "Active" or "Ready"

### How to Check Status

1. **In Netlify Dashboard:**
   - Go to Domain management page
   - Watch the status next to your domain
   - It will change from "Netlify DNS propagating..." to "Active" or show a green checkmark

2. **Check DNS Propagation:**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain: `analytiq-app.com`
   - Check if it shows Netlify's IP addresses (for A records) or your Netlify site (for CNAME)

3. **Test Your Domain:**
   - Try visiting `https://analytiq-app.com` in your browser
   - If it loads your site, DNS has propagated!

### What to Do While Waiting

- ✅ **Nothing!** Just wait - DNS propagation happens automatically
- ✅ You can check back in 15-30 minutes
- ✅ Your site will still work on `lively-torrone-986fc5.netlify.app` during this time
- ❌ Don't change DNS records again - this can cause delays

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

