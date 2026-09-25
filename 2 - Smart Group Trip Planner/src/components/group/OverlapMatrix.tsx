import React from 'react';
import { Check, X, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const OverlapMatrix: React.FC = () => {
  const { trip, destinations, scoresMap } = useTrip();
  const travelers = trip.travelers;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Group Travel History Heatmap
          </h3>
          <p className="text-xs text-slate-500">
            See at a glance who has visited which destination. Places exceeding your {trip.overlapThreshold}% overlap threshold are flagged.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            0% Overlap (Brand New)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Excluded (&gt;{trip.overlapThreshold}%)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="py-3 px-3 font-bold text-slate-700">Destination</th>
              {travelers.map(t => (
                <th key={t.id} className="py-3 px-3 font-semibold text-slate-800 text-center">
                  <div className="flex flex-col items-center">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-6 h-6 rounded-full object-cover mb-1 ring-1 ring-slate-300"
                    />
                    <span className="truncate max-w-[80px]">{t.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({t.departureCity})</span>
                  </div>
                </th>
              ))}
              <th className="py-3 px-3 font-bold text-slate-700 text-center">Visited Count</th>
              <th className="py-3 px-3 font-bold text-slate-700 text-center">Overlap Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {destinations.map(dest => {
              const score = scoresMap[dest.id];
              const isExcluded = score?.isExcludedByOverlap;
              const visitedCount = score?.visitedCount || 0;
              const overlapPct = Math.round((visitedCount / travelers.length) * 100);

              return (
                <tr
                  key={dest.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isExcluded ? 'bg-rose-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <img
                        src={dest.heroImage}
                        alt={dest.name}
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{dest.name}</div>
                        <div className="text-[10px] text-slate-400">{dest.state}</div>
                      </div>
                    </div>
                  </td>

                  {travelers.map(t => {
                    const hasVisited = t.visitedDestinations.some(v => {
                      const vLower = v.toLowerCase().trim();
                      const dLower = dest.name.toLowerCase().trim();
                      return vLower === dLower || dLower.includes(vLower) || vLower.includes(dLower);
                    });

                    return (
                      <td key={t.id} className="py-3 px-3 text-center">
                        {hasVisited ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-200" />
                        )}
                      </td>
                    );
                  })}

                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {visitedCount} / {travelers.length} ({overlapPct}%)
                  </td>

                  <td className="py-3 px-3 text-center">
                    {isExcluded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Excluded (&gt;{trip.overlapThreshold}%)
                      </span>
                    ) : visitedCount === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        100% Brand New
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Eligible ({score?.newnessPercentage}% New)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
