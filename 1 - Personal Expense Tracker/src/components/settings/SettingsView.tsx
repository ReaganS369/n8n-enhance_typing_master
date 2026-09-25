import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { StorageService } from '../../services/storage';
import { GoogleGenAI } from '@google/genai';

const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee (INR)' },
  { symbol: '$', name: 'US Dollar (USD)' },
  { symbol: '€', name: 'Euro (EUR)' },
  { symbol: '£', name: 'British Pound (GBP)' },
];

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    expenses,
    budgets,
    resetAllData,
    importBackupData,
    showToast,
  } = useExpense();

  const [userName, setUserName] = useState(settings.userName);
  const [currency, setCurrency] = useState(settings.currency);
  const [overallBudget, setOverallBudget] = useState(settings.monthlyOverallBudget.toString());
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [keyMessage, setKeyMessage] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const numBudget = parseFloat(overallBudget) || settings.monthlyOverallBudget;

    updateSettings({
      userName: userName.trim() || settings.userName,
      currency,
      monthlyOverallBudget: numBudget,
    });

    showToast({
      title: 'Preferences saved',
      type: 'success',
    });
  };

  const handleSaveApiKey = () => {
    updateSettings({
      geminiApiKey: geminiKey.trim(),
    });

    showToast({
      title: 'Gemini API Key saved',
      description: geminiKey.trim() ? 'AI Auto-categorizer active' : 'Using built-in offline rules',
      type: 'success',
    });
  };

  const handleTestGeminiKey = async () => {
    const key = geminiKey.trim();
    if (!key) {
      setKeyStatus('error');
      setKeyMessage('Please enter a Gemini API Key first.');
      return;
    }

    setIsTestingKey(true);
    setKeyStatus('idle');
    setKeyMessage('');

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Respond with the single word: "READY"',
      });

      if (res.text?.toUpperCase().includes('READY') || res.text) {
        setKeyStatus('success');
        setKeyMessage('Connection successful! Gemini 2.5 Flash is active and ready.');
        updateSettings({ geminiApiKey: key });
      } else {
        throw new Error('Unexpected response format.');
      }
    } catch (err: any) {
      setKeyStatus('error');
      setKeyMessage(err.message || 'Failed to authenticate with Gemini API. Check your key.');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleExportJSON = () => {
    StorageService.exportToJSON({
      expenses,
      budgets,
      settings,
    });
    showToast({
      title: 'Backup exported',
      description: 'Saved as spendly_backup.json',
      type: 'info',
    });
  };

  const handleExportCSV = () => {
    StorageService.exportToCSV(expenses);
    showToast({
      title: 'CSV exported',
      type: 'info',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        importBackupData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage currency, Gemini AI categorization, targets, and data backup
        </p>
      </div>

      {/* General Preferences Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            General Preferences
          </h2>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Monthly Budget Cap */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Overall Monthly Budget ({currency})
            </label>
            <input
              type="number"
              step="1000"
              value={overallBudget}
              onChange={(e) => setOverallBudget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used as the ceiling baseline on the spending trend area chart.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-soft transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Gemini AI Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Gemini AI Auto-Categorization
              </h2>
              <p className="text-xs text-slate-500">
                Automated category classification powered by Google Gemini
              </p>
            </div>
          </div>

          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {settings.geminiApiKey ? 'API Connected' : 'Offline Engine Active'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mb-4">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            ⚡ Instant Dual Engine Architecture:
          </p>
          <p>
            • <strong>Instant Built-in Rules:</strong> Common items like <code className="text-emerald-600">milk</code>, <code className="text-emerald-600">bread</code> (Grocery), <code className="text-blue-600">flight</code>, <code className="text-blue-600">train</code>, <code className="text-blue-600">tickets</code> (Travel), <code className="text-orange-600">swiggy</code>, <code className="text-orange-600">zomato</code> (Food) are detected automatically in real-time without latency.
          </p>
          <p>
            • <strong>Gemini Cloud Flash:</strong> For unique or ambiguous merchants (e.g. "Decathlon camping gear", "AWS cloud services"), provide your Gemini API key below to enable full LLM classification.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Google Gemini API Key (Optional)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
            >
              Save Key
            </button>

            <button
              type="button"
              disabled={isTestingKey}
              onClick={handleTestGeminiKey}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isTestingKey ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status feedback */}
          {keyStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{keyMessage}</span>
            </div>
          )}

          {keyStatus === 'error' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{keyMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Management Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Data Storage & Backup
            </h2>
            <p className="text-xs text-slate-500">
              Spendly stores all data locally in your browser with zero remote servers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-colors flex flex-col justify-between group"
          >
            <Download className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-2 transition-colors" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Export JSON Backup</p>
              <p className="text-[10px] text-slate-400">All expenses, budgets & settings</p>
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-colors flex flex-col justify-between group"
          >
            <Download className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-2 transition-colors" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Export CSV Ledger</p>
              <p className="text-[10px] text-slate-400">Excel & spreadsheet format</p>
            </div>
          </button>

          {/* Import JSON Backup */}
          <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-colors flex flex-col justify-between group cursor-pointer">
            <Upload className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-2 transition-colors" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Restore Backup</p>
              <p className="text-[10px] text-slate-400">Upload Spendly JSON file</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Reset to Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all expenses and budgets to default sample data?')) {
                resetAllData();
              }
            }}
            className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 bg-rose-50/30 text-left transition-colors flex flex-col justify-between group"
          >
            <RotateCcw className="w-5 h-5 text-rose-500 mb-2" />
            <div>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400">Reset Demo Data</p>
              <p className="text-[10px] text-rose-500/80">Restore initial sample ledger</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
