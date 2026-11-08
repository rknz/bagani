/**
 * BAGANI — Granular Weather-Based Care Schedule & 7-Day Past/Future Weather Model
 */

export type TimeOfDaySlot = 'morning' | 'afternoon' | 'evening';

export type CareTaskStatus = 'pending' | 'completed' | 'do_later';

export type CareTaskType =
  | 'watering'
  | 'fertilizer'
  | 'pest_control'
  | 'pruning'
  | 'soil_work'
  | 'sunlight'
  | 'general';

export interface DailyWeatherSnapshot {
  dateIso: string;
  dayLabelBengali: string;
  dayLabelEnglish: string;
  tempCelsius: number;
  humidityPercent: number;
  rainProbabilityPercent: number;
  condition: 'sunny' | 'partly_cloudy' | 'rainy' | 'hot_dry';
}

export interface GranularCareTask {
  id: string;
  plantId: string;
  plantNameBengali: string;
  plantNameEnglish: string;
  dueDateIso: string;
  isUrgentNext3Days: boolean;
  recommendedTimeSlot: TimeOfDaySlot;
  taskType?: CareTaskType;
  titleBengali?: string;
  titleEnglish?: string;
  actionDetailsBengali?: string;
  actionDetailsEnglish?: string;
  reasoningBengali?: string;
  reasoningEnglish?: string;
  waterAmountLiters?: number;
  fertilizerOrSprayInstructionBengali?: string;
  fertilizerOrSprayInstructionEnglish?: string;
  shadeOrMoistureAdvisoryBengali?: string;
  shadeOrMoistureAdvisoryEnglish?: string;
  isCompleted: boolean;
  status?: CareTaskStatus;
  savedAtIso?: string;
  notificationScheduled?: boolean;
  notificationId?: string;
}
