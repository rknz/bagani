/**
 * BAGANI — Messenger-Style Scrollable Timeline & Interactive Task Checkbox Model
 */

export type CareActionType =
  | 'watering'
  | 'fertilizer'
  | 'organic_spray'
  | 'pruning'
  | 'health_scan'
  | 'photo_note'
  | 'repotting'
  | 'harvest';

export interface PlantTimelineLog {
  id: string;
  plantId: string;
  actionType: CareActionType;
  titleBengali: string;
  titleEnglish: string;
  detailsNotes: string; // What fertilizer/water amount was applied & how
  waterLitersApplied?: number;
  fertilizerFormulaApplied?: string;
  completedViaCheckbox: boolean;
  photoUri?: string;
  timestampIso: string;
}
