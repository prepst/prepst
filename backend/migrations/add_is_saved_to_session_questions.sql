-- Add is_saved column to session_questions table
-- This allows users to bookmark questions for later review

ALTER TABLE session_questions
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;

-- Add index for performance when fetching saved questions
CREATE INDEX IF NOT EXISTS idx_session_questions_saved
ON session_questions(is_saved)
WHERE is_saved = true;

-- Add index for user's saved questions
CREATE INDEX IF NOT EXISTS idx_session_questions_user_saved
ON session_questions(session_id, is_saved)
WHERE is_saved = true;

-- Comment on the new column
COMMENT ON COLUMN session_questions.is_saved IS 'Indicates if the user has bookmarked this question for later review';