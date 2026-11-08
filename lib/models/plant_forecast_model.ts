/**
 * BAGANI — Dual-Tab Plant Profile: Current Status & Future Growth Forecast Model
 */

export interface GrowthProjectionPoint {
  monthLabelBengali: string;
  monthLabelEnglish: string;
  expectedHeightCm: number;
  expectedCanopyScore: number; // 0-100 growth index
  milestoneNoteBengali: string;
  milestoneNoteEnglish: string;
}

export interface PlantCurrentAndFutureForecast {
  plantId: string;
  // Tab 1: Current Status (বর্তমান অবস্থা)
  ageInDays: number;
  daysSinceLastWatered: number;
  daysSinceLastFertilized: number;
  currentHealthStatusBengali: string;
  currentHealthStatusEnglish: string;
  activeDiseaseAlert?: string;
  containerSummaryBn?: string;
  containerSummaryEn?: string;
  soilNutritionPrescriptionBn?: string;
  soilNutritionPrescriptionEn?: string;
  tailoredCareGuideBn?: string;
  tailoredCareGuideEn?: string;

  // Tab 2: Future Outlook & Growth Forecast (ভবিষ্যৎ অবস্থা ও পূর্বাভাস)
  estimatedDaysToFloweringOrHarvest: number; // Harvesting Countdown
  expectedHarvestSeasonBengali: string;
  expectedHarvestSeasonEnglish: string;
  upcomingWeekWeatherAdvisoryBengali: string;
  upcomingWeekWeatherAdvisoryEnglish: string;
  preEmptiveDiseaseRiskWarning?: string;
  growthProjectionGraph: GrowthProjectionPoint[];
}
