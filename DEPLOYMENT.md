# Deployment Guide - Secure Era

This guide walks you through deploying Secure Era to production using Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account
- Railway account ([railway.app](https://railway.app))
- Vercel account ([vercel.com](https://vercel.com))
- Git installed locally

## Part 1: Deploy Backend to Railway

### Step 1: Push Code to GitHub

```bash
cd c:\file\secure-era
git init
git add .
git commit -m "Initial commit - Secure Era"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/secure-era.git
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `secure-era` repository

### Step 3: Configure Railway

1. **Set Root Directory**:
   - Click on your service
   - Go to "Settings"
   - Set "Root Directory" to `server`

2. **Add Environment Variables**:
   - Go to "Variables" tab
   - Add the following:
     ```
     PORT=3000
     CORS_ORIGIN=http://localhost:5173
     ROOM_TIMEOUT_MS=3600000
     MAX_USERS_PER_ROOM=2
     ```
   - Note: We'll update `CORS_ORIGIN` later with the Vercel URL

3. **Deploy**:
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Copy your Railway app URL (e.g., `https://your-app.railway.app`)

### Step 4: Test Backend

```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "stats": {...}
}
```

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Add Environment Variables

1. Go to "Settings" → "Environment Variables"
2. Add the following:
   ```
   VITE_BACKEND_URL=wss://your-app.railway.app
   ```
   (Replace with your actual Railway URL, using `wss://` for WebSocket)

### Step 3: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Vercel app URL (e.g., `https://your-app.vercel.app`)

## Part 3: Update Backend CORS

### Step 1: Update Railway Environment Variables

1. Go back to Railway
2. Go to "Variables" tab
3. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
4. Railway will automatically redeploy

## Part 4: Verify Production Deployment

### Test End-to-End

1. Open your Vercel URL in a browser
2. Click "Send File"
3. Select a test file (< 5MB for initial test)
4. Copy the shareable link
5. Open the link in an incognito window
6. Verify:
   - ✅ Connection establishes
   - ✅ File transfers
   - ✅ Progress bar updates
   - ✅ File downloads successfully
   - ✅ File integrity (compare file hashes)

### Check Railway Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" → "View Logs"
4. Verify:
   - WebSocket connections
   - Room creation
   - Signaling messages
   - No errors

### Check Vercel Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" → Latest deployment → "Functions"
4. Check for any errors

## Part 5: Custom Domain (Optional)

### Vercel Custom Domain

1. Go to Vercel project settings
2. Go to "Domains"
3. Add your custom domain (e.g., `secureera.com`)
4. Follow DNS configuration instructions
5. Update Railway `CORS_ORIGIN` to your custom domain

### Railway Custom Domain

1. Go to Railway project settings
2. Go to "Settings" → "Domains"
3. Add your custom domain (e.g., `api.secureera.com`)
4. Follow DNS configuration instructions
5. Update Vercel `VITE_BACKEND_URL` to your custom domain

## Troubleshooting

### Backend Issues

**Problem**: Health check fails
- **Solution**: Check Railway logs, ensure PORT is set correctly

**Problem**: WebSocket connection fails
- **Solution**: Ensure you're using `wss://` (not `ws://`) in production

**Problem**: CORS errors
- **Solution**: Verify `CORS_ORIGIN` matches your Vercel URL exactly

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: Check `VITE_BACKEND_URL` is set correctly with `wss://`

**Problem**: Build fails
- **Solution**: Ensure all dependencies are in `package.json`, check Vercel build logs

**Problem**: 404 on refresh
- **Solution**: Verify `vercel.json` is present with correct rewrites

### WebRTC Issues

**Problem**: Connection fails between peers
- **Solution**: Check browser console for ICE candidate errors, may need TURN server

**Problem**: Transfer fails for large files
- **Solution**: Check browser memory limits, test with smaller files first

## Monitoring

### Railway Monitoring

- Go to "Metrics" tab to see:
  - CPU usage
  - Memory usage
  - Network traffic
  - Request count

### Vercel Analytics

- Go to "Analytics" tab to see:
  - Page views
  - Performance metrics
  - Error rates

## Cost Estimation

### Railway (Free Tier)
- $5 credit/month
- Sufficient for development and portfolio use
- Upgrade to Pro ($20/month) for production

### Vercel (Hobby Tier)
- Free for personal projects
- 100GB bandwidth/month
- Unlimited deployments

## Security Checklist

- ✅ HTTPS enabled (automatic on Vercel/Railway)
- ✅ CORS configured correctly
- ✅ Environment variables secured
- ✅ No sensitive data in code
- ✅ WebSocket using WSS (secure)
- ✅ Security headers in `vercel.json`

## Next Steps

1. **Add TURN Server**: For better NAT traversal
2. **Add Analytics**: Track usage (privacy-respecting)
3. **Add Rate Limiting**: Prevent abuse
4. **Add File Size Limits**: Prevent large file abuse
5. **Add Tests**: Unit and integration tests

## Support

If you encounter issues:
1. Check Railway logs
2. Check Vercel logs
3. Check browser console
4. Review this guide
5. Check GitHub issues

---

**🎉 Congratulations! Your app is now live in production!**
