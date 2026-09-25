import React from 'react';
import {
  X,
  Scale,
  CloudSun,
  Clock,
  Users,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ScoreRing } from '../common/ScoreRing';
import { useTrip } from '../../context/TripContext';
import { formatTransitHours } from '../../services/travelTimeService';

export const CompareModal: React.FC = () => {
  const {
    selectedForCompare,
    toggleCompareDestination,
    clearCompareDestinations,
    isCompareModalOpen,
    setIsCompareModalOpen,
    destinations,
    scoresMap,
    trip,
    createItineraryFromDestination,
  } = useTrip();

  const selectedDests = destinations.filter(d => selectedForCompare.includes(d.id));

  return (
    <Modal
      isOpen={isCompareModalOpen}
      onClose={() => setIsCompareModalOpen(false)}
      title="Destination Side-by-Side Comparison"
      subtitle={`Comparing ${selectedDests.length} destinations for your 4-member group`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {selectedDests.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No destinations selected for comparison</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click the scale icon on any destination card to add it here and compare weather, travel time, and overlap side by side.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500">
                Tip: Compare up to 4 destinations at once.
              </span>
              <button
                onClick={clearCompareDestinations}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Clear all
              </button>
            </div>

            {/* Scrollable comparison grid */}
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                {/* Header Row: Photos & Names */}
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-3 w-40 font-bold text-slate-500 bg-slate-50/50">
                      Feature
                    </th>
                    {selectedDests.map(d => {
                      const score = scoresMap[d.id];
                      return (
                        <th key={d.id} className="py-3 px-3 min-w-[200px]">
                          <div className="relative rounded-xl overflow-hidden mb-2 h-28 bg-slate-100">
                            <img
                              src={d.heroImage}
                              alt={d.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => toggleCompareDestination(d.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-lg"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 left-2 text-white font-bold text-sm drop-shadow">
                              {d.name}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {d.state}
                            </span>
                            {score && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                {score.overall} / 100
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* Overall Compatibility */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      Overall Match Score
                    </td>
                    {selectedDests.map(d => {
                      const score = scoresMap[d.id];
                      return (
                        <td key={d.id} className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <ScoreRing score={score?.overall || 0} size="sm" />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {score?.overall || 0}%
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {score?.isExcludedByOverlap ? 'Excluded by Overlap' : 'Eligible'}
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Group Overlap */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span>Group Overlap</span>
                      </div>
                    </td>
                    {selectedDests.map(d => {
                      const score = scoresMap[d.id];
                      return (
                        <td key={d.id} className="py-3.5 px-3">
                          <div className="font-bold text-slate-800">
                            {score?.visitedCount === 0 ? '0 members (100% New)' : `${score?.visitedCount} of 4 visited`}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {score?.visitedBy.length ? `Visited: ${score.visitedBy.join(', ')}` : 'Fresh for all 4'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Weather & Climate */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <CloudSun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Weather (Late Dec)</span>
                      </div>
                    </td>
                    {selectedDests.map(d => (
                      <td key={d.id} className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          {d.baseWeather.tempMax}°C / {d.baseWeather.tempMin}°C
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {d.baseWeather.condition}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Travel Time */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Travel Duration</span>
                      </div>
                    </td>
                    {selectedDests.map(d => {
                      const score = scoresMap[d.id];
                      const delhi = d.travelTimes['Delhi']?.flight || d.travelTimes['Delhi']?.train || 2;
                      const bhopal = d.travelTimes['Bhopal']?.flight || d.travelTimes['Bhopal']?.train || 5;
                      return (
                        <td key={d.id} className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">
                            Delhi: {formatTransitHours(delhi)}
                          </div>
                          <div className="font-semibold text-slate-800 mt-0.5">
                            Bhopal: {formatTransitHours(bhopal)}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Max: {formatTransitHours(score?.maxTravelTimeHours || 0)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Estimated Daily Budget */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                        <span>Est. Daily Budget</span>
                      </div>
                    </td>
                    {selectedDests.map(d => (
                      <td key={d.id} className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          ₹{d.avgDailyBudgetInr.toLocaleString('en-IN')} / person
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ₹{(d.avgDailyBudgetInr * trip.durationDays * 4).toLocaleString('en-IN')} group total
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Ideal Stay Duration */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Trip Suitability</span>
                      </div>
                    </td>
                    {selectedDests.map(d => (
                      <td key={d.id} className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">
                          {d.idealDaysMin}–{d.idealDaysMax} Days ideal
                        </div>
                        <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                          Fits {trip.durationDays}-day trip well
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Key Attractions */}
                  <tr>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 bg-slate-50/50">
                      <span>Key Highlights</span>
                    </td>
                    {selectedDests.map(d => (
                      <td key={d.id} className="py-3.5 px-3">
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {d.popularAttractions.slice(0, 3).map(att => (
                            <li key={att} className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                              <span className="truncate">{att}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td className="py-4 px-3 bg-slate-50/50 font-semibold text-slate-700">
                      <span>Action</span>
                    </td>
                    {selectedDests.map(d => (
                      <td key={d.id} className="py-4 px-3">
                        <button
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            createItineraryFromDestination(d);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <span>Plan {d.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
