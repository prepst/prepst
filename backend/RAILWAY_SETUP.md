# Railway Setup for Manim Service

Railway is **free** ($5/month credit) and **fast** - perfect for running Manim with system dependencies.

## Quick Setup (5 minutes)

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (free)

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `prepst/prepst` repository
- Select the `backend` directory

### 3. Configure Environment Variables
In Railway dashboard, add these environment variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### 4. Deploy
- Railway will automatically detect `Dockerfile.manim` and deploy
- Wait ~5-10 minutes for first build (installing system dependencies)
- Get your Railway URL (e.g., `https://your-app.railway.app`)

### 5. Update Vercel Backend (Optional)
If you want to proxy manim requests from Vercel to Railway:

Add to your Vercel backend's environment variables:
```
MANIM_SERVICE_URL=https://your-app.railway.app
```

Then update `backend/app/api/manim.py` to forward requests to Railway instead of running locally.

## Cost
- **Free tier**: $5/month credit
- **Typical usage**: ~$2-5/month (depends on video generation volume)
- **If you exceed**: Railway will pause service (no charges)

## Why Railway?
✅ Free $5/month credit  
✅ Fast deploys (~2-5 minutes)  
✅ Docker support (can install system packages)  
✅ Auto-deploys on git push  
✅ Simple setup  
✅ Generous free tier

## Alternative: Fly.io
Also free and fast, but slightly more complex setup:
- Free: 3 shared VMs, 160GB/month
- Fast global deploys
- More configuration needed
