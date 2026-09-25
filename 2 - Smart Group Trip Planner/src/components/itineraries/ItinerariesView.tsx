import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Copy,
  Scale,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  IndianRupee,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { Activity, Itinerary } from '../../types/trip';
import { DayTimeline } from './DayTimeline';
import { ActivityEditModal } from './ActivityEditModal';
import { ItineraryCompareModal } from './ItineraryCompareModal';
import { Modal } from '../common/Modal';

export const ItinerariesView: React.FC = () => {
  const {
    trip,
    duplicateItinerary,
    deleteItinerary,
    saveItinerary,
    reorderActivity,
    addActivityToDay,
    updateActivity,
    deleteActivity,
    destinations,
  } = useTrip();

  const itineraries = trip.itineraries;
  const [selectedItinId, setSelectedItinId] = useState<string>(
    itineraries[0]?.id || ''
  );

  const activeItinerary = itineraries.find(i => i.id === selectedItinId) || itineraries[0];

  // Activity Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDayNumber, setEditingDayNumber] = useState(1);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Compare Itineraries Modal
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // New Itinerary Modal
  const [newItinModalOpen, setNewItinModalOpen] = useState(false);
  const [newItinName, setNewItinName] = useState('');
  const [newItinTheme, setNewItinTheme] = useState<Itinerary['themeTag']>('Relaxed');
  const [newItinDays, setNewItinDays] = useState(4);
  const [newItinDestId, setNewItinDestId] = useState(destinations[0]?.id || '');

  const handleEditActivity = (dayNumber: number, activity: Activity) => {
    setEditingDayNumber(dayNumber);
    setEditingActivity(activity);
    setEditModalOpen(true);
  };

  const handleAddActivity = (dayNumber: number) => {
    setEditingDayNumber(dayNumber);
    setEditingActivity(null);
    setEditModalOpen(true);
  };

  const handleSaveActivity = (data: Omit<Activity, 'id'>) => {
    if (!activeItinerary) return;
    if (editingActivity) {
      updateActivity(activeItinerary.id, editingDayNumber, editingActivity.id, data);
    } else {
      addActivityToDay(activeItinerary.id, editingDayNumber, data);
    }
  };

  const handleCreateItinerary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItinName.trim()) return;

    const chosenDest = destinations.find(d => d.id === newItinDestId) || destinations[0];
    const days = Array.from({ length: newItinDays }, (_, i) => ({
      dayNumber: i + 1,
      dateStr: `Day ${i + 1}`,
      title: i === 0 ? `Arrival & Explore ${chosenDest.name}` : `Sightseeing in ${chosenDest.name}`,
      location: chosenDest.name,
      activities: [
        {
          id: `act-${Date.now()}-${i}-1`,
          time: '09:30 AM',
          title: chosenDest.popularAttractions[i % chosenDest.popularAttractions.length] || `Discover ${chosenDest.name}`,
          category: 'sightseeing' as const,
          location: chosenDest.name,
          costEstimateInr: 500,
          notes: 'Top group recommendation'
        },
        {
          id: `act-${Date.now()}-${i}-2`,
          time: '01:00 PM',
          title: 'Lunch at Local Heritage Restaurant',
          category: 'dining' as const,
          location: chosenDest.name,
          costEstimateInr: 600,
          notes: 'Traditional regional cuisine'
        }
      ]
    }));

    const newItin: Itinerary = {
      id: `itin-${Date.now()}`,
      name: newItinName.trim(),
      subtitle: `${chosenDest.name} · ${newItinDays} Days · Group Custom Plan`,
      themeTag: newItinTheme,
      daysCount: newItinDays,
      destinationIds: [chosenDest.id],
      destinationNames: [chosenDest.name],
      estimatedTotalBudgetInr: chosenDest.avgDailyBudgetInr * newItinDays,
      days,
      isCustom: true
    };

    saveItinerary(newItin);
    setSelectedItinId(newItin.id);
    setNewItinModalOpen(false);
    setNewItinName('');
  };

  if (!activeItinerary) {
    return (
      <div className="text-center py-16">
        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No itineraries created yet</h3>
        <button
          onClick={() => setNewItinModalOpen(true)}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
        >
          Create First Itinerary
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header and Option Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Interactive Itinerary Options</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Curated Group Itineraries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reorder activities, customize timings, or duplicate options to compare different group paces.
          </p>
        </div>

        {/* Global Itinerary Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
          >
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Compare Options</span>
          </button>

          <button
            onClick={() => duplicateItinerary(activeItinerary.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs transition-all"
            title="Duplicate active itinerary"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => setNewItinModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-700/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Itinerary</span>
          </button>
        </div>
      </div>

      {/* Itinerary Tab Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {itineraries.map(itin => {
          const isSelected = itin.id === activeItinerary.id;
          return (
            <button
              key={itin.id}
              onClick={() => setSelectedItinId(itin.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{itin.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {itin.themeTag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Itinerary Hero Overview Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {activeItinerary.themeTag} Circuit
            </span>
            <span className="text-xs text-slate-300">
              {activeItinerary.daysCount} Days ({trip.durationDays} Days planned)
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {activeItinerary.destinationNames.join(' + ')}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {activeItinerary.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {activeItinerary.subtitle}
          </p>
        </div>

        {/* Budget Pill & Delete Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-right">
            <div className="text-[11px] text-slate-400">Est. Group Total Budget</div>
            <div className="text-lg font-black text-teal-300 flex items-center justify-end">
              <IndianRupee className="w-4 h-4 text-slate-400" />
              <span>{(activeItinerary.estimatedTotalBudgetInr * trip.travelers.length).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {itineraries.length > 1 && (
            <button
              onClick={() => deleteItinerary(activeItinerary.id)}
              className="p-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl border border-slate-700/60 transition-colors"
              title="Delete this itinerary"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Day-by-Day Interactive Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Day-by-Day Group Schedule
            </h4>
            <p className="text-xs text-slate-500">
              Use the arrow buttons on each card to reorder activities. Click edit to adjust times and notes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {activeItinerary.days.map(day => (
            <DayTimeline
              key={day.dayNumber}
              day={day}
              itineraryId={activeItinerary.id}
              onEditActivity={handleEditActivity}
              onAddActivity={handleAddActivity}
              onReorderActivity={(dayNum, fromIdx, toIdx) =>
                reorderActivity(activeItinerary.id, dayNum, fromIdx, toIdx)
              }
              onDeleteActivity={(dayNum, actId) =>
                deleteActivity(activeItinerary.id, dayNum, actId)
              }
            />
          ))}
        </div>
      </div>

      {/* Activity Edit Modal */}
      <ActivityEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        activity={editingActivity}
        dayNumber={editingDayNumber}
        onSave={handleSaveActivity}
      />

      {/* Compare Itineraries Modal */}
      <ItineraryCompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onSelectItinerary={id => setSelectedItinId(id)}
      />

      {/* Create New Itinerary Modal */}
      <Modal
        isOpen={newItinModalOpen}
        onClose={() => setNewItinModalOpen(false)}
        title="Create New Group Itinerary"
        subtitle="Design a custom timeline from scratch"
        maxWidth="md"
      >
        <form onSubmit={handleCreateItinerary} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Itinerary Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Option D — Royal Heritage Trail"
              value={newItinName}
              onChange={e => setNewItinName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Theme / Pace
              </label>
              <select
                value={newItinTheme}
                onChange={e => setNewItinTheme(e.target.value as Itinerary['themeTag'])}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              >
                <option value="Relaxed">Relaxed</option>
                <option value="Culture">Culture</option>
                <option value="Multi-city">Multi-city</option>
                <option value="Adventure">Adventure</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newItinDays}
                onChange={e => setNewItinDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Destination
            </label>
            <select
              value={newItinDestId}
              onChange={e => setNewItinDestId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewItinModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Create Itinerary
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
