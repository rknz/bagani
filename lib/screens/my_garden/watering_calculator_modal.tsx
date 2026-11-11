/**
 * BAGANI — Smart Watering & Container Hydration Calculator Modal
 * Developer: ProFix - Web & Soft
 */

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppLanguage } from '../../core/l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../../core/theme/app_theme';
import { PlantModel } from '../../models/plant_model';
import {
  ContainerType,
  SoilType,
  PlantStage,
  WateringCalculatorService,
} from '../../services/watering_calculator_service';

interface WateringCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  plants?: PlantModel[];
  initialPlant?: PlantModel | null;
  onApplySchedule?: (plantId: string, waterAmountStr: string, frequencyStr: string) => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

const CONTAINER_OPTIONS: { id: ContainerType; icon: string; nameBn: string; nameEn: string }[] = [
  { id: 'geobag', icon: '🛍️', nameBn: 'জিও ব্যাগ', nameEn: 'Geo-bag' },
  { id: 'clay_pot', icon: '🪴', nameBn: 'মাটির টব', nameEn: 'Clay Pot' },
  { id: 'plastic_pot', icon: '🪣', nameBn: 'প্লাস্টিক টব', nameEn: 'Plastic Pot' },
  { id: 'half_drum', icon: '🛢️', nameBn: 'হাফ ড্রাম', nameEn: 'Half Drum' },
  { id: 'concrete', icon: '🧱', nameBn: 'সিমেন্ট টব', nameEn: 'Concrete' },
];

const SOIL_OPTIONS: { id: SoilType; nameBn: string; nameEn: string }[] = [
  { id: 'loamy', nameBn: 'দোআঁশ মাটি (আদর্শ)', nameEn: 'Loamy Soil (Ideal)' },
  { id: 'cocopeat', nameBn: 'কোকোপিট মিশ্রণ', nameEn: 'Cocopeat Mix' },
  { id: 'sandy_loam', nameBn: 'বেলে-দোআঁশ', nameEn: 'Sandy Loam' },
  { id: 'clay', nameBn: 'এঁটেল মাটি', nameEn: 'Clay Soil' },
];

const STAGE_OPTIONS: { id: PlantStage; icon: string; nameBn: string; nameEn: string }[] = [
  { id: 'seedling', icon: '🌱', nameBn: 'চারা পর্যায়', nameEn: 'Seedling' },
  { id: 'vegetative', icon: '🌿', nameBn: 'বৃদ্ধি পর্যায়', nameEn: 'Vegetative' },
  { id: 'flowering', icon: '🌸', nameBn: 'ফুল আসা', nameEn: 'Flowering' },
  { id: 'fruiting', icon: '🍋', nameBn: 'ফল ধরা', nameEn: 'Fruiting' },
];

const DIAMETER_PRESETS = [8, 10, 12, 14, 16, 18, 20, 24];

