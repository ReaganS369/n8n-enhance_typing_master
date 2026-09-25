import React, { useState } from 'react';
import {
  Settings,
  Calendar,
  CloudSun,
  Clock,
  Plane,
  Train,
  Car,
  Compass,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { TransitMode } from '../../types/trip';

export const SettingsView: React.FC = () => {
  const {
    trip,
    updatePreferences,
    updateTripBasics,
    resetToDefaultData,
    showToast,
  } = useTrip();

  const [name, setName] = useState(trip.name);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [durationDays, setDurationDays] = useState(trip.durationDays);

  const [tempMin, setTempMin] = useState(trip.preferences.preferredTempMin);
  const [tempMax, setTempMax] = useState(trip.preferences.preferredTempMax);
  const [maxTravelHours, setMaxTravelHours] = useState(trip.preferences.maxAcceptableTravelTime);
  const [travelPref, setTravelPref] = useState<TransitMode>(trip.preferences.travelPreference);

  const handleSaveTripBasics = (e: React.FormEvent) => {
    e.preventDefault();
    updateTripBasics({
      name: name.trim() || 'Winter Group Trip',
      startDate,
      endDate,
      durationDays: Number(durationDays),
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      preferredTempMin: Number(tempMin),
      preferredTempMax: Number(tempMax),
      maxAcceptableTravelTime: Number(maxTravelHours),
      travelPreference: travelPref,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <Settings className="w-4 h-4" />
          <span>Trip Setup & Group Preferences</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Customize Trip Parameters
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fine-tune temperature thresholds, maximum transit limits, and travel dates to update destination compatibility scores automatically.
        </p>
      </div>

      {/* Card 1: Trip Basics */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Trip Metadata & Dates</span>
        </h3>

        <form onSubmit={handleSaveTripBasics} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trip Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Trip Info</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Weather & Travel Time Preferences */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span>Weather & Travel Duration Limits</span>
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          {/* Temperature Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Preferred Temperature Range</span>
              <span className="text-teal-600 font-bold text-sm">
                {tempMin}°C – {tempMax}°C
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Minimum Temp (°C)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={tempMin}
                  onChange={e => setTempMin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-xs text-slate-600 font-medium">{tempMin}°C</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Maximum Temp (°C)</label>
                <input
                  type="range"
                  min="18"
                  max="35"
                  value={tempMax}
                  onChange={e => setTempMax(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <span className="text-xs text-slate-600 font-medium">{tempMax}°C</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Destinations with expected temperatures falling outside this range will receive lower weather scores.
            </p>
          </div>

          {/* Travel Time */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                Maximum Acceptable Travel Time
              </span>
              <span className="text-sky-700 font-bold text-sm">
                &le; {maxTravelHours} Hours
              </span>
            </div>

            <input
              type="range"
              min="4"
              max="16"
              step="1"
              value={maxTravelHours}
              onChange={e => setMaxTravelHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>4 hours (Short hop)</span>
              <span>8 hours (Standard)</span>
              <span>16 hours (Overnight)</span>
            </div>
          </div>

          {/* Travel Preference Mode */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Default Group Transit Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'flight', label: 'Flight', icon: Plane },
                { id: 'train', label: 'Train', icon: Train },
                { id: 'road', label: 'Road', icon: Car },
                { id: 'any', label: 'Fastest / Any', icon: Compass },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = travelPref === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTravelPref(opt.id as TransitMode)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Travel Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 3: Reset Demo Scenario */}
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-rose-950 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset to Preloaded Demo Scenario</span>
          </h4>
          <p className="text-xs text-rose-700 mt-1 max-w-lg">
            Restore the official 4 travelers (3 Delhi, 1 Bhopal) in late December with preloaded visited history and default itineraries.
          </p>
        </div>

        <button
          onClick={resetToDefaultData}
          className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
