"""
Railway-specific main file - Only includes manim routes to conserve resources.
All other routes are handled by Vercel.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import time
import logging
from app.api import manim
from app.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout,
    force=True
)
logger = logging.getLogger(__name__)

# Suppress verbose httpx logs
logging.getLogger("httpx").setLevel(logging.WARNING)

app = FastAPI(
    title="Manim Service API",
    description="Railway service for Manim video generation only",
    version="0.1.0"
)

# Configure CORS - allow requests from Vercel
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

logger.info(f"CORS origins configured: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    origin = request.headers.get("origin", "no-origin")
    print(f"→ {request.method} {request.url.path} [Origin: {origin}]", flush=True)
    
    response = await call_next(request)
    
    duration = (time.time() - start_time) * 1000
    print(f"← {response.status_code} {request.url.path} ({duration:.2f}ms)", flush=True)
    
    return response

# Startup event - log when app is ready
@app.on_event("startup")
async def startup_event():
    port = os.getenv("PORT", "8000")
    host = os.getenv("API_HOST", "0.0.0.0")
    logger.info(f"🚀 Manim Service API starting on {host}:{port}")
    logger.info("✅ Application ready to accept requests")
    print(f"✅ Server listening on {host}:{port}", flush=True)

# Only include manim router - all other routes handled by Vercel
app.include_router(manim.router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint - responds quickly for Railway health checks"""
    return {"status": "ok", "message": "Manim Service API (Railway) - Manim routes only"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "manim-only"}

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT") or os.getenv("API_PORT", 8000))
    
    uvicorn.run("app.main_railway:app", host=host, port=port, reload=True)
