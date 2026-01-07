# Modal Deployment Guide for Manim Video Generation

This guide explains how to deploy the Manim video generation service to Modal for production use.

## Overview

The Manim video generation service uses **Modal** (https://modal.com) for serverless GPU compute. This allows:

- ✅ **No server management** - Modal handles all infrastructure
- ✅ **Cost-effective** - Pay only when generating videos ($30/month free credit)
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Real-time** - Videos ready in 30-60 seconds
- ✅ **Production-ready** - All admins can generate videos

## Prerequisites

1. **Modal Account** (free - $30/month credit)
   - Sign up at https://modal.com
   - No credit card required

2. **Environment Variables**
   - `OPENAI_API_KEY` - For GPT-4 code generation and TTS
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for storage upload)

## Step 1: Install Modal CLI

```bash
pip install modal
```

## Step 2: Authenticate with Modal

```bash
modal token new
```

This opens a browser window to authenticate. You'll be logged in automatically.

## Step 3: Create Modal Secrets

Modal uses secrets to securely store environment variables. Create a secret named `manim-secrets`:

```bash
modal secret create manim-secrets \
  OPENAI_API_KEY="sk-..." \
  SUPABASE_URL="https://xxx.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

**Where to find these values:**
- `OPENAI_API_KEY`: OpenAI dashboard → API Keys
- `SUPABASE_URL`: Supabase dashboard → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase dashboard → Project Settings → API → service_role key

## Step 4: Deploy to Modal

Navigate to the Modal app directory and deploy:

```bash
cd backend/modal_app
modal deploy manim_generator.py
```

**What happens:**
1. Modal builds a container image with Manim dependencies (~5-10 minutes first time)
2. The function is deployed to Modal's cloud
3. You'll get a confirmation message with the function name

**Expected output:**
```
✓ Created objects.
├── 🔨 Created mount /Users/you/backend/modal_app/manim_generator.py
├── 🔨 Created Stub 'manim-video-generator'
└── 🔨 Created function generate_video.
✓ App deployed!
```

## Step 5: Test the Deployment

Test that the function works:

```bash
modal run manim_generator.py --question "How do you find the slope of a line?"
```

This will:
1. Call the Modal function
2. Generate a video
3. Upload to Supabase Storage
4. Print the video URL

## Step 6: Backend Integration (Already Done)

The backend is already configured to use Modal when available. It will:

1. Check if Modal is installed (`pip install modal`)
2. Try to lookup the Modal function
3. Use Modal for video generation if found
4. Fall back to local generation if Modal is unavailable

**No additional configuration needed!**

## Step 7: Update Backend Dependencies

Install Modal in your backend environment:

```bash
cd backend
pip install modal
```

Or if using requirements.txt (already updated):

```bash
pip install -r requirements.txt
```

## Step 8: Restart Backend

Restart your FastAPI backend to pick up the Modal integration:

```bash
# If running locally
uvicorn app.main:app --reload

# If deployed (Vercel/Railway)
# Just push your changes - it will auto-deploy
```

## Verification

### Check Backend Logs

When the backend starts, you should see:

```
✅ Modal function found - using serverless generation
```

If Modal is not configured:

```
ℹ️  Modal not installed - using local generation
```

### Test Video Generation

1. Go to admin dashboard: `/admin/manim`
2. Enter a question: "How do you solve 2x + 5 = 15?"
3. Click "Generate Video"
4. Wait 30-60 seconds
5. Video should appear and be downloadable

### Check Modal Dashboard

Visit https://modal.com/apps to see:
- Function invocations
- Execution logs
- Cost breakdown (~$0.10-0.20 per video)
- Performance metrics

## Cost Breakdown

### Free Tier
- $30/month credit (resets monthly)
- Approximately 100-300 videos per month free
- No credit card required

### Pricing Beyond Free Tier
- ~$0.10-0.15 per 30-second video
- ~$0.20-0.30 per 60-second video
- Charged per second of compute time

### Example Usage
- **5 videos/day** = 150 videos/month = ~$15-30/month = **FREE** (within $30 credit)
- **10 videos/day** = 300 videos/month = ~$30-60/month = ~$30/month cost (after credit)

## Monitoring & Debugging

### View Function Logs

```bash
modal app logs manim-video-generator
```

Or visit the Modal dashboard: https://modal.com/apps

### Test Function Locally

```bash
cd backend/modal_app
modal run manim_generator.py
```

### Update Function

After making changes to `manim_generator.py`:

```bash
modal deploy manim_generator.py
```

Updates deploy in ~30 seconds.

## Troubleshooting

### Error: "Function not found"

**Solution:** Deploy the function first:
```bash
cd backend/modal_app
modal deploy manim_generator.py
```

### Error: "Secret not found: manim-secrets"

**Solution:** Create the secret:
```bash
modal secret create manim-secrets \
  OPENAI_API_KEY="xxx" \
  SUPABASE_URL="xxx" \
  SUPABASE_SERVICE_ROLE_KEY="xxx"
```

### Error: "Modal not installed"

**Solution:** Install Modal:
```bash
pip install modal
```

### Backend falls back to local generation

Check that:
1. Modal is installed: `pip list | grep modal`
2. Function is deployed: `modal app list` (should show `manim-video-generator`)
3. Backend logs show: `✅ Modal function found`

### Video generation times out

Check Modal dashboard for detailed error logs. Common issues:
- OpenAI API key invalid
- Supabase credentials incorrect
- Question too complex (adjust GPT prompt)

## Architecture Diagram

```
┌─────────────────┐
│ Admin Dashboard │
└────────┬────────┘
         │ POST /api/manim/generate
         ▼
┌─────────────────┐
│ FastAPI Backend │
└────────┬────────┘
         │ modal.Function.remote()
         ▼
┌─────────────────┐
│ Modal Serverless│  ← Runs in Modal's cloud
│  (GPU compute)  │
└────────┬────────┘
         │
         ├─→ OpenAI (GPT-4 + TTS)
         │
         ├─→ Manim (video rendering)
         │
         └─→ Supabase Storage (video upload)
                 │
                 ▼
         ┌───────────────┐
         │ Public Video  │
         │     URL       │
         └───────────────┘
```

## Development Workflow

1. **Local Development**
   - Backend uses local Manim generation
   - No Modal required
   - Install Manim dependencies locally

2. **Production Deployment**
   - Backend automatically uses Modal
   - No local Manim dependencies needed
   - Videos generated in Modal's cloud

## Security Notes

- ✅ Secrets stored securely in Modal
- ✅ Service role key only used server-side
- ✅ Videos uploaded to public Supabase bucket
- ✅ No user authentication required for video access (videos are public)

## Next Steps

After deployment, consider:

1. **Monitor usage** in Modal dashboard
2. **Set up alerts** for high costs (if exceeding free tier)
3. **Add caching** for frequently requested videos
4. **Track analytics** for video generation in admin dashboard

## Support

- **Modal Docs**: https://modal.com/docs
- **Modal Discord**: https://discord.gg/modal
- **Modal Support**: support@modal.com

