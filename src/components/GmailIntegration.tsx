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

  const resetState = () => {
    setLoading(true);
    setError('');
    setMessage('');
  };

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Not authenticated");
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const handleConnectGmail = async () => {
    try {
      resetState();

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-oauth`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to connect Gmail');

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTransactions = async () => {
    try {
      resetState();

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-gmail-transactions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch transactions');

      setMessage(`Successfully fetched ${data.transactions_count || 0} transactions`);
      onTransactionsAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSampleTransactions = async () => {
    if (!user) return;

    try {
      resetState();

      const sampleTransactions = [
        {
          description: 'Coffee at Starbucks',
          amount: -5.5,
          category: 'Food',
          transaction_date: new Date().toISOString().split('T')[0],
          source: 'Gmail',
          type: 'debit',
        },
        {
          description: 'Salary Deposit',
          amount: 3500,
          category: 'Salary',
          transaction_date: new Date().toISOString().split('T')[0],
          source: 'Gmail',
          type: 'credit',
        },
      ];

      const { error } = await supabase.from('transactions').insert(
        sampleTransactions.map((t) => ({
          ...t,
          user_id: user.id,
          is_deleted: false,
        }))
      );

      if (error) throw error;

      setMessage('Sample transactions added');
      onTransactionsAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add sample transactions');
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
            Connect your Gmail account to automatically import financial transactions.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleConnectGmail}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            Connect Gmail Account
          </button>

          <button
            onClick={handleFetchTransactions}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Fetch Gmail Transactions
          </button>

          <button
            onClick={handleAddSampleTransactions}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Sample Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
