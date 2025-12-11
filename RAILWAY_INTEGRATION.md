# Railway Backend Integration Guide

Your backend is now successfully deployed on Railway! Here's how to connect your Next.js frontend to it.

## Backend URL
Your Railway backend is available at:
```
https://web-production-751a4.up.railway.app
```

## Frontend Configuration

### Option 1: Use Railway Backend (Recommended for Production)

1. **Add the backend URL to your frontend environment variables:**

   Edit `analytiq-nextjs/.env.local` and add:
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://web-production-751a4.up.railway.app
   ```

2. **Restart your Next.js dev server:**
   ```bash
   cd analytiq-nextjs
   npm run dev
   ```

3. **For production (Vercel/Netlify):**
   - Add `NEXT_PUBLIC_BACKEND_URL=https://web-production-751a4.up.railway.app` to your deployment platform's environment variables

### Option 2: Keep Using Next.js API Routes (Current Setup)

If you don't set `NEXT_PUBLIC_BACKEND_URL`, the frontend will continue using the Next.js API routes (`/api/analyze`) as before.

## How It Works

- **If `NEXT_PUBLIC_BACKEND_URL` is set:** Frontend calls Railway backend directly
- **If `NEXT_PUBLIC_BACKEND_URL` is NOT set:** Frontend uses Next.js API routes (requires authentication)

## Testing

1. Start your Next.js dev server
2. Try analyzing a study URL or text
3. Check the browser Network tab to see which endpoint is being called
4. Check Railway logs to see requests coming in

## Benefits of Using Railway Backend

- ✅ Dedicated backend server (better for scaling)
- ✅ No authentication required (simpler for public use)
- ✅ Rate limiting already configured
- ✅ Separate from frontend deployment

## Troubleshooting

- **CORS errors:** Make sure your frontend domain is allowed in `backend/src/server.ts` CORS configuration
- **404 errors:** Verify the Railway backend URL is correct
- **Connection errors:** Check Railway dashboard to ensure the service is running
