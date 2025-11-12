-- Migration: Add flat_id column to expenses table
-- Date: 2025-11-12
-- Description: Add flat_id reference to expenses table to support flat-specific expense tracking

-- Add flat_id column to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS flat_id INTEGER REFERENCES flats(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_flat ON expenses(flat_id);

-- Update view or any dependent objects if needed
COMMENT ON COLUMN expenses.flat_id IS 'Reference to specific flat if expense is flat-specific (optional)';
