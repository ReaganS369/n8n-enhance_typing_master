import { Destination, Trip, CompatibilityScore } from '../types/trip';
import { calculateTravelerTravelTime, formatTransitHours } from './travelTimeService';

export function calculateCompatibility(
  destination: Destination,
  trip: Trip
): CompatibilityScore {
  const travelers = trip.travelers;
  const totalTravelers = travelers.length || 1;

  // 1. Group Overlap & Visited History
  const destNameLower = destination.name.toLowerCase();
  const visitedTravelers: string[] = [];

  for (const t of travelers) {
    const hasVisited = t.visitedDestinations.some(v => {
      const vLower = v.toLowerCase().trim();
      return (
        vLower === destNameLower ||
        destNameLower.includes(vLower) ||
        vLower.includes(destNameLower)
      );
    });
    if (hasVisited) {
      visitedTravelers.push(t.name);
    }
  }

  const visitedCount = visitedTravelers.length;
  const overlapPercentage = (visitedCount / totalTravelers) * 100;
  const newnessPercentage = Math.round(((totalTravelers - visitedCount) / totalTravelers) * 100);

  // Group Overlap rule: Exceeding threshold marks as excluded
  // e.g., threshold 25% with 4 travelers allows up to 1 person (25%). 2 people (50%) is excluded.
  const isExcludedByOverlap = overlapPercentage > trip.overlapThreshold;

  const groupNewnessScore = Math.max(0, 100 - Math.round(overlapPercentage));

  // 2. Weather Suitability
  const { preferredTempMin, preferredTempMax } = trip.preferences;
  const destWeather = destination.baseWeather;

  let weatherScore = 100;
  let weatherDetail = '';

  // Check overlap with preferred range
  const tempMin = destWeather.tempMin;
  const tempMax = destWeather.tempMax;

  if (tempMin >= preferredTempMin && tempMax <= preferredTempMax) {
    weatherScore = 98;
    weatherDetail = `Ideal winter climate (${tempMin}°–${tempMax}°C) fits inside preferred range (${preferredTempMin}°–${preferredTempMax}°C).`;
  } else {
    let penalty = 0;
    if (tempMin < preferredTempMin) {
      const diff = preferredTempMin - tempMin;
      penalty += diff * 4.5; // chilly penalty
    }
    if (tempMax > preferredTempMax) {
      const diff = tempMax - preferredTempMax;
      penalty += diff * 3.5; // hot penalty
    }
    weatherScore = Math.max(20, Math.round(100 - penalty));

    if (tempMin < 5) {
      weatherDetail = `Sub-zero / freezing night chills (${tempMin}°C) significantly below group comfort floor.`;
    } else if (tempMin < preferredTempMin) {
      weatherDetail = `Slightly chillier nights (${tempMin}°C) than preferred ${preferredTempMin}°C.`;
    } else if (tempMax > preferredTempMax) {
      weatherDetail = `Warmer afternoons (${tempMax}°C) exceeding preferred ${preferredTempMax}°C.`;
    } else {
      weatherDetail = `Pleasant weather condition (${tempMin}°–${tempMax}°C).`;
    }
  }

  // 3. Travel Accessibility
  const travelBreakdown = travelers.map(t =>
    calculateTravelerTravelTime(
      t,
      destination,
      trip.preferences.travelPreference,
      trip.preferences.maxAcceptableTravelTime
    )
  );

  const maxTravelTimeHours = Math.max(...travelBreakdown.map(t => t.timeHours));
  const hasExceededTravelTime = travelBreakdown.some(t => t.isExceeded);

  let travelAccessibilityScore = 100;
  let accessibilityDetail = '';

  if (maxTravelTimeHours <= trip.preferences.maxAcceptableTravelTime) {
    // Within acceptable time
    const ratio = maxTravelTimeHours / trip.preferences.maxAcceptableTravelTime;
    travelAccessibilityScore = Math.round(100 - ratio * 20); // 80 - 100
    accessibilityDetail = `All members arrive in under ${formatTransitHours(maxTravelTimeHours)} (well within ${trip.preferences.maxAcceptableTravelTime}h limit).`;
  } else {
    // Exceeds limit
    const overHours = maxTravelTimeHours - trip.preferences.maxAcceptableTravelTime;
    travelAccessibilityScore = Math.max(25, Math.round(75 - overHours * 6));
    const slowpoke = travelBreakdown.find(t => t.timeHours === maxTravelTimeHours);
    accessibilityDetail = `Transit for ${slowpoke?.travelerName ?? 'traveler'} (${formatTransitHours(maxTravelTimeHours)}) exceeds group ${trip.preferences.maxAcceptableTravelTime}h comfort limit.`;
  }

  // 4. Trip Duration Suitability
  let durationScore = 100;
  const tripDays = trip.durationDays;
  if (tripDays >= destination.idealDaysMin && tripDays <= destination.idealDaysMax) {
    durationScore = 100;
  } else if (tripDays < destination.idealDaysMin) {
    const diff = destination.idealDaysMin - tripDays;
    durationScore = Math.max(40, 100 - diff * 25);
  } else {
    const diff = tripDays - destination.idealDaysMax;
    durationScore = Math.max(60, 100 - diff * 15);
  }

  // Overall Weighted Score
  // Weights: 35% Newness, 25% Weather, 25% Accessibility, 15% Duration
  const weighted =
    groupNewnessScore * 0.35 +
    weatherScore * 0.25 +
    travelAccessibilityScore * 0.25 +
    durationScore * 0.15;

  const overall = Math.round(weighted);

  return {
    overall,
    weatherScore,
    travelAccessibilityScore,
    groupNewnessScore,
    durationScore,
    visitedCount,
    visitedBy: visitedTravelers,
    newnessPercentage,
    isExcludedByOverlap,
    isExcludedByTravelTime: hasExceededTravelTime,
    travelTimeBreakdown: travelBreakdown,
    maxTravelTimeHours,
    weatherSuitabilityDetail: weatherDetail,
    accessibilityDetail,
  };
}
