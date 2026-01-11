
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, InsightReport, TransactionType } from './types';
import { INITIAL_TRANSACTIONS, CATEGORIES } from './constants';
import { Card } from './components/Card';
import { TransactionItem } from './components/TransactionItem';
import { DashboardCharts } from './components/DashboardCharts';
import { parseNaturalLanguage, analyzeSpendingHabits, analyzeImageReceipt } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'ai'>('overview');
  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [insight, setInsight] = useState<InsightReport | null>(null);

  // Stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = useCallback((newTx: Partial<Transaction>) => {
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: newTx.amount || 0,
      type: newTx.type || 'expense',
      category: newTx.category || '其他',
      description: newTx.description || '未命名交易',
      date: newTx.date || new Date().toISOString().split('T')[0],
    };
    setTransactions(prev => [tx, ...prev]);
  }, []);

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    const result = await parseNaturalLanguage(aiInput);
    if (result) {
      handleAddTransaction(result);
      setAiInput('');
    }
    setIsProcessing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeImageReceipt(base64);
      if (result) {
        handleAddTransaction(result);
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const generateAIInsight = async () => {
    setIsProcessing(true);
    const report = await analyzeSpendingHabits(transactions);
    if (report) setInsight(report);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
              <span className="font-bold text-lg">W</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">WealthWisdom</h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>总览</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>账单历史</button>
            <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'ai' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>AI 洞察</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0 shadow-lg shadow-blue-100">
                <div className="text-blue-100 text-sm mb-1">当前余额</div>
                <div className="text-3xl font-bold">¥ {balance.toLocaleString()}</div>
                <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs">
                   <span>实时自动计算</span>
                </div>
              </Card>
              <Card>
                <div className="text-slate-400 text-sm mb-1">总收入</div>
                <div className="text-2xl font-bold text-emerald-500">¥ {totalIncome.toLocaleString()}</div>
                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{width: '65%'}} />
                </div>
              </Card>
              <Card>
                <div className="text-slate-400 text-sm mb-1">总支出</div>
                <div className="text-2xl font-bold text-slate-800">¥ {totalExpense.toLocaleString()}</div>
                <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{width: '45%'}} />
                </div>
              </Card>
            </div>

            {/* AI Input Field */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="试试输入：昨天午餐花了35块..."
                  className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 pl-11 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd(e)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </span>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleQuickAdd}
                  disabled={isProcessing || !aiInput}
                  className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'AI 分析中...' : '智能记账'}
                </button>
                <label className="p-3 bg-slate-100 text-slate-600 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
            </div>

            {/* Charts */}
            <DashboardCharts transactions={transactions} />

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">最近交易</h3>
                <button onClick={() => setActiveTab('history')} className="text-sm text-blue-600 font-medium hover:underline">查看全部</button>
              </div>
              <div className="divide-y divide-slate-50">
                {transactions.slice(0, 5).map(tx => (
                  <TransactionItem key={tx.id} transaction={tx} onDelete={handleDeleteTransaction} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card title="账单历史" className="overflow-hidden p-0">
               <div className="divide-y divide-slate-50">
                 {transactions.length > 0 ? (
                   transactions.map(tx => (
                     <TransactionItem key={tx.id} transaction={tx} onDelete={handleDeleteTransaction} />
                   ))
                 ) : (
                   <div className="p-12 text-center text-slate-400">暂无交易记录</div>
                 )}
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">AI 财务助理</h2>
              <p className="text-slate-500">让 AI 分析您的消费习惯，提供个性化的财务建议。</p>
            </div>

            {!insight ? (
              <div className="flex justify-center">
                <button 
                  onClick={generateAIInsight}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 disabled:bg-slate-300"
                >
                  {isProcessing ? '分析中...' : '生成财务诊断报告'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <Card title="诊断报告摘要">
                   <p className="text-slate-600 leading-relaxed">{insight.summary}</p>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="省钱建议">
                    <ul className="space-y-3">
                      {insight.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card title="风险评估">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className={`text-4xl mb-2 ${
                        insight.riskLevel === 'low' ? 'text-emerald-500' :
                        insight.riskLevel === 'medium' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {insight.riskLevel === 'low' ? '🟢' : insight.riskLevel === 'medium' ? '🟡' : '🔴'}
                      </div>
                      <div className="text-xl font-bold uppercase tracking-wider">
                        {insight.riskLevel === 'low' ? '健康' : insight.riskLevel === 'medium' ? '中等风险' : '高风险'}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center px-4">基于过去交易的消费频率和金额波动评估</p>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-center">
                   <button onClick={() => setInsight(null)} className="text-slate-400 hover:text-slate-600 text-sm font-medium">重新生成报告</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 md:hidden flex items-center justify-around h-16 z-40">
        <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center gap-1 ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px]">概览</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-[10px]">历史</span>
        </button>
        <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px]">AI分析</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
