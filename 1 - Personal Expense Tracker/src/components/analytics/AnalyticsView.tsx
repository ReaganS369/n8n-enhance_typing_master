import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  CreditCard,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../data/categories';
import { CategoryId } from '../../types/expense';
import { CategoryIcon } from '../common/CategoryIcon';
import { generateSpendingInsights } from '../../services/gemini';

export const AnalyticsView: React.FC = () => {
  const {
    expenses,
    currentMonthExpenses,
    currentMonthTotalSpend,
    previousMonthTotalSpend,
    budgets,
    settings,
    selectedMonth,
  } = useExpense();

  // Gemini AI Insights state
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      try {
        const insights = await generateSpendingInsights(
          currentMonthExpenses,
          budgets,
          settings.currency,
          settings.geminiApiKey
        );
        if (isMounted) setAiInsights(insights);
      } catch (err) {
        console.error('Failed to generate insights:', err);
      } finally {
        if (isMounted) setIsLoadingInsights(false);
      }
    };

    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, [currentMonthExpenses, budgets, settings.currency, settings.geminiApiKey]);

  // Average daily spending this month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const today = new Date();
  const isCurrentActiveMonth =
    today.getFullYear() === parseInt(yearStr, 10) &&
    today.getMonth() + 1 === parseInt(monthStr, 10);
  const activeDaysElapsed = isCurrentActiveMonth ? Math.max(today.getDate(), 1) : daysInMonth;
  const avgDailySpend = Math.round(currentMonthTotalSpend / activeDaysElapsed);

  // Highest spending categories
  const categoryTotals = useMemo(() => {
    const map: Record<CategoryId, number> = {
      food: 0,
      groceries: 0,
      travel: 0,
      shopping: 0,
      bills: 0,
      entertainment: 0,
      health: 0,
      education: 0,
      other: 0,
    };
    currentMonthExpenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amount;
    });

    return (Object.entries(map) as [CategoryId, number][])
      .filter(([, amt]) => amt > 0)
      .map(([id, amount]) => ({
        id,
        name: CATEGORIES[id]?.name || id,
        amount,
        percent: currentMonthTotalSpend > 0 ? (amount / currentMonthTotalSpend) * 100 : 0,
        color: CATEGORIES[id]?.color || '#10b981',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthExpenses, currentMonthTotalSpend]);

  // Top spending merchants
  const topMerchants = useMemo(() => {
    const map: Record<string, { amount: number; count: number; category: CategoryId }> = {};
    currentMonthExpenses.forEach((e) => {
      if (!map[e.merchant]) {
        map[e.merchant] = { amount: 0, count: 0, category: e.categoryId };
      }
      map[e.merchant].amount += e.amount;
      map[e.merchant].count += 1;
    });

    return Object.entries(map)
      .map(([merchant, data]) => ({
        merchant,
        ...data,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [currentMonthExpenses]);

  // Multi-month comparison bars (Past 3-4 months)
  const monthlyComparison = useMemo(() => {
    const monthMap: Record<string, number> = {};
    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        const m = e.date.slice(0, 7);
        monthMap[m] = (monthMap[m] || 0) + e.amount;
      }
    });

    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-4)
      .map(([m, amt]) => {
        const [y, mon] = m.split('-');
        const date = new Date(parseInt(y, 10), parseInt(mon, 10) - 1, 1);
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          monthKey: m,
          label,
          amount: amt,
        };
      });
  }, [expenses]);

  const maxMonthSpend = Math.max(...monthlyComparison.map((m) => m.amount), 1000);

  // Day of Week Distribution (Mon - Sun)
  const dayOfWeekSpend = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = [0, 0, 0, 0, 0, 0, 0];
    currentMonthExpenses.forEach((e) => {
      const d = new Date(e.date).getDay();
      days[d] += e.amount;
    });
    return dayNames.map((name, i) => ({
      name,
      amount: days[i],
    }));
  }, [currentMonthExpenses]);

  const maxDaySpend = Math.max(...dayOfWeekSpend.map((d) => d.amount), 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Spending Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comprehensive breakdown of habits, merchants, trends, and AI-driven insights
          </p>
        </div>
      </div>

      {/* Top Analytics Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Daily Spend */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Daily Spend</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
            {settings.currency}{avgDailySpend.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/ day</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Based on {activeDaysElapsed} days elapsed in {selectedMonth}
          </p>
        </div>

        {/* Highest Spend Category */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Spending Area</span>
            <PieIcon className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {categoryTotals[0]?.name || 'N/A'}
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2">
            {categoryTotals[0]
              ? `${settings.currency}${categoryTotals[0].amount.toLocaleString()} (${Math.round(categoryTotals[0].percent)}% of total)`
              : 'No expenses recorded'}
          </p>
        </div>

        {/* Month-over-Month Variance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MoM Comparison</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {previousMonthTotalSpend > 0
                ? `${Math.abs(Math.round(((currentMonthTotalSpend - previousMonthTotalSpend) / previousMonthTotalSpend) * 100))}%`
                : '0%'}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${
                currentMonthTotalSpend > previousMonthTotalSpend
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              {currentMonthTotalSpend > previousMonthTotalSpend ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Higher
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Lower
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {settings.currency}{previousMonthTotalSpend.toLocaleString()} last month
          </p>
        </div>
      </div>

      {/* Gemini AI Smart Advisor Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 rounded-2xl p-5 border border-emerald-500/20 shadow-soft">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Spendly AI Financial Observations
          </h3>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            Powered by Gemini
          </span>
        </div>

        {isLoadingInsights ? (
          <div className="py-4 flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>Analyzing spending habits and patterns...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-500/15 shadow-soft-sm flex items-start gap-2.5"
              >
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Grid: Multi-Month Comparison & Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500">Historical progression across recent months</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {monthlyComparison.map((m) => {
              const pct = (m.amount / maxMonthSpend) * 100;
              const isSelected = m.monthKey === selectedMonth;

              return (
                <div key={m.monthKey} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-medium ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m.label} {m.monthKey.slice(0, 4)} {isSelected && '(Current)'}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {settings.currency}{m.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isSelected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day-of-Week Spending Pattern */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Day-of-Week Patterns
              </h3>
              <p className="text-xs text-slate-500">Where you spend the most throughout the week</p>
            </div>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2">
            {dayOfWeekSpend.map((d) => {
              const heightPct = (d.amount / maxDaySpend) * 100;
              const isWeekend = d.name === 'Sat' || d.name === 'Sun';

              return (
                <div key={d.name} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {settings.currency}{Math.round(d.amount / 1000)}k
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-end h-28 overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isWeekend ? 'bg-purple-500 group-hover:bg-purple-400' : 'bg-emerald-500 group-hover:bg-emerald-400'
                      }`}
                      style={{ height: `${Math.max(heightPct, 5)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isWeekend ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500'
                    }`}
                  >
                    {d.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Merchants & Category Ranking Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Top Merchants</h3>
              <p className="text-xs text-slate-500">Where the highest volume of money was spent</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {topMerchants.map((m, idx) => (
              <div
                key={m.merchant}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {m.merchant}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      {m.count} {m.count === 1 ? 'transaction' : 'transactions'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {settings.currency}{m.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Ranking Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Category Ranking
              </h3>
              <p className="text-xs text-slate-500">Ranked by proportion of monthly spend</p>
            </div>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {categoryTotals.slice(0, 5).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <CategoryIcon categoryId={cat.id} size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {settings.currency}{cat.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                      {cat.percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: cat.color, width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
