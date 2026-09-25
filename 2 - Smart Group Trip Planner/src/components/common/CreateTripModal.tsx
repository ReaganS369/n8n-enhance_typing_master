import React, { useState } from 'react';
import {
  Plane,
  Calendar,
  Users,
  MapPin,
  SlidersHorizontal,
  CloudSun,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { Modal } from './Modal';
import { useTrip } from '../../context/TripContext';
import { TransitMode, Traveler, TripPreferences } from '../../types/trip';

interface TravelerDraft {
  name: string;
  departureCity: string;
  preferredTransit: TransitMode;
  visitedStr: string;
  role: string;
}

export const CreateTripModal: React.FC = () => {
  const { isCreateTripModalOpen, setIsCreateTripModalOpen, createNewTrip, trip } = useTrip();

  // Step state: 1 (Basics & Dates) -> 2 (Travelers) -> 3 (Preferences)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [tripName, setTripName] = useState('Spring Escape 2027');
  const [startDate, setStartDate] = useState('2027-03-15');
  const [endDate, setEndDate] = useState('2027-03-19');
  const [durationDays, setDurationDays] = useState(5);

  // Travelers State
  const [travelers, setTravelers] = useState<TravelerDraft[]>([
    {
      name: 'Aarav Sharma',
      departureCity: 'Delhi',
      preferredTransit: 'flight',
      visitedStr: 'Delhi, Goa, Jaipur, Manali',
      role: 'Trip Organizer',
    },
    {
      name: 'Rohan Verma',
      departureCity: 'Delhi',
      preferredTransit: 'any',
      visitedStr: 'Goa, Jaipur',
      role: 'Foodie',
    },
    {
      name: 'Priya Iyer',
      departureCity: 'Delhi',
      preferredTransit: 'train',
      visitedStr: 'Manali',
      role: 'Photographer',
    },
    {
      name: 'Karan Patel',
      departureCity: 'Bhopal',
      preferredTransit: 'flight',
      visitedStr: 'Goa, Udaipur',
      role: 'Adventure',
    },
  ]);

  // Preferences State
  const [overlapThreshold, setOverlapThreshold] = useState<number>(25);
  const [tempMin, setTempMin] = useState<number>(12);
  const [tempMax, setTempMax] = useState<number>(26);
  const [maxTravelHours, setMaxTravelHours] = useState<number>(8);
  const [travelPreference, setTravelPreference] = useState<TransitMode>('any');

  // Quick Presets
  const weatherPresets = [
    { label: 'Crisp Winter', min: 10, max: 24, desc: 'Pleasant & cool' },
    { label: 'Warm & Tropical', min: 22, max: 32, desc: 'Beaches & sunny' },
    { label: 'Hill Station Cool', min: 5, max: 18, desc: 'Mist & jackets' },
    { label: 'Mild Spring', min: 15, max: 28, desc: 'Optimal sightseeing' },
  ];

  const handleAddTraveler = () => {
    setTravelers([
      ...travelers,
      {
        name: `Friend ${travelers.length + 1}`,
        departureCity: 'Delhi',
        preferredTransit: 'flight',
        visitedStr: '',
        role: 'Traveler',
      },
    ]);
  };

  const handleRemoveTraveler = (idx: number) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter((_, i) => i !== idx));
  };

  const handleUpdateTraveler = (idx: number, updates: Partial<TravelerDraft>) => {
    const next = [...travelers];
    next[idx] = { ...next[idx], ...updates };
    setTravelers(next);
  };

  const handleDatesChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const s = new Date(start).getTime();
      const e = new Date(end).getTime();
      const diffDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
      setDurationDays(diffDays);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim() || travelers.length === 0) return;

    const formattedTravelers: Omit<Traveler, 'id'>[] = travelers.map(t => ({
      name: t.name.trim(),
      avatar: '',
      departureCity: t.departureCity.trim(),
      preferredTransit: t.preferredTransit,
      visitedDestinations: t.visitedStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      role: t.role.trim() || 'Traveler',
    }));

    const prefs: TripPreferences = {
      preferredTempMin: tempMin,
      preferredTempMax: tempMax,
      maxAcceptableTravelTime: maxTravelHours,
      travelPreference,
    };

    createNewTrip({
      name: tripName.trim(),
      startDate,
      endDate,
      durationDays: Number(durationDays),
      travelers: formattedTravelers,
      preferences: prefs,
      overlapThreshold,
    });

    setStep(1);
  };

  return (
    <Modal
      isOpen={isCreateTripModalOpen}
      onClose={() => setIsCreateTripModalOpen(false)}
      title="Plan a New Group Trip"
      subtitle="Configure dates, multi-city group departures, and preferences"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Trip Basics' },
              { num: 2, label: 'Travelers & Cities' },
              { num: 3, label: 'Preferences' },
            ].map(s => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400">Step {step} of 3</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* STEP 1: TRIP BASICS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan Heritage Expedition"
                  value={tripName}
                  onChange={e => setTripName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 font-semibold"
                />
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Suggestions:</span>
                  {['Desert Dunes Escape', 'Monsoon Retreat', 'Holi Long Weekend', 'Goa Reunion 2027'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTripName(s)}
                      className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => handleDatesChange(e.target.value, endDate)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => handleDatesChange(startDate, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trip Duration
                  </label>
                  <div className="flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
                    {durationDays} Days
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 text-xs text-teal-800 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Next:</strong> Add travelers departing from Delhi, Bhopal, or other cities with their travel history so TripSync finds non-overlapping destinations.
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <span>Continue to Travelers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRAVELERS & CITIES */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Group Travelers & Starting Cities ({travelers.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Enter who is traveling and their visited history to ensure fresh destinations for everyone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTraveler}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold border border-teal-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Friend</span>
                </button>
              </div>

              {/* Travelers List */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {travelers.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700">Traveler #{idx + 1}</span>
                      {travelers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTraveler(idx)}
                          className="text-slate-400 hover:text-rose-500"
                          title="Remove traveler"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. Aarav)"
                        value={t.name}
                        onChange={e => handleUpdateTraveler(idx, { name: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Departure City (e.g. Delhi)"
                        value={t.departureCity}
                        onChange={e => handleUpdateTraveler(idx, { departureCity: e.target.value })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                      />
                      <select
                        value={t.preferredTransit}
                        onChange={e => handleUpdateTraveler(idx, { preferredTransit: e.target.value as TransitMode })}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="flight">Prefers Flight</option>
                        <option value="train">Prefers Train</option>
                        <option value="road">Prefers Road</option>
                        <option value="any">Any / Fastest</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Visited Places (e.g. Goa, Jaipur, Manali)"
                        value={t.visitedStr}
                        onChange={e => handleUpdateTraveler(idx, { visitedStr: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  <span>Continue to Preferences</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES & OVERLAP */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Overlap Threshold */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                    Maximum Group Overlap Limit
                  </span>
                  <span className="font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                    {overlapThreshold}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[0, 25, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOverlapThreshold(val)}
                      className={`p-2 rounded-xl text-xs text-center border font-semibold transition-all ${
                        overlapThreshold === val
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}% {val === 0 ? '(0 visited)' : val === 25 ? '(Max 1)' : '(Max 2)'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Allow destinations already visited by up to {overlapThreshold}% of the group.
                </p>
              </div>

              {/* Weather Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    Target Weather & Temperature Range
                  </span>
                  <span className="font-bold text-amber-700">
                    {tempMin}°C – {tempMax}°C
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {weatherPresets.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setTempMin(preset.min);
                        setTempMax(preset.max);
                      }}
                      className={`p-2 rounded-xl text-left border transition-all text-xs ${
                        tempMin === preset.min && tempMax === preset.max
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-semibold truncate">{preset.label}</div>
                      <div className="text-[10px] text-slate-500">{preset.min}°–{preset.max}°C</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Time Max */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Max Acceptable Travel Duration</span>
                  <span className="text-sky-700 font-bold">&le; {maxTravelHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  value={maxTravelHours}
                  onChange={e => setMaxTravelHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-700/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Trip & Find Destinations</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
