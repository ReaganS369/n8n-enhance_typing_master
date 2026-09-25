import { DestinationWeather } from '../types/trip';

// WMO Weather interpretation codes (WW)
export function interpretWmoCode(code: number): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: 'Sun' };
    case 1:
      return { condition: 'Mainly Clear', icon: 'Sun' };
    case 2:
      return { condition: 'Partly Cloudy', icon: 'CloudSun' };
    case 3:
      return { condition: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { condition: 'Fog & Mist', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain Showers', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'Snowfall', icon: 'CloudSnow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Heavy Showers', icon: 'CloudRainWind' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', icon: 'CloudLightning' };
    default:
      return { condition: 'Pleasant Weather', icon: 'Sun' };
  }
}

interface WeatherCacheEntry {
  timestamp: number;
  data: DestinationWeather;
}

const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export async function fetchLiveWeather(
  destinationId: string,
  lat: number,
  lng: number,
  fallback: DestinationWeather
): Promise<DestinationWeather> {
  const cacheKey = `${destinationId}_${lat}_${lng}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=1`;

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();

    const currentTemp = Math.round(data.current?.temperature_2m ?? fallback.tempMax);
    const tempMax = Math.round(data.daily?.temperature_2m_max?.[0] ?? fallback.tempMax);
    const tempMin = Math.round(data.daily?.temperature_2m_min?.[0] ?? fallback.tempMin);
    const weatherCode = data.current?.weather_code ?? fallback.weatherCode;
    const humidity = data.current?.relative_humidity_2m ?? fallback.humidity;
    const precipitationProb = data.daily?.precipitation_probability_max?.[0] ?? fallback.precipitationProb;
    const condition = interpretWmoCode(weatherCode).condition;

    const weatherResult: DestinationWeather = {
      tempMin,
      tempMax,
      currentTemp,
      condition,
      weatherCode,
      humidity,
      precipitationProb,
      isLive: true,
    };

    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: weatherResult,
    });

    return weatherResult;
  } catch (error) {
    // Return realistic fallback with live flag false
    return {
      ...fallback,
      isLive: false,
    };
  }
}
