export type TransitMode = 'flight' | 'train' | 'road' | 'any';

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  departureCity: string;
  preferredTransit: TransitMode;
  visitedDestinations: string[];
  role?: string;
}

export interface TripPreferences {
  preferredTempMin: number; // e.g. 15°C
  preferredTempMax: number; // e.g. 26°C
  maxAcceptableTravelTime: number; // in hours, e.g. 8
  travelPreference: TransitMode;
}

export interface DestinationWeather {
  tempMin: number;
  tempMax: number;
  currentTemp?: number;
  condition: string;
  weatherCode: number;
  humidity?: number;
  precipitationProb?: number;
  isLive?: boolean;
}

export interface RouteTransitOption {
  flight?: number; // hours
  train?: number;  // hours
  road?: number;   // hours
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  country: string;
  region: 'North' | 'West' | 'Central' | 'South' | 'East';
  lat: number;
  lng: number;
  heroImage: string;
  galleryImages?: string[];
  description: string;
  highlightQuote: string;
  tags: string[];
  idealDaysMin: number;
  idealDaysMax: number;
  avgDailyBudgetInr: number;
  popularAttractions: string[];
  baseWeather: DestinationWeather;
  // Keyed by departure city name (e.g. "Delhi", "Bhopal")
  travelTimes: Record<string, RouteTransitOption>;
}

export interface TravelerTravelTime {
  travelerId: string;
  travelerName: string;
  departureCity: string;
  timeHours: number;
  mode: 'flight' | 'train' | 'road';
  isExceeded: boolean;
}

export interface CompatibilityScore {
  overall: number; // 0-100
  weatherScore: number; // 0-100
  travelAccessibilityScore: number; // 0-100
  groupNewnessScore: number; // 0-100
  durationScore: number; // 0-100
  visitedCount: number;
  visitedBy: string[]; // Traveler names
  newnessPercentage: number; // 0-100%
  isExcludedByOverlap: boolean;
  isExcludedByTravelTime: boolean;
  travelTimeBreakdown: TravelerTravelTime[];
  maxTravelTimeHours: number;
  weatherSuitabilityDetail: string;
  accessibilityDetail: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  category: 'sightseeing' | 'dining' | 'travel' | 'leisure' | 'stay';
  location: string;
  costEstimateInr?: number;
  notes?: string;
  duration?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dateStr: string;
  title: string;
  location: string;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  name: string;
  subtitle: string;
  themeTag: 'Relaxed' | 'Culture' | 'Multi-city' | 'Adventure' | 'Custom';
  daysCount: number;
  destinationIds: string[];
  destinationNames: string[];
  days: ItineraryDay[];
  estimatedTotalBudgetInr: number;
  isCustom?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string; // "2026-12-25"
  endDate: string;   // "2026-12-29"
  durationDays: number;
  travelers: Traveler[];
  preferences: TripPreferences;
  overlapThreshold: number; // 0 to 50 (%)
  itineraries: Itinerary[];
}

export type ActiveNavTab = 'overview' | 'destinations' | 'itineraries' | 'group' | 'settings';
