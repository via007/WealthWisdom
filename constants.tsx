
import { Category, Transaction } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: '餐饮', icon: '🍔', color: 'bg-orange-100 text-orange-600' },
  { id: '2', name: '购物', icon: '🛍️', color: 'bg-pink-100 text-pink-600' },
  { id: '3', name: '交通', icon: '🚗', color: 'bg-blue-100 text-blue-600' },
  { id: '4', name: '娱乐', icon: '🎮', color: 'bg-purple-100 text-purple-600' },
  { id: '5', name: '居住', icon: '🏠', color: 'bg-green-100 text-green-600' },
  { id: '6', name: '工资', icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
  { id: '7', name: '其他', icon: '✨', color: 'bg-slate-100 text-slate-600' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 35.5, type: 'expense', category: '餐饮', description: '午餐外卖', date: '2024-03-20' },
  { id: 't2', amount: 5000, type: 'income', category: '工资', description: '3月基本工资', date: '2024-03-15' },
  { id: 't3', amount: 120, type: 'expense', category: '购物', description: '超市日用品', date: '2024-03-18' },
  { id: 't4', amount: 15, type: 'expense', category: '交通', description: '地铁打卡', date: '2024-03-19' },
  { id: 't5', amount: 45, type: 'expense', category: '娱乐', description: '电影票', date: '2024-03-19' },
];
