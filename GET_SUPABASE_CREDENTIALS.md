# How to Get Your Supabase Project URL and Anon Key

## Quick Guide

### Step 1: Go to Supabase Dashboard
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account

### Step 2: Select Your Project
- Click on your project from the dashboard (or create a new one if you haven't)

### Step 3: Open API Settings
1. Look at the **left sidebar**
2. Find and click the **⚙️ Settings** icon (gear icon)
3. Click **"API"** from the settings menu

### Step 4: Copy Your Credentials

You'll see two important values:

#### **Project URL**
- Located at the top in the **"Project URL"** section
- Format: `https://xxxxxxxxxxxxx.supabase.co`
- Click the **copy button** (📋) next to it

#### **anon public key**
- Scroll down to **"Project API keys"** section
- Find the row that says **"anon"** or **"public"**
- Click the **eye icon** (👁️) to reveal the key
- Click the **copy button** (📋) to copy it
- The key is long and starts with `eyJ...`

⚠️ **IMPORTANT**: 
- Use the **anon/public** key (safe to use in frontend)
- **DO NOT** use the **service_role** key (it's secret and should never be in frontend code!)

### Step 5: Add to Your Code

1. Open `frontend/public/js/auth.js`
2. Find these lines at the top:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

## Example

After copying, your `auth.js` should look like:

```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

## Troubleshooting

**Can't find the API settings?**
- Make sure you're logged in
- Make sure you've selected a project (not just on the dashboard)
- Look for the gear icon (⚙️) in the left sidebar

**Key is hidden?**
- Click the eye icon (👁️) to reveal it
- Some browsers may hide it - try clicking the icon again

**Not sure which key to use?**
- Always use the **anon** or **public** key
- It's safe to use in frontend code
- The service_role key should NEVER be in frontend code

**Still having trouble?**
- Check the Supabase documentation: https://supabase.com/docs/guides/api
- Make sure your project is fully created (wait a few minutes if you just created it)

