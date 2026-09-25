import React from 'react';
import {
  Clock,
  MapPin,
  IndianRupee,
  Utensils,
  Camera,
  Car,
  Hotel,
  Palmtree,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';
import { ItineraryDay, Activity } from '../../types/trip';

interface DayTimelineProps {
  day: ItineraryDay;
  itineraryId: string;
  onEditActivity: (dayNumber: number, activity: Activity) => void;
  onAddActivity: (dayNumber: number) => void;
  onReorderActivity: (dayNumber: number, fromIdx: number, toIdx: number) => void;
  onDeleteActivity: (dayNumber: number, activityId: string) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  day,
  itineraryId,
  onEditActivity,
  onAddActivity,
  onReorderActivity,
  onDeleteActivity,
}) => {
  const getCategoryConfig = (cat: Activity['category']) => {
    switch (cat) {
      case 'dining':
        return { icon: Utensils, label: 'Dining', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'travel':
        return { icon: Car, label: 'Transit', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'stay':
        return { icon: Hotel, label: 'Stay', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'leisure':
        return { icon: Palmtree, label: 'Leisure', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'sightseeing':
      default:
        return { icon: Camera, label: 'Sightseeing', badge: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 pb-8 last:pb-2 border-l-2 border-teal-200/80 ml-3 sm:ml-4">
      {/* Day Marker Dot on Connector */}
      <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-slate-900 text-teal-400 border-4 border-slate-50 flex items-center justify-center text-xs font-black shadow-md">
        {day.dayNumber}
      </div>

      {/* Day Header */}
      <div className="mb-4 pt-0.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                {day.dateStr}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-slate-400" />
                {day.location}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {day.title}
            </h4>
          </div>

          <button
            onClick={() => onAddActivity(day.dayNumber)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-semibold transition-all border border-slate-200/80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Activities Timeline Cards */}
      <div className="space-y-3">
        {day.activities.map((activity, idx) => {
          const config = getCategoryConfig(activity.category);
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className="group relative p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left: Time & Details */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Category Icon Badge */}
                <div className={`p-2 rounded-xl border ${config.badge} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {activity.time}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${config.badge}`}>
                      {config.label}
                    </span>
                    {activity.location && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {activity.location}
                      </span>
                    )}
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 tracking-tight">
                    {activity.title}
                  </h5>

                  {activity.notes && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {activity.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Cost & Interactive Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {activity.costEstimateInr !== undefined && (
                  <div className="flex items-center text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-500 mr-0.5" />
                    <span>{activity.costEstimateInr.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Reorder and Edit Buttons */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                  <button
                    disabled={idx === 0}
                    onClick={() => onReorderActivity(day.dayNumber, idx, idx - 1)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === day.activities.length - 1}
                    onClick={() => onReorderActivity(day.dayNumber, idx, idx + 1)}
                    className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
                    title="Move later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditActivity(day.dayNumber, activity)}
                    className="p-1 text-slate-500 hover:text-teal-600 rounded-md transition-colors"
                    title="Edit activity"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteActivity(day.dayNumber, activity.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
