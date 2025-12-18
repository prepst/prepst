from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.config import get_settings
from app.services.discord_service import send_user_signup_notification
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class UserSignupWebhook(BaseModel):
    user_id: str
    email: EmailStr
    created_at: str


@router.post("/user-signup", status_code=status.HTTP_200_OK)
async def handle_user_signup(data: UserSignupWebhook):
    """
    Webhook endpoint called by Supabase trigger when a new user signs up.
    Sends a notification to Discord.

    Args:
        data: User signup data (user_id, email, created_at)

    Returns:
        Success message
    """
    try:
        settings = get_settings()

        # Send Discord notification
        success = await send_user_signup_notification(
            webhook_url=settings.discord_webhook_url,
            user_id=data.user_id,
            email=data.email,
            created_at=data.created_at
        )

        if success:
            logger.info(f"User signup notification sent for: {data.email}")
        else:
            logger.warning(f"Failed to send notification for: {data.email}")

        # Always return 200 OK so user signup isn't blocked
        return {"status": "ok", "notification_sent": success}

    except Exception as e:
        # Log error but still return 200 OK
        logger.error(f"Error in user signup webhook: {e}")
        return {"status": "error", "notification_sent": False}
