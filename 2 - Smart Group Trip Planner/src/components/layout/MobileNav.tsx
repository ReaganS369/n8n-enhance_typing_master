import React from 'react';
import { Compass, MapPin, CalendarDays, Users, Settings } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { ActiveNavTab } from '../../types/trip';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, eligibleDestinationsCount } = useTrip();

  const navItems: { id: ActiveNavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'destinations', label: 'Explore', icon: MapPin, badge: eligibleDestinationsCount },
    { id: 'itineraries', label: 'Itinerary', icon: CalendarDays },
    { id: 'group', label: 'Group', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-teal-600 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
