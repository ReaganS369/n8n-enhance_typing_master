import React, { useState, useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';

export const SpendingTrendChart: React.FC = () => {
  const { currentMonthExpenses, totalMonthlyBudget, settings, selectedMonth } = useExpense();
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; daily: number; total: number; x: number; y: number } | null>(null);

  // Determine number of days in the selected month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Aggregate spending day by day
  const dailyData = useMemo(() => {
    const dailyMap: Record<number, number> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dailyMap[i] = 0;
    }

    currentMonthExpenses.forEach((exp) => {
      const day = parseInt(exp.date.split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        dailyMap[day] = (dailyMap[day] || 0) + exp.amount;
      }
    });

    // Build cumulative array
    let runningTotal = 0;
    return Object.entries(dailyMap).map(([dayKey, amount]) => {
      runningTotal += amount;
      return {
        day: parseInt(dayKey, 10),
        daily: amount,
        total: runningTotal,
      };
    });
  }, [currentMonthExpenses, daysInMonth]);

  // Chart Dimensions
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max value for scale (either total spend or total budget)
  const maxSpend = dailyData[dailyData.length - 1]?.total || 0;
  const maxVal = Math.max(maxSpend * 1.15, totalMonthlyBudget * 1.05, 5000);

  // Coordinates helper
  const getX = (day: number) => padding.left + ((day - 1) / (daysInMonth - 1)) * graphWidth;
  const getY = (val: number) => padding.top + graphHeight - (val / maxVal) * graphHeight;

  // Generate SVG Path
  const points = dailyData.map((d) => ({
    ...d,
    x: getX(d.day),
    y: getY(d.total),
  }));

  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Simple smooth bezier
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${getY(0)} L ${points[0].x} ${getY(0)} Z`
    : '';

  // Budget reference line Y coordinate
  const budgetY = getY(totalMonthlyBudget);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Spending Pace & Trend</h3>
          <p className="text-xs text-slate-500">Cumulative month-to-date spending vs budget ceiling</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Cumulative Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 border-t-2 border-dashed border-slate-300 dark:border-slate-600" />
            <span>Budget Ceiling</span>
          </div>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full aspect-[21/9] min-h-[200px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = padding.top + graphHeight * pct;
            const val = Math.round(maxVal * (1 - pct));
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Budget Limit Dotted Line */}
          {budgetY >= padding.top && budgetY <= padding.top + graphHeight && (
            <g>
              <line
                x1={padding.left}
                y1={budgetY}
                x2={width - padding.right}
                y2={budgetY}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-70"
              />
              <text
                x={width - padding.right}
                y={budgetY - 5}
                textAnchor="end"
                className="text-[9px] fill-slate-500 font-mono font-semibold"
              >
                Cap: {settings.currency}{totalMonthlyBudget.toLocaleString()}
              </text>
            </g>
          )}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#spendGradient)"
            />
          )}

          {/* Main Spending Curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Dots */}
          {points.map((p) => (
            <circle
              key={p.day}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.day === p.day ? 5 : 2.5}
              className={`transition-all duration-150 cursor-pointer ${
                hoveredPoint?.day === p.day
                  ? 'fill-emerald-600 stroke-white stroke-2'
                  : 'fill-emerald-500/80 hover:fill-emerald-400'
              }`}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* X Axis Day Labels */}
          {[1, Math.round(daysInMonth / 4), Math.round(daysInMonth / 2), Math.round((3 * daysInMonth) / 4), daysInMonth].map(
            (day) => (
              <text
                key={day}
                x={getX(day)}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium font-mono"
              >
                Day {day}
              </text>
            )
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none bg-slate-900 text-white text-xs rounded-xl py-1.5 px-3 shadow-lg border border-slate-700 font-mono -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 8}%`,
            }}
          >
            <p className="font-semibold text-emerald-400">Day {hoveredPoint.day}</p>
            <p className="text-[11px] text-slate-300">
              Total: {settings.currency}{hoveredPoint.total.toLocaleString()}
            </p>
            {hoveredPoint.daily > 0 && (
              <p className="text-[10px] text-slate-400">
                Spent: +{settings.currency}{hoveredPoint.daily.toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
