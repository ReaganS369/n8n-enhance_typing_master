import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  Trip,
  Destination,
  Traveler,
  TripPreferences,
  Itinerary,
  Activity,
  ActiveNavTab,
  CompatibilityScore
} from '../types/trip';
import { INITIAL_DESTINATIONS, INITIAL_TRIP } from '../data/initialTripData';
import { calculateCompatibility } from '../services/scoringEngine';
import { fetchLiveWeather } from '../services/openMeteoService';

interface ToastData {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

interface TripContextType {
  trip: Trip;
  destinations: Destination[];
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  selectedForCompare: string[];
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;
  isLiveWeatherLoading: boolean;
  toast: ToastData | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;

  isCreateTripModalOpen: boolean;
  setIsCreateTripModalOpen: (open: boolean) => void;
  createNewTrip: (tripData: {
    name: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    travelers: Omit<Traveler, 'id'>[];
    preferences: TripPreferences;
    overlapThreshold: number;
  }) => void;

  // Actions
  setOverlapThreshold: (val: number) => void;
  updatePreferences: (prefs: Partial<TripPreferences>) => void;
  updateTripBasics: (updates: { name?: string; startDate?: string; endDate?: string; durationDays?: number }) => void;
  addTraveler: (traveler: Omit<Traveler, 'id'>) => void;
  updateTraveler: (id: string, updates: Partial<Traveler>) => void;
  removeTraveler: (id: string) => void;
  addVisitedDestination: (travelerId: string, destinationName: string) => void;
  removeVisitedDestination: (travelerId: string, destinationName: string) => void;
  toggleCompareDestination: (destId: string) => void;
  clearCompareDestinations: () => void;
  saveItinerary: (itinerary: Itinerary) => void;
  duplicateItinerary: (id: string) => void;
  deleteItinerary: (id: string) => void;
  reorderActivity: (itineraryId: string, dayNumber: number, fromIdx: number, toIdx: number) => void;
  addActivityToDay: (itineraryId: string, dayNumber: number, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (itineraryId: string, dayNumber: number, activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (itineraryId: string, dayNumber: number, activityId: string) => void;
  createItineraryFromDestination: (destination: Destination) => void;
  syncLiveWeather: () => Promise<void>;
  resetToDefaultData: () => void;

  // Computed
  scoresMap: Record<string, CompatibilityScore>;
  eligibleDestinationsCount: number;
  totalDestinationsCount: number;
}

const STORAGE_KEY = 'tripsync_state_v2';
const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial from localStorage or fall back to mock
  const [trip, setTrip] = useState<Trip>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved state from localStorage:', e);
    }
    return INITIAL_TRIP;
  });

  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('overview');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [isLiveWeatherLoading, setIsLiveWeatherLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch (e) {
      console.warn('Failed to write state to localStorage:', e);
    }
  }, [trip]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, text, type });
    setTimeout(() => {
      setToast(curr => (curr?.id === id ? null : curr));
    }, 3500);
  }, []);

  // Compute scores for each destination
  const scoresMap = useMemo(() => {
    const map: Record<string, CompatibilityScore> = {};
    for (const d of destinations) {
      map[d.id] = calculateCompatibility(d, trip);
    }
    return map;
  }, [destinations, trip]);

  const { eligibleDestinationsCount, totalDestinationsCount } = useMemo(() => {
    let eligible = 0;
    for (const d of destinations) {
      const score = scoresMap[d.id];
      if (score && !score.isExcludedByOverlap) {
        eligible++;
      }
    }
    return {
      eligibleDestinationsCount: eligible,
      totalDestinationsCount: destinations.length,
    };
  }, [destinations, scoresMap]);

  // Actions
  const setOverlapThreshold = (val: number) => {
    setTrip(prev => ({ ...prev, overlapThreshold: Math.min(50, Math.max(0, val)) }));
  };

  const updatePreferences = (prefs: Partial<TripPreferences>) => {
    setTrip(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs },
    }));
    showToast('Updated group travel preferences', 'success');
  };

  const updateTripBasics = (updates: { name?: string; startDate?: string; endDate?: string; durationDays?: number }) => {
    setTrip(prev => ({
      ...prev,
      ...updates,
    }));
    showToast('Updated trip details', 'success');
  };

  const addTraveler = (travelerData: Omit<Traveler, 'id'>) => {
    const id = `traveler-${Date.now()}`;
    const newTraveler: Traveler = { ...travelerData, id };
    setTrip(prev => ({
      ...prev,
      travelers: [...prev.travelers, newTraveler],
    }));
    showToast(`Added ${travelerData.name} to the group`, 'success');
  };

  const updateTraveler = (id: string, updates: Partial<Traveler>) => {
    setTrip(prev => ({
      ...prev,
      travelers: prev.travelers.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const removeTraveler = (id: string) => {
    if (trip.travelers.length <= 1) {
      showToast('A group must have at least one traveler', 'warning');
      return;
    }
    const traveler = trip.travelers.find(t => t.id === id);
    setTrip(prev => ({
      ...prev,
      travelers: prev.travelers.filter(t => t.id !== id),
    }));
    showToast(`Removed ${traveler?.name || 'traveler'} from trip`, 'info');
  };

  const addVisitedDestination = (travelerId: string, destinationName: string) => {
    const trimmed = destinationName.trim();
    if (!trimmed) return;

    setTrip(prev => ({
      ...prev,
      travelers: prev.travelers.map(t => {
        if (t.id !== travelerId) return t;
        const exists = t.visitedDestinations.some(
          d => d.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return t;
        return {
          ...t,
          visitedDestinations: [...t.visitedDestinations, trimmed],
        };
      }),
    }));
    showToast(`Added ${trimmed} to travel history`, 'success');
  };

  const removeVisitedDestination = (travelerId: string, destinationName: string) => {
    setTrip(prev => ({
      ...prev,
      travelers: prev.travelers.map(t => {
        if (t.id !== travelerId) return t;
        return {
          ...t,
          visitedDestinations: t.visitedDestinations.filter(
            d => d.toLowerCase() !== destinationName.toLowerCase()
          ),
        };
      }),
    }));
  };

  const toggleCompareDestination = (destId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(destId)) {
        return prev.filter(id => id !== destId);
      }
      if (prev.length >= 4) {
        showToast('You can compare up to 4 destinations at once', 'warning');
        return prev;
      }
      return [...prev, destId];
    });
  };

  const clearCompareDestinations = () => {
    setSelectedForCompare([]);
  };

  const saveItinerary = (itinerary: Itinerary) => {
    setTrip(prev => {
      const exists = prev.itineraries.some(i => i.id === itinerary.id);
      if (exists) {
        return {
          ...prev,
          itineraries: prev.itineraries.map(i => (i.id === itinerary.id ? itinerary : i)),
        };
      }
      return {
        ...prev,
        itineraries: [itinerary, ...prev.itineraries],
      };
    });
    showToast(`Saved itinerary "${itinerary.name}"`, 'success');
  };

  const duplicateItinerary = (id: string) => {
    const target = trip.itineraries.find(i => i.id === id);
    if (!target) return;

    const copy: Itinerary = {
      ...target,
      id: `itin-${Date.now()}`,
      name: `${target.name} (Copy)`,
      isCustom: true,
      days: target.days.map(d => ({
        ...d,
        activities: d.activities.map(a => ({ ...a, id: `act-${Math.random().toString(36).substr(2, 9)}` })),
      })),
    };

    setTrip(prev => ({
      ...prev,
      itineraries: [...prev.itineraries, copy],
    }));
    showToast(`Duplicated ${target.name}`, 'success');
  };

  const deleteItinerary = (id: string) => {
    const target = trip.itineraries.find(i => i.id === id);
    setTrip(prev => ({
      ...prev,
      itineraries: prev.itineraries.filter(i => i.id !== id),
    }));
    showToast(`Deleted "${target?.name || 'Itinerary'}"`, 'info');
  };

  const reorderActivity = (
    itineraryId: string,
    dayNumber: number,
    fromIdx: number,
    toIdx: number
  ) => {
    setTrip(prev => ({
      ...prev,
      itineraries: prev.itineraries.map(itin => {
        if (itin.id !== itineraryId) return itin;
        return {
          ...itin,
          days: itin.days.map(day => {
            if (day.dayNumber !== dayNumber) return day;
            const updated = [...day.activities];
            const [moved] = updated.splice(fromIdx, 1);
            updated.splice(toIdx, 0, moved);
            return { ...day, activities: updated };
          }),
        };
      }),
    }));
  };

  const addActivityToDay = (
    itineraryId: string,
    dayNumber: number,
    activityData: Omit<Activity, 'id'>
  ) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };

    setTrip(prev => ({
      ...prev,
      itineraries: prev.itineraries.map(itin => {
        if (itin.id !== itineraryId) return itin;
        return {
          ...itin,
          days: itin.days.map(day => {
            if (day.dayNumber !== dayNumber) return day;
            return {
              ...day,
              activities: [...day.activities, newActivity],
            };
          }),
        };
      }),
    }));
    showToast(`Added activity "${activityData.title}"`, 'success');
  };

  const updateActivity = (
    itineraryId: string,
    dayNumber: number,
    activityId: string,
    updates: Partial<Activity>
  ) => {
    setTrip(prev => ({
      ...prev,
      itineraries: prev.itineraries.map(itin => {
        if (itin.id !== itineraryId) return itin;
        return {
          ...itin,
          days: itin.days.map(day => {
            if (day.dayNumber !== dayNumber) return day;
            return {
              ...day,
              activities: day.activities.map(act => (act.id === activityId ? { ...act, ...updates } : act)),
            };
          }),
        };
      }),
    }));
    showToast('Activity updated', 'success');
  };

  const deleteActivity = (itineraryId: string, dayNumber: number, activityId: string) => {
    setTrip(prev => ({
      ...prev,
      itineraries: prev.itineraries.map(itin => {
        if (itin.id !== itineraryId) return itin;
        return {
          ...itin,
          days: itin.days.map(day => {
            if (day.dayNumber !== dayNumber) return day;
            return {
              ...day,
              activities: day.activities.filter(act => act.id !== activityId),
            };
          }),
        };
      }),
    }));
    showToast('Activity removed', 'info');
  };

  const createItineraryFromDestination = (destination: Destination) => {
    const daysCount = trip.durationDays || 4;
    const days = Array.from({ length: daysCount }, (_, i) => ({
      dayNumber: i + 1,
      dateStr: `Day ${i + 1}`,
      title: i === 0 ? `Arrival & Explore ${destination.name}` : `Highlights of ${destination.name}`,
      location: destination.name,
      activities: [
        {
          id: `act-gen-${i}-1`,
          time: '09:30 AM',
          title: destination.popularAttractions[i % destination.popularAttractions.length] || `Explore ${destination.name}`,
          category: 'sightseeing' as const,
          location: destination.name,
          costEstimateInr: 500,
          notes: 'Top group recommendation'
        },
        {
          id: `act-gen-${i}-2`,
          time: '01:00 PM',
          title: `Local Cuisine & Cafe Discovery`,
          category: 'dining' as const,
          location: `${destination.name} Center`,
          costEstimateInr: 600,
          notes: 'Try famous regional flavors and fresh specialties'
        },
        {
          id: `act-gen-${i}-3`,
          time: '05:00 PM',
          title: `Sunset Vista & Evening Leisure`,
          category: 'leisure' as const,
          location: destination.popularAttractions[(i + 1) % destination.popularAttractions.length] || destination.name,
          costEstimateInr: 300,
          notes: 'Golden hour photography and tea with the group'
        }
      ]
    }));

    const newItin: Itinerary = {
      id: `itin-custom-${Date.now()}`,
      name: `Custom ${destination.name} Escape`,
      subtitle: `${destination.name} · ${daysCount} Days · Group Custom Itinerary`,
      themeTag: 'Custom',
      daysCount,
      destinationIds: [destination.id],
      destinationNames: [destination.name],
      estimatedTotalBudgetInr: destination.avgDailyBudgetInr * daysCount,
      days,
      isCustom: true
    };

    setTrip(prev => ({
      ...prev,
      itineraries: [newItin, ...prev.itineraries],
    }));
    setActiveTab('itineraries');
    showToast(`Created new itinerary for ${destination.name}`, 'success');
  };

  const syncLiveWeather = async () => {
    setIsLiveWeatherLoading(true);
    showToast('Fetching live Open-Meteo weather for all destinations...', 'info');
    try {
      const updated = await Promise.all(
        destinations.map(async d => {
          const liveWeather = await fetchLiveWeather(d.id, d.lat, d.lng, d.baseWeather);
          return {
            ...d,
            baseWeather: liveWeather,
          };
        })
      );
      setDestinations(updated);
      showToast('Live weather updated successfully via Open-Meteo API', 'success');
    } catch (e) {
      showToast('Weather sync completed with fallback data', 'info');
    } finally {
      setIsLiveWeatherLoading(false);
    }
  };

  const createNewTrip = (tripData: {
    name: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    travelers: Omit<Traveler, 'id'>[];
    preferences: TripPreferences;
    overlapThreshold: number;
  }) => {
    const avatarSeeds = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80',
    ];

    const newTravelers: Traveler[] = tripData.travelers.map((t, idx) => ({
      ...t,
      id: `traveler-${Date.now()}-${idx + 1}`,
      avatar: t.avatar || avatarSeeds[idx % avatarSeeds.length],
    }));

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: tripData.name,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      durationDays: tripData.durationDays,
      travelers: newTravelers,
      preferences: tripData.preferences,
      overlapThreshold: tripData.overlapThreshold,
      itineraries: [],
    };

    setTrip(newTrip);
    setSelectedForCompare([]);
    setIsCreateTripModalOpen(false);
    setActiveTab('destinations');
    showToast(`🎉 "${newTrip.name}" created! Discover matching destinations for your group.`, 'success');
  };

  const resetToDefaultData = () => {
    setTrip(INITIAL_TRIP);
    setDestinations(INITIAL_DESTINATIONS);
    setSelectedForCompare([]);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to default scenario: 3 Delhi & 1 Bhopal travelers', 'success');
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        destinations,
        activeTab,
        setActiveTab,
        selectedForCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        isCreateTripModalOpen,
        setIsCreateTripModalOpen,
        createNewTrip,
        isLiveWeatherLoading,
        toast,
        showToast,
        setOverlapThreshold,
        updatePreferences,
        updateTripBasics,
        addTraveler,
        updateTraveler,
        removeTraveler,
        addVisitedDestination,
        removeVisitedDestination,
        toggleCompareDestination,
        clearCompareDestinations,
        saveItinerary,
        duplicateItinerary,
        deleteItinerary,
        reorderActivity,
        addActivityToDay,
        updateActivity,
        deleteActivity,
        createItineraryFromDestination,
        syncLiveWeather,
        resetToDefaultData,
        scoresMap,
        eligibleDestinationsCount,
        totalDestinationsCount,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
