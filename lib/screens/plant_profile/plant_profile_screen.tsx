/**
 * BAGANI — Dual-Tab Plant Profile Dashboard (Turn 174 & Turns 107–109)
 * Tab 1: বর্তমান অবস্থা (Current Status) + Messenger-Style Scrollable Timeline
 * Tab 2: ভবিষ্যৎ অবস্থা ও পূর্বাভাস (Future Outlook, Harvesting Countdown & Growth Graph)
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../../core/theme/app_theme';
import { toBengaliNumber } from '../../core/utils/date_utils';
import { PlantTimelineLog } from '../../models/plant_log_model';
import { PlantModel } from '../../models/plant_model';
import { LocalDbService } from '../../services/local_db_service';
import { OnlineBotanicalService } from '../../services/online_botanical_service';

interface PlantProfileScreenProps {
  plant: PlantModel;
  theme: AppThemeColors;
  lang: AppLanguage;
  onBack: () => void;
  onOpenQrDesigner: (plant: PlantModel) => void;
  onPlantUpdated: () => void;
}

export const PlantProfileScreen: React.FC<PlantProfileScreenProps> = ({
  plant,
  theme,
  lang,
  onBack,
  onOpenQrDesigner,
  onPlantUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');
  const [logs, setLogs] = useState<PlantTimelineLog[]>([]);
  const [noteInput, setNoteInput] = useState('');

  const forecast = LocalDbService.getPlantForecast(plant);
  const knowledgeProfile = OnlineBotanicalService.getKnowledgeProfileForPlant(plant);
  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const loadLogs = async () => {
    const items = await LocalDbService.getTimelineLogs(plant.id);
    setLogs(items);
  };

  useEffect(() => {
    loadLogs();
  }, [plant.id]);

  const handleQuickLog = async (
    actionType: PlantTimelineLog['actionType'],
    titleBn: string,
    titleEn: string,
    defaultNote: string,
    waterLiters?: number,
    photoUri?: string
  ) => {
    const newLog: PlantTimelineLog = {
      id: 'log_' + Date.now().toString(36),
      plantId: plant.id,
      actionType,
      titleBengali: titleBn,
      titleEnglish: titleEn,
      detailsNotes: noteInput.trim() || defaultNote,
      waterLitersApplied: waterLiters,
      photoUri,
      completedViaCheckbox: true,
      timestampIso: new Date().toISOString(),
    };
    await LocalDbService.addTimelineLog(newLog);
    setNoteInput('');
    await loadLogs();
    onPlantUpdated();
  };

  const handleAddPhotoLog = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          lang === 'bn' ? 'পারমিশন প্রয়োজন' : 'Permission Required',
          lang === 'bn'
            ? 'টাইমলাইন ফটো যোগ করতে গ্যালারি ব্যবহারের অনুমতি দিন।'
            : 'Please allow access to your photo library to attach a photo.'
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        await handleQuickLog(
          'photo_note',
          '📸 নতুন গ্রোথ ছবি ও বর্তমান অবস্থার নোট যুক্ত হয়েছে',
          '📸 Added Growth Photo & Status Note',
          noteInput.trim() ||
            (lang === 'bn'
              ? 'গাছের পাতা ও বৃদ্ধির বর্তমান অবস্থার ছবি সংরক্ষিত।'
              : 'Saved current plant growth photo & health observation.'),
          undefined,
          uri
        );
      }
    } catch (e) {
      console.warn('Photo log picker error', e);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Top Back & QR Tag Header */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          style={[
            styles.backBtn,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.backText, { color: theme.textPrimary, fontFamily: fontFam }]}>
            ← {lang === 'bn' ? 'হোম তালিকায় ফিরুন' : 'Back to Plants'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpenQrDesigner(plant)}
          style={[styles.qrBtn, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
        >
          <Text style={{ fontSize: 13, color: '#FFFFFF' }}>🏷️</Text>
          <Text style={[styles.qrBtnText, { fontFamily: fontFam }]}>
            {lang === 'bn' ? 'QR ট্যাগ প্রিন্ট / PDF' : 'Print QR PDF Tag'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Plant Identity Header Card */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.plantIconBox}>
            <Text style={styles.plantEmoji}>🌳</Text>
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.badgeRow}>
              <Text style={[styles.qrIdBadge, { color: theme.primary }]}>
                QR: {plant.qrCodeId}
              </Text>
              {plant.isAllSeason && (
                <View
                  style={[
                    styles.seasonPill,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <Text style={[styles.seasonPillText, { color: theme.primary }]}>
                    {lang === 'bn' ? '✨ বারোমাসি জাত' : '✨ All-Season'}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.plantTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
            </Text>
            <Text
              style={[
                styles.varietyText,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              🌱 {plant.variety} •{' '}
              {lang === 'bn'
                ? forecast.containerSummaryBn ||
                  `${plant.containerSizeInches}" জিও ব্যাগ`
                : forecast.containerSummaryEn ||
                  `${plant.containerSizeInches}" Geo Bag`}{' '}
              • {plant.rooftopZone}
            </Text>
          </View>
        </View>
      </View>

      {/* DUAL TAB SWITCHER: 1. বর্তমান অবস্থা (Current Status) | 2. ভবিষ্যৎ অবস্থা ও পূর্বাভাস (Future Forecast) */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('current')}
          style={[
            styles.tabBtn,
            activeTab === 'current' && { backgroundColor: theme.primary },
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
          ]}
        >
          <Text style={{ fontSize: 14 }}>🌿</Text>
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'current' ? '#FFFFFF' : theme.textPrimary,
                fontFamily: fontFam,
              },
            ]}
          >
            {lang === 'bn' ? 'বর্তমান অবস্থা (Current)' : 'Current Status'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('future')}
          style={[
            styles.tabBtn,
            activeTab === 'future' && { backgroundColor: theme.primary },
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
          ]}
        >
          <Text style={{ fontSize: 14 }}>🔮</Text>
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'future' ? '#FFFFFF' : theme.textPrimary,
                fontFamily: fontFam,
              },
            ]}
          >
            {lang === 'bn'
              ? 'ভবিষ্যৎ অবস্থা ও পূর্বাভাস'
              : 'Future Outlook & Forecast'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <>
          {/* TAB 1: CURRENT STATUS METRICS GRID */}
          <View style={styles.metricsGrid}>
            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>⏳</Text>
                <Text style={[styles.metricLabel, { color: theme.textMuted, flex: 1 }]}>
                  {lang === 'bn' ? 'গাছের বর্তমান বয়স' : 'Current Plant Age'}
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.primary }]}>
                {lang === 'bn'
                  ? `${toBengaliNumber(forecast.ageInDays)} দিন`
                  : `${forecast.ageInDays} Days`}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>💧</Text>
                <Text style={[styles.metricLabel, { color: theme.textMuted, flex: 1 }]}>
                  {lang === 'bn' ? 'শেষ পানি দেওয়া হয়েছে' : 'Last Watered'}
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.info }]}>
                {lang === 'bn'
                  ? `${toBengaliNumber(forecast.daysSinceLastWatered)} দিন আগে`
                  : `${forecast.daysSinceLastWatered}d ago`}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>🌱</Text>
                <Text style={[styles.metricLabel, { color: theme.textMuted, flex: 1 }]}>
                  {lang === 'bn' ? 'মাটির আনুমানিক আর্দ্রতা' : 'Est. Soil Moisture'}
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.success }]}>
                {lang === 'bn'
                  ? `${toBengaliNumber(plant.estimatedMoisturePercent)}%`
                  : `${plant.estimatedMoisturePercent}%`}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={{ fontSize: 13 }}>🩺</Text>
                <Text style={[styles.metricLabel, { color: theme.textMuted, flex: 1 }]}>
                  {lang === 'bn' ? 'সর্বশেষ স্বাস্থ্য স্ক্যান' : 'Health Status'}
                </Text>
              </View>
              <Text
                style={[
                  styles.metricValueSmall,
                  {
                    color:
                      plant.healthState === 'healthy'
                        ? theme.success
                        : theme.warning,
                  },
                ]}
              >
                {lang === 'bn'
                  ? forecast.currentHealthStatusBengali
                  : forecast.currentHealthStatusEnglish}
              </Text>
            </View>
          </View>

          {/* Container-Specific Soil Nutrition & Tailored Care Guide Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.primary,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ fontSize: 16, lineHeight: 22 }}>🧪</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { flex: 1, color: theme.primary, fontFamily: fontFam, lineHeight: 22 },
                ]}
              >
                {lang === 'bn'
                  ? 'পাত্র ও মাটি অনুযায়ী সারের মাত্রা এবং পরিচর্যা গাইড'
                  : 'Container-Specific Fertilizer & Tailored Care Guide'}
              </Text>
            </View>
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.cardBackground,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🪴</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.primary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn'
                    ? `পাত্রের মাপ (${forecast.containerSummaryBn}) অনুযায়ী সারের প্রেসক্রিপশন:`
                    : `Exact Fertilizer Dosage (${forecast.containerSummaryEn}):`}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? forecast.soilNutritionPrescriptionBn
                  : forecast.soilNutritionPrescriptionEn}
              </Text>
            </View>

            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.cardBackground,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🌤️</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn'
                    ? 'মাটি ও আবহাওয়ার পরিবেশ অনুযায়ী সেচ ও পরিচর্যা:'
                    : 'Soil Condition & Weather Care Instructions:'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? forecast.tailoredCareGuideBn
                  : forecast.tailoredCareGuideEn}
              </Text>
            </View>
          </View>

          {/* Online Botanical Care & Disease Remedies Card (Requirements #2, #5) */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 220 }}>
                <Text style={{ fontSize: 16, lineHeight: 22 }}>🌐</Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    { flex: 1, color: theme.primary, fontFamily: fontFam, lineHeight: 22 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'অনলাইন বোটানিক্যাল জ্ঞান ভাণ্ডার ও পূর্ণাঙ্গ পরিচর্যা'
                    : 'Online Botanical Knowledge Profile'}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>
                  {knowledgeProfile.scientificName}
                </Text>
              </View>
            </View>

            {/* Soil Selection & Mix */}
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🪴</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'মাটি নির্বাচন ও টব প্রস্তুত প্রণালী:' : 'Soil Selection & Preparation Formula:'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12.5,
                  lineHeight: 19,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? knowledgeProfile.soilSelectionAndMixBn
                  : knowledgeProfile.soilSelectionAndMixEn}
              </Text>
            </View>

            {/* Planting Method */}
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🌱</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'চারা রোপণ ও প্রাথমিক ড্রেনেজ ব্যবস্থাপনা:' : 'Planting & Drainage Setup:'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12.5,
                  lineHeight: 19,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? knowledgeProfile.plantingMethodBn
                  : knowledgeProfile.plantingMethodEn}
              </Text>
            </View>

            {/* Common Diseases, Pests & Organic Remedies */}
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🩺</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.primary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'সম্ভাব্য রোগবালাই ও ঘরোয়া জৈব প্রতিকার (Organic Remedies):' : 'Common Pests & Organic Remedies:'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12.5,
                  lineHeight: 19,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? knowledgeProfile.diseaseAndRemediesBn
                  : knowledgeProfile.diseaseAndRemediesEn}
              </Text>
            </View>

            {/* Harvest & Post-Harvest Maintenance */}
            <View
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 15, lineHeight: 20 }}>🧺</Text>
                <Text
                  style={{
                    flex: 1,
                    color: theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'হারভেস্টিং ও পরবর্তী ছাদবাগান পরিচর্যা:' : 'Harvesting & Post-Harvest Maintenance:'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12.5,
                  lineHeight: 19,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? knowledgeProfile.harvestAndPostHarvestBn
                  : knowledgeProfile.harvestAndPostHarvestEn}
              </Text>
            </View>
          </View>

          {/* Quick Care Checkbox / Update Logger */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ fontSize: 16, lineHeight: 22 }}>✅</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                ]}
              >
                {lang === 'bn'
                  ? 'আজকের পরিচর্যা সম্পন্ন করুন (টাইমলাইনে যুক্ত হবে)'
                  : 'Log Care Action to Timeline'}
              </Text>
            </View>

            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder={
                lang === 'bn'
                  ? 'নোট লিখুন (যেমন: ২ লিটার পানি বা ভার্মিকম্পোস্ট দেওয়া হলো)...'
                  : 'Write care note (e.g., Applied 2L water or vermicompost)...'
              }
              placeholderTextColor={theme.textMuted}
              style={[
                styles.noteInput,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                },
              ]}
            />

            <View style={styles.quickBtnRow}>
              <TouchableOpacity
                onPress={() =>
                  handleQuickLog(
                    'watering',
                    '✓ পানি প্রদান সম্পন্ন (২.০ লিটার)',
                    '✓ Watered Plant (2.0 Liters)',
                    'সকালে নিয়মিত ২.০ লিটার পানি প্রদান করা হয়েছে।',
                    2.0
                  )
                }
                style={[styles.quickBtn, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
              >
                <Text style={{ fontSize: 14 }}>💧</Text>
                <Text style={styles.quickBtnText}>
                  {lang === 'bn' ? '✓ পানি দিলাম' : '✓ Log Water'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  handleQuickLog(
                    'fertilizer',
                    '✓ জৈব সার / পটাশ প্রয়োগ সম্পন্ন',
                    '✓ Applied Organic Fertilizer',
                    'ভার্মিকম্পোস্ট ও হাড়ের গুঁড়ো প্রয়োগ করা হয়েছে।'
                  )
                }
                style={[styles.quickBtn, { backgroundColor: theme.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
              >
                <Text style={{ fontSize: 14 }}>🌿</Text>
                <Text style={styles.quickBtnText}>
                  {lang === 'bn' ? '✓ সার দিলাম' : '✓ Log Fertilizer'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddPhotoLog}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  },
                ]}
              >
                <Text style={{ fontSize: 14 }}>📷</Text>
                <Text style={[styles.quickBtnTextAlt, { color: theme.textPrimary }]}>
                  {lang === 'bn' ? 'ছবি ও নোট সেভ' : 'Save Photo/Note'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Messenger-Style Scrollable Timeline History (Turns 107–109) */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              📜{' '}
              {lang === 'bn'
                ? 'ডিজিটাল টাইমলাইন ইতিহাস (তারিখ অনুযায়ী স্ক্রল ভিউ)'
                : 'Digital Care Timeline History'}
            </Text>

            {logs.map((log, idx) => {
              const dt = new Date(log.timestampIso);
              const dateLabel = dt.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeLabel = dt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={log.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeftAxis}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                    {idx < logs.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: theme.border },
                        ]}
                      />
                    )}
                  </View>

                  <View
                    style={[
                      styles.timelineBubble,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.timelineDate, { color: theme.primary }]}>
                      📅 {dateLabel} • ⏰ {timeLabel}
                    </Text>
                    <Text
                      style={[
                        styles.timelineTitle,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn' ? log.titleBengali : log.titleEnglish}
                    </Text>
                    <Text
                      style={[
                        styles.timelineNotes,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {log.detailsNotes}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <>
          {/* TAB 2: FUTURE OUTLOOK, HARVESTING COUNTDOWN & GROWTH PROJECTION GRAPH */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ fontSize: 16, lineHeight: 22 }}>⏳</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { flex: 1, color: theme.primary, fontFamily: fontFam, lineHeight: 22 },
                ]}
              >
                {lang === 'bn'
                  ? 'ফল ও ফুল আসার পূর্বাভাস (Harvesting Countdown)'
                  : 'Flowering & Harvesting Countdown'}
              </Text>
            </View>

            <View
              style={[
                styles.countdownBanner,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.countdownBig, { color: theme.primary }]}>
                {lang === 'bn'
                  ? `আর মাত্র ~${toBengaliNumber(forecast.estimatedDaysToFloweringOrHarvest)} দিন বাকি`
                  : `~${forecast.estimatedDaysToFloweringOrHarvest} Days Remaining`}
              </Text>
              <Text
                style={[
                  styles.countdownSub,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? forecast.expectedHarvestSeasonBengali
                  : forecast.expectedHarvestSeasonEnglish}
              </Text>
            </View>
          </View>

          {/* Upcoming Week Weather Advisory & Pre-emptive Disease Warning */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ fontSize: 16, lineHeight: 22 }}>🌦️</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                ]}
              >
                {lang === 'bn'
                  ? 'আগামী সপ্তাহের আবহাওয়া ভিত্তিক যত্ন ও আগাম সতর্কবার্তা'
                  : 'Upcoming Week Weather Care & Pre-Emptive Advisory'}
              </Text>
            </View>
            <Text
              style={[
                styles.advisoryBody,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? forecast.upcomingWeekWeatherAdvisoryBengali
                : forecast.upcomingWeekWeatherAdvisoryEnglish}
            </Text>
            {forecast.preEmptiveDiseaseRiskWarning && (
              <View
                style={[
                  styles.warningBox,
                  {
                    backgroundColor: theme.warning + '18',
                    borderColor: theme.warning,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>🛡️</Text>
                  <Text
                    style={[
                      styles.warningText,
                      { flex: 1, color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {forecast.preEmptiveDiseaseRiskWarning}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 1–2 Month Visual Growth Projection Graph & Guideline */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ fontSize: 16, lineHeight: 22 }}>📈</Text>
              <Text
                style={[
                  styles.sectionTitle,
                  { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                ]}
              >
                {lang === 'bn'
                  ? 'আগামী ১–২ মাসের সম্ভাব্য গ্রোথ গ্রাফ ও গাইডলাইন'
                  : '1–2 Month AI Growth Projection Graph & Guideline'}
              </Text>
            </View>

            {forecast.growthProjectionGraph.map((pt, i) => (
              <View
                key={i}
                style={[
                  styles.graphRow,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.graphHeader}>
                  <Text
                    style={[
                      styles.graphMonth,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? pt.monthLabelBengali
                      : pt.monthLabelEnglish}
                  </Text>
                  <Text style={[styles.graphScore, { color: theme.primary }]}>
                    {lang === 'bn'
                      ? `উচ্চতা ~${toBengaliNumber(pt.expectedHeightCm)} সে.মি. • গ্রোথ ${toBengaliNumber(pt.expectedCanopyScore)}%`
                      : `Height ~${pt.expectedHeightCm} cm • Growth ${pt.expectedCanopyScore}%`}
                  </Text>
                </View>

                {/* Visual Progress Bar Graph */}
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: theme.background },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${pt.expectedCanopyScore}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 13, lineHeight: 18 }}>🎯</Text>
                  <Text
                    style={[
                      styles.graphNote,
                      { flex: 1, color: theme.textSecondary, fontFamily: fontFam, marginTop: 0 },
                    ]}
                  >
                    {lang === 'bn'
                      ? pt.milestoneNoteBengali
                      : pt.milestoneNoteEnglish}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Precision Pruning (Cutting) & 2x Yield Multiplier Guide (Requirement #6) */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.primary,
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                <Text style={{ fontSize: 18, lineHeight: 22 }}>✂️</Text>
                <Text
                  style={[
                    styles.sectionTitle,
                    { flex: 1, color: theme.primary, fontFamily: fontFam, marginBottom: 0 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'প্রিসিশন প্রুনিং ও আগামী মৌসুমে দ্বিগুণ ফলন নির্দেশিকা'
                    : 'Precision Pruning & 2x Yield Multiplier Guide'}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  {lang === 'bn' ? 'ফলন দ্বিগুণ করার সিক্রেট' : '2x Yield Boost'}
                </Text>
              </View>
            </View>

            <View
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: theme.cardBackground,
                borderWidth: 1,
                borderColor: theme.border,
                gap: 6,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: '700',
                  fontSize: 13.5,
                  fontFamily: fontFam,
                }}
              >
                🌿 {plant.nameBengali} ({plant.variety}) — {lang === 'bn' ? 'সঠিক ডাল কাটার কৌশল ও সময়:' : 'Recommended Cutting Technique & Timing:'}
              </Text>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 13,
                  lineHeight: 21,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? knowledgeProfile.pruningTechniqueBn
                  : knowledgeProfile.pruningTechniqueEn}
              </Text>

              <View
                style={{
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: theme.surfaceElevated,
                  borderLeftWidth: 3,
                  borderLeftColor: theme.primary,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={{ fontSize: 16, lineHeight: 20 }}>💡</Text>
                  <Text style={{ flex: 1, color: theme.textSecondary, fontSize: 12, lineHeight: 18, fontFamily: fontFam }}>
                    {lang === 'bn'
                      ? `গাছের বর্তমান বয়স (${forecast.ageInDays} দিন) অনুযায়ী: ফল সংগ্রহের পরপরই কিংবা নতুন কুঁড়ি আসার ৩ সপ্তাহ আগে প্রুনিং সম্পন্ন করুন। কাটা অংশে অবশ্যই ছত্রাকনাশক পেস্ট (ম্যানকোজেব বা চুন+তুঁতে) লাগিয়ে দিন।`
                      : `Based on current plant age (${forecast.ageInDays} days): Execute pruning post-harvest or 3 weeks before spring bud-break. Always seal cut wounds with fungicide paste to avoid stem dieback.`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    padding: 20,
    gap: 14,
    paddingBottom: 90,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  qrBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  qrBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  headerCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  plantIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(21,128,61,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantEmoji: {
    fontSize: 32,
  },
  headerTextCol: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrIdBadge: {
    fontSize: 11,
    fontWeight: '800',
  },
  seasonPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seasonPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  plantTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  varietyText: {
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  metricCard: {
    width: '48.6%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    minWidth: 0,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 19,
    fontWeight: '700',
  },
  metricValueSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  quickBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  quickBtnTextAlt: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLeftAxis: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineBubble: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 4,
  },
  timelineDate: {
    fontSize: 11,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  timelineNotes: {
    fontSize: 12,
    lineHeight: 18,
  },
  countdownBanner: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  countdownBig: {
    fontSize: 22,
    fontWeight: '800',
  },
  countdownSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  advisoryBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  warningBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  graphRow: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graphMonth: {
    fontSize: 13,
    fontWeight: '800',
  },
  graphScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  graphNote: {
    fontSize: 12,
  },
});

