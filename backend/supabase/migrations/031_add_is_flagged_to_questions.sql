-- Migration: Add is_flagged column to questions table
-- Purpose: Allow admins to flag questions for review
-- Date: 2025-01-XX

-- Add is_flagged column to questions table
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;

-- Create index for faster flagged question lookups
CREATE INDEX IF NOT EXISTS idx_questions_is_flagged ON questions(is_flagged) WHERE is_flagged = TRUE;

-- Add comment
COMMENT ON COLUMN questions.is_flagged IS 'Admin flag for questions that need review or attention';

