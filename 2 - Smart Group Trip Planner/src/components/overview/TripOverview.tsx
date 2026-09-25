import React from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CloudSun,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Plus
} from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { ScoreRing } from '../common/ScoreRing';
import { formatTransitHours } from '../../services/travelTimeService';

export const TripOverview: React.FC = () => {
  const {
    trip,
    destinations,
    scoresMap,
    setActiveTab,
    eligibleDestinationsCount,
    totalDestinationsCount,
    setIsCreateTripModalOpen,
  } = useTrip();

  // Sort destinations by compatibility
  const topRecommendations = [...destinations]
    .filter(d => !scoresMap[d.id]?.isExcludedByOverlap)
    .sort((a, b) => (scoresMap[b.id]?.overall || 0) - (scoresMap[a.id]?.overall || 0))
    .slice(0, 3);

  // Group average score of top eligible destinations
  const avgScore = topRecommendations.length
    ? Math.round(
        topRecommendations.reduce((acc, d) => acc + (scoresMap[d.id]?.overall || 0), 0) /
          topRecommendations.length
      )
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Smart Group Trip Planner</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {trip.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Coordinating a <strong>{trip.durationDays}-day</strong> winter escape for <strong>4 travelers</strong> departing from <strong>Delhi (3)</strong> and <strong>Bhopal (1)</strong>. Balanced for ideal late December weather and zero travel fatigue.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Calendar className="w-4 h-4 text-teal-400" />
                Dec 25 – Dec 29, 2026
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Users className="w-4 h-4 text-teal-400" />
                4 Friends (Aarav, Rohan, Priya, Karan)
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <SlidersHorizontal className="w-4 h-4 text-teal-400" />
                Max Overlap: {trip.overlapThreshold}%
              </span>
            </div>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('destinations')}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore {eligibleDestinationsCount} Eligible Places</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('itineraries')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs border border-slate-700/80 transition-all"
            >
              <span>View Itinerary Options ({trip.itineraries.length})</span>
            </button>

            <button
              onClick={() => setIsCreateTripModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold text-xs border border-teal-500/40 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Plan a New Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Group Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Eligible Destinations
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {eligibleDestinationsCount} <span className="text-sm font-medium text-slate-400">/ {totalDestinationsCount}</span>
            </div>
            <div className="text-xs text-teal-600 font-semibold mt-1">
              Passing &le;{trip.overlapThreshold}% overlap rule
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Compatibility
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {avgScore}%
            </div>
            <div className="text-xs text-teal-600 font-semibold mt-1">
              High multi-factor alignment
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Weather Target
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {trip.preferences.preferredTempMin}°–{trip.preferences.preferredTempMax}°C
            </div>
            <div className="text-xs text-amber-600 font-semibold mt-1">
              Crisp winter sunshine
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CloudSun className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Travel Time Limit
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              &le; {trip.preferences.maxAcceptableTravelTime} Hours
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Delhi & Bhopal departures
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top 3 Destination Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Highest Compatibility Picks for the Group</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ranked highest based on travel history newness, weather comfort, and transit times.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('destinations')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View All ({destinations.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRecommendations.map((dest, idx) => {
            const score = scoresMap[dest.id];
            const rankLabel = idx === 0 ? '🥇 #1 Pick' : idx === 1 ? '🥈 #2 Pick' : '🥉 #3 Pick';

            return (
              <div
                key={dest.id}
                onClick={() => setActiveTab('destinations')}
                className="cursor-pointer group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all"
              >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={dest.heroImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-900/90 text-white backdrop-blur-md shadow-md">
                    {rankLabel}
                  </div>

                  <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-1.5 shadow-md">
                    <ScoreRing score={score?.overall || 0} size="sm" />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-xs text-teal-300 font-semibold">{dest.state}</div>
                    <div className="text-xl font-bold">{dest.name}</div>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-teal-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        {score?.newnessPercentage}% New to Group
                      </span>
                      <span>
                        {dest.baseWeather.tempMax}°C / {dest.baseWeather.tempMin}°C
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {dest.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Ideal {dest.idealDaysMin}–{dest.idealDaysMax} Days
                    </span>
                    <span className="text-teal-600 font-bold flex items-center gap-0.5">
                      Explore Place <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Travel Scenario Card */}
      <div className="p-6 rounded-3xl bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Scenario Active: Delhi & Bhopal Travelers</span>
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Delhi (3 Travelers) & Bhopal (1 Traveler) Winter Getaway
          </h4>
          <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
            Aarav, Rohan, and Priya depart from Delhi; Karan departs from Bhopal. Preloaded visited destinations (Goa, Jaipur, Manali, Udaipur) automatically inform the overlap algorithm so you get fresh suggestions like Jaisalmer and Jodhpur.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('group')}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
        >
          Manage Travelers & Past Trips
        </button>
      </div>
    </div>
  );
};
