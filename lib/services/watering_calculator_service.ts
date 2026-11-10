/**
 * BAGANI — Smart Watering & Container Hydration Calculator Service
 * Developer: ProFix - Web & Soft
 *
 * Algorithm factors:
 * 1. Container volume (Cylinder volume from diameter & depth in inches / Liters)
 * 2. Container material porosity (Terracotta > Geobag > Concrete > Plastic > Drum)
 * 3. Soil retention coefficient (Cocopeat > Clay > Loam > Sandy Loam)
 * 4. Botanical category evapotranspiration index (Vegetable > Fruit > Flower > Indoor > Succulent)
 * 5. Plant phenology stage (Fruiting > Flowering > Vegetative > Seedling)
 * 6. Meteorological adjustments (Temperature, Humidity, Rain probability)
 */

export type ContainerType =
  | 'geobag'
  | 'clay_pot'
  | 'plastic_pot'
  | 'concrete'
  | 'half_drum';

export type SoilType = 'loamy' | 'clay' | 'sandy_loam' | 'cocopeat';

export type PlantStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting';

export interface WateringCalculationInput {
  containerType: ContainerType;
  diameterInches: number; // e.g. 10, 12, 14, 16, 18, 20
  depthInches?: number; // defaults to diameter * 0.9 if not provided
  soilType: SoilType;
  plantCategory: 'fruit' | 'vegetable' | 'flower' | 'indoor' | 'succulent';
  plantStage: PlantStage;
  currentTemperatureC?: number; // e.g. 28, 33, 38
  rainForecast?: 'none' | 'light_rain' | 'heavy_rain';
}

export interface WateringCalculationResult {
  volumeLiters: number; // Container volume in liters
  dailyWaterMl: number; // Recommended daily water amount in ml
  displayAmountBn: string; // e.g. "৭৫০ মিলি" or "১.৫ লিটার"
  displayAmountEn: string; // e.g. "750 ml" or "1.5 L"
  frequencyBn: string; // e.g. "প্রতিদিন সকালে ১ বার"
  frequencyEn: string; // e.g. "Once daily in early morning"
  moistureTipBn: string;
  moistureTipEn: string;
  drainageWarningBn?: string;
  drainageWarningEn?: string;
}

