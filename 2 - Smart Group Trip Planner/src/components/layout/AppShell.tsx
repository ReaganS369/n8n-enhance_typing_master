import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Toast } from '../common/Toast';
import { CreateTripModal } from '../common/CreateTripModal';
import { useTrip } from '../../context/TripContext';
import { TripOverview } from '../overview/TripOverview';
import { DestinationDiscovery } from '../destinations/DestinationDiscovery';
import { ItinerariesView } from '../itineraries/ItinerariesView';
import { GroupView } from '../group/GroupView';
import { SettingsView } from '../settings/SettingsView';

export const AppShell: React.FC = () => {
  const { activeTab } = useTrip();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <TripOverview />;
      case 'destinations':
        return <DestinationDiscovery />;
      case 'itineraries':
        return <ItinerariesView />;
      case 'group':
        return <GroupView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TripOverview />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans selection:bg-teal-500 selection:text-white">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Toast Notification Container */}
      <Toast />

      {/* Plan New Trip Modal */}
      <CreateTripModal />
    </div>
  );
};
