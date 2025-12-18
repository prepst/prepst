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
