# Manim Video Generator - Modal Deployment

This directory contains the Modal serverless function for generating Manim videos in production.

## Setup

### 1. Install Modal CLI

```bash
pip install modal
```

### 2. Authenticate with Modal

```bash
modal token new
```

This will open a browser window to authenticate. Modal is free with $30/month in credits.

### 3. Create Secrets

Create a Modal secret with your environment variables:

```bash
modal secret create manim-secrets \
  OPENAI_API_KEY="your-openai-api-key" \
  SUPABASE_URL="your-supabase-url" \
  SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

Replace the values with your actual credentials from your `.env` file.

### 4. Deploy to Modal

```bash
cd backend/modal_app
modal deploy manim_generator.py
```

This will deploy the function to Modal's cloud. The first deployment takes a few minutes as it builds the container image with all dependencies.

### 5. Test the Deployment

You can test the deployed function:

```bash
modal run manim_generator.py --question "How do you find the slope of a line?"
```

Or test locally before deploying:

```bash
modal run manim_generator.py
```

## Usage

Once deployed, the backend will automatically use Modal for video generation in production. The Modal function will:

1. Accept a natural language math question
2. Use OpenAI to classify the question into category/topic
3. Generate Manim Python code using GPT-4
4. Execute Manim to render the video
5. Upload the video to Supabase Storage
6. Return the public video URL

## Cost

Modal provides $30/month in free credits. Each video costs approximately:
- 30-second video: ~$0.10-0.15
- 60-second video: ~$0.20-0.30

For "several videos per day" usage (5-10 per day), you'll stay within the free tier.

## Monitoring

View your Modal dashboard at: https://modal.com/apps

You can see:
- Function invocations
- Execution logs
- Cost breakdown
- Performance metrics

## Troubleshooting

### Function not found

Make sure you've deployed the function:
```bash
modal deploy manim_generator.py
```

### Secrets not found

Create the secrets:
```bash
modal secret create manim-secrets OPENAI_API_KEY=xxx SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Video generation fails

Check the Modal logs in the dashboard or run locally:
```bash
modal run manim_generator.py
```

## Development

To update the function:

1. Make changes to `manim_generator.py`
2. Deploy the updated version:
   ```bash
   modal deploy manim_generator.py
   ```

The deployment is automatic and takes ~30 seconds to update.

