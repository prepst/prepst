-- Migration: Add Discord Webhook Notification for New User Signups
-- Description: Update the user signup trigger to send HTTP POST to our FastAPI webhook endpoint

-- First, ensure the pg_net extension is enabled for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the trigger function to call our FastAPI webhook after creating user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT;
    api_host TEXT;
BEGIN
    -- Insert user into public.users table
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );

    -- Get API host from environment or use default
    -- You can override this via: ALTER DATABASE postgres SET app.api_host = 'https://your-custom-url';
    api_host := current_setting('app.api_host', true);
    IF api_host IS NULL OR api_host = '' THEN
        -- Production API URL
        api_host := 'https://satguide-demo-backend.vercel.app';
    END IF;

    webhook_url := api_host || '/api/webhooks/user-signup';

    -- Send async HTTP POST request to our webhook endpoint
    -- This uses pg_net to make the request without blocking the user creation
    PERFORM net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'user_id', NEW.id,
            'email', NEW.email,
            'created_at', NEW.created_at
        ),
        timeout_milliseconds := 5000
    );

    -- Note: We don't check the response because we don't want to block
    -- user creation if the webhook fails. The notification is best-effort.

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If anything fails, log it but still create the user
    RAISE WARNING 'Failed to send webhook notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on the function for documentation
COMMENT ON FUNCTION public.handle_new_user() IS
'Trigger function that creates a user profile and sends Discord notification via webhook when a new user signs up';
