export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  transaction_date: string;
  source: string;
  type: 'debit' | 'credit';
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
}
