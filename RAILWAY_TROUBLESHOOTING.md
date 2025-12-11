# Railway Backend Troubleshooting Guide

## Common Issues and Solutions

### 1. CORS Errors

**Symptoms:**
- `Access to fetch at 'https://web-production-751a4.up.railway.app/api/analyze' from origin 'https://analytiq-app.com' has been blocked by CORS policy`

**Solutions:**

#### A. Verify Railway Backend is Running
1. Check Railway dashboard: https://railway.app
2. Verify the service is deployed and running
3. Check logs for any errors

#### B. Test Backend Health Endpoint
```bash
curl https://web-production-751a4.up.railway.app/api/health
```

Expected response:
```json
{"status":"ok","message":"analytIQ API is running"}
```

#### C. Check Railway Environment Variables
In Railway dashboard, ensure these are set:
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically)
- `OPENAI_API_KEY=your_key_here`
- `FRONTEND_URL=https://analytiq-app.com` (optional but recommended)

#### D. Verify CORS Configuration
The backend should allow:
- `https://analytiq-app.com`
- `https://www.analytiq-app.com`
- Any domain containing `analytiq-app.com`

Check Railway logs for CORS debug messages:
```
CORS check - Origin: https://analytiq-app.com
CORS: Allowing analytiq-app.com domain
```

### 2. Frontend Configuration

**Check Frontend Environment Variables:**

In your frontend deployment (Vercel/Netlify), ensure:
- `NEXT_PUBLIC_BACKEND_URL=https://web-production-751a4.up.railway.app`

**If using Vercel:**
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_BACKEND_URL` with value `https://web-production-751a4.up.railway.app`
3. Redeploy

**If using Netlify:**
1. Go to Site Settings → Environment Variables
2. Add `NEXT_PUBLIC_BACKEND_URL` with value `https://web-production-751a4.up.railway.app`
3. Redeploy

### 3. Backend Not Responding

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click on your backend service
3. Check the "Logs" tab
4. Look for:
   - "Server is running on port XXXX"
   - Any error messages
   - CORS rejection messages

**Common Issues:**
- Missing `OPENAI_API_KEY` → Backend will fail on analysis requests
- Port not set correctly → Railway auto-sets PORT, but verify it's being used
- Build failures → Check Railway build logs

### 4. Testing the Backend Directly

**Test with curl:**

```bash
# Test health endpoint
curl https://web-production-751a4.up.railway.app/api/health

# Test analyze endpoint (will fail without auth, but tests CORS)
curl -X POST https://web-production-751a4.up.railway.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "Origin: https://analytiq-app.com" \
  -d '{"inputType":"text","content":"test"}'
```

**Check CORS headers:**
```bash
curl -I -X OPTIONS https://web-production-751a4.up.railway.app/api/analyze \
  -H "Origin: https://analytiq-app.com" \
  -H "Access-Control-Request-Method: POST"
```

Look for:
- `Access-Control-Allow-Origin: https://analytiq-app.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`

### 5. Redeploy Backend

If changes aren't working:

1. **Push latest code to git:**
   ```bash
   git push origin main
   ```

2. **Trigger Railway redeploy:**
   - Railway auto-deploys on git push
   - Or manually trigger in Railway dashboard: Service → Settings → Redeploy

3. **Verify deployment:**
   - Check Railway logs for successful build
   - Wait for deployment to complete
   - Test health endpoint again

### 6. Railway-Specific Issues

**Check Railway Service Status:**
- Service might be paused (check dashboard)
- Service might be out of credits (check billing)
- Service might need to be restarted

**Restart Service:**
1. Go to Railway dashboard
2. Click on your service
3. Click "Restart" button

### 7. Debug Steps

1. **Check Railway logs** for CORS messages
2. **Test backend directly** with curl
3. **Verify environment variables** are set correctly
4. **Check frontend console** for specific error messages
5. **Verify Railway URL** is correct (check Railway dashboard for actual URL)

### 8. Quick Fixes

**If CORS is still blocking:**
- Temporarily allow all origins in development (already in code if `NODE_ENV !== 'production'`)
- Check Railway logs to see what origin is being rejected
- Verify the exact origin string matches what's in `allowedOrigins`

**If backend is not responding:**
- Check Railway service is running
- Verify build completed successfully
- Check for runtime errors in logs
- Ensure `OPENAI_API_KEY` is set

## Still Not Working?

1. Check Railway logs for specific error messages
2. Test backend endpoints directly with curl
3. Verify all environment variables are set
4. Check if Railway service needs to be restarted
5. Verify the Railway URL hasn't changed
