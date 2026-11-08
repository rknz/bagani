/**
 * BAGANI — Live District Weather & 15-Day Forecast Service (Past 7d + Today + Next 7d)
 * Fetches real-time meteorological data from Open-Meteo (no API key required, 100% free)
 * for Bangladesh districts with instant offline fallback to LocalDbService.
 */

import { DailyWeatherSnapshot } from '../models/care_schedule_model';
import { LocalDbService } from './local_db_service';

interface DistrictCoordinates {
  lat: number;
  lon: number;
}

const DISTRICT_COORDS: Record<string, DistrictCoordinates> = {
  'জামালপুর (ময়মনসিংহ)': { lat: 24.9375, lon: 89.9378 },
  ঢাকা: { lat: 23.8103, lon: 90.4125 },
  ময়মনসিংহ: { lat: 24.7471, lon: 90.4203 },
  রাজশাহী: { lat: 24.3745, lon: 88.6042 },
  চট্টগ্রাম: { lat: 22.3569, lon: 91.7832 },
  সিলেট: { lat: 24.8949, lon: 91.8687 },
  খুলনা: { lat: 22.8456, lon: 89.5403 },
  বরিশাল: { lat: 22.701, lon: 90.3535 },
  রংপুর: { lat: 25.7439, lon: 89.2752 },
  কুমিল্লা: { lat: 23.4607, lon: 91.1809 },
  বগুড়া: { lat: 24.8481, lon: 89.373 },
  গাজীপুর: { lat: 23.9999, lon: 90.4203 },
};

export class WeatherService {
  static getCoordinatesForDistrict(district: string): DistrictCoordinates {
    for (const key of Object.keys(DISTRICT_COORDS)) {
      if (district.includes(key) || key.includes(district)) {
        return DISTRICT_COORDS[key];
      }
    }
    return DISTRICT_COORDS['ঢাকা'];
  }

  /**
   * Fetches live 15-day weather window (7 days past + today + 7 days forecast)
   * Falls back immediately to LocalDbService.get15DayWeatherWindow() if offline.
   */
  static async fetchLive15DayWeather(district: string): Promise<{
    past7Days: DailyWeatherSnapshot[];
    today: DailyWeatherSnapshot;
    next7Days: DailyWeatherSnapshot[];
    isLiveOnline: boolean;
  }> {
    const fallback = LocalDbService.get15DayWeatherWindow();
    try {
      const coords = this.getCoordinatesForDistrict(district);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,precipitation_probability_max&past_days=7&forecast_days=8&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) {
        return { ...fallback, isLiveOnline: false };
      }

      const data = await response.json();
      const currentTemp = Math.round(
        data?.current?.temperature_2m ?? fallback.today.tempCelsius
      );
      const currentHumidity = Math.round(
        data?.current?.relative_humidity_2m ?? fallback.today.humidityPercent
      );

      const dailyTimes: string[] = data?.daily?.time || [];
      const dailyTemps: number[] = data?.daily?.temperature_2m_max || [];
      const dailyRain: number[] =
        data?.daily?.precipitation_probability_max || [];

      if (dailyTimes.length < 15) {
        return {
          ...fallback,
          today: {
            ...fallback.today,
            tempCelsius: currentTemp,
            humidityPercent: currentHumidity,
          },
          isLiveOnline: true,
        };
      }

      const past7Days: DailyWeatherSnapshot[] = fallback.past7Days.map(
        (item, idx) => {
          const temp = Math.round(dailyTemps[idx] ?? item.tempCelsius);
          const rain = Math.round(
            dailyRain[idx] ?? item.rainProbabilityPercent
          );
          return {
            ...item,
            tempCelsius: temp,
            rainProbabilityPercent: rain,
            condition:
              rain >= 50 ? 'rainy' : temp >= 33 ? 'hot_dry' : 'sunny',
          };
        }
      );

      const todayRain = Math.round(dailyRain[7] ?? 15);
      const today: DailyWeatherSnapshot = {
        ...fallback.today,
        tempCelsius: currentTemp,
        humidityPercent: currentHumidity,
        rainProbabilityPercent: todayRain,
        condition:
          todayRain >= 50 ? 'rainy' : currentTemp >= 33 ? 'hot_dry' : 'sunny',
      };

      const next7Days: DailyWeatherSnapshot[] = fallback.next7Days.map(
        (item, idx) => {
          const dIdx = 8 + idx;
          const temp = Math.round(dailyTemps[dIdx] ?? item.tempCelsius);
          const rain = Math.round(
            dailyRain[dIdx] ?? item.rainProbabilityPercent
          );
          return {
            ...item,
            tempCelsius: temp,
            rainProbabilityPercent: rain,
            condition:
              rain >= 50 ? 'rainy' : temp >= 33 ? 'hot_dry' : 'sunny',
          };
        }
      );

      return { past7Days, today, next7Days, isLiveOnline: true };
    } catch {
      return { ...fallback, isLiveOnline: false };
    }
  }
}

