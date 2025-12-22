# Dockerfile for Railway deployment with Manim support
FROM python:3.12-slim

# Install system dependencies required for Manim
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-dev \
    libffi-dev \
    shared-mime-info \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements file with manim dependencies
COPY requirements-manim.txt requirements.txt

# Install Python dependencies including manim
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-8000}

# Run the application (Railway sets PORT env var)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
