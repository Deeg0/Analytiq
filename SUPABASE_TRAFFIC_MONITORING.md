# How to Check Traffic & Usage in Supabase

## Quick Guide

### Step 1: Go to Your Supabase Dashboard
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: View Usage & Traffic

#### Option A: Project Overview (Quick Stats)
1. On your project dashboard (home page)
2. Look for the **"Usage"** or **"Project Usage"** section
3. You'll see:
   - **API Requests** - Number of API calls
   - **Database Size** - Storage used
   - **Bandwidth** - Data transferred
   - **Active Users** - Authentication usage

#### Option B: Detailed Usage Reports
1. In the left sidebar, click **⚙️ Settings**
2. Click **"Usage"** or **"Billing"**
3. Here you'll see:
   - **API Requests** (per day/month)
   - **Database Size**
   - **Storage** (file uploads)
   - **Bandwidth** (data transfer)
   - **Auth Users** (number of users)
   - **Realtime Connections**

#### Option C: Database Activity
1. Go to **"Database"** in the left sidebar
2. Click **"Logs"** or **"Activity"**
3. View:
   - Query logs
   - Slow queries
   - Connection activity

#### Option D: API Logs
1. Go to **⚙️ Settings** → **"Logs"** or **"API Logs"**
2. View:
   - API request logs
   - Response times
   - Error logs
   - Request details

## What You Can Monitor

### 1. **API Requests**
- Total requests per day/month
- Requests by endpoint
- Success vs error rates
- Response times

### 2. **Database Usage**
- Database size
- Number of queries
- Query performance
- Storage used

### 3. **Authentication**
- Number of users
- Sign-ups per day
- Active sessions
- Auth API calls

### 4. **Storage**
- File uploads
- Storage space used
- Bandwidth consumed

### 5. **Realtime**
- Active connections
- Messages sent/received

## Free Tier Limits

Supabase free tier typically includes:
- **500 MB Database** storage
- **1 GB File Storage**
- **2 GB Bandwidth** per month
- **50,000 Monthly Active Users**
- **Unlimited API requests** (with rate limiting)

## Monitoring Best Practices

1. **Check Daily**: Monitor usage regularly to avoid hitting limits
2. **Set Up Alerts**: Configure email alerts when approaching limits
3. **Review Logs**: Check error logs for issues
4. **Optimize Queries**: Review slow queries in database logs

## Where to Find Everything

```
Supabase Dashboard
├── Project Overview
│   └── Usage Widget (quick stats)
├── ⚙️ Settings
│   ├── Usage/Billing (detailed usage)
│   ├── API (API keys & logs)
│   └── Logs (activity logs)
├── Database
│   └── Logs (query logs)
└── Authentication
    └── Users (user count)
```

## Troubleshooting

**Can't find usage stats?**
- Make sure you're on the correct project
- Check if you're on the free tier (some stats may be limited)
- Try refreshing the page

**Need more detailed analytics?**
- Use Supabase's built-in analytics
- Consider upgrading to Pro plan for more detailed metrics
- Use third-party tools like PostHog or Mixpanel

## Quick Access URLs

- **Dashboard**: `https://supabase.com/dashboard/project/[your-project-id]`
- **Usage**: `https://supabase.com/dashboard/project/[your-project-id]/settings/usage`
- **Logs**: `https://supabase.com/dashboard/project/[your-project-id]/logs`

