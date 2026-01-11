
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface InsightReport {
  summary: string;
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
}
