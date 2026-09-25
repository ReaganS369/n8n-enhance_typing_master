import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  showLabel = false,
}) => {
  const dimensions = {
    sm: { radius: 18, stroke: 3, width: 44, text: 'text-xs font-bold' },
    md: { radius: 24, stroke: 4, width: 58, text: 'text-sm font-bold' },
    lg: { radius: 36, stroke: 6, width: 88, text: 'text-xl font-extrabold' },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color selection
  const getColor = (s: number) => {
    if (s >= 88) return { stroke: '#0d9488', bg: 'text-teal-600', badge: 'bg-teal-50 text-teal-700' }; // Emerald/Teal
    if (s >= 75) return { stroke: '#0284c7', bg: 'text-sky-600', badge: 'bg-sky-50 text-sky-700' };    // Blue/Sky
    if (s >= 60) return { stroke: '#d97706', bg: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' };// Amber
    return { stroke: '#ef4444', bg: 'text-rose-600', badge: 'bg-rose-50 text-rose-700' };               // Red
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.width }}
      >
        <svg
          className="transform -rotate-90"
          width={dimensions.width}
          height={dimensions.width}
        >
          {/* Background track */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke="#e2e8f0"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Animated score progress */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={dimensions.radius}
            stroke={colors.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className={`absolute flex items-center justify-center ${dimensions.text} ${colors.bg}`}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
          Match Score
        </span>
      )}
    </div>
  );
};
