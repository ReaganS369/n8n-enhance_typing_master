import React, { useState } from 'react';
import {
  MapPin,
  Plane,
  Train,
  Car,
  Compass,
  Plus,
  X,
  Trash2,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { Traveler, TransitMode } from '../../types/trip';
import { useTrip } from '../../context/TripContext';

interface TravelerCardProps {
  traveler: Traveler;
}

export const TravelerCard: React.FC<TravelerCardProps> = ({ traveler }) => {
  const {
    updateTraveler,
    removeTraveler,
    addVisitedDestination,
    removeVisitedDestination,
    trip,
  } = useTrip();

  const [newCityInput, setNewCityInput] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);

  const transitIcon = {
    flight: Plane,
    train: Train,
    road: Car,
    any: Compass,
  }[traveler.preferredTransit];
  const TransitIcon = transitIcon;

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;
    addVisitedDestination(traveler.id, newCityInput.trim());
    setNewCityInput('');
    setIsAddingCity(false);
  };

  const quickCitySuggestions = ['Delhi', 'Goa', 'Jaipur', 'Manali', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Agra', 'Varanasi', 'Mumbai', 'Shimla', 'Kerala']
    .filter(c => !traveler.visitedDestinations.some(v => v.toLowerCase() === c.toLowerCase()));

  return (
    <div className="flex flex-col justify-between p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
      <div>
        {/* Top Header: Avatar, Name & Departure */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={traveler.avatar}
              alt={traveler.name}
              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-500/30 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-base text-slate-900">{traveler.name}</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium">{traveler.role || 'Traveler'}</p>

              {/* Departure City Pill */}
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  Departs from {traveler.departureCity}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <TransitIcon className="w-3 h-3 text-slate-500" />
                  <span className="capitalize">{traveler.preferredTransit}</span>
                </span>
              </div>
            </div>
          </div>

          {trip.travelers.length > 1 && (
            <button
              onClick={() => removeTraveler(traveler.id)}
              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-colors"
              title="Remove traveler"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Visited Destinations Section */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              Visited History ({traveler.visitedDestinations.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Affects group overlap score
            </span>
          </div>

          {/* Visited Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[40px]">
            {traveler.visitedDestinations.length === 0 ? (
              <span className="text-xs text-slate-400 italic py-1">
                No past destinations logged yet.
              </span>
            ) : (
              traveler.visitedDestinations.map(city => (
                <span
                  key={city}
                  className="group/chip inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span>{city}</span>
                  <button
                    onClick={() => removeVisitedDestination(traveler.id, city)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
                    title={`Remove ${city}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add City Input / Button */}
          {isAddingCity ? (
            <form onSubmit={handleAddCity} className="flex items-center gap-1.5 mt-2">
              <input
                type="text"
                autoFocus
                placeholder="City name (e.g. Udaipur)..."
                value={newCityInput}
                onChange={e => setNewCityInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs border border-teal-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCity(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAddingCity(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Visited Place</span>
              </button>

              {/* Quick Suggestions Chips */}
              {quickCitySuggestions.slice(0, 3).map(city => (
                <button
                  key={city}
                  onClick={() => addVisitedDestination(traveler.id, city)}
                  className="px-2 py-0.5 text-[11px] text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-dashed border-slate-200"
                >
                  +{city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transit Preference Quick Switcher */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">Preferred Transit:</span>
        <select
          value={traveler.preferredTransit}
          onChange={e => updateTraveler(traveler.id, { preferredTransit: e.target.value as TransitMode })}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold focus:outline-none cursor-pointer"
        >
          <option value="flight">Flight</option>
          <option value="train">Train</option>
          <option value="road">Road</option>
          <option value="any">Fastest / Any</option>
        </select>
      </div>
    </div>
  );
};
