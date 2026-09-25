import React from 'react';
import { Calendar, IndianRupee, MapPin, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTrip } from '../../context/TripContext';

interface ItineraryCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItinerary: (id: string) => void;
}

export const ItineraryCompareModal: React.FC<ItineraryCompareModalProps> = ({
  isOpen,
  onClose,
  onSelectItinerary,
}) => {
  const { trip } = useTrip();
  const itineraries = trip.itineraries;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare Itinerary Options"
      subtitle="Evaluate paces, daily budgets, and destination circuits side-by-side"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[700px]">
            {itineraries.map(itin => (
              <div
                key={itin.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Theme Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                      {itin.themeTag}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {itin.daysCount} Days
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      {itin.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {itin.subtitle}
                    </p>
                  </div>

                  {/* Destinations included */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>Destinations:</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {itin.destinationNames.join(' + ')}
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="font-semibold text-slate-500">Est. Budget per person</div>
                    <div className="text-xl font-black text-slate-900 flex items-center">
                      <IndianRupee className="w-4 h-4 text-slate-500" />
                      <span>{itin.estimatedTotalBudgetInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Daily Schedule Highlights */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Daily Flow
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {itin.days.map(d => (
                        <li key={d.dayNumber} className="flex items-start gap-1.5">
                          <span className="font-bold text-teal-700 shrink-0">Day {d.dayNumber}:</span>
                          <span className="line-clamp-1">{d.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectItinerary(itin.id);
                    onClose();
                  }}
                  className="mt-5 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <span>Select & Edit Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
