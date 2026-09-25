import React from 'react';
import {
  MapPin,
  CloudSun,
  Clock,
  Users,
  Sparkles,
  Ban,
  Check,
  ChevronRight,
  PlusCircle,
  Scale
} from 'lucide-react';
import { Destination, CompatibilityScore } from '../../types/trip';
import { ScoreRing } from '../common/ScoreRing';
import { formatTransitHours } from '../../services/travelTimeService';
import { useTrip } from '../../context/TripContext';

interface DestinationCardProps {
  destination: Destination;
  score: CompatibilityScore;
  onOpenDetails: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  score,
  onOpenDetails,
}) => {
  const {
    selectedForCompare,
    toggleCompareDestination,
    createItineraryFromDestination,
    trip,
  } = useTrip();

  const isSelectedForCompare = selectedForCompare.includes(destination.id);
  const isExcluded = score.isExcludedByOverlap;

  // Travel time summary from Delhi & Bhopal
  const delhiTime = destination.travelTimes['Delhi']?.flight || destination.travelTimes['Delhi']?.train || 2;
  const bhopalTime = destination.travelTimes['Bhopal']?.flight || destination.travelTimes['Bhopal']?.train || 5;

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-xl ${
        isExcluded
          ? 'opacity-65 hover:opacity-90 border-slate-200 bg-slate-50/50'
          : 'border-slate-200/90 hover:border-teal-400/80'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Location & Tags on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 mb-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{destination.state}, India</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
              {destination.name}
            </h3>
          </div>

          {/* Quick Compare Checkbox on Image */}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleCompareDestination(destination.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isSelectedForCompare
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white'
            }`}
            title={isSelectedForCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <Scale className="w-4 h-4" />
          </button>
        </div>

        {/* Top Badges (Newness & Overlap Exclusion) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isExcluded ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600/95 text-white shadow-md backdrop-blur-md">
              <Ban className="w-3.5 h-3.5" />
              Excluded · &gt;{trip.overlapThreshold}% Overlap
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/95 text-slate-950 shadow-md backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              {score.newnessPercentage}% New to Group
            </span>
          )}

          {destination.baseWeather.isLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Weather
            </span>
          )}
        </div>

        {/* Compatibility Score Dial (Top Right) */}
        <div className="absolute top-3 right-3 bg-white/95 rounded-2xl p-1.5 shadow-lg backdrop-blur-md border border-white/60">
          <ScoreRing score={score.overall} size="sm" />
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Key Metrics Row: Weather & Travel Time */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            {/* Weather Metric */}
            <div className="flex items-start gap-2">
              <CloudSun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">
                  {destination.baseWeather.tempMax}°C / {destination.baseWeather.tempMin}°C
                </div>
                <div className="text-[11px] text-slate-500 truncate" title={destination.baseWeather.condition}>
                  {destination.baseWeather.condition}
                </div>
              </div>
            </div>

            {/* Travel Time Metric */}
            <div className="flex items-start gap-2 border-l border-slate-200/80 pl-2">
              <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">
                  {formatTransitHours(delhiTime)} Del · {formatTransitHours(bhopalTime)} Bho
                </div>
                <div className="text-[11px] text-slate-500">
                  Max: {formatTransitHours(score.maxTravelTimeHours)}
                </div>
              </div>
            </div>
          </div>

          {/* Group Visited History Indicator */}
          <div className="flex items-center justify-between text-xs py-1 px-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {score.visitedCount === 0 ? (
                  <strong className="text-teal-700 font-semibold">Unvisited by all 4 members</strong>
                ) : (
                  <span>
                    <strong>{score.visitedCount}</strong> of {trip.travelers.length} visited
                  </span>
                )}
              </span>
            </div>

            {/* Traveler Visited Avatars */}
            {score.visitedBy.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>Visited by:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[110px]" title={score.visitedBy.join(', ')}>
                  {score.visitedBy.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Tags Chips */}
          <div className="flex flex-wrap gap-1.5">
            {destination.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {destination.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(destination)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <span>Score Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => createItineraryFromDestination(destination)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/60 rounded-xl text-xs font-semibold transition-colors"
            title="Create an itinerary for this destination"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
