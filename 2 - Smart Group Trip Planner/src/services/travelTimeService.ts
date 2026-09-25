import { Destination, RouteTransitOption, Traveler, TravelerTravelTime, TransitMode } from '../types/trip';

export function calculateTravelerTravelTime(
  traveler: Traveler,
  destination: Destination,
  globalPreference: TransitMode,
  maxAcceptableHours: number
): TravelerTravelTime {
  const cityRoutes: RouteTransitOption | undefined = destination.travelTimes[traveler.departureCity];

  // Default estimations if a new custom city is entered
  const defaultOption: RouteTransitOption = cityRoutes || {
    flight: 2.5,
    train: 10.0,
    road: 10.5,
  };

  const prefMode = traveler.preferredTransit !== 'any' ? traveler.preferredTransit : globalPreference;

  let chosenMode: 'flight' | 'train' | 'road' = 'flight';
  let hours = 999;

  if (prefMode === 'flight' && defaultOption.flight !== undefined) {
    chosenMode = 'flight';
    hours = defaultOption.flight;
  } else if (prefMode === 'train' && defaultOption.train !== undefined) {
    chosenMode = 'train';
    hours = defaultOption.train;
  } else if (prefMode === 'road' && defaultOption.road !== undefined) {
    chosenMode = 'road';
    hours = defaultOption.road;
  } else {
    // Pick the fastest available mode
    const candidates: { mode: 'flight' | 'train' | 'road'; time: number }[] = [];
    if (defaultOption.flight !== undefined) candidates.push({ mode: 'flight', time: defaultOption.flight });
    if (defaultOption.train !== undefined) candidates.push({ mode: 'train', time: defaultOption.train });
    if (defaultOption.road !== undefined) candidates.push({ mode: 'road', time: defaultOption.road });

    candidates.sort((a, b) => a.time - b.time);
    if (candidates.length > 0) {
      chosenMode = candidates[0].mode;
      hours = candidates[0].time;
    } else {
      hours = 8;
    }
  }

  return {
    travelerId: traveler.id,
    travelerName: traveler.name,
    departureCity: traveler.departureCity,
    timeHours: hours,
    mode: chosenMode,
    isExceeded: hours > maxAcceptableHours,
  };
}

export function formatTransitHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${minutes}m`;
}
