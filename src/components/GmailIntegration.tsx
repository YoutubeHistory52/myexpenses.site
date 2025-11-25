import { useState } from 'react';
import { Mail, Loader, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface GmailIntegrationProps {
  onTransactionsAdded: () => void;
}

export function GmailIntegration({ onTransactionsAdded }: GmailIntegrationProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleConnectGmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect Gmail');
      }

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Gmail';
      setError(errorMessage);
      console.error('Gmail connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTransactions = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-gmail-transactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setMessage(`Successfully fetched ${data.transactions_count || 0} transactions from Gmail`);
      onTransactionsAdded();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Fetch transactions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleTransactions = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setMessage('');

    const sampleTransactions = [
      {
        description: 'Coffee at Starbucks',
        amount: -5.50,
        category: 'Food',
        transaction_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        source: 'Gmail',
        type: 'debit',
      },
      {
        description: 'Salary Deposit',
        amount: 3500,
        category: 'Salary',
        transaction_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        source: 'Gmail',
        type: 'credit',
      },
      {
        description: 'Uber ride',
        amount: -12.75,
        category: 'Transport',
        transaction_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        source: 'Gmail',
        type: 'debit',
      },
      {
        description: 'Netflix Subscription',
        amount: -15.99,
        category: 'Entertainment',
        transaction_date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        source: 'Gmail',
        type: 'debit',
      },
      {
        description: 'Freelance Project',
        amount: 500,
        category: 'Freelance',
        transaction_date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
        source: 'Gmail',
        type: 'credit',
      },
    ];

    try {
      const { error } = await supabase.from('transactions').insert(
        sampleTransactions.map((t) => ({
          ...t,
          user_id: user.id,
          is_deleted: false,
        }))
      );

      if (error) throw error;

      setMessage('Successfully added 5 sample transactions from Gmail');
      onTransactionsAdded();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add sample transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gmail Integration</h2>
          <p className="text-gray-600">
            Connect your Gmail account to automatically import bank and financial transactions
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Connect your Gmail account securely</li>
              <li>2. We'll scan for bank transaction emails</li>
              <li>3. Transactions are automatically categorized</li>
              <li>4. All data stays private and secure</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConnectGmail}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Connect Gmail Account
              </>
            )}
          </button>

          <button
            onClick={handleFetchTransactions}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Fetch Transactions from Gmail
              </>
            )}
          </button>

          <button
            onClick={handleAddSampleTransactions}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add Sample Transactions (Demo)
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Your Gmail account connection is secure and only used to read financial emails. We never store your Gmail password.
          </p>
        </div>
      </div>
    </div>
  );
}
