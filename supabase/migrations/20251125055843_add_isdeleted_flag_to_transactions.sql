/*
  # Add Soft Delete and Enhanced Tracking to Transactions

  ## Changes
  
  ### Modified Tables
  
  #### `transactions`
  - Added `is_deleted` (boolean, DEFAULT false) - Soft delete flag to preserve audit trail
  - Modified policies to exclude soft-deleted transactions from user views
  
  ## Notes
  - Soft delete allows data to be preserved in database for audit and compliance purposes
  - Users will not see deleted transactions in normal views
  - All existing transactions remain accessible with is_deleted = false
  
  ## Security
  - Updated RLS policies to automatically filter out deleted transactions
  - Maintains complete audit trail for compliance
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE transactions ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_deleted = false)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_not_deleted ON transactions(user_id, is_deleted) WHERE is_deleted = false;