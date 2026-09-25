import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, CheckCircle2, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const OverlapSlider: React.FC = () => {
  const {
    trip,
    setOverlapThreshold,
    eligibleDestinationsCount,
    totalDestinationsCount,
  } = useTrip();

  const totalMembers = trip.travelers.length || 4;
  const maxAllowedPeople = Math.floor((totalMembers * trip.overlapThreshold) / 100);

  // Discrete marks
  const marks = [
    { value: 0, label: '0%', people: '0 people (Nobody)' },
    { value: 25, label: '25%', people: `Up to ${Math.floor((totalMembers * 25) / 100)} person` },
    { value: 50, label: '50%', people: `Up to ${Math.floor((totalMembers * 50) / 100)} people` },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-teal-900/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header & Stat Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Maximum Group Overlap
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-teal-500 text-slate-950">
                  {trip.overlapThreshold}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Allow destinations already visited by up to this percentage of the group.
              </p>
            </div>
          </div>

          {/* Dynamic Eligible Destination Counter Pill */}
          <motion.div
            key={eligibleDestinationsCount}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-900/60 border border-teal-400/40 shadow-inner"
          >
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <div className="text-left">
              <div className="text-xs text-teal-200">Eligible Destinations</div>
              <div className="text-sm font-bold text-white leading-tight">
                <span className="text-teal-300 text-base">{eligibleDestinationsCount}</span> / {totalDestinationsCount} Places
              </div>
            </div>
          </motion.div>
        </div>

        {/* Current Threshold Impact Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
          {marks.map(mark => {
            const isSelected = trip.overlapThreshold === mark.value;
            return (
              <button
                key={mark.value}
                onClick={() => setOverlapThreshold(mark.value)}
                className={`text-left p-3 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? 'bg-teal-600/30 border-teal-400 text-white shadow-md shadow-teal-900/40'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-teal-300">{mark.label}</span>
                  {isSelected ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <div className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {mark.people}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Slider Input */}
        <div className="pt-2 pb-1">
          <input
            type="range"
            min="0"
            max="50"
            step="25"
            value={trip.overlapThreshold}
            onChange={e => setOverlapThreshold(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            aria-label="Maximum group overlap percentage slider"
          />

          <div className="flex justify-between text-[11px] text-slate-400 mt-2 px-1 font-medium">
            <span>0% (100% Brand New)</span>
            <span>25% (Max 1 visited)</span>
            <span>50% (Max 2 visited)</span>
          </div>
        </div>

        {/* Human Readable Explanation for the Current Setting */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>
              For your <strong>{totalMembers} travelers</strong>: at <strong>{trip.overlapThreshold}%</strong>, destinations visited by <strong>{maxAllowedPeople === 0 ? 'any member' : `more than ${maxAllowedPeople} members`}</strong> are excluded.
            </span>
          </div>
          <span className="hidden md:inline text-slate-400 text-[11px]">
            {totalDestinationsCount - eligibleDestinationsCount} destinations currently excluded
          </span>
        </div>
      </div>
    </div>
  );
};
