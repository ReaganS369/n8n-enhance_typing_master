import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, AlertCircle, Compass } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { Destination } from '../../types/trip';
import { OverlapSlider } from './OverlapSlider';
import { FilterBar, SortOption } from './FilterBar';
import { DestinationCard } from './DestinationCard';
import { DestinationDetailModal } from './DestinationDetailModal';
import { CompareModal } from './CompareModal';

export const DestinationDiscovery: React.FC = () => {
  const {
    destinations,
    scoresMap,
    selectedForCompare,
    setIsCompareModalOpen,
    trip,
  } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('compatibility');
  const [selectedTag, setSelectedTag] = useState('All');
  const [hideExcluded, setHideExcluded] = useState(false);

  // Selected destination for details modal
  const [detailDestination, setDetailDestination] = useState<Destination | null>(null);

  // Filter and Sort destinations
  const filteredAndSortedDestinations = useMemo(() => {
    let list = [...destinations];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.state.toLowerCase().includes(q) ||
          d.popularAttractions.some(a => a.toLowerCase().includes(q)) ||
          d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by tag
    if (selectedTag !== 'All') {
      list = list.filter(d =>
        d.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()))
      );
    }

    // Filter excluded if toggle active
    if (hideExcluded) {
      list = list.filter(d => {
        const score = scoresMap[d.id];
        return score ? !score.isExcludedByOverlap : true;
      });
    }

    // Sort
    list.sort((a, b) => {
      const scoreA = scoresMap[a.id];
      const scoreB = scoresMap[b.id];

      // If one is excluded by overlap and the other isn't, prefer eligible ones first
      if (scoreA?.isExcludedByOverlap !== scoreB?.isExcludedByOverlap) {
        return scoreA?.isExcludedByOverlap ? 1 : -1;
      }

      switch (sortBy) {
        case 'compatibility':
          return (scoreB?.overall || 0) - (scoreA?.overall || 0);
        case 'newness':
          return (scoreB?.newnessPercentage || 0) - (scoreA?.newnessPercentage || 0);
        case 'travelTime':
          return (scoreA?.maxTravelTimeHours || 0) - (scoreB?.maxTravelTimeHours || 0);
        case 'temp':
          return b.baseWeather.tempMax - a.baseWeather.tempMax;
        case 'budget':
          return a.avgDailyBudgetInr - b.avgDailyBudgetInr;
        default:
          return 0;
      }
    });

    return list;
  }, [destinations, scoresMap, searchQuery, selectedTag, hideExcluded, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4" />
            <span>Group Destination Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Places That Work For Everyone
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Calculated across {trip.travelers.length} travelers departing from <strong>Delhi</strong> and <strong>Bhopal</strong> for late December, filtered by weather comfort and past visited history.
          </p>
        </div>
      </div>

      {/* Prominent Group Overlap Slider */}
      <OverlapSlider />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        hideExcluded={hideExcluded}
        setHideExcluded={setHideExcluded}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        compareCount={selectedForCompare.length}
      />

      {/* Destinations Grid */}
      {filteredAndSortedDestinations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No destinations match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search query, selecting &ldquo;All&rdquo; tags, or moving the Maximum Group Overlap slider to allow more destinations.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('All');
              setHideExcluded(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedDestinations.map(destination => {
              const score = scoresMap[destination.id];
              if (!score) return null;
              return (
                <motion.div
                  key={destination.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <DestinationCard
                    destination={destination}
                    score={score}
                    onOpenDetails={dest => setDetailDestination(dest)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Destination Detail Modal */}
      <DestinationDetailModal
        destination={detailDestination}
        score={detailDestination ? scoresMap[detailDestination.id] : null}
        isOpen={!!detailDestination}
        onClose={() => setDetailDestination(null)}
      />

      {/* Multi-destination Side-by-Side Compare Modal */}
      <CompareModal />
    </div>
  );
};
