-- Create enum for vocabulary source
CREATE TYPE vocab_source AS ENUM ('practice_session', 'manual', 'suggested');

-- Create enum for difficulty level (reuse if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
        CREATE TYPE difficulty_level AS ENUM ('E', 'M', 'H');
    END IF;
END$$;

-- User vocabulary words table
CREATE TABLE vocabulary_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    example_usage TEXT,
    context_sentence TEXT, -- Original sentence where word was found (if from practice session)
    session_question_id UUID REFERENCES session_questions(id) ON DELETE SET NULL,
    source vocab_source NOT NULL DEFAULT 'manual',
    is_mastered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vocabulary_words_user ON vocabulary_words(user_id);
CREATE INDEX idx_vocabulary_words_mastered ON vocabulary_words(user_id, is_mastered);
CREATE INDEX idx_vocabulary_words_source ON vocabulary_words(user_id, source);
CREATE INDEX idx_vocabulary_words_created_at ON vocabulary_words(created_at DESC);

-- Case-insensitive unique constraint per user (using unique index)
CREATE UNIQUE INDEX idx_vocabulary_words_user_word_unique ON vocabulary_words(user_id, LOWER(word));

-- Popular SAT vocabulary table (admin-managed)
CREATE TABLE popular_sat_vocab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word VARCHAR(100) NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    example_usage TEXT,
    frequency_rank INTEGER NOT NULL DEFAULT 0, -- Lower = more common
    difficulty_level CHAR(1) NOT NULL DEFAULT 'M' CHECK (difficulty_level IN ('E', 'M', 'H')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sorting by frequency
CREATE INDEX idx_popular_vocab_rank ON popular_sat_vocab(frequency_rank);
CREATE INDEX idx_popular_vocab_difficulty ON popular_sat_vocab(difficulty_level);

-- Add trigger for updated_at on vocabulary_words
CREATE TRIGGER update_vocabulary_words_updated_at 
    BEFORE UPDATE ON vocabulary_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_sat_vocab ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vocabulary_words
CREATE POLICY "Users can view own vocabulary"
    ON vocabulary_words
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary"
    ON vocabulary_words
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary"
    ON vocabulary_words
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary"
    ON vocabulary_words
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for popular_sat_vocab (public read, admin write)
CREATE POLICY "Popular vocab is viewable by everyone"
    ON popular_sat_vocab
    FOR SELECT
    USING (true);

-- Seed some popular SAT vocabulary words
INSERT INTO popular_sat_vocab (word, definition, example_usage, frequency_rank, difficulty_level) VALUES
('aberration', 'A departure from what is normal or expected', 'The scientist dismissed the unusual result as an aberration in the data.', 1, 'H'),
('benevolent', 'Well-meaning and kindly; showing goodwill', 'The benevolent donor funded scholarships for underprivileged students.', 2, 'M'),
('capricious', 'Given to sudden changes of mood or behavior; unpredictable', 'The capricious weather made it difficult to plan outdoor activities.', 3, 'H'),
('diligent', 'Having or showing care in one''s work or duties', 'The diligent student reviewed her notes every evening.', 4, 'E'),
('eloquent', 'Fluent or persuasive in speaking or writing', 'Her eloquent speech moved the entire audience to tears.', 5, 'M'),
('frugal', 'Sparing or economical with money or resources', 'Living a frugal lifestyle allowed him to save for retirement.', 6, 'M'),
('gregarious', 'Fond of company; sociable', 'The gregarious host made sure every guest felt welcome at the party.', 7, 'M'),
('hypothetical', 'Based on an imagined situation rather than reality', 'The professor posed a hypothetical scenario for the students to analyze.', 8, 'M'),
('indifferent', 'Having no particular interest or concern; apathetic', 'She remained indifferent to the criticism of her work.', 9, 'E'),
('juxtapose', 'To place side by side for comparison or contrast', 'The artist chose to juxtapose light and dark colors in her painting.', 10, 'H'),
('meticulous', 'Showing great attention to detail; very careful', 'The meticulous editor caught every grammatical error.', 11, 'M'),
('novel', 'New or unusual in an interesting way', 'The researcher proposed a novel approach to solving the problem.', 12, 'E'),
('obsolete', 'No longer produced or used; out of date', 'The old technology became obsolete within a few years.', 13, 'M'),
('pragmatic', 'Dealing with things sensibly and realistically', 'She took a pragmatic approach to solving the budget crisis.', 14, 'M'),
('quantify', 'To express or measure the quantity of something', 'It was difficult to quantify the impact of the new policy.', 15, 'M'),
('resilient', 'Able to recover quickly from difficulties', 'The resilient community rebuilt after the natural disaster.', 16, 'M'),
('scrutinize', 'To examine or inspect closely and thoroughly', 'The committee will scrutinize every detail of the proposal.', 17, 'M'),
('tenacious', 'Holding firmly to something; persistent', 'Her tenacious pursuit of justice inspired many activists.', 18, 'M'),
('unprecedented', 'Never done or known before', 'The pandemic caused unprecedented disruption to daily life.', 19, 'M'),
('vindicate', 'To clear of blame or suspicion', 'The new evidence helped vindicate the wrongly accused man.', 20, 'H'),
('ambiguous', 'Open to more than one interpretation; unclear', 'The contract language was ambiguous and led to disputes.', 21, 'M'),
('bolster', 'To support or strengthen', 'The new data helped bolster his argument.', 22, 'M'),
('candid', 'Truthful and straightforward; frank', 'She gave a candid assessment of the situation.', 23, 'E'),
('diminish', 'To make or become less', 'Nothing could diminish her enthusiasm for the project.', 24, 'E'),
('empirical', 'Based on observation or experience rather than theory', 'The study relied on empirical evidence to support its claims.', 25, 'H'),
('fluctuate', 'To rise and fall irregularly', 'Stock prices fluctuate based on market conditions.', 26, 'M'),
('conventional', 'Based on what is traditionally done or believed', 'He rejected conventional wisdom in favor of innovation.', 27, 'E'),
('substantiate', 'To provide evidence to support a claim', 'She was unable to substantiate her allegations.', 28, 'H'),
('analogous', 'Comparable in certain respects', 'The structure of an atom is analogous to a solar system.', 29, 'H'),
('cynical', 'Distrustful of human sincerity or integrity', 'Years of disappointment made him cynical about politics.', 30, 'M');
