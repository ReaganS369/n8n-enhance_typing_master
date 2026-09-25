import React, { useState, useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { CATEGORIES } from '../../data/categories';
import { CategoryId } from '../../types/expense';
import { CategoryIcon } from '../common/CategoryIcon';

export const CategoryBreakdownChart: React.FC = () => {
  const { categorySpendMap, currentMonthTotalSpend, settings, setFilterState, setCurrentView } = useExpense();
  const [hoveredCategory, setHoveredCategory] = useState<CategoryId | null>(null);

  // Filter categories with positive spend and sort descending
  const categoryData = useMemo(() => {
    return (Object.entries(categorySpendMap) as [CategoryId, number][])
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => {
        const percent = currentMonthTotalSpend > 0 ? (amount / currentMonthTotalSpend) * 100 : 0;
        return {
          id,
          name: CATEGORIES[id]?.name || id,
          amount,
          percent,
          color: CATEGORIES[id]?.color || '#64748b',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categorySpendMap, currentMonthTotalSpend]);

  // SVG Donut calculation
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const slices = categoryData.map((cat) => {
    const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += cat.percent;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = hoveredCategory
    ? categoryData.find((c) => c.id === hoveredCategory)
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Category Breakdown</h3>
          <p className="text-xs text-slate-500">Distribution of monthly expenditure</p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {categoryData.length} categories active
        </span>
      </div>

      {categoryData.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No expenses recorded for this month.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut graphic */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full -rotate-90 transform"
            >
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Slices */}
              {slices.map((slice) => {
                const isHovered = hoveredCategory === slice.id;
                return (
                  <circle
                    key={slice.id}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(slice.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-3">
              {activeCategory ? (
                <>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                    {activeCategory.name}
                  </span>
                  <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                    {Math.round(activeCategory.percent)}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {settings.currency}{activeCategory.amount.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total Spend
                  </span>
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                    {settings.currency}{currentMonthTotalSpend.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category List / Legend */}
          <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-52 pr-1">
            {categoryData.map((cat) => {
              const isHovered = hoveredCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => {
                    setFilterState((prev) => ({ ...prev, category: cat.id }));
                    setCurrentView('transactions');
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <CategoryIcon categoryId={cat.id} size={14} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-right shrink-0">
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {settings.currency}{cat.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 w-9 text-right">
                      {cat.percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
