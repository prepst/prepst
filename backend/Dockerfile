# Dockerfile for Railway deployment with Manim support
FROM python:3.12-slim

# Install system dependencies required for Manim
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-xlib-2.0-dev \
    libffi-dev \
    shared-mime-info \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements-manim.txt ./
RUN pip install --no-cache-dir -r requirements-manim.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-8000}

# Run the application (Railway sets PORT env var)
CMD uvicorn app.main_railway:app --host 0.0.0.0 --port ${PORT:-8000}
