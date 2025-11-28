import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { TransactionSummary } from './TransactionSummary';
import { Analytics } from './Analytics';
import { GmailIntegration } from './GmailIntegration';
import { LogOut, Wallet, BarChart3, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

type Page = 'transactions' | 'analytics' | 'gmail';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_deleted', false)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const handleAddTransaction = async (
    transaction: Omit<
      Transaction,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_deleted'
    >
  ) => {
    if (!user) return;

    const { error } = await supabase.from('transactions').insert({
      ...transaction,
      user_id: user.id,
    });

    if (!error) {
      loadTransactions();
            toast.success('Transaction added successfully!');
    } else {
      toast.error(error.message || 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ is_deleted: true })
      .eq('id', id);

    if (!error) {
      loadTransactions();
      toast.success('Transaction deleted successfully!');
    } else {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'income') return t.amount > 0;
    if (filter === 'expense') return t.amount < 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Expense Tracker
                </h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
          <nav className="flex gap-2 border-t border-gray-200 pt-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setCurrentPage('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                currentPage === 'transactions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                currentPage === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            {/* <button
              onClick={() => setCurrentPage('gmail')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                currentPage === 'gmail'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Mail className="w-5 h-5" />
              <span>Gmail</span>
          </nav> */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <TransactionForm onSubmit={handleAddTransaction} />
              <TransactionSummary transactions={transactions} />
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Transactions
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('income')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === 'income'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setFilter('expense')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filter === 'expense'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Expenses
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    Loading transactions...
                  </div>
                ) : (
                  <TransactionList
                    transactions={filteredTransactions}
                    onDelete={handleDeleteTransaction}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'analytics' && (
          <Analytics transactions={transactions} />
        )}

        {currentPage === 'gmail' && (
          <GmailIntegration onTransactionsAdded={loadTransactions} />
        )}
      </main>
    </div>
  );
}
