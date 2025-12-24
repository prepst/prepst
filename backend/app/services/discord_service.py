import httpx
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


async def send_user_signup_notification(
    webhook_url: str,
    user_id: str,
    email: str,
    created_at: Optional[str] = None
) -> bool:
    """
    Send a Discord notification when a new user signs up.

    Args:
        webhook_url: Discord webhook URL
        user_id: The new user's ID
        email: The new user's email
        created_at: Timestamp of signup (optional)

    Returns:
        True if notification sent successfully, False otherwise
    """
    if not webhook_url:
        logger.warning("Discord webhook URL not configured, skipping notification")
        return False

    try:
        # Format timestamp
        timestamp = created_at or datetime.utcnow().isoformat()

        # Create Discord embed message
        embed = {
            "title": "🎉 New User Signup!",
            "color": 3447003,  # Blue color
            "fields": [
                {
                    "name": "Email",
                    "value": email,
                    "inline": True
                },
                {
                    "name": "User ID",
                    "value": user_id,
                    "inline": True
                },
                {
                    "name": "Signed Up At",
                    "value": timestamp,
                    "inline": False
                }
            ],
            "timestamp": timestamp,
            "footer": {
                "text": "SAT Prep Platform"
            }
        }

        payload = {
            "embeds": [embed]
        }

        # Send POST request to Discord webhook
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()

        logger.info(f"Discord notification sent for user signup: {email}")
        return True

    except httpx.HTTPError as e:
        logger.error(f"Failed to send Discord notification: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Discord notification: {e}")
        return False


async def send_feedback_notification(
    webhook_url: str,
    feedback_type: str,
    details: str,
    user_email: str,
    page_url: str,
    attachment_url: Optional[str] = None
) -> bool:
    """
    Send a Discord notification when a user submits feedback.

    Args:
        webhook_url: Discord webhook URL
        feedback_type: Type of feedback ('bug' or 'improvement')
        details: Feedback details/description
        user_email: Email of user who submitted feedback
        page_url: URL of page where feedback was submitted
        attachment_url: Optional screenshot URL

    Returns:
        True if notification sent successfully, False otherwise
    """
    if not webhook_url:
        logger.warning("Discord webhook URL not configured, skipping notification")
        return False

    try:
        timestamp = datetime.utcnow().isoformat()

        # Choose color and emoji based on feedback type
        if feedback_type == "bug":
            color = 15158332  # Red
            emoji = "🐛"
            title = "Bug Report"
        else:
            color = 3066993  # Green
            emoji = "💡"
            title = "Improvement Suggestion"

        # Create Discord embed message
        embed = {
            "title": f"{emoji} {title}",
            "color": color,
            "description": details if details else "(no details provided)",
            "fields": [
                {
                    "name": "Submitted by",
                    "value": user_email,
                    "inline": True
                },
                {
                    "name": "Page",
                    "value": page_url,
                    "inline": False
                }
            ],
            "timestamp": timestamp,
            "footer": {
                "text": "SAT Prep Platform - Student Feedback"
            }
        }

        # Add screenshot if available
        if attachment_url:
            embed["image"] = {"url": attachment_url}
            embed["fields"].append({
                "name": "Screenshot",
                "value": "[View attachment](" + attachment_url + ")",
                "inline": False
            })

        payload = {
            "embeds": [embed]
        }

        # Send POST request to Discord webhook
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()

        logger.info(f"Discord feedback notification sent from: {user_email}")
        return True

    except httpx.HTTPError as e:
        logger.error(f"Failed to send Discord feedback notification: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Discord feedback notification: {e}")
        return False
