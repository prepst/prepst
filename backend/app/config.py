from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase - explicitly set env names for Vercel
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_anon_key: str = Field(..., env="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")

    # API
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")  # Railway sets PORT, handled in main.py
    debug: bool = Field(default=False, env="DEBUG")

    # CORS - use environment variable
    cors_origins: str = Field(default="http://localhost:3000", env="CORS_ORIGINS")
    
    # OpenAI
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=500, env="OPENAI_MAX_TOKENS")

    # Discord
    discord_webhook_url: str = Field(default="", env="DISCORD_WEBHOOK_URL")
    discord_feedback_webhook_url: str = Field(default="", env="DISCORD_FEEDBACK_WEBHOOK_URL")

    # Manim Service (Railway)
    # When set, Vercel will proxy manim requests to Railway
    # When empty (Railway deployment), manim routes work directly
    manim_service_url: str = Field(default="", env="MANIM_SERVICE_URL")

    @field_validator("manim_service_url")
    @classmethod
    def validate_manim_service_url(cls, v: str) -> str:
        """Validate and normalize MANIM_SERVICE_URL"""
        if not v:
            return ""
        # Strip whitespace
        v = v.strip()
        if not v:
            return ""
        # If URL doesn't start with http:// or https://, add https://
        if not v.startswith(("http://", "https://")):
            return f"https://{v}"
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields


@lru_cache()
def get_settings():
    return Settings()
