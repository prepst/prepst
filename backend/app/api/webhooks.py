from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.config import get_settings
from app.services.discord_service import send_user_signup_notification, send_feedback_notification
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


class UserSignupWebhook(BaseModel):
    user_id: str
    email: EmailStr
    created_at: str


class FeedbackWebhook(BaseModel):
    type: str
    details: str
    user_email: EmailStr
    page_url: str
    attachment_url: Optional[str] = None


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


@router.post("/feedback", status_code=status.HTTP_200_OK)
async def handle_feedback(data: FeedbackWebhook):
    """
    Webhook endpoint called when a user submits feedback.
    Sends a notification to Discord.

    Args:
        data: Feedback data (type, details, user_email, page_url, attachment_url)

    Returns:
        Success message
    """
    try:
        settings = get_settings()

        # Send Discord notification to feedback channel
        success = await send_feedback_notification(
            webhook_url=settings.discord_feedback_webhook_url,
            feedback_type=data.type,
            details=data.details,
            user_email=data.user_email,
            page_url=data.page_url,
            attachment_url=data.attachment_url
        )

        if success:
            logger.info(f"Feedback notification sent from: {data.user_email}")
        else:
            logger.warning(f"Failed to send feedback notification from: {data.user_email}")

        # Always return 200 OK
        return {"status": "ok", "notification_sent": success}

    except Exception as e:
        # Log error but still return 200 OK
        logger.error(f"Error in feedback webhook: {e}")
        return {"status": "error", "notification_sent": False}
