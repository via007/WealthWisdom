
import React from 'react';
import { Transaction } from '../types';
import { CATEGORIES } from '../constants';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onDelete }) => {
  const category = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${category.color}`}>
          {category.icon}
        </div>
        <div>
          <div className="font-medium text-slate-800">{transaction.description}</div>
          <div className="text-sm text-slate-400">{transaction.category} · {transaction.date}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-slate-700'}`}>
          {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}
        </div>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};
