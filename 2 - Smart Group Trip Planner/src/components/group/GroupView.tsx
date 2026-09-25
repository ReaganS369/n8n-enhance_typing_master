import React, { useState } from 'react';
import { Users, UserPlus, MapPin, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { TravelerCard } from './TravelerCard';
import { OverlapMatrix } from './OverlapMatrix';
import { Modal } from '../common/Modal';
import { TransitMode } from '../../types/trip';

export const GroupView: React.FC = () => {
  const { trip, addTraveler } = useTrip();
  const travelers = trip.travelers;

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [departureCity, setDepartureCity] = useState('Delhi');
  const [role, setRole] = useState('Traveler');
  const [preferredTransit, setPreferredTransit] = useState<TransitMode>('flight');
  const [initialVisited, setInitialVisited] = useState('');

  const handleAddTraveler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const visitedList = initialVisited
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    addTraveler({
      name: name.trim(),
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 90000000)}?auto=format&fit=crop&w=200&h=200&q=80`,
      departureCity: departureCity.trim(),
      preferredTransit,
      visitedDestinations: visitedList,
      role: role.trim() || 'Traveler',
    });

    setName('');
    setDepartureCity('Delhi');
    setInitialVisited('');
    setAddModalOpen(false);
  };

  // Group summary metrics
  const delhiCount = travelers.filter(t => t.departureCity.toLowerCase().includes('delhi')).length;
  const bhopalCount = travelers.filter(t => t.departureCity.toLowerCase().includes('bhopal')).length;
  const otherCities = travelers.length - delhiCount - bhopalCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Travelers & Travel Histories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Group Coordination & Origins
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Managing departures from multiple cities and tracking individual travel histories so everyone discovers somewhere exciting.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="self-start md:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-700/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Traveler</span>
        </button>
      </div>

      {/* Quick Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg">
            {travelers.length}
          </div>
          <div>
            <div className="text-xs text-slate-500">Group Members</div>
            <div className="text-sm font-bold text-slate-900">
              {delhiCount} from Delhi · {bhopalCount} from Bhopal
              {otherCities > 0 && ` · ${otherCities} others`}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Target Season</div>
            <div className="text-sm font-bold text-slate-900">
              Late December (4–5 Days)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Overlap Filter Rule</div>
            <div className="text-sm font-bold text-slate-900">
              Max {trip.overlapThreshold}% overlap allowed
            </div>
          </div>
        </div>
      </div>

      {/* Traveler Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Traveler Profiles & Visited Places
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travelers.map(traveler => (
            <TravelerCard key={traveler.id} traveler={traveler} />
          ))}
        </div>
      </div>

      {/* Group Travel History Heatmap Matrix */}
      <OverlapMatrix />

      {/* Add Traveler Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Traveler to Group"
        subtitle="Include another friend's departure city and travel preferences"
        maxWidth="md"
      >
        <form onSubmit={handleAddTraveler} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha Patel"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delhi, Bhopal, Mumbai"
                value={departureCity}
                onChange={e => setDepartureCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group Role / Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Navigator, Foodie"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Transit Mode
            </label>
            <select
              value={preferredTransit}
              onChange={e => setPreferredTransit(e.target.value as TransitMode)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
            >
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="road">Road</option>
              <option value="any">Fastest / Any</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Already Visited Destinations (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Goa, Jaipur, Manali"
              value={initialVisited}
              onChange={e => setInitialVisited(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              You can also click to add or remove places on their profile card later.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
            >
              Add Traveler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
