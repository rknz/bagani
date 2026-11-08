/**
 * BAGANI — Registered Plant / Pot Digital Profile & QR Tag Model
 */

export type PlantCategory =
  | 'fruit'
  | 'vegetable'
  | 'herb'
  | 'flower'
  | 'indoor';
export type PlantHealthState = 'healthy' | 'needs_attention' | 'diseased';
export type QrTagSize = 'small' | 'medium' | 'large' | 'qr_only';

export type PlantPropagationType = 'grafted' | 'seed' | 'cutting';
export type PlantGrowthStage =
  | 'sapling'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'dormant';
export type PlantCanopySize = 'small' | 'medium' | 'large';
export type ContainerType =
  | 'geo_bag'
  | 'gallon_pot'
  | 'bucket_drum'
  | 'clay_cement_pot'
  | 'direct_bed';
export type SoilConditionType =
  | 'loam_compost'
  | 'clay_heavy'
  | 'sandy_fast'
  | 'cocopeat_mix';
export type SunlightExposureLevel = 'full_sun' | 'partial_sun' | 'shaded';

export interface PrintableQrTagConfig {
  qrCodeValue: string;
  tagSize: QrTagSize;
  plantName: string;
  varietyName: string;
  isAllSeason: boolean;
  customQuoteBengali: string;
  ownerName: string;
  ownerAddressOrCode?: string;
}

export interface PlantOnlineKnowledgeProfile {
  scientificName: string;
  verifiedNameBn: string;
  verifiedNameEn: string;
  availableVarietiesBn: string[];
  availableVarietiesEn: string[];
  soilSelectionAndMixBn: string;
  soilSelectionAndMixEn: string;
  plantingMethodBn: string;
  plantingMethodEn: string;
  ongoingCareAndFertilizerBn: string;
  ongoingCareAndFertilizerEn: string;
  pruningTechniqueBn: string;
  pruningTechniqueEn: string;
  diseaseAndRemediesBn: string;
  diseaseAndRemediesEn: string;
  harvestAndPostHarvestBn: string;
  harvestAndPostHarvestEn: string;
  onlineSourceSummary?: string;
  verifiedAtIso: string;
}

export interface PlantModel {
  id: string;
  qrCodeId: string; // Unique QR Code identifier (e.g. BAGANI-QR-1001)
  nameBengali: string;
  nameEnglish: string;
  variety: string; // e.g., Katimon-12, China-3, Diamond, Vietnamese Malta
  category: PlantCategory;
  isAllSeason: boolean; // বারোমাসি কিনা
  plantedDateIso: string; // Supports both "Planted Today" and "Existing / Earlier Plant"
  containerSizeInches: number; // Normalized equivalent diameter in inches (e.g. 12, 15, 18, 20, 24)
  containerType?: ContainerType; // Geo-Bag, Gallon Pot, Bucket/Drum, Clay/Cement Pot, Direct Bed
  containerCapacityLabel?: string; // e.g., "20 Inch Geo-Bag (~65L Soil)" or "15 Gallon Pot (~55L)" or "20L Bucket"
  propagationType?: PlantPropagationType; // Grafted/Air-layered vs Seed-grown vs Cutting
  growthStage?: PlantGrowthStage; // Sapling, Vegetative, Flowering, Fruiting, Dormant
  canopySize?: PlantCanopySize; // Small (<2ft), Medium (2-4ft), Large (4-7+ft)
  heightFeet?: number;
  soilCondition?: SoilConditionType; // Loam+Compost, Heavy Clay, Sandy, Coco Peat Mix
  sunlightExposure?: SunlightExposureLevel; // Full Sun (6-8h), Partial Sun (3-5h), Shaded
  environmentWeatherNote?: string;
  customFertilizerGuideBn?: string;
  customFertilizerGuideEn?: string;
  customCareGuideBn?: string;
  customCareGuideEn?: string;
  onlineKnowledgeProfile?: PlantOnlineKnowledgeProfile;
  rooftopZone: string; // e.g., South-East Cornice Row
  photoUri?: string;
  healthState: PlantHealthState;
  lastHealthDiagnosisSummary?: string;
  lastWateredIso?: string;
  lastFertilizedIso?: string;
  estimatedMoisturePercent: number; // Software-calculated from logs & local weather
  qrTagConfig: PrintableQrTagConfig;
}
