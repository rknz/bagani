/**
 * BAGANI — Phase 4: Lightweight Offline-First Local Database & Cloud Sync Service
 * Manages:
 * - Registered Rooftop Plants (with unique QR IDs)
 * - Messenger-style Scrollable Timeline Logs & Checkbox completions
 * - Granular Weather-Based Care Prescriptions (exact water liters, morning/afternoon slots)
 * - 7-Day Past + Today + 7-Day Future Weather Snapshots
 * - AI Current & Future Status Forecast calculation per plant
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CareTaskStatus,
  DailyWeatherSnapshot,
  GranularCareTask,
} from '../models/care_schedule_model';
import { PlantCurrentAndFutureForecast } from '../models/plant_forecast_model';
import { PlantTimelineLog } from '../models/plant_log_model';
import { PlantModel } from '../models/plant_model';

const PLANTS_STORAGE_KEY = '@bagani_registered_plants_v1';
const LOGS_STORAGE_KEY = '@bagani_plant_timeline_logs_v1';
const TASKS_STORAGE_KEY = '@bagani_care_tasks_v1';

export const INITIAL_SAMPLE_PLANTS: PlantModel[] = [
  {
    id: 'plt_katimon_1',
    qrCodeId: 'BAGANI-QR-1001',
    nameBengali: 'কাটিমন-১২ আম',
    nameEnglish: 'Katimon-12 Mango',
    variety: 'কাটিমন-১২ (বারোমাসি কলম)',
    category: 'fruit',
    isAllSeason: true,
    plantedDateIso: new Date(Date.now() - 145 * 86400000).toISOString(),
    containerSizeInches: 24,
    rooftopZone: 'দক্ষিণ কার্নিশ সারি - টব ০১',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'সম্পূর্ণ সুস্থ ও নতুন কচি পাতা গজাচ্ছে',
    lastWateredIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 12 * 86400000).toISOString(),
    estimatedMoisturePercent: 72,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1001',
      tagSize: 'medium',
      plantName: 'কাটিমন-১২ আম',
      varietyName: 'বারোমাসি কলম',
      isAllSeason: true,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০১ • BAGANI',
    },
  },
  {
    id: 'plt_malta_2',
    qrCodeId: 'BAGANI-QR-1002',
    nameBengali: 'ভিয়েতনামী মাল্টা',
    nameEnglish: 'Vietnamese Malta',
    variety: 'ভিয়েতনামী বারোমাসি মাল্টা',
    category: 'fruit',
    isAllSeason: true,
    plantedDateIso: new Date(Date.now() - 110 * 86400000).toISOString(),
    containerSizeInches: 20,
    rooftopZone: 'দক্ষিণ কার্নিশ সারি - টব ০২',
    healthState: 'needs_attention',
    lastHealthDiagnosisSummary: 'হালকা ম্যাগনেসিয়াম ঘাটতি — এপসম লবণ স্প্রে প্রয়োজন',
    lastWateredIso: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 18 * 86400000).toISOString(),
    estimatedMoisturePercent: 46,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1002',
      tagSize: 'medium',
      plantName: 'ভিয়েতনামী মাল্টা',
      varietyName: 'বারোমাসি সুইট',
      isAllSeason: true,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০২ • BAGANI',
    },
  },
  {
    id: 'plt_sapodilla_3',
    qrCodeId: 'BAGANI-QR-1003',
    nameBengali: 'থাই সবেদা',
    nameEnglish: 'Thai Sapodilla (Chikoo)',
    variety: 'থাই লম্বা মিষ্টি সবেদা',
    category: 'fruit',
    isAllSeason: true,
    plantedDateIso: new Date(Date.now() - 95 * 86400000).toISOString(),
    containerSizeInches: 20,
    rooftopZone: 'পূর্ব কার্নিশ সারি - টব ০৩',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'ফুল ও কুঁড়ি আসতে শুরু করেছে',
    lastWateredIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 8 * 86400000).toISOString(),
    estimatedMoisturePercent: 68,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1003',
      tagSize: 'medium',
      plantName: 'থাই সবেদা',
      varietyName: 'থাই বারোমাসি',
      isAllSeason: true,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০৩ • BAGANI',
    },
  },
  {
    id: 'plt_tamarind_4',
    qrCodeId: 'BAGANI-QR-1004',
    nameBengali: 'মিষ্টি তেঁতুল',
    nameEnglish: 'Sweet Tamarind',
    variety: 'থাই মিষ্টি তেঁতুল (কলম)',
    category: 'fruit',
    isAllSeason: false,
    plantedDateIso: new Date(Date.now() - 80 * 86400000).toISOString(),
    containerSizeInches: 20,
    rooftopZone: 'পশ্চিম কার্নিশ সারি - টব ০৪',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'শিকড় ও ডালপালা মজবুত হচ্ছে',
    lastWateredIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 15 * 86400000).toISOString(),
    estimatedMoisturePercent: 64,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1004',
      tagSize: 'medium',
      plantName: 'মিষ্টি তেঁতুল',
      varietyName: 'থাই কলম জাত',
      isAllSeason: false,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০৪ • BAGANI',
    },
  },
  {
    id: 'plt_fig_5',
    qrCodeId: 'BAGANI-QR-1005',
    nameBengali: 'তিন ফল (ডুমুর)',
    nameEnglish: 'Tin Phal (Arabian Fig)',
    variety: 'মিশরীয় পুষ্টিকর তিন ফল',
    category: 'fruit',
    isAllSeason: true,
    plantedDateIso: new Date(Date.now() - 65 * 86400000).toISOString(),
    containerSizeInches: 18,
    rooftopZone: 'পূর্ব কার্নিশ সারি - টব ০৫',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'ডালে ছোট ফলের কুঁড়ি দেখা যাচ্ছে',
    lastWateredIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 10 * 86400000).toISOString(),
    estimatedMoisturePercent: 70,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1005',
      tagSize: 'medium',
      plantName: 'তিন ফল (ডুমুর)',
      varietyName: 'মিশরীয় বারোমাসি',
      isAllSeason: true,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০৫ • BAGANI',
    },
  },
  {
    id: 'plt_guava_6',
    qrCodeId: 'BAGANI-QR-1006',
    nameBengali: 'ডায়মন্ড পেয়ারা',
    nameEnglish: 'Diamond Seedless Guava',
    variety: 'ডায়মন্ড সিডলেস পেয়ারা',
    category: 'fruit',
    isAllSeason: true,
    plantedDateIso: new Date(Date.now() - 60 * 86400000).toISOString(),
    containerSizeInches: 18,
    rooftopZone: 'উত্তর কার্নিশ সারি - টব ০৬',
    healthState: 'healthy',
    lastHealthDiagnosisSummary: 'সতেজ সবুজ পাতা ও দ্রুত বৃদ্ধি',
    lastWateredIso: new Date(Date.now() - 1 * 86400000).toISOString(),
    lastFertilizedIso: new Date(Date.now() - 14 * 86400000).toISOString(),
    estimatedMoisturePercent: 74,
    qrTagConfig: {
      qrCodeValue: 'BAGANI-QR-1006',
      tagSize: 'medium',
      plantName: 'ডায়মন্ড পেয়ারা',
      varietyName: 'ডায়মন্ড সিডলেস',
      isAllSeason: true,
      customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
      ownerName: 'সবুজ বাগানি',
      ownerAddressOrCode: 'টব #০৬ • BAGANI',
    },
  },
];

export const INITIAL_TIMELINE_LOGS: PlantTimelineLog[] = [
  {
    id: 'log_1',
    plantId: 'plt_katimon_1',
    actionType: 'watering',
    titleBengali: 'সকালের নিয়মিত পানি প্রদান (২.৫ লিটার)',
    titleEnglish: 'Morning Watering (2.5 Liters)',
    detailsNotes:
      'রোদের তীব্রতা বিবেচনা করে ২৪ ইঞ্চি জিও ব্যাগে ২.৫ লিটার পানি দেওয়া হয়েছে এবং পাতা ধুলোমুক্ত রাখতে স্প্রে করা হয়েছে।',
    waterLitersApplied: 2.5,
    completedViaCheckbox: true,
    timestampIso: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'log_2',
    plantId: 'plt_katimon_1',
    actionType: 'fertilizer',
    titleBengali: 'ভার্মিকম্পোস্ট ও হাড়ের গুঁড়ো প্রয়োগ',
    titleEnglish: 'Vermicompost & Bone Meal Applied',
    detailsNotes:
      'টবের চারপাশের মাটি খুঁচিয়ে ২৫০ গ্রাম ভার্মিকম্পোস্ট, ৫০ গ্রাম হাড়ের গুঁড়ো ও কলার খোসার গুঁড়ো মিশিয়ে হালকা সেচ দেওয়া হয়েছে।',
    fertilizerFormulaApplied: 'ভার্মিকম্পোস্ট ২৫০ গ্রাম + হাড়ের গুঁড়ো ৫০ গ্রাম',
    completedViaCheckbox: true,
    timestampIso: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'log_3',
    plantId: 'plt_malta_2',
    actionType: 'organic_spray',
    titleBengali: 'জৈব নিম তেল ও বেকিং সোডা স্প্রে',
    titleEnglish: 'Organic Neem Oil & Baking Soda Spray',
    detailsNotes:
      'ছত্রাক ও পাতা কোঁকড়ানো রোধে ১ লিটার পানিতে ১ চা চামচ নিম তেল মিশিয়ে বিকেলে পাতার উপরে ও নিচে স্প্রে করা হয়েছে।',
    completedViaCheckbox: true,
    timestampIso: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export const INITIAL_CARE_TASKS: GranularCareTask[] = [
  {
    id: 'tsk_1',
    plantId: 'plt_malta_2',
    plantNameBengali: 'ভিয়েতনামী মাল্টা',
    plantNameEnglish: 'Vietnamese Malta',
    dueDateIso: new Date().toISOString(),
    isUrgentNext3Days: true,
    recommendedTimeSlot: 'afternoon',
    waterAmountLiters: 2.0,
    fertilizerOrSprayInstructionBengali:
      '১ লিটার পানিতে ১ চামচ এপসম লবণ (Epsom Salt) মিশিয়ে বিকেলে পাতায় স্প্রে করুন এবং ২ লিটার পানি গোড়ায় দিন।',
    fertilizerOrSprayInstructionEnglish:
      'Spray 1 tsp Epsom Salt in 1L water on leaves in the afternoon & apply 2L water to soil.',
    shadeOrMoistureAdvisoryBengali:
      'ইটের ভাটার ধুলোবালি পরিষ্কার রাখতে পাতা হালকা পানি দিয়ে ধুয়ে দিন।',
    shadeOrMoistureAdvisoryEnglish:
      'Mist leaves gently to remove dust buildup.',
    isCompleted: false,
  },
  {
    id: 'tsk_2',
    plantId: 'plt_katimon_1',
    plantNameBengali: 'কাটিমন-১২ আম',
    plantNameEnglish: 'Katimon-12 Mango',
    dueDateIso: new Date(Date.now() + 86400000).toISOString(),
    isUrgentNext3Days: true,
    recommendedTimeSlot: 'morning',
    waterAmountLiters: 2.5,
    fertilizerOrSprayInstructionBengali:
      'সকাল ৮টার আগে ২.৫ লিটার পানি দিন এবং মটর দানার মতো মুকুল/ফল টিকিয়ে রাখতে তরল পটাশ সার দিন।',
    fertilizerOrSprayInstructionEnglish:
      'Water 2.5L before 8 AM and apply organic banana-peel potash boost.',
    isCompleted: false,
  },
  {
    id: 'tsk_3',
    plantId: 'plt_sapodilla_3',
    plantNameBengali: 'থাই সবেদা',
    plantNameEnglish: 'Thai Sapodilla',
    dueDateIso: new Date(Date.now() + 2 * 86400000).toISOString(),
    isUrgentNext3Days: true,
    recommendedTimeSlot: 'afternoon',
    waterAmountLiters: 2.0,
    fertilizerOrSprayInstructionBengali:
      'ফুল আসার সময় ২০০ গ্রাম ভার্মিকম্পোস্ট ও সামান্য ঝিনুক চুন মাটির সাথে মিশিয়ে ২ লিটার পানি দিন।',
    fertilizerOrSprayInstructionEnglish:
      'Mix 200g vermicompost + oyster shell calcium and water 2.0L.',
    isCompleted: false,
  },
];

export class LocalDbService {
  static async getPlants(): Promise<PlantModel[]> {
    try {
      const raw = await AsyncStorage.getItem(PLANTS_STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(
          PLANTS_STORAGE_KEY,
          JSON.stringify(INITIAL_SAMPLE_PLANTS)
        );
        return INITIAL_SAMPLE_PLANTS;
      }
      return JSON.parse(raw) as PlantModel[];
    } catch {
      return INITIAL_SAMPLE_PLANTS;
    }
  }

  static computeHorticulturalGuidance(plant: PlantModel): {
    waterLiters: number;
    containerSummaryBn: string;
    containerSummaryEn: string;
    soilNutritionPrescriptionBn: string;
    soilNutritionPrescriptionEn: string;
    tailoredCareGuideBn: string;
    tailoredCareGuideEn: string;
  } {
    const sizeIn = plant.containerSizeInches || 18;
    const cType = plant.containerType || 'geo_bag';
    const stage = plant.growthStage || 'vegetative';
    const canopy = plant.canopySize || 'medium';
    const soil = plant.soilCondition || 'loam_compost';
    const sun = plant.sunlightExposure || 'full_sun';

    // Container label
    const containerTypeBn =
      cType === 'geo_bag'
        ? `${sizeIn} ইঞ্চি জিও ব্যাগ (Grow Bag)`
        : cType === 'gallon_pot'
        ? `${sizeIn} গ্যালন পট (Gallon Pot)`
        : cType === 'bucket_drum'
        ? `${sizeIn} লিটার বালতি / হাফ-ড্রাম`
        : cType === 'clay_cement_pot'
        ? `${sizeIn} ইঞ্চি মাটি/সিমেন্টের টব`
        : 'সরাসরি বেড / মাটি';

    const containerTypeEn =
      plant.containerCapacityLabel ||
      (cType === 'geo_bag'
        ? `${sizeIn}" Geo-Bag (Grow Bag)`
        : cType === 'gallon_pot'
        ? `${sizeIn} Gallon Pot`
        : cType === 'bucket_drum'
        ? `${sizeIn}L Bucket / Half-Drum`
        : cType === 'clay_cement_pot'
        ? `${sizeIn}" Clay / Cement Pot`
        : 'Raised Bed / Direct Soil');

    // Calculate base water liters from container volume + canopy size + soil + sun
    let baseWater =
      cType === 'bucket_drum'
        ? sizeIn >= 50
          ? 3.5
          : 1.8
        : cType === 'gallon_pot'
        ? sizeIn >= 15
          ? 2.2
          : 1.2
        : sizeIn >= 20
        ? 2.5
        : sizeIn >= 15
        ? 1.8
        : 1.2;

    if (canopy === 'large') baseWater += 0.6;
    if (canopy === 'small') baseWater = Math.max(0.6, baseWater - 0.5);
    if (soil === 'clay_heavy') baseWater = Math.max(0.5, baseWater - 0.4);
    if (soil === 'sandy_fast') baseWater += 0.4;
    if (sun === 'shaded') baseWater = Math.max(0.5, baseWater - 0.4);

    const waterLiters = Number(baseWater.toFixed(1));

    // Calculate exact fertilizer dosage in grams based on container capacity & growth stage
    const compostGrams =
      cType === 'bucket_drum' && sizeIn >= 50
        ? 450
        : sizeIn >= 20 || (cType === 'gallon_pot' && sizeIn >= 15)
        ? 300
        : sizeIn >= 14 || (cType === 'gallon_pot' && sizeIn >= 10)
        ? 200
        : 120;
    const boneMealGrams = Math.round(compostGrams * 0.2);
    const mustardCakeGrams = Math.round(compostGrams * 0.12);

    const stageNutrientBn =
      stage === 'sapling'
        ? `চারা অবস্থায় শিকড় গঠনের জন্য প্রতি ২০ দিনে ${compostGrams} গ্রাম ভার্মিকম্পোস্ট ও ১ চা চামচ ট্রাইকোডার্মা দিন (রাসায়নিক সার দেবেন না)।`
        : stage === 'flowering'
        ? `ফুল ও মুকুল টিকিয়ে রাখতে ${compostGrams} গ্রাম ভার্মিকম্পোস্ট, ${boneMealGrams} গ্রাম হাড়ের গুঁড়ো এবং ১ লিটার পানিতে ২ গ্রাম বোরন ও পটাশ স্প্রে করুন।`
        : stage === 'fruiting'
        ? `ফলের আকার ও মিষ্টতা বৃদ্ধির জন্য প্রতি ১৫ দিনে ${compostGrams} গ্রাম ভার্মিকম্পোস্ট, ${boneMealGrams} গ্রাম হাড়ের গুঁড়ো, ${mustardCakeGrams} গ্রাম সরিষার খৈল পচা পানি ও কলার খোসার তরল সার দিন।`
        : `পাতা ও ডালপালা বৃদ্ধির জন্য প্রতি ২০ দিনে ${compostGrams} গ্রাম ভার্মিকম্পোস্ট, ${boneMealGrams} গ্রাম হাড়ের গুঁড়ো এবং ${mustardCakeGrams} গ্রাম নিম খৈল মাটির চারপাশে মিশিয়ে দিন।`;

    const stageNutrientEn =
      stage === 'sapling'
        ? `Sapling Root-Building Formula (${containerTypeEn}): Apply ${compostGrams}g Vermicompost + 1 tsp Trichoderma every 20 days. Avoid harsh chemical fertilizers.`
        : stage === 'flowering'
        ? `Flowering & Blossom Retention Formula (${containerTypeEn}): Apply ${compostGrams}g Vermicompost + ${boneMealGrams}g Bone Meal + foliar spray of 2g Boron & Organic Potash per liter.`
        : stage === 'fruiting'
        ? `Fruit Sizing & Sweetening Formula (${containerTypeEn}): Apply ${compostGrams}g Vermicompost + ${boneMealGrams}g Bone Meal + ${mustardCakeGrams}g fermented Mustard Cake liquid every 15 days.`
        : `Balanced Vegetative Formula (${containerTypeEn}): Mix ${compostGrams}g Vermicompost + ${boneMealGrams}g Bone Meal + ${mustardCakeGrams}g Neem Cake around the container rim every 20 days.`;

    const soilAdviceBn =
      soil === 'clay_heavy'
        ? 'মাটি এঁটেল প্রকৃতির হওয়ায় উপরের ২ ইঞ্চি মাটি না শুকানো পর্যন্ত পুনরায় পানি দেবেন না এবং মাটিতে কোকোপিট যোগ করুন।'
        : soil === 'sandy_fast'
        ? 'বেলে মাটিতে পানি দ্রুত শুকিয়ে যায়—সকাল ও বিকেলে মাটির আর্দ্রতা পরীক্ষা করে নিয়মিত সেচ দিন ও মালচিং করুন।'
        : 'দোআঁশ ও জৈব সার মিশ্রিত মাটিতে প্রতিদিন সকালে নিয়মিত সেচ দিন এবং মাসে একবার মাটি আলতো করে খুঁচিয়ে দিন।';

    const soilAdviceEn =
      soil === 'clay_heavy'
        ? 'Heavy clay soil retains moisture—allow top 2 inches to dry before re-watering and aerate with coco peat.'
        : soil === 'sandy_fast'
        ? 'Fast-draining sandy mix—mulch the top layer with dry leaves and water ${waterLiters}L consistently in the morning.'
        : `Well-draining loam mix—water ${waterLiters}L in the morning and gently loosen the top 1.5 inches of soil every 15 days.`;

    return {
      waterLiters,
      containerSummaryBn: containerTypeBn,
      containerSummaryEn: containerTypeEn,
      soilNutritionPrescriptionBn:
        plant.customFertilizerGuideBn || stageNutrientBn,
      soilNutritionPrescriptionEn:
        plant.customFertilizerGuideEn || stageNutrientEn,
      tailoredCareGuideBn: plant.customCareGuideBn || soilAdviceBn,
      tailoredCareGuideEn: plant.customCareGuideEn || soilAdviceEn,
    };
  }

  static async addPlant(newPlant: PlantModel): Promise<PlantModel[]> {
    const guidance = this.computeHorticulturalGuidance(newPlant);
    const enrichedPlant: PlantModel = {
      ...newPlant,
      customFertilizerGuideBn: guidance.soilNutritionPrescriptionBn,
      customFertilizerGuideEn: guidance.soilNutritionPrescriptionEn,
      customCareGuideBn: guidance.tailoredCareGuideBn,
      customCareGuideEn: guidance.tailoredCareGuideEn,
    };

    const current = await this.getPlants();
    const updated = [enrichedPlant, ...current];
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updated));

    // Automatically generate a tailored care task & notification for the newly added plant
    const tasks = await this.getCareTasks();
    const autoTask: GranularCareTask = {
      id: 'tsk_new_' + Date.now().toString(36),
      plantId: enrichedPlant.id,
      plantNameBengali: enrichedPlant.nameBengali,
      plantNameEnglish: enrichedPlant.nameEnglish,
      dueDateIso: new Date().toISOString(),
      isUrgentNext3Days: true,
      recommendedTimeSlot: 'morning',
      waterAmountLiters: guidance.waterLiters,
      fertilizerOrSprayInstructionBengali: `${guidance.soilNutritionPrescriptionBn} (${guidance.tailoredCareGuideBn})`,
      fertilizerOrSprayInstructionEnglish: `${guidance.soilNutritionPrescriptionEn} (${guidance.tailoredCareGuideEn})`,
      isCompleted: false,
      status: 'pending',
    };
    await AsyncStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify([autoTask, ...tasks])
    );

    // Log registration & calculated prescription into the plant's timeline
    const existingLogs = await this.getTimelineLogs();
    const registrationLog: PlantTimelineLog = {
      id: 'log_reg_' + Date.now().toString(36),
      plantId: enrichedPlant.id,
      actionType: 'fertilizer',
      titleBengali: `🌱 নতুন গাছ নিবন্ধিত: ${enrichedPlant.nameBengali} (${guidance.containerSummaryBn})`,
      titleEnglish: `🌱 Registered: ${enrichedPlant.nameEnglish} (${guidance.containerSummaryEn})`,
      detailsNotes: `${guidance.soilNutritionPrescriptionEn} • Daily Water: ${guidance.waterLiters}L`,
      waterLitersApplied: guidance.waterLiters,
      completedViaCheckbox: true,
      timestampIso: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      LOGS_STORAGE_KEY,
      JSON.stringify([registrationLog, ...existingLogs])
    );

    return updated;
  }

  static async updatePlant(updatedPlant: PlantModel): Promise<PlantModel[]> {
    const current = await this.getPlants();
    const updated = current.map((p) =>
      p.id === updatedPlant.id ? updatedPlant : p
    );
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static async getTimelineLogs(plantId?: string): Promise<PlantTimelineLog[]> {
    try {
      const raw = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const all: PlantTimelineLog[] = raw
        ? JSON.parse(raw)
        : INITIAL_TIMELINE_LOGS;
      if (!raw) {
        await AsyncStorage.setItem(
          LOGS_STORAGE_KEY,
          JSON.stringify(INITIAL_TIMELINE_LOGS)
        );
      }
      const filtered = plantId
        ? all.filter((l) => l.plantId === plantId)
        : all;
      return filtered.sort(
        (a, b) =>
          new Date(b.timestampIso).getTime() -
          new Date(a.timestampIso).getTime()
      );
    } catch {
      return INITIAL_TIMELINE_LOGS;
    }
  }

  static async addTimelineLog(
    log: PlantTimelineLog
  ): Promise<PlantTimelineLog[]> {
    const all = await this.getTimelineLogs();
    const updated = [log, ...all];
    await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));

    // Also update plant's lastWatered / lastFertilized / moisture
    const plants = await this.getPlants();
    const updatedPlants = plants.map((p) => {
      if (p.id !== log.plantId) return p;
      return {
        ...p,
        lastWateredIso:
          log.actionType === 'watering' ? log.timestampIso : p.lastWateredIso,
        lastFertilizedIso:
          log.actionType === 'fertilizer'
            ? log.timestampIso
            : p.lastFertilizedIso,
        estimatedMoisturePercent:
          log.actionType === 'watering'
            ? Math.min(92, p.estimatedMoisturePercent + 22)
            : p.estimatedMoisturePercent,
      };
    });
    await AsyncStorage.setItem(
      PLANTS_STORAGE_KEY,
      JSON.stringify(updatedPlants)
    );
    return updated;
  }

  static async getCareTasks(): Promise<GranularCareTask[]> {
    try {
      const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (!raw) {
        await AsyncStorage.setItem(
          TASKS_STORAGE_KEY,
          JSON.stringify(INITIAL_CARE_TASKS)
        );
        return INITIAL_CARE_TASKS;
      }
      return JSON.parse(raw) as GranularCareTask[];
    } catch {
      return INITIAL_CARE_TASKS;
    }
  }

  static async addCareTask(
    newTask: GranularCareTask
  ): Promise<GranularCareTask[]> {
    const current = await this.getCareTasks();
    const updated = [newTask, ...current];
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static async saveTaskStatus(
    task: GranularCareTask,
    nextStatus: CareTaskStatus
  ): Promise<{
    tasks: GranularCareTask[];
    newLog?: PlantTimelineLog;
  }> {
    const current = await this.getCareTasks();
    const isCompleted = nextStatus === 'completed';
    const updated = current.map((t) =>
      t.id === task.id
        ? {
            ...t,
            isCompleted,
            status: nextStatus,
            savedAtIso: new Date().toISOString(),
          }
        : t
    );
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));

    if (isCompleted) {
      const log: PlantTimelineLog = {
        id: 'log_chk_' + Date.now().toString(36),
        plantId: task.plantId,
        actionType: task.waterAmountLiters ? 'watering' : 'fertilizer',
        titleBengali: `✓ চেকবক্স সম্পন্ন: ${task.plantNameBengali} (${task.waterAmountLiters || 1.5} লিটার পানি ও যত্ন)`,
        titleEnglish: `✓ Task Completed: ${task.plantNameEnglish} (${task.waterAmountLiters || 1.5}L Water & Care)`,
        detailsNotes:
          task.fertilizerOrSprayInstructionBengali ||
          'নির্ধারিত পরিচর্যা সম্পন্ন করা হয়েছে।',
        waterLitersApplied: task.waterAmountLiters,
        completedViaCheckbox: true,
        timestampIso: new Date().toISOString(),
      };
      await this.addTimelineLog(log);
      return { tasks: updated, newLog: log };
    }
    return { tasks: updated };
  }

  static async toggleTaskCompleted(task: GranularCareTask): Promise<{
    tasks: GranularCareTask[];
    newLog?: PlantTimelineLog;
  }> {
    const nextStatus: CareTaskStatus = task.isCompleted
      ? 'pending'
      : 'completed';
    return this.saveTaskStatus(task, nextStatus);
  }

  /**
   * Generates Past 7 Days + Today + Next 7 Days Weather Snapshots (Turn 128)
   */
  static get15DayWeatherWindow(): {
    past7Days: DailyWeatherSnapshot[];
    today: DailyWeatherSnapshot;
    next7Days: DailyWeatherSnapshot[];
  } {
    const makeSnap = (
      offsetDays: number,
      bnLabel: string,
      enLabel: string,
      temp: number,
      hum: number,
      rain: number,
      cond: DailyWeatherSnapshot['condition']
    ): DailyWeatherSnapshot => ({
      dateIso: new Date(Date.now() + offsetDays * 86400000).toISOString(),
      dayLabelBengali: bnLabel,
      dayLabelEnglish: enLabel,
      tempCelsius: temp,
      humidityPercent: hum,
      rainProbabilityPercent: rain,
      condition: cond,
    });

    const past7Days: DailyWeatherSnapshot[] = [
      makeSnap(-7, '৭ দিন আগে', '7d ago', 31, 60, 10, 'sunny'),
      makeSnap(-6, '৬ দিন আগে', '6d ago', 32, 58, 5, 'hot_dry'),
      makeSnap(-5, '৫ দিন আগে', '5d ago', 30, 65, 20, 'partly_cloudy'),
      makeSnap(-4, '৪ দিন আগে', '4d ago', 28, 78, 65, 'rainy'),
      makeSnap(-3, '৩ দিন আগে', '3d ago', 29, 70, 30, 'partly_cloudy'),
      makeSnap(-2, '২ দিন আগে', '2d ago', 31, 62, 15, 'sunny'),
      makeSnap(-1, 'গতকাল', 'Yesterday', 31, 64, 10, 'sunny'),
    ];

    const today = makeSnap(0, 'আজ (লাইভ)', 'Today (Live)', 30, 62, 15, 'sunny');

    const next7Days: DailyWeatherSnapshot[] = [
      makeSnap(1, 'আগামীকাল', 'Tomorrow', 31, 60, 10, 'sunny'),
      makeSnap(2, '২ দিন পর', 'In 2 days', 33, 54, 5, 'hot_dry'),
      makeSnap(3, '৩ দিন পর', 'In 3 days', 32, 58, 15, 'sunny'),
      makeSnap(4, '৪ দিন পর', 'In 4 days', 29, 76, 60, 'rainy'),
      makeSnap(5, '৫ দিন পর', 'In 5 days', 28, 80, 70, 'rainy'),
      makeSnap(6, '৬ দিন পর', 'In 6 days', 30, 68, 25, 'partly_cloudy'),
      makeSnap(7, '৭ দিন পর', 'In 7 days', 31, 63, 10, 'sunny'),
    ];

    return { past7Days, today, next7Days };
  }

  /**
   * Computes Dual-Tab Plant Profile Data: Current Status & Future Growth Forecast (Turn 174)
   */
  static getPlantForecast(plant: PlantModel): PlantCurrentAndFutureForecast {
    const ageInDays = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(plant.plantedDateIso).getTime()) / 86400000
      )
    );
    const daysSinceLastWatered = plant.lastWateredIso
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(plant.lastWateredIso).getTime()) / 86400000
          )
        )
      : 1;
    const daysSinceLastFertilized = plant.lastFertilizedIso
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(plant.lastFertilizedIso).getTime()) / 86400000
          )
        )
      : 10;

    const guidance = this.computeHorticulturalGuidance(plant);
    const propType = plant.propagationType || 'grafted';
    const stage = plant.growthStage || 'vegetative';
    const baseHarvestDays =
      stage === 'fruiting'
        ? 30
        : stage === 'flowering'
        ? 65
        : propType === 'seed'
        ? 365
        : plant.isAllSeason
        ? 150
        : 220;
    const estimatedDaysToFloweringOrHarvest = Math.max(
      10,
      baseHarvestDays - (ageInDays % baseHarvestDays)
    );

    return {
      plantId: plant.id,
      ageInDays,
      daysSinceLastWatered,
      daysSinceLastFertilized,
      currentHealthStatusBengali:
        plant.healthState === 'healthy'
          ? 'সম্পূর্ণ সুস্থ ও স্বাভাবিক বৃদ্ধি'
          : plant.healthState === 'diseased'
          ? 'পোকা বা ছত্রাক সংক্রমণ — জৈব চিকিৎসা প্রয়োজন'
          : 'হালকা পুষ্টি/পাতার যত্ন প্রয়োজন',
      currentHealthStatusEnglish:
        plant.healthState === 'healthy'
          ? 'Healthy & Active Growth'
          : plant.healthState === 'diseased'
          ? 'Pest / Fungal Infection — Organic Treatment Needed'
          : 'Needs Minor Foliar & Nutrient Care',
      activeDiseaseAlert:
        plant.healthState !== 'healthy'
          ? plant.lastHealthDiagnosisSummary
          : undefined,
      containerSummaryBn: guidance.containerSummaryBn,
      containerSummaryEn: guidance.containerSummaryEn,
      soilNutritionPrescriptionBn: guidance.soilNutritionPrescriptionBn,
      soilNutritionPrescriptionEn: guidance.soilNutritionPrescriptionEn,
      tailoredCareGuideBn: guidance.tailoredCareGuideBn,
      tailoredCareGuideEn: guidance.tailoredCareGuideEn,
      estimatedDaysToFloweringOrHarvest,
      expectedHarvestSeasonBengali: plant.isAllSeason
        ? 'বারোমাসি ফলন — আগামী মৌসুমেই ফল সংগ্রহ উপযোগী'
        : 'নির্ধারিত মৌসুমে ফল সংগ্রহ উপযোগী',
      expectedHarvestSeasonEnglish: plant.isAllSeason
        ? 'All-Season Yield — Ready in upcoming cycle'
        : 'Seasonal Harvest Window',
      upcomingWeekWeatherAdvisoryBengali:
        'আগামী ২য় ও ৩য় দিনে রোদের তাপমাত্রা ৩৩°C থাকবে—সকালে ২–২.৫ লিটার পানি দিন। ৪র্থ ও ৫ম দিনে বৃষ্টির সম্ভাবনা থাকায় সেচ বন্ধ রাখুন এবং মেঘলা আবহাওয়ার পর বিকেলে বেকিং সোডা বা নিম তেল স্প্রে করুন।',
      upcomingWeekWeatherAdvisoryEnglish:
        'Days 2–3 will reach 33°C—water 2–2.5L in the morning. Skip watering on rainy Days 4–5 and spray organic neem oil after cloudy spells.',
      preEmptiveDiseaseRiskWarning:
        'মেঘলা ও আর্দ্র আবহাওয়ায় পাতায় ছত্রাক (Fungal Spot) প্রতিরোধে ১০ দিন অন্তর জৈব নিম তেল স্প্রে করার পরামর্শ দেওয়া হচ্ছে।',
      growthProjectionGraph: [
        {
          monthLabelBengali: 'বর্তমান মাস',
          monthLabelEnglish: 'Current Month',
          expectedHeightCm: 85 + Math.min(60, Math.floor(ageInDays * 0.3)),
          expectedCanopyScore: 62,
          milestoneNoteBengali: 'নতুন ডালপালা ও পাতার বিস্তার',
          milestoneNoteEnglish: 'Active vegetative shoot expansion',
        },
        {
          monthLabelBengali: 'আগামী ১ মাস পর',
          monthLabelEnglish: '+1 Month Forecast',
          expectedHeightCm: 98 + Math.min(60, Math.floor(ageInDays * 0.3)),
          expectedCanopyScore: 78,
          milestoneNoteBengali: 'মুকুল/ফুল আসা ও পটাশ সার প্রয়োগের সময়',
          milestoneNoteEnglish: 'Bud/Flowering stage & Organic Potash boost',
        },
        {
          monthLabelBengali: 'আগামী ২ মাস পর',
          monthLabelEnglish: '+2 Months Forecast',
          expectedHeightCm: 112 + Math.min(60, Math.floor(ageInDays * 0.3)),
          expectedCanopyScore: 94,
          milestoneNoteBengali: 'ফল পরিপক্ব হওয়া ও হারভেস্টিং প্রস্তুতি',
          milestoneNoteEnglish: 'Fruit maturation & Harvest readiness',
        },
      ],
    };
  }
}
