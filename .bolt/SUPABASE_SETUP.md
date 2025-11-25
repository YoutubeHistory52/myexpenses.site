# Supabase Setup Guide for Gmail Personal Finance Tracker

This guide will walk you through setting up Supabase for your Gmail Personal Finance Tracker application.

## Prerequisites

- A Google/GitHub account to sign up for Supabase
- Access to Gmail account for OAuth integration

---

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Sign up using GitHub, Google, or email
4. Verify your email if required

---

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Select your organization (or create one)
3. Fill in the project details:
   - **Project Name**: `gmail-finance-tracker` (or your preferred name)
   - **Database Password**: Create a strong password and **save it securely**
   - **Region**: Choose the closest region to your location for better performance
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be provisioned

---

## Step 3: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

4. Copy these values and update your `.env` file:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

⚠️ **IMPORTANT**:

- Use the **anon/public** key, NOT the service_role key
- Never commit the `.env` file to version control
- The service_role key bypasses Row Level Security and should never be exposed in frontend code

---

## Step 4: Enable Email Authentication

1. Go to **Authentication** in the left sidebar
2. Click on **Providers**
3. Find **Email** provider
4. Make sure it's **enabled** (it should be by default)
5. Configure settings:
   - Enable "Confirm email": You can disable this for development
   - Enable "Secure email change": Recommended for production

---

## Step 5: Create Database Schema

1. Go to **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste the following SQL:

```sql
-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gmail_message_id TEXT UNIQUE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  category TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  source TEXT DEFAULT 'gmail',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_gmail_message_id ON public.transactions(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create gmail_sync_state table to track sync progress
CREATE TABLE IF NOT EXISTS public.gmail_sync_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_sync_date TIMESTAMPTZ,
  last_message_id TEXT,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for gmail_sync_state
CREATE INDEX IF NOT EXISTS idx_gmail_sync_state_user_id ON public.gmail_sync_state(user_id);

-- Enable RLS for gmail_sync_state
ALTER TABLE public.gmail_sync_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gmail_sync_state
CREATE POLICY "Users can view their own sync state"
  ON public.gmail_sync_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync state"
  ON public.gmail_sync_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync state"
  ON public.gmail_sync_state
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

4. Click **Run** to execute the SQL
5. You should see a success message confirming the tables were created

---

## Step 6: Verify Database Tables

1. Go to **Table Editor** in the left sidebar
2. You should see two tables:
   - `transactions`
   - `gmail_sync_state`
3. Click on each table to verify the columns are created correctly

---

## Step 7: Configure CORS (if needed)

For StackBlitz development:

1. Go to **Settings** > **API**
2. Scroll down to **CORS settings**
3. The default settings should work, but if you encounter CORS errors, add:
   - `http://localhost:5173`
   - Your StackBlitz preview URL

---

## Step 8: Test the Application

1. Make sure your `.env` file has the correct credentials
2. Save the `.env` file (Ctrl+S)
3. StackBlitz will automatically reload
4. Open the preview (should be at `http://localhost:5173`)
5. You should now see the login/signup screen instead of a blank page
6. Try creating an account to test the authentication

---

## Step 9: Gmail OAuth Setup (For Future Implementation)

**Note**: Gmail OAuth integration requires backend Edge Functions. For now, you can:

1. Create test transactions manually using the Supabase Table Editor
2. Or use the SQL Editor to insert sample data:

```sql
-- Insert sample transaction (replace USER_ID with your actual user ID)
INSERT INTO public.transactions (
  user_id,
  description,
  amount,
  type,
  category,
  transaction_date
) VALUES (
  'YOUR_USER_ID_HERE',
  'Sample Coffee Purchase',
  5.50,
  'debit',
  'Food & Dining',
  NOW()
);
```

To get your user ID:

1. After signing up, go to **Authentication** > **Users**
2. Click on your user
3. Copy the UUID

---

## Troubleshooting

### Preview shows blank page

- ✅ Check that `.env` file exists in the `.bolt` folder
- ✅ Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- ✅ Make sure there are no extra spaces or quotes around the values
- ✅ Check browser console for error messages (F12)

### "Invalid API key" error

- ✅ Make sure you copied the **anon** key, not the service_role key
- ✅ The anon key should start with `eyJ`
- ✅ No spaces before or after the key in .env file

### Database connection errors

- ✅ Verify your project URL ends with `.supabase.co`
- ✅ Check that your Supabase project is active (not paused)
- ✅ Ensure Row Level Security policies are created

### Authentication not working

- ✅ Check that Email provider is enabled in Authentication > Providers
- ✅ For development, disable "Confirm email" requirement
- ✅ Check spam folder for confirmation emails

---

## Next Steps

Once your setup is complete:

1. ✅ Create an account in the application
2. ✅ Test adding manual transactions
3. ✅ Verify transactions appear in the dashboard
4. 🔄 Set up Gmail OAuth (requires Supabase Edge Functions - advanced)
5. 🔄 Configure transaction parsing rules
6. 🔄 Set up automated sync schedules

---

## Security Best Practices

⚠️ **IMPORTANT SECURITY NOTES**:

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use anon key in frontend** - Service role key should only be used in secure backend
3. **Row Level Security (RLS)** - Always enabled to protect user data
4. **Database password** - Store securely, needed for direct database access
5. **Regular backups** - Supabase Free tier includes automatic backups

---

## Support Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord Community](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)
- 📧 [Supabase Support](https://supabase.com/support)

---

**Setup completed successfully?** Your preview should now display the authentication screen! 🎉
