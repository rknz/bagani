import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  AppThemeColors,
  APP_TYPOGRAPHY,
  DESIGN_TOKENS,
} from '../theme/app_theme';
import { AppLanguage } from '../l10n/translations';
import {
  PlantModel,
  PlantCategory,
  PlantHealthState,
  PlantPropagationType,
  PlantGrowthStage,
  PlantCanopySize,
  ContainerType,
  SoilConditionType,
  SunlightExposureLevel,
} from '../../models/plant_model';
import { LocalDbService } from '../../services/local_db_service';
import {
  OnlineBotanicalService,
  PlantVerificationResult,
} from '../../services/online_botanical_service';

interface AddPlantModalProps {
  visible: boolean;
  lang: AppLanguage;
  theme: AppThemeColors;
  existingPlantCount?: number;
  ownerName?: string;
  ownerDistrict?: string;
  onClose: () => void;
  onSavePlant: (plant: PlantModel) => void;
}

interface QuickPlantPreset {
  nameBn: string;
  nameEn: string;
  variety: string;
  category: PlantCategory;
  isAllSeason: boolean;
  propagation: PlantPropagationType;
  containerType: ContainerType;
  containerSize: number;
}

const QUICK_PRESETS: QuickPlantPreset[] = [
  {
    nameBn: 'কাটিমন আম (বারোমাসি)',
    nameEn: 'Katimon Mango',
    variety: 'বারোমাসি থাই কাটিমন কলম',
    category: 'fruit',
    isAllSeason: true,
    propagation: 'grafted',
    containerType: 'bucket_drum',
    containerSize: 100,
  },
  {
    nameBn: 'দার্জিলিং কমলা',
    nameEn: 'Darjeeling Mandarin Orange',
    variety: 'কলমের দার্জিলিং কমলা',
    category: 'fruit',
    isAllSeason: false,
    propagation: 'grafted',
    containerType: 'geo_bag',
    containerSize: 20,
  },
  {
    nameBn: 'বারোমাসি কাগজি লেবু',
    nameEn: 'Seedless Lemon',
    variety: 'সিডলেস বারোমাসি লেবু',
    category: 'fruit',
    isAllSeason: true,
    propagation: 'grafted',
    containerType: 'geo_bag',
    containerSize: 16,
  },
  {
    nameBn: 'থাই গোল্ডেন পেয়ারা',
    nameEn: 'Thai Golden Guava',
    variety: 'থাই গোল্ডেন-৮ পেয়ারা',
    category: 'fruit',
    isAllSeason: true,
    propagation: 'grafted',
    containerType: 'geo_bag',
    containerSize: 20,
  },
  {
    nameBn: 'চেরি টমেটো',
    nameEn: 'Cherry Tomato',
    variety: 'হাইব্রিড সুইট চেরি',
    category: 'vegetable',
    isAllSeason: false,
    propagation: 'seed',
    containerType: 'gallon_pot',
    containerSize: 7,
  },
  {
    nameBn: 'নাগা মরিচ / কাঁচা মরিচ',
    nameEn: 'Naga / Green Chili',
    variety: 'সুগন্ধি নাগা ও বগুড়ার মরিচ',
    category: 'vegetable',
    isAllSeason: true,
    propagation: 'seed',
    containerType: 'gallon_pot',
    containerSize: 5,
  },
  {
    nameBn: 'হাইব্রিড গোলাপ',
    nameEn: 'Hybrid Tea Rose',
    variety: 'তাজমহল / মিরান্ডি গোলাপ',
    category: 'flower',
    isAllSeason: true,
    propagation: 'grafted',
    containerType: 'clay_cement_pot',
    containerSize: 12,
  },
];