export class WateringCalculatorService {
  /**
   * Compute exact water requirement in ml and optimal schedule
   */
  static calculate(input: WateringCalculationInput): WateringCalculationResult {
    const {
      containerType,
      diameterInches,
      depthInches = Math.round(diameterInches * 0.95),
      soilType,
      plantCategory,
      plantStage,
      currentTemperatureC = 30,
      rainForecast = 'none',
    } = input;

    // 1. Calculate approximate cylindrical soil volume in Liters
    // V = pi * r^2 * h in cubic inches. 1 cu in = 0.016387 Liters
    const radiusInches = diameterInches / 2;
    const cubicInches = Math.PI * radiusInches * radiusInches * depthInches;
    const containerVolumeLiters = Math.max(1, Number((cubicInches * 0.016387).toFixed(1)));

    // 2. Base hydration requirement: ~12% to 15% of container soil volume
    let baseWaterMl = containerVolumeLiters * 125; // 125 ml per Liter of soil

    // 3. Container material evaporation factor
    const containerFactor: Record<ContainerType, number> = {
      clay_pot: 1.25, // Breathable terracotta dries faster
      geobag: 1.15, // High aeration fabric
      concrete: 1.0,
      plastic_pot: 0.85, // Non-porous retains moisture
      half_drum: 0.9,
    };
    baseWaterMl *= containerFactor[containerType] || 1.0;

    // 4. Soil moisture retention factor
    const soilFactor: Record<SoilType, number> = {
      sandy_loam: 1.2, // Fast draining, needs slightly more frequent water
      loamy: 1.0, // Ideal balance
      clay: 0.8, // Heavy retention, risk of waterlogging
      cocopeat: 0.75, // Sponge-like moisture holding
    };
    baseWaterMl *= soilFactor[soilType] || 1.0;

    // 5. Plant category transpiration index
    const categoryFactor: Record<string, number> = {
      vegetable: 1.2,
      fruit: 1.15,
      flower: 1.0,
      indoor: 0.65,
      succulent: 0.3,
    };
    baseWaterMl *= categoryFactor[plantCategory] || 1.0;

    // 6. Growth stage multiplier
    const stageFactor: Record<PlantStage, number> = {
      seedling: 0.6,
      vegetative: 1.0,
      flowering: 1.25,
      fruiting: 1.35,
    };
    baseWaterMl *= stageFactor[plantStage] || 1.0;

    // 7. Weather & ambient temperature adjustments
    if (currentTemperatureC >= 35) {
      baseWaterMl *= 1.3; // Summer heatwave
    } else if (currentTemperatureC <= 20) {
      baseWaterMl *= 0.7; // Winter dormancy
    }

    // 8. Rain forecast adjustments
    if (rainForecast === 'heavy_rain') {
      baseWaterMl = 0; // Natural rainwater suffices
    } else if (rainForecast === 'light_rain') {
      baseWaterMl *= 0.4;
    }

    const finalWaterMl = Math.round(baseWaterMl);

    // Format display string
    let displayAmountBn = '';
    let displayAmountEn = '';
    if (finalWaterMl === 0) {
      displayAmountBn = 'আজকে পানি দেওয়ার প্রয়োজন নেই (বৃষ্টি)';
      displayAmountEn = 'No watering needed today (Rain)';
    } else if (finalWaterMl < 1000) {
      displayAmountBn = `${finalWaterMl} মিলি`;
      displayAmountEn = `${finalWaterMl} ml`;
    } else {
      const liters = (finalWaterMl / 1000).toFixed(1);
      displayAmountBn = `${liters} লিটার`;
      displayAmountEn = `${liters} L`;
    }

    // Determine frequency advice
    let frequencyBn = 'প্রতিদিন সকালে ১ বার';
    let frequencyEn = 'Once daily in early morning';

    if (plantCategory === 'succulent') {
      frequencyBn = 'সপ্তাহে ১ বার (মাটি সম্পূর্ণ শুকালে)';
      frequencyEn = 'Once weekly when topsoil is completely dry';
    } else if (containerType === 'clay_pot' && currentTemperatureC >= 34) {
      frequencyBn = 'দিনে ২ বার (ভোরে একবার ও বিকেলে একবার)';
      frequencyEn = 'Twice daily (Early morning & late afternoon)';
    } else if (soilType === 'clay' || plantCategory === 'indoor') {
      frequencyBn = '২ দিন পরপর মাটি পরীক্ষা করে';
      frequencyEn = 'Every 2 days after checking topsoil';
    }

    const moistureTipBn =
      'টবের উপরের ১ ইঞ্চি মাটি আঙুল দিয়ে পরীক্ষা করুন। মাটি ভেজা থাকলে পানি দেবেন না। অতিরিক্ত পানি শিকড় পচনের মূল কারণ।';
    const moistureTipEn =
      'Insert finger 1 inch into topsoil. If moist, skip watering. Overwatering is the leading cause of root rot.';

    let drainageWarningBn: string | undefined = undefined;
    let drainageWarningEn: string | undefined = undefined;

    if (containerType === 'plastic_pot' && soilType === 'clay') {
      drainageWarningBn =
        'সতর্কতা: প্লাস্টিকের টবে এঁটেল মাটি পানি ধরে রাখে। টবের নিচে অন্তত ৩-৪টি ড্রেনেজ ছিদ্র ও নুড়ি পাথরের স্তর নিশ্চিত করুন।';
      drainageWarningEn =
        'Caution: Clay in plastic containers retains water. Ensure 3-4 drainage holes with pebble layer at bottom.';
    }

    return {
      volumeLiters: containerVolumeLiters,
      dailyWaterMl: finalWaterMl,
      displayAmountBn,
      displayAmountEn,
      frequencyBn,
      frequencyEn,
      moistureTipBn,
      moistureTipEn,
      drainageWarningBn,
      drainageWarningEn,
    };
  }
}

