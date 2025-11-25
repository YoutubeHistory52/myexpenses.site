/*
  # Expense Tracker Database Schema

  ## Overview
  Creates the core schema for tracking financial transactions with user authentication support.

  ## New Tables
  
  ### `transactions`
  - `id` (uuid, primary key) - Unique identifier for each transaction
  - `user_id` (uuid, foreign key) - References auth.users, identifies transaction owner
  - `description` (text) - Transaction description/notes
  - `amount` (decimal) - Transaction amount (positive for income, negative for expense)
  - `category` (text) - Transaction category (e.g., Food, Transport, Salary, etc.)
  - `transaction_date` (date) - Date when the transaction occurred
  - `source` (text) - Source of transaction (e.g., Gmail, Manual, etc.)
  - `created_at` (timestamptz) - Timestamp when record was created
  - `updated_at` (timestamptz) - Timestamp when record was last updated

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on `transactions` table
  - Users can only view their own transactions
  - Users can only insert their own transactions
  - Users can only update their own transactions
  - Users can only delete their own transactions

  ## Notes
  - All monetary amounts stored as decimal for precision
  - Foreign key ensures data integrity with auth.users
  - Timestamps help track data changes
  - Category field allows flexible transaction categorization
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount decimal(12, 2) NOT NULL,
  category text NOT NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  source text DEFAULT 'Manual',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);