export const WateringCalculatorModal: React.FC<WateringCalculatorModalProps> = ({
  visible,
  onClose,
  plants = [],
  initialPlant,
  onApplySchedule,
  theme,
  lang,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    initialPlant?.id || plants[0]?.id || ''
  );
  const activePlant = useMemo(
    () => plants.find((p) => p.id === selectedPlantId) || initialPlant || null,
    [plants, selectedPlantId, initialPlant]
  );

  const [containerType, setContainerType] = useState<ContainerType>('geobag');
  const [diameterInches, setDiameterInches] = useState<number>(14);
  const [soilType, setSoilType] = useState<SoilType>('loamy');
  const [plantStage, setPlantStage] = useState<PlantStage>('vegetative');
  const [appliedNotice, setAppliedNotice] = useState(false);

  const fontFam =
    lang === 'bn' ? APP_TYPOGRAPHY.fontFamilyBengali : APP_TYPOGRAPHY.fontFamilyEnglish;

  const result = useMemo(() => {
    return WateringCalculatorService.calculate({
      containerType,
      diameterInches,
      soilType,
      plantCategory: (activePlant?.category as any) || 'fruit',
      plantStage,
      currentTemperatureC: 31,
    });
  }, [containerType, diameterInches, soilType, activePlant, plantStage]);

  const handleApply = () => {
    if (activePlant && onApplySchedule) {
      onApplySchedule(
        activePlant.id,
        lang === 'bn' ? result.displayAmountBn : result.displayAmountEn,
        lang === 'bn' ? result.frequencyBn : result.frequencyEn
      );
      setAppliedNotice(true);
      setTimeout(() => {
        setAppliedNotice(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2.69L5.34 9.35A7.5 7.5 0 1 0 16 14.5C16 11.5 12 2.69 12 2.69Z"
                    stroke={theme.primary}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={theme.primary + '22'}
                  />
                </Svg>
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'স্মার্ট ওয়াটারিং ক্যালকুলেটর' : 'Smart Watering Calculator'}
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'টবের আকার ও মাটির ভিত্তিতে সঠিক পানির পরিমাণ' : 'Precision plant hydration guide'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={{ color: theme.textSecondary, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Calculation Result Highlight Banner */}
            <View style={[styles.resultBanner, { backgroundColor: theme.primary, borderColor: theme.surface }]}>
              <View style={styles.resultBannerTopRow}>
                <View>
                  <Text style={[styles.resLabel, { fontFamily: fontFam }]}>
                    💧 {lang === 'bn' ? 'প্রয়োজনীয় দৈনিক পানি:' : 'Daily Water Required:'}
                  </Text>
                  <Text style={styles.resAmount}>
                    {lang === 'bn' ? result.displayAmountBn : result.displayAmountEn}
                  </Text>
                </View>
                <View style={styles.soilVolPill}>
                  <Text style={styles.soilVolText}>
                    🪴 ~{result.volumeLiters} L {lang === 'bn' ? 'মাটি' : 'Soil'}
                  </Text>
                </View>
              </View>

              <View style={styles.freqRow}>
                <Text style={[styles.freqText, { fontFamily: fontFam }]}>
                  ⏰ {lang === 'bn' ? result.frequencyBn : result.frequencyEn}
                </Text>
              </View>

              <Text style={[styles.moistureTipText, { fontFamily: fontFam }]}>
                💡 {lang === 'bn' ? result.moistureTipBn : result.moistureTipEn}
              </Text>
            </View>

            {/* Warning if plastic container + clay soil */}
            {result.drainageWarningBn && (
              <View style={styles.warningBox}>
                <Text style={[styles.warningText, { fontFamily: fontFam }]}>
                  ⚠️ {lang === 'bn' ? result.drainageWarningBn : result.drainageWarningEn}
                </Text>
              </View>
            )}

            {/* 1. Container Type */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary, fontFamily: fontFam }]}>
              {lang === 'bn' ? '১. টব বা পাত্রের ধরন নির্বাচন করুন' : '1. Select Container Material'}
            </Text>
            <View style={styles.chipsGrid}>
              {CONTAINER_OPTIONS.map((c) => {
                const isSelected = containerType === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setContainerType(c.id)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{c.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {lang === 'bn' ? c.nameBn : c.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Container Diameter (Inches) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={[styles.sectionLabel, { color: theme.textPrimary, fontFamily: fontFam, marginTop: 0 }]}>
                {lang === 'bn' ? '২. টব বা ব্যাগের সাইজ (ব্যাস)' : '2. Container Diameter'}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: theme.primary }}>
                {diameterInches}″ ({Math.round(diameterInches * 2.54)} cm)
              </Text>
            </View>
            <View style={styles.diameterRow}>
              {DIAMETER_PRESETS.map((dm) => {
                const isSelected = diameterInches === dm;
                return (
                  <TouchableOpacity
                    key={dm}
                    onPress={() => setDiameterInches(dm)}
                    style={[
                      styles.diamChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        fontSize: 13,
                        fontWeight: '700',
                      }}
                    >
                      {dm}″
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Soil Mixture */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary, fontFamily: fontFam }]}>
              {lang === 'bn' ? '৩. মাটি ও মিডিয়ার ধরন' : '3. Soil & Growing Media'}
            </Text>
            <View style={styles.chipsGrid}>
              {SOIL_OPTIONS.map((s) => {
                const isSelected = soilType === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSoilType(s.id)}
                    style={[
                      styles.soilChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {lang === 'bn' ? s.nameBn : s.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Plant Stage */}
            <Text style={[styles.sectionLabel, { color: theme.textPrimary, fontFamily: fontFam }]}>
              {lang === 'bn' ? '৪. গাছের বর্তমান পর্যায়' : '4. Current Growth Stage'}
            </Text>
            <View style={styles.chipsGrid}>
              {STAGE_OPTIONS.map((st) => {
                const isSelected = plantStage === st.id;
                return (
                  <TouchableOpacity
                    key={st.id}
                    onPress={() => setPlantStage(st.id)}
                    style={[
                      styles.stageChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{st.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}
                    >
                      {lang === 'bn' ? st.nameBn : st.nameEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Target Plant Selector (if plants exist) */}
            {plants.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.sectionLabel, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? '৫. গাছ নির্বাচন (রুটিন সংযুক্তির জন্য)' : '5. Select Target Plant'}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {plants.map((p) => {
                    const isSelected = selectedPlantId === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setSelectedPlantId(p.id)}
                        style={[
                          styles.plantPill,
                          {
                            backgroundColor: isSelected ? theme.selectedSurface : theme.surfaceElevated,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={{ color: isSelected ? theme.primary : theme.textPrimary, fontWeight: '700', fontSize: 12 }}>
                          🌿 {lang === 'bn' ? p.nameBengali : p.nameEnglish}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.footerRow}>
              {activePlant && onApplySchedule ? (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleApply}
                  style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.applyBtnText, { fontFamily: fontFam }]}>
                    {appliedNotice
                      ? lang === 'bn'
                        ? '✓ রুটিন সংরক্ষিত হয়েছে!'
                        : '✓ Schedule Saved!'
                      : lang === 'bn'
                      ? '✓ এই গাছের সেচ রুটিনে যুক্ত করুন'
                      : '✓ Apply to Plant Schedule'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={onClose}
                  style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.applyBtnText, { fontFamily: fontFam }]}>
                    {lang === 'bn' ? 'সম্পন্ন (Close)' : 'Done'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 18,
    gap: 10,
  },
  resultBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  resultBannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resLabel: {
    color: '#E6F4EA',
    fontSize: 12.5,
    fontWeight: '700',
  },
  resAmount: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  soilVolPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  soilVolText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  freqRow: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  freqText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  moistureTipText: {
    color: '#E6F4EA',
    fontSize: 12,
    lineHeight: 17,
  },
  warningBox: {
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderColor: '#D97706',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  warningText: {
    color: '#B45309',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  soilChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  stageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
  },
  diameterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  diamChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  plantPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  footerRow: {
    marginTop: 14,
  },
  applyBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
