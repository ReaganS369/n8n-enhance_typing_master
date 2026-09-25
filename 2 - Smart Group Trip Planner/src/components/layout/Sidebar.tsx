import React from 'react';
import {
  Compass,
  MapPin,
  CalendarDays,
  Users,
  Settings,
  CloudSun,
  RefreshCw,
  Sparkles,
  Plane,
  Plus
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { ActiveNavTab } from '../../types/trip';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    trip,
    eligibleDestinationsCount,
    syncLiveWeather,
    isLiveWeatherLoading,
    setIsCreateTripModalOpen,
  } = useTrip();

  const navItems: { id: ActiveNavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'overview', label: 'Trip Overview', icon: Compass },
    { id: 'destinations', label: 'Destinations', icon: MapPin, badge: eligibleDestinationsCount },
    { id: 'itineraries', label: 'Itineraries', icon: CalendarDays, badge: trip.itineraries.length },
    { id: 'group', label: 'Group & History', icon: Users, badge: trip.travelers.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none">
      {/* Brand & App Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-900/30">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">TripSync</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">Smart Group Travel</p>
          </div>
        </div>
      </div>

      {/* Active Trip Context Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Active Trip
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-900/40 text-teal-300 border border-teal-800/60">
            {trip.durationDays} Days
          </span>
        </div>
        <h4 className="font-semibold text-sm text-white truncate" title={trip.name}>
          {trip.name}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Group Avatars in Sidebar */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-700/40">
          <div className="flex -space-x-2">
            {trip.travelers.map(t => (
              <img
                key={t.id}
                src={t.avatar}
                alt={t.name}
                title={`${t.name} (from ${t.departureCity})`}
                className="w-6 h-6 rounded-full ring-2 ring-slate-800 object-cover"
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            3 Delhi · 1 Bhopal
          </span>
        </div>

        {/* Plan New Trip Button */}
        <button
          onClick={() => setIsCreateTripModalOpen(true)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white rounded-lg text-xs font-bold shadow-md shadow-teal-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Start a New Trip</span>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-teal-700/80 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Live Weather Sync */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => syncLiveWeather()}
          disabled={isLiveWeatherLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isLiveWeatherLoading ? 'animate-spin' : ''}`} />
          <span>{isLiveWeatherLoading ? 'Syncing Weather...' : 'Sync Open-Meteo'}</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5 text-amber-400/80" /> Open-Meteo Live API
          </span>
          <span className="text-teal-400">Connected</span>
        </div>
      </div>
    </aside>
  );
};