const CONTAINER_PRESETS: Record<ContainerType, number[]> = {
  geo_bag: [10, 12, 16, 18, 20, 24],
  gallon_pot: [5, 7, 10, 15, 20, 25],
  bucket_drum: [15, 20, 30, 50, 100],
  clay_cement_pot: [8, 10, 12, 14, 16, 18],
  direct_bed: [4, 8, 12, 20, 30],
};

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  visible,
  lang,
  theme,
  existingPlantCount = 6,
  ownerName = 'সবুজ বাগানি',
  ownerDistrict = 'ঢাকা',
  onClose,
  onSavePlant,
}) => {
  const isBn = lang === 'bn';
  const fontFam = isBn
    ? APP_TYPOGRAPHY.fontFamilyBengali
    : APP_TYPOGRAPHY.fontFamilyEnglish;

  // 1. Identity & Category
  const [category, setCategory] = useState<PlantCategory>('fruit');
  const [nameInput, setNameInput] = useState('');
  const [varietyInput, setVarietyInput] = useState('');
  const [isAllSeason, setIsAllSeason] = useState<boolean>(true);
  const [propagationType, setPropagationType] =
    useState<PlantPropagationType>('grafted');

  // 2. Planting Status, Age, Growth Stage & Size
  const [isExistingPlant, setIsExistingPlant] = useState<boolean>(false);
  const [ageValue, setAgeValue] = useState<string>('6');
  const [ageUnit, setAgeUnit] = useState<'months' | 'days'>('months');
  const [growthStage, setGrowthStage] =
    useState<PlantGrowthStage>('vegetative');
  const [canopySize, setCanopySize] = useState<PlantCanopySize>('medium');

  // 3. Container Type & Capacity
  const [containerType, setContainerType] = useState<ContainerType>('geo_bag');
  const [containerSizeText, setContainerSizeText] = useState<string>('18');

  // 4. Health, Soil & Environment
  const [healthState, setHealthState] = useState<PlantHealthState>('healthy');
  const [soilCondition, setSoilCondition] =
    useState<SoilConditionType>('loam_compost');
  const [sunlightExposure, setSunlightExposure] =
    useState<SunlightExposureLevel>('full_sun');
  const [rooftopZone, setRooftopZone] = useState<string>(
    'South-East Zone (Sunny)'
  );
  const [environmentWeatherNote, setEnvironmentWeatherNote] =
    useState<string>('');
  const [verificationResult, setVerificationResult] =
    useState<PlantVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerifyPlantOnline = async (customName?: string) => {
    const query = (customName ?? nameInput).trim();
    if (!query) return null;
    setIsVerifying(true);
    try {
      const res = await OnlineBotanicalService.verifyAndEnrichPlant(
        query,
        varietyInput,
        category
      );
      setVerificationResult(res);
      if (res.isValid) {
        setNameInput(isBn ? res.correctedNameBn : res.correctedNameEn);
        setCategory(res.category);
        setIsAllSeason(res.isAllSeason);
        if (!varietyInput.trim()) {
          setVarietyInput(isBn ? res.suggestedVarietyBn : res.suggestedVarietyEn);
        }
      }
      return res;
    } finally {
      setIsVerifying(false);
    }
  };

  const applyPreset = (preset: QuickPlantPreset) => {
    setCategory(preset.category);
    setNameInput(isBn ? preset.nameBn : preset.nameEn);
    setVarietyInput(preset.variety);
    setIsAllSeason(preset.isAllSeason);
    setPropagationType(preset.propagation);
    setContainerType(preset.containerType);
    setContainerSizeText(String(preset.containerSize));
    handleVerifyPlantOnline(isBn ? preset.nameBn : preset.nameEn);
  };

  const handleContainerTypeChange = (type: ContainerType) => {
    setContainerType(type);
    const defaultSizes: Record<ContainerType, number> = {
      geo_bag: 18,
      gallon_pot: 10,
      bucket_drum: 20,
      clay_cement_pot: 12,
      direct_bed: 12,
    };
    setContainerSizeText(String(defaultSizes[type]));
  };

  const containerUnitInfo = useMemo(() => {
    switch (containerType) {
      case 'geo_bag':
        return {
          labelEn: 'Geo-Bag Diameter (Inches)',
          labelBn: 'জিও ব্যাগের মাপ (ইঞ্চি)',
          unitShortEn: 'Inch Geo-Bag',
          unitShortBn: 'ইঞ্চি জিও ব্যাগ',
          helperEn:
            'Standard rooftop geo-bags: 10"–12" for veggies/herbs, 16"–24" for fruit trees.',
          helperBn:
            'সবজির জন্য ১০"-১২" এবং ফলের গাছের জন্য ১৬"-২৪" জিও ব্যাগ আদর্শ।',
        };
      case 'gallon_pot':
        return {
          labelEn: 'Pot Capacity (Gallons)',
          labelBn: 'গ্যালন পটের মাপ (গ্যালন)',
          unitShortEn: 'Gallon Pot',
          unitShortBn: 'গ্যালন পট',
          helperEn:
            '1 US Gallon ≈ 3.8 Liters of soil mix (e.g., 10 Gal = ~38L soil).',
          helperBn:
            '১ গ্যালন ≈ ৩.৮ লিটার মাটি (যেমন ১০ গ্যালন পটে প্রায় ৩৮ লিটার মাটি ধরে)।',
        };
      case 'bucket_drum':
        return {
          labelEn: 'Bucket / Half-Drum Volume (Liters)',
          labelBn: 'বালতি বা হাফ-ড্রামের আয়তন (লিটার)',
          unitShortEn: 'Liter Bucket/Drum',
          unitShortBn: 'লিটার বালতি/ড্রাম',
          helperEn:
            '15L–20L bucket for medium plants, 50L–100L half-drum for large fruit trees.',
          helperBn:
            'মাঝারি গাছের জন্য ১৫-২০ লিটার বালতি এবং বড় ফলের গাছের জন্য ৫০-১০০ লিটার হাফ-ড্রাম।',
        };
      case 'clay_cement_pot':
        return {
          labelEn: 'Pot Rim Diameter (Inches)',
          labelBn: 'টবের মুখের ব্যাস (ইঞ্চি)',
          unitShortEn: 'Inch Clay/Cement Pot',
          unitShortBn: 'ইঞ্চি মাটি/সিমেন্টের টব',
          helperEn:
            'Breathable clay/cement pots: 8"–12" for flowers/indoors, 14"–18" for shrubs.',
          helperBn:
            'ফুল ও ইনডোর গাছের জন্য ৮"-১২" এবং মাঝারি গাছের জন্য ১৪"-১৮" মাটির টব উপযুক্ত।',
        };
      case 'direct_bed':
        return {
          labelEn: 'Bed / Soil Area (Sq. Ft.)',
          labelBn: 'বেড বা মাটির আয়তন (বর্গফুট)',
          unitShortEn: 'Sq.Ft Raised Bed',
          unitShortBn: 'বর্গফুট মাটির বেড',
          helperEn:
            'Permanent masonry rooftop bed or direct ground garden bed area.',
          helperBn: 'ছাদের স্থায়ী পাকা বেড বা সরাসরি মাটির বাগানের আয়তন।',
        };
    }
  }, [containerType]);

  const calculatedAgeDays = useMemo(() => {
    if (!isExistingPlant) return 1;
    const raw = Math.max(1, parseInt(ageValue, 10) || 1);
    return ageUnit === 'months' ? raw * 30 : raw;
  }, [isExistingPlant, ageValue, ageUnit]);

  const draftPlant: PlantModel = useMemo(() => {
    const numericSize = Math.max(1, parseInt(containerSizeText, 10) || 18);
    const plantedDateIso = new Date(
      Date.now() - calculatedAgeDays * 86400000
    ).toISOString();
    const qrId = 'BAGANI-QR-' + (1000 + existingPlantCount + 1);
    const cleanName =
      nameInput.trim() || (isBn ? 'কাটিমন আম' : 'Katimon Mango');
    const cleanVar =
      varietyInput.trim() ||
      (isBn ? 'উন্নত বারোমাসি জাত' : 'High-Yield All-Season');

    const capLabel =
      containerType === 'geo_bag'
        ? `${numericSize}" Geo-Bag`
        : containerType === 'gallon_pot'
        ? `${numericSize} Gallon Pot`
        : containerType === 'bucket_drum'
        ? `${numericSize}L Bucket/Drum`
        : containerType === 'clay_cement_pot'
        ? `${numericSize}" Clay/Cement Pot`
        : `${numericSize} sq.ft Direct Bed`;

    return {
      id: 'plt_preview',
      qrCodeId: qrId,
      nameBengali: cleanName,
      nameEnglish: cleanName,
      variety: cleanVar,
      category,
      isAllSeason,
      plantedDateIso,
      containerSizeInches: numericSize,
      containerType,
      containerCapacityLabel: capLabel,
      propagationType,
      growthStage: isExistingPlant ? growthStage : 'sapling',
      canopySize: isExistingPlant ? canopySize : 'small',
      soilCondition,
      sunlightExposure,
      environmentWeatherNote: environmentWeatherNote.trim(),
      rooftopZone: rooftopZone.trim() || 'South-East Zone (Sunny)',
      healthState,
      lastHealthDiagnosisSummary:
        healthState === 'healthy'
          ? isBn
            ? 'সুস্থ ও সতেজ গাছ'
            : 'Healthy & vigorous plant'
          : healthState === 'needs_attention'
          ? isBn
            ? 'পুষ্টি ও বিশেষ পরিচর্যা প্রয়োজন'
            : 'Requires nutrient & care boost'
          : isBn
          ? 'পোকা বা ছত্রাকের ঝুঁকি — দ্রুত স্প্রে প্রয়োজন'
          : 'Pest/fungal symptoms — urgent treatment needed',
      lastWateredIso: new Date().toISOString(),
      lastFertilizedIso: new Date().toISOString(),
      estimatedMoisturePercent:
        soilCondition === 'clay_heavy'
          ? 78
          : soilCondition === 'sandy_fast'
          ? 58
          : 70,
      qrTagConfig: {
        qrCodeValue: qrId,
        tagSize: 'medium',
        plantName: cleanName,
        varietyName: cleanVar,
        isAllSeason,
        customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
        ownerName,
        ownerAddressOrCode: `${ownerDistrict} • ${qrId}`,
      },
    };
  }, [
    nameInput,
    varietyInput,
    category,
    isAllSeason,
    propagationType,
    isExistingPlant,
    calculatedAgeDays,
    growthStage,
    canopySize,
    containerType,
    containerSizeText,
    soilCondition,
    sunlightExposure,
    rooftopZone,
    environmentWeatherNote,
    healthState,
    existingPlantCount,
    ownerName,
    ownerDistrict,
    isBn,
  ]);

  const guidance = useMemo(
    () => LocalDbService.computeHorticulturalGuidance(draftPlant),
    [draftPlant]
  );

  const handleConfirmSave = async () => {
    if (!nameInput.trim()) {
      setVerificationResult({
        isValid: false,
        wasAutoCorrected: false,
        originalInput: '',
        correctedNameBn: '',
        correctedNameEn: '',
        scientificName: '',
        suggestedVarietyBn: '',
        suggestedVarietyEn: '',
        availableVarietiesBn: [],
        availableVarietiesEn: [],
        category,
        isAllSeason,
        messageBn: '❌ অনুগ্রহ করে আগে একটি বৈধ গাছের নাম লিখুন।',
        messageEn: '❌ Please enter a valid plant name before saving.',
      });
      return;
    }

    const res = await handleVerifyPlantOnline(nameInput);
    if (!res || !res.isValid) {
      return;
    }

    const finalVariety =
      varietyInput.trim() ||
      (isBn ? res.suggestedVarietyBn : res.suggestedVarietyEn);

    const finalPlant: PlantModel = {
      ...draftPlant,
      id: 'plt_' + Date.now().toString(36),
      nameBengali: res.correctedNameBn,
      nameEnglish: res.correctedNameEn,
      variety: finalVariety,
      category: res.category,
      isAllSeason: res.isAllSeason,
      customFertilizerGuideBn: guidance.soilNutritionPrescriptionBn,
      customFertilizerGuideEn: guidance.soilNutritionPrescriptionEn,
      customCareGuideBn: guidance.tailoredCareGuideBn,
      customCareGuideEn: guidance.tailoredCareGuideEn,
      onlineKnowledgeProfile: res.knowledgeProfile,
      qrTagConfig: {
        ...draftPlant.qrTagConfig,
        plantName: isBn ? res.correctedNameBn : res.correctedNameEn,
        varietyName: finalVariety,
        isAllSeason: res.isAllSeason,
      },
    };
    onSavePlant(finalPlant);
    setNameInput('');
    setVarietyInput('');
    setEnvironmentWeatherNote('');
    setVerificationResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Modal Top Header */}
          <View
            style={[styles.headerRow, { borderBottomColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '🌱 নতুন বা পুরাতন গাছ রেজিস্ট্রেশন'
                  : '🌱 Add & Register Plant'}
              </Text>
              <Text
                style={[
                  styles.modalSub,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'সঠিক সার, পানি ও পরিচর্যার গাইড পেতে গাছের সম্পূর্ণ তথ্য দিন'
                  : 'Enter plant kind, age, container & soil details for exact fertilizer & care guidance'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.closeCircle,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={{
                  color: theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Presets Bar */}
            <View style={styles.sectionBlock}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '⚡ জনপ্রিয় গাছের কুইক টেমপ্লেট (ঐচ্ছিক):'
                  : '⚡ Quick Popular Rooftop Templates (Optional):'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                {QUICK_PRESETS.map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: theme.selectedSurface,
                        borderColor: theme.primary + '55',
                      },
                    ]}
                    onPress={() => applyPreset(preset)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: theme.primary, fontFamily: fontFam },
                      ]}
                    >
                      + {isBn ? preset.nameBn : preset.nameEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* SECTION 1: PLANT KIND, NAME & VARIETY */}
            <View
              style={[
                styles.formSectionCard,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '১. গাছের ধরন, নাম ও জাত (Plant Identity)'
                  : '1. What Kind of Plant Is It?'}
              </Text>

              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছের ক্যাটাগরি (Plant Category)'
                  : 'Plant Kind / Category'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'fruit',
                      labelBn: '🥭 ফলের গাছ',
                      labelEn: '🥭 Fruit Tree',
                    },
                    {
                      id: 'vegetable',
                      labelBn: '🍅 সবজি/ফসল',
                      labelEn: '🍅 Vegetable',
                    },
                    {
                      id: 'flower',
                      labelBn: '🌹 ফুলের গাছ',
                      labelEn: '🌹 Flower',
                    },
                    {
                      id: 'herb',
                      labelBn: '🌿 ভেষজ/মশলা',
                      labelEn: '🌿 Herb/Spice',
                    },
                    {
                      id: 'indoor',
                      labelBn: '🪴 ইনডোর/পাতাবাহার',
                      labelEn: '🪴 Indoor',
                    },
                  ] as { id: PlantCategory; labelBn: string; labelEn: string }[]
                ).map((cat) => {
                  const active = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.primary
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? '#FFFFFF' : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? cat.labelBn : cat.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছের নাম (অনলাইনে স্বয়ংক্রিয় বানান যাচাই ও সংশোধন সহ) *'
                  : 'Plant Name (Online Verified & Auto-Spell Corrected) *'}
              </Text>
              <TextInput
                style={[
                  styles.inputField,
                  {
                    width: '100%',
                    backgroundColor: theme.surface,
                    color: theme.textPrimary,
                    borderColor:
                      verificationResult && !verificationResult.isValid
                        ? theme.danger
                        : verificationResult?.isValid
                        ? theme.primary
                        : theme.border,
                    fontFamily: fontFam,
                  },
                ]}
                placeholder={
                  isBn
                    ? 'যেমন: সবেদা, কাটিমন আম, মাল্টা, টমেটো, মরিচ, গোলাপ, জবা, তুলসী...'
                    : 'e.g., Sapodilla, Katimon Mango, Malta, Tomato, Chili, Rose, Tulsi...'
                }
                placeholderTextColor={theme.textMuted}
                value={nameInput}
                onChangeText={(txt) => {
                  setNameInput(txt);
                  if (verificationResult) setVerificationResult(null);
                }}
                onBlur={() => {
                  if (nameInput.trim().length >= 2) {
                    handleVerifyPlantOnline(nameInput);
                  }
                }}
              />
              <View style={{ width: '100%', marginTop: 7, alignItems: 'flex-start' }}>
                <TouchableOpacity
                  onPress={() => handleVerifyPlantOnline(nameInput)}
                  disabled={isVerifying || !nameInput.trim()}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: theme.primary,
                    paddingHorizontal: 15,
                    paddingVertical: 9,
                    borderRadius: DESIGN_TOKENS.buttonRadius,
                  }}
                >
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Circle cx="11" cy="11" r="7" stroke="#FFFFFF" strokeWidth="2.2" />
                    <Path d="M16.5 16.5L21 21" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                  </Svg>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: 12.5,
                      fontFamily: fontFam,
                    }}
                  >
                    {isVerifying
                      ? isBn
                        ? 'যাচাই হচ্ছে...'
                        : 'Checking...'
                      : isBn
                      ? 'অনলাইন যাচাই'
                      : 'Verify Online'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Online Verification & Spell Auto-Correction Status Banner */}
              {verificationResult && (
                <View
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    backgroundColor: verificationResult.isValid
                      ? theme.selectedSurface
                      : theme.danger + '15',
                    borderColor: verificationResult.isValid
                      ? theme.primary
                      : theme.danger,
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: verificationResult.isValid
                        ? theme.primary
                        : theme.danger,
                      fontWeight: '700',
                      fontSize: 12.5,
                      fontFamily: fontFam,
                    }}
                  >
                    {isBn
                      ? verificationResult.messageBn
                      : verificationResult.messageEn}
                  </Text>

                  {verificationResult.isValid &&
                    (isBn
                      ? verificationResult.availableVarietiesBn
                      : verificationResult.availableVarietiesEn
                    ).length > 0 && (
                      <View style={{ marginTop: 4, gap: 4 }}>
                        <Text
                          style={{
                            color: theme.textSecondary,
                            fontSize: 11.5,
                            fontWeight: '600',
                            fontFamily: fontFam,
                          }}
                        >
                          {isBn
                            ? 'অনলাইনে প্রাপ্ত এই গাছের অনুমোদিত জাতসমূহ (১ ট্যাপে নির্বাচন করুন):'
                            : 'Verified Varieties Found Online (Tap to Select):'}
                        </Text>
                        <View style={styles.pillWrapRow}>
                          {(isBn
                            ? verificationResult.availableVarietiesBn
                            : verificationResult.availableVarietiesEn
                          ).map((v) => {
                            const selectedVar = varietyInput === v;
                            return (
                              <TouchableOpacity
                                key={v}
                                onPress={() => setVarietyInput(v)}
                                style={[
                                  styles.smallPill,
                                  {
                                    backgroundColor: selectedVar
                                      ? theme.primary
                                      : theme.surface,
                                    borderColor: theme.primary,
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    color: selectedVar
                                      ? '#FFFFFF'
                                      : theme.primary,
                                    fontSize: 11.5,
                                    fontWeight: '700',
                                    fontFamily: fontFam,
                                  }}
                                >
                                  ✓ {v}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                </View>
              )}

              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn ? 'গাছের জাত (Variety / Cultivar)' : 'Variety / Cultivar'}
              </Text>
              <TextInput
                style={[
                  styles.inputField,
                  {
                    backgroundColor: theme.surface,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    fontFamily: fontFam,
                  },
                ]}
                placeholder={
                  isBn
                    ? 'যেমন: বারোমাসি থাই ভ্যারাইটি, বারি-৪, হাইব্রিড...'
                    : 'e.g., Thai All-Season, BARI-4, Hybrid Sweet...'
                }
                placeholderTextColor={theme.textMuted}
                value={varietyInput}
                onChangeText={setVarietyInput}
              />

              {/* Propagation & Seasonality */}
              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {isBn
                      ? 'চারা তৈরির ধরন (Propagation)'
                      : 'Propagation Type'}
                  </Text>
                  <View style={styles.pillWrapRow}>
                    {(
                      [
                        {
                          id: 'grafted',
                          labelBn: 'কলম (Grafted)',
                          labelEn: 'Grafted / Layered',
                        },
                        {
                          id: 'seed',
                          labelBn: 'বীজ (Seed)',
                          labelEn: 'Seed-Grown',
                        },
                        {
                          id: 'cutting',
                          labelBn: 'কাটিং (Cutting)',
                          labelEn: 'Branch Cutting',
                        },
                      ] as {
                        id: PlantPropagationType;
                        labelBn: string;
                        labelEn: string;
                      }[]
                    ).map((prop) => {
                      const active = propagationType === prop.id;
                      return (
                        <TouchableOpacity
                          key={prop.id}
                          style={[
                            styles.smallPill,
                            {
                              backgroundColor: active
                                ? theme.selectedSurface
                                : theme.surface,
                              borderColor: active
                                ? theme.primary
                                : theme.border,
                            },
                          ]}
                          onPress={() => setPropagationType(prop.id)}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              {
                                color: active
                                  ? theme.primary
                                  : theme.textSecondary,
                                fontFamily: fontFam,
                              },
                            ]}
                          >
                            {isBn ? prop.labelBn : prop.labelEn}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {isBn ? 'ফলনের ধরন (Seasonality)' : 'Seasonality'}
                  </Text>
                  <View style={styles.pillWrapRow}>
                    {(
                      [
                        {
                          val: true,
                          labelBn: 'বারোমাসি (All-Season)',
                          labelEn: 'All-Season',
                        },
                        {
                          val: false,
                          labelBn: 'মৌসুমি (Seasonal)',
                          labelEn: 'Seasonal',
                        },
                      ] as const
                    ).map((s) => {
                      const active = isAllSeason === s.val;
                      return (
                        <TouchableOpacity
                          key={String(s.val)}
                          style={[
                            styles.smallPill,
                            {
                              backgroundColor: active
                                ? theme.selectedSurface
                                : theme.surface,
                              borderColor: active
                                ? theme.primary
                                : theme.border,
                            },
                          ]}
                          onPress={() => setIsAllSeason(s.val)}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              {
                                color: active
                                  ? theme.primary
                                  : theme.textSecondary,
                                fontFamily: fontFam,
                              },
                            ]}
                          >
                            {isBn ? s.labelBn : s.labelEn}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* SECTION 2: WHEN WAS IT PLANTED, AGE, STAGE & SIZE */}
            <View
              style={[
                styles.formSectionCard,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '২. বয়স ও ধাপ (Age & Stage)'
                  : '2. Age & Stage'}
              </Text>

              <View style={styles.twoColRow}>
                <TouchableOpacity
                  style={[
                    styles.modeToggleBtn,
                    {
                      backgroundColor: !isExistingPlant
                        ? theme.primary
                        : theme.surface,
                      borderColor: !isExistingPlant
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setIsExistingPlant(false);
                    setGrowthStage('sapling');
                    setCanopySize('small');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ marginTop: 2 }}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 22V13M12 13C12 13 8 11.5 8 7C10.5 7 12 9 12 13ZM12 13C12 13 16 11.5 16 7C13.5 7 12 9 12 13Z"
                          stroke={!isExistingPlant ? '#FFFFFF' : theme.primary}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.modeToggleTitle,
                          {
                            color: !isExistingPlant ? '#FFFFFF' : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? 'আজ লাগানো হয়েছে' : 'Planted Today'}
                      </Text>
                      <Text
                        style={[
                          styles.modeToggleSub,
                          {
                            color: !isExistingPlant
                              ? 'rgba(255,255,255,0.85)'
                              : theme.textSecondary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? 'নতুন চারা বা টব' : 'New sapling / fresh planting'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeToggleBtn,
                    {
                      backgroundColor: isExistingPlant
                        ? theme.primary
                        : theme.surface,
                      borderColor: isExistingPlant
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() => {
                    setIsExistingPlant(true);
                    setGrowthStage('vegetative');
                    setCanopySize('medium');
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ marginTop: 2 }}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 22V14M12 14C12 14 6 13 6 8C9 8 11 10.5 12 14ZM12 14C12 14 18 13 18 8C15 8 13 10.5 12 14Z"
                          stroke={isExistingPlant ? '#FFFFFF' : theme.primary}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M12 9C12 5.5 14 3 12 2C10 3 12 5.5 12 9Z"
                          stroke={isExistingPlant ? '#FFFFFF' : theme.primary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.modeToggleTitle,
                          {
                            color: isExistingPlant ? '#FFFFFF' : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? 'আগে থেকেই বাগানে আছে' : 'Existing Plant'}
                      </Text>
                      <Text
                        style={[
                          styles.modeToggleSub,
                          {
                            color: isExistingPlant
                              ? 'rgba(255,255,255,0.85)'
                              : theme.textSecondary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn
                          ? 'পুরাতন বা প্রতিষ্ঠিত গাছ'
                          : 'Planted earlier in garden'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {isExistingPlant && (
                <View style={{ marginTop: 10 }}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {isBn
                      ? 'গাছটির বর্তমান বয়স কত? (How old is this plant?)'
                      : 'How old is the plant (since planted)?'}
                  </Text>

                  <View style={[styles.pillWrapRow, { marginBottom: 8 }]}>
                    {[
                      {
                        val: '1',
                        unit: 'months' as const,
                        labelBn: '১ মাস',
                        labelEn: '1 Month',
                      },
                      {
                        val: '3',
                        unit: 'months' as const,
                        labelBn: '৩ মাস',
                        labelEn: '3 Months',
                      },
                      {
                        val: '6',
                        unit: 'months' as const,
                        labelBn: '৬ মাস',
                        labelEn: '6 Months',
                      },
                      {
                        val: '12',
                        unit: 'months' as const,
                        labelBn: '১ বছর',
                        labelEn: '1 Year',
                      },
                      {
                        val: '24',
                        unit: 'months' as const,
                        labelBn: '২ বছর',
                        labelEn: '2 Years',
                      },
                      {
                        val: '36',
                        unit: 'months' as const,
                        labelBn: '৩+ বছর',
                        labelEn: '3+ Years',
                      },
                    ].map((preset) => {
                      const active =
                        ageValue === preset.val && ageUnit === preset.unit;
                      return (
                        <TouchableOpacity
                          key={preset.labelEn}
                          style={[
                            styles.smallPill,
                            {
                              backgroundColor: active
                                ? theme.selectedSurface
                                : theme.surface,
                              borderColor: active
                                ? theme.primary
                                : theme.border,
                            },
                          ]}
                          onPress={() => {
                            setAgeValue(preset.val);
                            setAgeUnit(preset.unit);
                          }}
                        >
                          <Text
                            style={[
                              styles.smallPillText,
                              {
                                color: active
                                  ? theme.primary
                                  : theme.textSecondary,
                                fontFamily: fontFam,
                              },
                            ]}
                          >
                            {isBn ? preset.labelBn : preset.labelEn}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.ageInputRow}>
                    <TextInput
                      style={[
                        styles.inputField,
                        {
                          flex: 1,
                          backgroundColor: theme.surface,
                          color: theme.textPrimary,
                          borderColor: theme.border,
                          fontFamily: fontFam,
                        },
                      ]}
                      keyboardType="numeric"
                      value={ageValue}
                      onChangeText={setAgeValue}
                      placeholder="6"
                      placeholderTextColor={theme.textMuted}
                    />
                    <TouchableOpacity
                      style={[
                        styles.unitBtn,
                        {
                          backgroundColor:
                            ageUnit === 'months'
                              ? theme.primary
                              : theme.surface,
                          borderColor:
                            ageUnit === 'months' ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setAgeUnit('months')}
                    >
                      <Text
                        style={{
                          color:
                            ageUnit === 'months'
                              ? '#FFFFFF'
                              : theme.textPrimary,
                          fontWeight: '700',
                          fontSize: 12,
                          fontFamily: fontFam,
                        }}
                      >
                        {isBn ? 'মাস (Months)' : 'Months'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitBtn,
                        {
                          backgroundColor:
                            ageUnit === 'days' ? theme.primary : theme.surface,
                          borderColor:
                            ageUnit === 'days' ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setAgeUnit('days')}
                    >
                      <Text
                        style={{
                          color:
                            ageUnit === 'days' ? '#FFFFFF' : theme.textPrimary,
                          fontWeight: '700',
                          fontSize: 12,
                          fontFamily: fontFam,
                        }}
                      >
                        {isBn ? 'দিন (Days)' : 'Days'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Growth Stage */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছের বর্তমান বৃদ্ধির ধাপ (Current Growth Stage)'
                  : 'Current Growth Stage'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'sapling',
                      labelBn: '🌱 চারা অবস্থা',
                      labelEn: '🌱 Sapling / Young',
                    },
                    {
                      id: 'vegetative',
                      labelBn: '🌿 ডালপালা বাড়ছে',
                      labelEn: '🌿 Leafy / Growing',
                    },
                    {
                      id: 'flowering',
                      labelBn: '🌸 ফুল বা মুকুল এসেছে',
                      labelEn: '🌸 Flowering / Budding',
                    },
                    {
                      id: 'fruiting',
                      labelBn: '🥭 ফল ধরেছে / পরিপক্ব',
                      labelEn: '🥭 Fruiting / Mature',
                    },
                    {
                      id: 'dormant',
                      labelBn: '🍂 বিশ্রাম কাল (শীত)',
                      labelEn: '🍂 Dormant / Resting',
                    },
                  ] as {
                    id: PlantGrowthStage;
                    labelBn: string;
                    labelEn: string;
                  }[]
                ).map((st) => {
                  const active = growthStage === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setGrowthStage(st.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? theme.primary : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? st.labelBn : st.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Plant Canopy Size */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছের বর্তমান আকার ও উচ্চতা (Plant Size)'
                  : 'Plant Size / Height'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'small',
                      labelBn: 'ছোট (< ২ ফুট)',
                      labelEn: 'Small (< 2 ft)',
                    },
                    {
                      id: 'medium',
                      labelBn: 'মাঝারি (২–৪ ফুট)',
                      labelEn: 'Medium (2–4 ft)',
                    },
                    {
                      id: 'large',
                      labelBn: 'বড় ও ঝোপালো (৪–৭+ ফুট)',
                      labelEn: 'Large (4–7+ ft)',
                    },
                  ] as {
                    id: PlantCanopySize;
                    labelBn: string;
                    labelEn: string;
                  }[]
                ).map((sz) => {
                  const active = canopySize === sz.id;
                  return (
                    <TouchableOpacity
                      key={sz.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setCanopySize(sz.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? theme.primary : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? sz.labelBn : sz.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SECTION 3: CONTAINER TYPE & EXACT CAPACITY */}
            <View
              style={[
                styles.formSectionCard,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '৩. পাত্রের ধরন ও মাপ — জিও ব্যাগ, গ্যালন পট নাকি বালতি? (Container Details)'
                  : '3. Container Type & Size (Crucial for Fertilizer Dosage)'}
              </Text>
              <Text
                style={[
                  styles.helperBannerText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছটি জিও ব্যাগ, গ্যালন পট, বালতি নাকি মাটির টবে আছে তা নির্বাচন করুন। পাত্রের মাপের ওপর ভিত্তি করে সফটওয়্যার স্বয়ংক্রিয়ভাবে সারের সঠিক গ্রাম ও পানির লিটার হিসাব করবে।'
                  : 'Specify whether the plant is in a Geo-Bag, Gallon Pot, Bucket/Half-Drum, Clay Pot, or Direct Bed so BAGANI can calculate exact fertilizer grams and water volume.'}
              </Text>

              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'geo_bag',
                      labelBn: '🛍️ জিও ব্যাগ (Geo-Bag)',
                      labelEn: '🛍️ Geo-Bag (Grow Bag)',
                    },
                    {
                      id: 'gallon_pot',
                      labelBn: '🪴 গ্যালন পট (Gallon Pot)',
                      labelEn: '🪴 Gallon Pot',
                    },
                    {
                      id: 'bucket_drum',
                      labelBn: '🛢️ বালতি / হাফ-ড্রাম',
                      labelEn: '🛢️ Bucket / Half-Drum',
                    },
                    {
                      id: 'clay_cement_pot',
                      labelBn: '🏺 মাটি / সিমেন্টের টব',
                      labelEn: '🏺 Clay / Cement Pot',
                    },
                    {
                      id: 'direct_bed',
                      labelBn: '🧱 সরাসরি মাটি / বেড',
                      labelEn: '🧱 Direct Soil / Bed',
                    },
                  ] as { id: ContainerType; labelBn: string; labelEn: string }[]
                ).map((ct) => {
                  const active = containerType === ct.id;
                  return (
                    <TouchableOpacity
                      key={ct.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.primary
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => handleContainerTypeChange(ct.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? '#FFFFFF' : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? ct.labelBn : ct.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn ? containerUnitInfo.labelBn : containerUnitInfo.labelEn}
              </Text>

              {/* Preset Container Sizes */}
              <View style={[styles.pillWrapRow, { marginBottom: 8 }]}>
                {CONTAINER_PRESETS[containerType].map((sz) => {
                  const active = String(sz) === containerSizeText;
                  const unitSuffix =
                    containerType === 'geo_bag' ||
                    containerType === 'clay_cement_pot'
                      ? '"'
                      : containerType === 'gallon_pot'
                      ? ' Gal'
                      : containerType === 'bucket_drum'
                      ? 'L'
                      : ' sq.ft';
                  return (
                    <TouchableOpacity
                      key={sz}
                      style={[
                        styles.sizePresetChip,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setContainerSizeText(String(sz))}
                    >
                      <Text
                        style={[
                          styles.sizePresetText,
                          {
                            color: active ? theme.primary : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {sz}
                        {unitSuffix}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Numeric Size Input with Clear Unit Badge */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      width: 72,
                      height: 38,
                      borderRadius: 8,
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 14,
                      paddingHorizontal: 4,
                      paddingVertical: 0,
                      backgroundColor: theme.surface,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                      fontFamily: fontFam,
                    },
                  ]}
                  keyboardType="numeric"
                  value={containerSizeText}
                  onChangeText={setContainerSizeText}
                  placeholder="18"
                  placeholderTextColor={theme.textMuted}
                />
                <View
                  style={[
                    styles.unitStaticBadge,
                    {
                      height: 38,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: theme.selectedSurface,
                      borderColor: theme.primary + '55',
                      flexShrink: 0,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: theme.primary,
                      fontWeight: '700',
                      fontSize: 12,
                      fontFamily: fontFam,
                    }}
                  >
                    {isBn
                      ? containerUnitInfo.unitShortBn
                      : containerUnitInfo.unitShortEn}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.microHint,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                ℹ️{' '}
                {isBn ? containerUnitInfo.helperBn : containerUnitInfo.helperEn}
              </Text>
            </View>

            {/* SECTION 4: HEALTH, SOIL & WEATHER ENVIRONMENT */}
            <View
              style={[
                styles.formSectionCard,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? '৪. গাছের বর্তমান স্বাস্থ্য, মাটি ও রোদের পরিবেশ (Health, Soil & Weather)'
                  : '4. Plant Condition, Soil & Weather Environment'}
              </Text>

              {/* Current Health Status */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'গাছের বর্তমান শারীরিক অবস্থা (Current Condition)'
                  : 'Overall Plant Health Condition'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'healthy',
                      labelBn: '✅ সুস্থ ও সতেজ',
                      labelEn: '✅ Healthy & Vigorous',
                      tone: theme.success,
                    },
                    {
                      id: 'needs_attention',
                      labelBn: '⚠️ পুষ্টির অভাব / পাতা হলুদ',
                      labelEn: '⚠️ Needs Care / Mild Stress',
                      tone: theme.warning,
                    },
                    {
                      id: 'diseased',
                      labelBn: '🚨 পোকা বা ছত্রাকের আক্রমণ',
                      labelEn: '🚨 Pest / Fungal Attack',
                      tone: theme.danger,
                    },
                  ] as {
                    id: PlantHealthState;
                    labelBn: string;
                    labelEn: string;
                    tone: string;
                  }[]
                ).map((st) => {
                  const active = healthState === st.id;
                  return (
                    <TouchableOpacity
                      key={st.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? st.tone + '1F'
                            : theme.surface,
                          borderColor: active ? st.tone : theme.border,
                        },
                      ]}
                      onPress={() => setHealthState(st.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? st.tone : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? st.labelBn : st.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Soil Type */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'টবের মাটির ধরন (Soil Media Mix)'
                  : 'Soil / Potting Mix Type'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'loam_compost',
                      labelBn: 'দোআঁশ + জৈব সার',
                      labelEn: 'Loam + Compost Mix',
                    },
                    {
                      id: 'cocopeat_mix',
                      labelBn: 'কোকোপিট মিক্স (হালকা)',
                      labelEn: 'Coco-Peat Lightweight Mix',
                    },
                    {
                      id: 'clay_heavy',
                      labelBn: 'এঁটেল মাটি (পানি ধরে রাখে)',
                      labelEn: 'Heavy Clay Soil',
                    },
                    {
                      id: 'sandy_fast',
                      labelBn: 'বেলে-দোআঁশ মাটি',
                      labelEn: 'Sandy / Fast-Draining',
                    },
                  ] as {
                    id: SoilConditionType;
                    labelBn: string;
                    labelEn: string;
                  }[]
                ).map((sc) => {
                  const active = soilCondition === sc.id;
                  return (
                    <TouchableOpacity
                      key={sc.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSoilCondition(sc.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? theme.primary : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? sc.labelBn : sc.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sunlight Exposure */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'দৈনিক রোদ পাওয়ার পরিমাণ (Sunlight & Micro-Climate)'
                  : 'Daily Sunlight & Weather Exposure'}
              </Text>
              <View style={styles.pillWrapRow}>
                {(
                  [
                    {
                      id: 'full_sun',
                      labelBn: '☀️ পূর্ণ রোদ (৬–৮ ঘণ্টা)',
                      labelEn: '☀️ Full Sun (6–8 hrs)',
                    },
                    {
                      id: 'partial_sun',
                      labelBn: '⛅ আংশিক রোদ (৩–৫ ঘণ্টা)',
                      labelEn: '⛅ Partial Sun (3–5 hrs)',
                    },
                    {
                      id: 'shaded',
                      labelBn: '🌥️ ছায়াযুক্ত / বারান্দা (< ৩ ঘণ্টা)',
                      labelEn: '🌥️ Shaded / Balcony (< 3 hrs)',
                    },
                  ] as {
                    id: SunlightExposureLevel;
                    labelBn: string;
                    labelEn: string;
                  }[]
                ).map((sun) => {
                  const active = sunlightExposure === sun.id;
                  return (
                    <TouchableOpacity
                      key={sun.id}
                      style={[
                        styles.optionPill,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSunlightExposure(sun.id)}
                    >
                      <Text
                        style={[
                          styles.optionPillText,
                          {
                            color: active ? theme.primary : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {isBn ? sun.labelBn : sun.labelEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Rooftop Zone Selector */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'ছাদ বা বাগানের কোন অংশে রাখা হয়েছে? (Garden Location)'
                  : 'Garden / Rooftop Placement Zone'}
              </Text>
              <View style={styles.pillWrapRow}>
                {[
                  'South-East Zone (Sunny)',
                  'South-West Zone (Hot Afternoon)',
                  'North-East Zone (Moderate Sun)',
                  'Balcony / Railings (Semi-Shade)',
                ].map((z) => {
                  const active = rooftopZone === z;
                  return (
                    <TouchableOpacity
                      key={z}
                      style={[
                        styles.smallPill,
                        {
                          backgroundColor: active
                            ? theme.selectedSurface
                            : theme.surface,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setRooftopZone(z)}
                    >
                      <Text
                        style={[
                          styles.smallPillText,
                          {
                            color: active ? theme.primary : theme.textSecondary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        📍 {z}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Notes */}
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {isBn
                  ? 'বিশেষ নোট বা সর্বশেষ দেওয়া সারের তথ্য (ঐচ্ছিক)'
                  : 'Additional Care / Weather Notes (Optional)'}
              </Text>
              <TextInput
                style={[
                  styles.inputField,
                  {
                    backgroundColor: theme.surface,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    fontFamily: fontFam,
                  },
                ]}
                placeholder={
                  isBn
                    ? 'যেমন: গত সপ্তাহে ভার্মি কম্পোস্ট দেওয়া হয়েছে...'
                    : 'e.g., Added vermicompost last week, windy rooftop corner...'
                }
                placeholderTextColor={theme.textMuted}
                value={environmentWeatherNote}
                onChangeText={setEnvironmentWeatherNote}
              />
            </View>

            {/* LIVE AI HORTICULTURAL PRESCRIPTION PREVIEW */}
            <View
              style={[
                styles.prescriptionPreviewCard,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <View style={styles.previewHeaderRow}>
                <Text
                  style={[
                    styles.previewTitle,
                    { color: theme.primary, fontFamily: fontFam },
                  ]}
                >
                  {isBn
                    ? '📊 সফটওয়্যারের হিসাবকৃত সার ও পরিচর্যা গাইড (Live Preview)'
                    : '📊 Calculated Container Fertilizer & Care Guide'}
                </Text>
                <View
                  style={[
                    styles.volumeBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.volumeBadgeText}>
                    {isBn
                      ? guidance.containerSummaryBn
                      : guidance.containerSummaryEn}
                  </Text>
                </View>
              </View>

              <View style={styles.previewMetricsRow}>
                <View
                  style={[
                    styles.previewMetricBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricCaption,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {isBn ? 'দৈনিক পানির চাহিদা' : 'Daily Water Need'}
                  </Text>
                  <Text
                    style={[
                      styles.metricBigVal,
                      { color: theme.primary, fontFamily: fontFam },
                    ]}
                  >
                    💧 {guidance.waterLiters}{' '}
                    {isBn ? 'লিটার/দিন' : 'Liters / day'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.previewMetricBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.metricCaption,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {isBn ? 'বয়স ও ধাপ' : 'Age & Stage'}
                  </Text>
                  <Text
                    style={[
                      styles.metricBigVal,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    ⏳{' '}
                    {isExistingPlant
                      ? `${calculatedAgeDays} ${isBn ? 'দিন' : 'Days'}`
                      : isBn
                      ? 'আজ রোপণ (নতুন)'
                      : 'Planted Today'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.prescriptionDetailBox,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.prescriptionHeading,
                    { color: theme.primary, fontFamily: fontFam },
                  ]}
                >
                  🧪{' '}
                  {isBn
                    ? 'পাত্রের মাপ অনুযায়ী সারের সঠিক মাত্রা:'
                    : 'Exact Fertilizer Dosage for This Container:'}
                </Text>
                <Text
                  style={[
                    styles.prescriptionBody,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {isBn
                    ? guidance.soilNutritionPrescriptionBn
                    : guidance.soilNutritionPrescriptionEn}
                </Text>
              </View>

              <View
                style={[
                  styles.prescriptionDetailBox,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    marginTop: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.prescriptionHeading,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  🌤️{' '}
                  {isBn
                    ? 'মাটি ও আবহাওয়া অনুযায়ী বিশেষ পরিচর্যা:'
                    : 'Tailored Soil & Environment Care Advice:'}
                </Text>
                <Text
                  style={[
                    styles.prescriptionBody,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {isBn
                    ? guidance.tailoredCareGuideBn
                    : guidance.tailoredCareGuideEn}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Sticky Action Footer */}
          <View style={[styles.footerRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  fontWeight: '600',
                  fontSize: 13,
                  fontFamily: fontFam,
                }}
              >
                {isBn ? 'বাতিল করুন' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleConfirmSave}
            >
              <Text style={[styles.saveBtnText, { fontFamily: fontFam }]}>
                {isBn ? 'গাছ সংরক্ষণ' : 'Save Plant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 14,
  },
  sectionBlock: {
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formSectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  helperBannerText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: DESIGN_TOKENS.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  pillWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  modeToggleBtn: {
    flex: 1,
    minWidth: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  modeToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeToggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  ageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  unitStaticBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  sizePresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  sizePresetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  microHint: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  prescriptionPreviewCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  volumeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  volumeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  previewMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  previewMetricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricCaption: {
    fontSize: 11,
  },
  metricBigVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  prescriptionDetailBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  prescriptionHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  prescriptionBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
