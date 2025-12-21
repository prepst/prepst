# Railway Setup for Manim Service

Railway is **free** ($5/month credit) and **fast** - perfect for running Manim with system dependencies.

## Quick Setup (5 minutes)

### 1. Create Railway Account

- Go to [railway.app](https://railway.app)
- Sign up with GitHub (free)

### 2. Create New Project

- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository (`prepst/prepst`)
- Railway will detect the repo

### 3. Configure Service Settings

- In Railway dashboard, click on your service
- Go to **Settings** → **Source**
- Set **Root Directory** to: `backend`
- Set **Dockerfile Path** to: `Dockerfile.manim`
- Or use the `railway.json` config (Railway should auto-detect it)

### 4. Configure Environment Variables

In Railway dashboard → **Variables**, add:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False
```

### 5. Deploy

- Railway will automatically build using `Dockerfile.manim`
- First build takes ~10-15 minutes (installing system dependencies)
- Get your Railway URL from the **Settings** → **Networking** tab
- Example: `https://your-app.up.railway.app`

### 6. Test the Deployment

Once deployed, test the health endpoint:

```bash
curl https://your-app.up.railway.app/health
```

Should return: `{"status": "healthy"}`

### 7. (Optional) Update Vercel to Proxy Manim Requests

If you want your Vercel backend to forward manim requests to Railway:

1. Add to Vercel environment variables:

   ```
   MANIM_SERVICE_URL=https://your-app.up.railway.app
   ```

2. Update `backend/app/api/manim.py` to forward requests to Railway when `MANIM_SERVICE_URL` is set

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
