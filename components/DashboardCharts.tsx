
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  transactions: Transaction[];
}

export const DashboardCharts: React.FC<Props> = ({ transactions }) => {
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

  const trendData = transactions.reduce((acc: any[], t) => {
    const existing = acc.find(item => item.date === t.date);
    if (existing) {
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
    } else {
      acc.push({ 
        date: t.date, 
        income: t.type === 'income' ? t.amount : 0, 
        expense: t.type === 'expense' ? t.amount : 0 
      });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">消费构成</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {expenseData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs text-slate-500">{item.name}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">收支趋势 (近7天)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expense" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
