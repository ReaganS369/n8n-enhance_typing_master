import React from 'react';
import {
  Calendar,
  Users,
  Layers,
  SlidersHorizontal,
  CloudSun,
  Scale,
  Plus
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const Header: React.FC = () => {
  const {
    trip,
    selectedForCompare,
    setIsCompareModalOpen,
    setIsCreateTripModalOpen,
    setActiveTab,
    eligibleDestinationsCount,
  } = useTrip();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Trip Headline & Quick Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {trip.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <Calendar className="w-3 h-3 text-teal-600" />
                Late Dec · {trip.durationDays} Days
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {trip.travelers.length} Travelers
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">
                3 Delhi · 1 Bhopal
              </span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="hidden md:flex items-center gap-1 text-slate-600">
                <SlidersHorizontal className="w-3 h-3 text-teal-600" />
                Overlap &le; {trip.overlapThreshold}% ({Math.floor((trip.travelers.length * trip.overlapThreshold) / 100)} visited)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Plan New Trip Button */}
          <button
            onClick={() => setIsCreateTripModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">New Trip</span>
          </button>

          {/* Compare Float Pill */}
          {selectedForCompare.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-teal-700/20 transition-all animate-bounce"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}

          {/* Overlap Pill Indicator on Header */}
          <div
            onClick={() => setActiveTab('destinations')}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>
              <strong className="text-slate-900 font-bold">{eligibleDestinationsCount}</strong> Eligible
            </span>
          </div>

          {/* Group Avatars Stack */}
          <div
            onClick={() => setActiveTab('group')}
            className="cursor-pointer flex items-center gap-2 pl-2 border-l border-slate-200"
            title="Manage group & visited destinations"
          >
            <div className="flex -space-x-2 overflow-hidden">
              {trip.travelers.map(t => (
                <img
                  key={t.id}
                  src={t.avatar}
                  alt={t.name}
                  className="w-7 h-7 rounded-full ring-2 ring-white object-cover shadow-xs"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
