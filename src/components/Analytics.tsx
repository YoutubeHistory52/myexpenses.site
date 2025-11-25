import { Transaction } from '../types';
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react';

export function Analytics({ transactions }: { transactions: Transaction[] }) {
  const categoryExpenses: Record<string, number> = {};
  const categoryIncome: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.amount < 0) {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + Math.abs(t.amount);
    } else {
      categoryIncome[t.category] = (categoryIncome[t.category] || 0) + t.amount;
    }
  });

  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    if (t.amount < 0) {
      monthlyData[monthKey].expenses += Math.abs(t.amount);
    } else {
      monthlyData[monthKey].income += t.amount;
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const maxMonthlyAmount = Math.max(
    ...sortedMonths.map(m => Math.max(monthlyData[m].income, monthlyData[m].expenses))
  ) || 100;

  const topExpenses = Object.entries(categoryExpenses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topIncome = Object.entries(categoryIncome)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Transaction Analytics
        </h2>

        {sortedMonths.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
            <div className="space-y-4">
              {sortedMonths.map((month) => {
                const { income, expenses } = monthlyData[month];
                const incomeWidth = (income / maxMonthlyAmount) * 100;
                const expenseWidth = (expenses / maxMonthlyAmount) * 100;

                return (
                  <div key={month}>
                    <div className="flex justify-between text-sm text-gray-700 mb-2">
                      <span className="font-medium">{month}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">Income: {formatAmount(income)}</span>
                        <span className="text-red-600">Expenses: {formatAmount(expenses)}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {income > 0 && (
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: `${incomeWidth}%` }}
                        />
                      )}
                      {expenses > 0 && (
                        <div
                          className="bg-red-500 rounded-full h-2"
                          style={{ width: `${expenseWidth}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {topExpenses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                Top Expense Categories
              </h3>
              <div className="space-y-3">
                {topExpenses.map(([category, amount]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{category}</p>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${(amount / Math.max(...topExpenses.map(e => e[1]))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-600 whitespace-nowrap">
                      {formatAmount(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {topIncome.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Income Categories
                </h3>
                <div className="space-y-3">
                  {topIncome.map(([category, amount]) => (
                    <div key={category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{category}</p>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(amount / Math.max(...topIncome.map(e => e[1]))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions to analyze yet</p>
            <p className="text-sm text-gray-400 mt-2">Add transactions to see insights</p>
          </div>
        )}
      </div>
    </div>
  );
}
