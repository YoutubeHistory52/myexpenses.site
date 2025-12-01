#Personal Finance Tracker

A web application that automatically tracks your personal finances by extracting transaction details from Gmail and organizing them into a comprehensive expense tracker.

## Overview

This project aims to simplify personal finance management by automatically importing debit/credit transaction details from bank notification emails in Gmail. Instead of manually entering each expense, the app reads your transaction emails and categorizes them automatically.

## Features

### Current Features
- User authentication (Sign up/Sign in) with Supabase
- Secure user sessions
- Dashboard for viewing transactions
- Manual transaction entry
- Transaction categorization
- Expense analytics and summaries

### Planned Features
- Gmail OAuth integration for automatic email import
- Automatic extraction of transaction details from bank emails
- Initial import of past 6 months of transaction emails
- Incremental sync (fetch emails from last 2 days to avoid duplicates)
- Smart duplicate detection
- Multiple bank email format support
- Export transactions to CSV/Excel

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
src/
  components/
    Analytics.tsx       # Expense analytics and charts
    Auth.tsx            # Authentication (login/signup)
    Dashboard.tsx       # Main dashboard view
    GmailIntegration.tsx # Gmail import functionality
    TransactionForm.tsx  # Manual transaction entry
    TransactionList.tsx  # Transaction listing
    TransactionSummary.tsx # Summary statistics
  context/
    AuthContext.tsx     # Authentication state management
  lib/
    supabase.ts         # Supabase client configuration
  types/
    index.ts            # TypeScript type definitions
supabase/
  migrations/          # Database migration files
```

## Database Schema

### Tables

#### transactions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `gmail_message_id` (Text, for duplicate detection)
- `description` (Text)
- `amount` (Decimal)
- `type` ('income' | 'expense')
- `category` (Text)
- `transaction_date` (Timestamp)
- `source` ('manual' | 'gmail')
- `is_deleted` (Boolean, soft delete)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### gmail_sync_state
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `last_sync_date` (Timestamp)
- `last_message_id` (Text)
- `sync_status` (Text)
- `error_message` (Text)

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/YoutubeHistory52/myexpenses.site.git
cd myexpenses.site
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server
```bash
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from `supabase/migrations/` folder
3. Enable Row Level Security (RLS) on all tables
4. Copy your project URL and anon key to `.env`

## Usage

1. **Sign Up**: Create a new account with your email
2. **Verify Email**: Check your email for verification link
3. **Sign In**: Log in with your credentials
4. **Add Transactions**: Manually add transactions or import from Gmail
5. **View Analytics**: See your spending patterns and summaries

## Gmail Integration (Coming Soon)

The Gmail integration will:
1. Connect to your Gmail account via OAuth 2.0
2. Scan for transaction notification emails from banks
3. Extract transaction details (amount, date, merchant, type)
4. Import transactions without duplicates
5. Support incremental sync for efficiency

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Author

Built with React, TypeScript, and Supabase.

---

[Edit in StackBlitz](https://stackblitz.com/~/github.com/YoutubeHistory52/myexpenses.site)
