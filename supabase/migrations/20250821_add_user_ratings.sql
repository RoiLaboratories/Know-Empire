-- Add rating and review columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update any existing users with default values
UPDATE users SET rating = 0.00, review_count = 0 WHERE rating IS NULL OR review_count IS NULL;
