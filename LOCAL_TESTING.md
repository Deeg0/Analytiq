# Local Testing Guide

This guide will help you run and test the AnalytIQ application locally.

## Prerequisites

- **Node.js** v20 or higher
- **npm** v10 or higher
- **OpenAI API Key** (for AI analysis)
- **Supabase credentials** (for authentication)

## Step 1: Set Up Backend Environment Variables

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (if it doesn't exist):
   ```bash
   touch .env
   ```

3. Add the following environment variables to `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   FRONTEND_URL=http://localhost:3000
   NETLIFY_URL=http://localhost:3000
   ```

   **Important:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Step 2: Set Up Frontend Environment Variables

1. Navigate to the frontend directory:
   ```bash
   cd analytiq-nextjs
   ```

2. Check if `.env.local` exists (it should already exist):
   ```bash
   ls -la .env.local
   ```

3. Ensure `.env.local` contains:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   **Optional:** To use the Railway backend instead of Next.js API routes:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://web-production-751a4.up.railway.app
   ```

   **Note:** If `NEXT_PUBLIC_BACKEND_URL` is set, the frontend will use Railway backend. If not set, it will use Next.js API routes (requires authentication).

## Step 3: Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

### Frontend Dependencies
```bash
cd analytiq-nextjs
npm install
```

## Step 4: Start the Backend Server

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Start the backend in development mode:
   ```bash
   npm run dev
   ```

   The backend should start on **http://localhost:3001**

   You should see:
   ```
   Server is running on port 3001
   ```

3. Test the backend health endpoint:
   ```bash
   curl http://localhost:3001/api/health
   ```

   Expected response:
   ```json
   {"status":"ok","message":"analytIQ API is running"}
   ```

## Step 5: Start the Frontend Server

1. Open a **new terminal window** (keep the backend running)

2. Navigate to frontend directory:
   ```bash
   cd analytiq-nextjs
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

   The frontend should start on **http://localhost:3000**

   You should see:
   ```
   ▲ Next.js 16.0.8
   - Local:        http://localhost:3000
   ```

## Step 6: Test the Application

1. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

2. **Sign in** using Supabase authentication (you'll need to create an account if you don't have one)

3. **Test Analysis:**
   - Enter a study URL or paste study text
   - Click "Analyze Study"
   - Wait for the analysis to complete
   - Review the results

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Check the Console tab for any errors
   - Check the Network tab to see API requests

5. **Check Backend Logs:**
   - Look at the terminal where the backend is running
   - You should see request logs and any errors

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Missing dependencies:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
cd backend
npm run build
```

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Missing dependencies:**
```bash
cd analytiq-nextjs
rm -rf node_modules package-lock.json .next
npm install
```

**Build errors:**
```bash
cd analytiq-nextjs
npm run build
```

### Environment Variable Issues

- Make sure `.env` files are in the correct directories
- Check that all required variables are set
- Restart the servers after changing environment variables
- For Next.js, environment variables starting with `NEXT_PUBLIC_` are available client-side

### Authentication Issues

- Make sure Supabase credentials are correct
- Check that Supabase project is active
- Verify the Supabase URL and anon key in `.env.local`

### API Issues

- Check that OpenAI API key is valid
- Verify backend is running on port 3001
- Check CORS settings if using Railway backend
- Look at Network tab in browser DevTools for API errors

## Quick Start Commands

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd analytiq-nextjs
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Testing Different Configurations

### Option 1: Use Next.js API Routes (Default)
- Don't set `NEXT_PUBLIC_BACKEND_URL`
- Frontend calls `/api/analyze` (Next.js API route)
- Requires authentication

### Option 2: Use Railway Backend
- Set `NEXT_PUBLIC_BACKEND_URL=https://web-production-751a4.up.railway.app` in `.env.local`
- Frontend calls Railway backend directly
- No authentication required (handled by backend)

### Option 3: Use Local Backend
- Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001` in `.env.local`
- Frontend calls local backend
- Make sure backend CORS allows `localhost:3000`

## Next Steps

Once everything is running:
1. Test with different study URLs
2. Test with text input
3. Check the Bradford Hill Criteria assessment (for studies implying causation)
4. Verify all UI features work correctly
5. Check that results display properly
