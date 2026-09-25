import React from 'react';
import {
  MapPin,
  CloudSun,
  Clock,
  Users,
  Sparkles,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  Plane,
  Train,
  Car,
  Compass,
  ArrowRight,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { Destination, CompatibilityScore } from '../../types/trip';
import { Modal } from '../common/Modal';
import { ScoreRing } from '../common/ScoreRing';
import { formatTransitHours } from '../../services/travelTimeService';
import { useTrip } from '../../context/TripContext';

interface DestinationDetailModalProps {
  destination: Destination | null;
  score: CompatibilityScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  score,
  isOpen,
  onClose,
}) => {
  const { trip, createItineraryFromDestination, toggleCompareDestination, selectedForCompare } = useTrip();

  if (!destination || !score) return null;

  const isSelectedForCompare = selectedForCompare.includes(destination.id);

  const getFactorColor = (val: number) => {
    if (val >= 85) return 'bg-teal-500';
    if (val >= 70) return 'bg-sky-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="-m-6">
        {/* Hero Header Banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold mb-1">
                <MapPin className="w-4 h-4" />
                <span>{destination.state}, {destination.region} India</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {destination.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 italic mt-1 max-w-xl">
                &ldquo;{destination.highlightQuote}&rdquo;
              </p>
            </div>

            {/* Score Pill in Banner */}
            <div className="bg-white/95 rounded-2xl p-3 shadow-xl backdrop-blur-md flex items-center gap-3 shrink-0">
              <ScoreRing score={score.overall} size="md" />
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Compatibility
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {score.overall >= 85 ? '🌟 Excellent Match' : score.overall >= 70 ? '👍 Strong Option' : '⚠️ Minor Tradeoffs'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Overlap Status Callout */}
          {score.isExcludedByOverlap ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Destination Excluded by Group Overlap Policy</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Visited by {score.visitedCount} of {trip.travelers.length} members ({Math.round((score.visitedCount / trip.travelers.length) * 100)}%), which exceeds your current Maximum Group Overlap threshold of <strong>{trip.overlapThreshold}%</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Eligible for Group Itinerary</h4>
                <p className="text-xs text-teal-800 mt-0.5">
                  Meets your Maximum Group Overlap threshold (&le; {trip.overlapThreshold}%). Visited by {score.visitedCount} of {trip.travelers.length} members ({score.newnessPercentage}% group newness).
                </p>
              </div>
            </div>
          )}

          {/* Section: Transparent Score Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transparent Score Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Every point is calculated directly from group dates, locations, and travel histories.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100">
                Formula Weights: 35% Newness · 25% Weather · 25% Transit · 15% Days
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Factor 1: Group Overlap & Newness */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    Group Overlap & Newness (35%)
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {score.groupNewnessScore} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${getFactorColor(score.groupNewnessScore)} transition-all duration-500`}
                    style={{ width: `${score.groupNewnessScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {score.visitedCount === 0
                    ? '100% Brand new destination for all 4 group members!'
                    : `Visited by ${score.visitedBy.join(', ')} (${score.visitedCount} members). ${score.newnessPercentage}% newness score.`}
                </p>
              </div>

              {/* Factor 2: Weather Suitability */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    Weather Suitability (25%)
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {score.weatherScore} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${getFactorColor(score.weatherScore)} transition-all duration-500`}
                    style={{ width: `${score.weatherScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {score.weatherSuitabilityDetail} Expected {destination.baseWeather.tempMin}°C to {destination.baseWeather.tempMax}°C ({destination.baseWeather.condition}).
                </p>
              </div>

              {/* Factor 3: Travel Accessibility */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" />
                    Travel Accessibility (25%)
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {score.travelAccessibilityScore} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${getFactorColor(score.travelAccessibilityScore)} transition-all duration-500`}
                    style={{ width: `${score.travelAccessibilityScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  {score.accessibilityDetail}
                </p>
              </div>

              {/* Factor 4: Trip Duration Fit */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Trip Duration Fit (15%)
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {score.durationScore} / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${getFactorColor(score.durationScore)} transition-all duration-500`}
                    style={{ width: `${score.durationScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  Destination ideally needs {destination.idealDaysMin}–{destination.idealDaysMax} days. Your group trip is planned for {trip.durationDays} days.
                </p>
              </div>
            </div>
          </div>

          {/* Individual Traveler Transit Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600" />
              Member Travel Logistics (Delhi & Bhopal Departures)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {score.travelTimeBreakdown.map(item => (
                <div
                  key={item.travelerId}
                  className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs text-xs"
                >
                  <div className="font-semibold text-slate-800">{item.travelerName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Departing: {item.departureCity}</div>
                  <div className="mt-2 flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1 capitalize text-slate-700">
                      {item.mode === 'flight' && <Plane className="w-3.5 h-3.5 text-teal-600" />}
                      {item.mode === 'train' && <Train className="w-3.5 h-3.5 text-sky-600" />}
                      {item.mode === 'road' && <Car className="w-3.5 h-3.5 text-amber-600" />}
                      {item.mode}
                    </span>
                    <span className={`font-bold ${item.isExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatTransitHours(item.timeHours)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Attractions & Daily Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Top Attractions & Experiences
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {destination.popularAttractions.map(attraction => (
                  <li key={attraction} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{attraction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Estimated Group Budget
                </h4>
                <div className="text-2xl font-black text-slate-900 flex items-center">
                  <IndianRupee className="w-5 h-5 text-slate-600" />
                  <span>{destination.avgDailyBudgetInr.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-normal text-slate-500 ml-1">/ day / person</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Total for 4 travelers for {trip.durationDays} days: approx ₹{(destination.avgDailyBudgetInr * trip.durationDays * 4).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => toggleCompareDestination(destination.id)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isSelectedForCompare
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSelectedForCompare ? '✓ Selected for Compare' : '+ Add to Side-by-Side Compare'}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  createItineraryFromDestination(destination);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-700/20 transition-all"
              >
                <span>Plan {destination.name} Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
