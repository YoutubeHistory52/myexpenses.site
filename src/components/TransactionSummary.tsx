import { Transaction } from '../types';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = income - expenses;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>

      <div className="space-y-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Balance</span>
            </div>
          </div>
          <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            {formatAmount(balance)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Income</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">{formatAmount(income)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Expenses</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{formatAmount(expenses)}</p>
        </div>
      </div>
    </div>
  );
}
