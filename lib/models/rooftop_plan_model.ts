/**
 * BAGANI — Smart Rooftop Garden Planner Wizard & Lifecycle Guide Model
 */

export type SunlightExposure = 'full_sun' | 'partial_shade' | 'low_light';

export interface RooftopLifecycleStage {
  stageNumber: number;
  titleBengali: string;
  titleEnglish: string;
  summaryBengali: string;
  summaryEnglish: string;
  checklistItemsBengali: string[];
  checklistItemsEnglish: string[];
  estimatedCostBdtRange?: string;
}

export interface RooftopGardenPlanModel {
  id: string;
  roofLengthFeet: number;
  roofWidthFeet: number;
  totalAreaSqFt: number;
  activeStripWidthFeet: number;
  sunlightExposure: SunlightExposure;
  hasHighDustOrBrickKilnNearby: boolean;
  isDroughtProneRegion: boolean;
  preferredCategories: ('fruit' | 'vegetable')[];
  recommendedVarieties: string[];
  lifecycleStages: RooftopLifecycleStage[];
  createdAtIso: string;
}
