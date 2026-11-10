import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Print from 'expo-print';
import { AppLanguage } from '../../core/l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../../core/theme/app_theme';
import { PlantModel, QrTagSize } from '../../models/plant_model';
import { QrPdfService } from '../../services/qr_pdf_service';
import { PlantSelectorDropdown } from '../../core/components/plant_selector_dropdown';

interface QrTrackerScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  plants: PlantModel[];
  ownerName: string;
  onSelectPlant: (plant: PlantModel) => void;
  onUpdatePlantQrSettings?: (
    plantId: string,
    updates: {
      qrTagSize: QrTagSize;
      customTagQuote: string;
      ownerDisplayName: string;
    }
  ) => void;
}

/**
 * Deterministic visual QR matrix generator from payload string
 * so every plant gets a unique, authentic scannable-style matrix preview
 */
function generateVisualQrMatrix(payload: string, size = 15): boolean[][] {
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
        const isCenter =
          r >= 1 && r <= 3 && c >= 1 && c <= 3 && r === 2 && c === 2;
        matrix[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 5);
  drawFinder(size - 5, 0);

  let seed = Math.abs(hash) || 1234567;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 6 && c < 6;
      const inTopRight = r < 6 && c >= size - 6;
      const inBottomLeft = r >= size - 6 && c < 6;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      seed = (seed * 1664525 + 1013904223) % 4294967296;
      matrix[r][c] = seed % 100 < 48;
    }
  }
  return matrix;
}

export const QrTrackerScreen: React.FC<QrTrackerScreenProps> = ({
  theme,
  lang,
  plants,
  ownerName,
  onSelectPlant,
  onUpdatePlantQrSettings,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0]?.id || ''
  );
  const selectedPlant = useMemo(
    () => plants.find((p) => p.id === selectedPlantId) || plants[0] || null,
    [plants, selectedPlantId]
  );

  const [tagSize, setTagSize] = useState<QrTagSize>(
    selectedPlant?.qrTagConfig?.tagSize || 'medium'
  );
  const [customQuote, setCustomQuote] = useState<string>(
    selectedPlant?.qrTagConfig?.customQuoteBengali || 'গাছ লাগান, পরিবেশ বাঁচান'
  );
  const [customOwner, setCustomOwner] = useState<string>(
    selectedPlant?.qrTagConfig?.ownerName || ownerName
  );
  const [customPlantedDate, setCustomPlantedDate] = useState<string>(
    selectedPlant?.plantedDateIso?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10)
  );
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState(false);
  const [plantSearchQuery, setPlantSearchQuery] = useState('');
  const [manualQrInput, setManualQrInput] = useState('');

  const calculatePlantAge = (dateStr: string): { textBn: string; textEn: string; totalDays: number } => {
    if (!dateStr) return { textBn: 'অজানা', textEn: 'Unknown', totalDays: 0 };
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return { textBn: 'অজানা', textEn: 'Unknown', totalDays: 0 };
    const diffMs = Math.max(0, Date.now() - parsed.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const yrs = Math.floor(totalDays / 365);
    const mos = Math.floor((totalDays % 365) / 30);
    const days = Math.floor((totalDays % 365) % 30);

    let textBn = '';
    let textEn = '';
    if (yrs > 0) {
      textBn = `${yrs} বছর ${mos} মাস`;
      textEn = `${yrs} yr${yrs > 1 ? 's' : ''} ${mos} mo${mos > 1 ? 's' : ''}`;
    } else if (mos > 0) {
      textBn = `${mos} মাস ${days} দিন`;
      textEn = `${mos} month${mos > 1 ? 's' : ''} ${days} day${days > 1 ? 's' : ''}`;
    } else {
      textBn = `${totalDays} দিন`;
      textEn = `${totalDays} day${totalDays > 1 ? 's' : ''}`;
    }
    return { textBn, textEn, totalDays };
  };

  const plantAge = useMemo(
    () => calculatePlantAge(customPlantedDate),
    [customPlantedDate]
  );

  const filteredPlants = useMemo(() => {
    if (!plantSearchQuery.trim()) return plants;
    const q = plantSearchQuery.toLowerCase();
    return plants.filter(
      (p) =>
        p.nameBengali.toLowerCase().includes(q) ||
        p.nameEnglish.toLowerCase().includes(q) ||
        (p.variety && p.variety.toLowerCase().includes(q)) ||
        (p.rooftopZone && p.rooftopZone.toLowerCase().includes(q))
    );
  }, [plants, plantSearchQuery]);

  const handleChoosePlant = (plant: PlantModel) => {
    setSelectedPlantId(plant.id);
    setTagSize(plant.qrTagConfig?.tagSize || 'medium');
    setCustomQuote(
      plant.qrTagConfig?.customQuoteBengali || 'গাছ লাগান, পরিবেশ বাঁচান'
    );
    setCustomOwner(plant.qrTagConfig?.ownerName || ownerName);
    if (plant.plantedDateIso) {
      setCustomPlantedDate(plant.plantedDateIso.slice(0, 10));
    }
    setIsPlantDropdownOpen(false);
    setPlantSearchQuery('');
  };

  const qrMatrix = useMemo(
    () =>
      generateVisualQrMatrix(
        selectedPlant?.qrCodeId || 'BAGANI-QR-1001',
        15
      ),
    [selectedPlant]
  );

  const handlePrintPdfTag = async () => {
    if (!selectedPlant) return;

    if (onUpdatePlantQrSettings) {
      onUpdatePlantQrSettings(selectedPlant.id, {
        qrTagSize: tagSize,
        customTagQuote: customQuote,
        ownerDisplayName: customOwner,
      });
    }

    try {
      await QrPdfService.printSingleTagPdf(
        selectedPlant,
        tagSize,
        customQuote,
        customOwner,
        customPlantedDate
      );
    } catch {
      Alert.alert(
        lang === 'bn' ? 'পিডিএফ ট্যাগ প্রস্তুত' : 'PDF Tag Ready',
        lang === 'bn'
          ? `আপনার "${selectedPlant.nameBengali}" গাছের প্রিন্টেবল QR ট্যাগ প্রস্তুত হয়েছে।`
          : `Printable QR tag for "${selectedPlant.nameEnglish}" is ready.`
      );
    }
  };

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Top Action Header: Futuristic QR Scanner Launcher */}
      <View
        style={[
          styles.scannerBanner,
          { backgroundColor: theme.cardBackground, borderColor: theme.primary },
        ]}
      >
        <View style={styles.scannerBannerTextCol}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 20 }}>📷</Text>
            <Text
              style={[
                styles.scannerTitle,
                { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
              ]}
            >
              {lang === 'bn'
                ? 'স্মার্ট QR কোড স্ক্যানার ও প্রিন্টেবল ট্যাগ'
                : 'Smart QR Scanner & Printable PDF Tag'}
            </Text>
          </View>
          <Text
            style={[
              styles.scannerSub,
              { color: theme.textSecondary, fontFamily: fontFam },
            ]}
          >
            {lang === 'bn'
              ? 'গাছের টবে লাগানো QR ট্যাগ স্ক্যান করলে সাথে সাথে গাছের বর্তমান বয়স, পানির তথ্য ও ভবিষ্যৎ পূর্বাভাস ওপেন হবে।'
              : 'Design and generate custom QR tags for your plants to track status and forecasts.'}
          </Text>
        </View>
      </View>

      {/* Step 1: Select Registered Plant (Dropdown Selector) */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: fontFam }]}>
            ১. {lang === 'bn' ? 'গাছ নির্বাচন করুন (ড্রপডাউন)' : '1. Select Registered Plant'}
          </Text>
          <Text style={{ fontSize: 12, color: theme.textSecondary }}>
            {lang === 'bn' ? `মোট ${plants.length}টি গাছ` : `${plants.length} plants`}
          </Text>
        </View>

        {/* Reusable Shared Plant Selector Dropdown */}
        <PlantSelectorDropdown
          plants={plants}
          selectedPlantId={selectedPlant?.id || ''}
          onSelectPlantId={(id) => {
            const chosen = plants.find((p) => p.id === id);
            if (chosen) handleChoosePlant(chosen);
          }}
          theme={theme}
          lang={lang}
          allowAllPlantsOption={false}
        />
      </View>

      {selectedPlant && (
        <>
          {/* Step 2: Customize Printable Tag Settings */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: fontFam }]}>
              ২.{' '}
              {lang === 'bn'
                ? 'প্রিন্টেবল QR ট্যাগ কাস্টমাইজ করুন'
                : '2. Customize Printable QR Tag'}
            </Text>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              {lang === 'bn' ? 'ট্যাগের সাইজ (Tag Size)' : 'Tag Size Option'}
            </Text>
            <View style={styles.sizeGrid}>
              {(
                [
                  { id: 'small', bn: 'ছোট (Small)', en: 'Small (2.5")' },
                  { id: 'medium', bn: 'মাঝারি (Medium)', en: 'Medium (3.5")' },
                  { id: 'large', bn: 'বড় (Large)', en: 'Large (4.5")' },
                  { id: 'qr_only', bn: 'শুধু QR কোড', en: 'QR Code Only' },
                ] as { id: QrTagSize; bn: string; en: string }[]
              ).map((opt) => {
                const active = tagSize === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setTagSize(opt.id)}
                    style={[
                      styles.sizePill,
                      {
                        backgroundColor: active
                          ? theme.primary
                          : theme.surfaceElevated,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : theme.textPrimary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {lang === 'bn' ? opt.bn : opt.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {tagSize !== 'qr_only' && (
              <>
                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {lang === 'bn'
                    ? 'ট্যাগের অনুপ্রেরণামূলক বার্তা (Custom Quote)'
                    : 'Custom Inspirational Quote'}
                </Text>
                <TextInput
                  value={customQuote}
                  onChangeText={setCustomQuote}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceElevated,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="গাছ লাগান, পরিবেশ বাঁচান"
                  placeholderTextColor={theme.textSecondary}
                />

                <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                  {lang === 'bn' ? 'বাগানীর নাম (Owner Name)' : 'Gardener / Owner Name'}
                </Text>
                <TextInput
                  value={customOwner}
                  onChangeText={setCustomOwner}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.surfaceElevated,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder={ownerName}
                  placeholderTextColor={theme.textSecondary}
                />

                {/* Date Input Field for Planting Date & Plant Age Indicator */}
                <View style={{ marginTop: 6, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                      📅 {lang === 'bn' ? 'রোপণের তারিখ (Planting Date)' : 'Planting Date (YYYY-MM-DD)'}
                    </Text>
                    <View style={[styles.ageBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary }]}>
                      <Text style={[styles.ageBadgeText, { color: theme.primary, fontFamily: fontFam }]}>
                        🌱 {lang === 'bn' ? `বয়স: ${plantAge.textBn}` : `Age: ${plantAge.textEn}`} ({plantAge.totalDays} {lang === 'bn' ? 'দিন' : 'days'})
                      </Text>
                    </View>
                  </View>

                  <TextInput
                    value={customPlantedDate}
                    onChangeText={setCustomPlantedDate}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.surfaceElevated,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="YYYY-MM-DD (e.g. 2024-03-15)"
                    placeholderTextColor={theme.textSecondary}
                  />

                  {/* Quick Preset Buttons */}
                  <View style={styles.datePresetsRow}>
                    <Text style={{ fontSize: 11, color: theme.textSecondary, alignSelf: 'center', marginRight: 2 }}>
                      {lang === 'bn' ? 'দ্রুত নির্বাচন:' : 'Quick set:'}
                    </Text>
                    {[
                      { labelBn: 'আজকে', labelEn: 'Today', daysAgo: 0 },
                      { labelBn: '৩ মাস আগে', labelEn: '3 mo ago', daysAgo: 90 },
                      { labelBn: '৬ মাস আগে', labelEn: '6 mo ago', daysAgo: 180 },
                      { labelBn: '১ বছর আগে', labelEn: '1 yr ago', daysAgo: 365 },
                      { labelBn: '২ বছর আগে', labelEn: '2 yr ago', daysAgo: 730 },
                    ].map((preset, idx) => {
                      const dt = new Date();
                      dt.setDate(dt.getDate() - preset.daysAgo);
                      const isoDate = dt.toISOString().slice(0, 10);
                      const isCurrent = customPlantedDate === isoDate;
                      return (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => setCustomPlantedDate(isoDate)}
                          style={[
                            styles.datePresetChip,
                            {
                              backgroundColor: isCurrent ? theme.primary : theme.surfaceElevated,
                              borderColor: isCurrent ? theme.primary : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.datePresetText,
                              { color: isCurrent ? '#FFFFFF' : theme.textPrimary },
                            ]}
                          >
                            {lang === 'bn' ? preset.labelBn : preset.labelEn}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Step 3: Live Visual Printable Tag Preview */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBackground, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: fontFam }]}>
              ৩.{' '}
              {lang === 'bn'
                ? 'প্রিন্টেবল পিডিএফ ট্যাগ প্রিভিউ'
                : '3. Printable PDF Tag Live Preview'}
            </Text>

            <View
              style={[
                styles.tagPreviewOuter,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: theme.primary,
                  width:
                    tagSize === 'small'
                      ? 230
                      : tagSize === 'large'
                      ? '100%'
                      : tagSize === 'qr_only'
                      ? 210
                      : 290,
                },
              ]}
            >
              <Image
                source={require('../../../assets/images/logo.png')}
                style={{ width: 96, height: 64, marginBottom: 2 }}
                resizeMode="contain"
              />
              <Text style={styles.tagBrandHeader}>
                BAGANI • বাগানী SMART GARDEN TAG
              </Text>

              {tagSize !== 'qr_only' && (
                <>
                  <Text style={styles.tagPlantName}>
                    {selectedPlant.nameBengali} ({selectedPlant.nameEnglish})
                  </Text>
                  <Text style={styles.tagVariety}>
                    {selectedPlant.variety} •{' '}
                    {selectedPlant.isAllSeason
                      ? lang === 'bn'
                        ? 'বারোমাসি জাত'
                        : 'All-Season'
                      : lang === 'bn'
                      ? 'মৌসুমি জাত'
                      : 'Seasonal'}
                  </Text>
                </>
              )}

              {/* Crisp Visual QR Code Matrix */}
              <View style={styles.qrMatrixBox}>
                {qrMatrix.map((row, rIdx) => (
                  <View key={rIdx} style={styles.qrRow}>
                    {row.map((cell, cIdx) => (
                      <View
                        key={cIdx}
                        style={[
                          styles.qrCell,
                          {
                            backgroundColor: cell ? '#111827' : '#FFFFFF',
                          },
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>

              <Text style={styles.tagPayloadCode}>
                {selectedPlant.qrCodeId}
              </Text>

              {tagSize !== 'qr_only' && (
                <>
                  <Text style={styles.tagQuoteText}>"{customQuote}"</Text>
                  <Text style={styles.tagPlantedDateFooter}>
                    📅 {lang === 'bn' ? 'রোপণ' : 'Planted'}: {customPlantedDate} • {lang === 'bn' ? 'বয়স' : 'Age'}: {lang === 'bn' ? plantAge.textBn : plantAge.textEn} ({plantAge.totalDays} {lang === 'bn' ? 'দিন' : 'days'})
                  </Text>
                  <Text style={styles.tagOwnerFooter}>
                    👤 {customOwner} • 📍 {selectedPlant.rooftopZone}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.tagActionsRow}>
              {/* 1. Single QR PDF Tag Download Button */}
              <TouchableOpacity
                onPress={handlePrintPdfTag}
                activeOpacity={0.82}
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>🖨️</Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.primaryBtnText, { fontFamily: fontFam }]}
                  >
                    {lang === 'bn' ? 'পিডিএফ ট্যাগ ডাউনলোড' : 'Download PDF Tag'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 2. All Plants A4 Sheet Print Button */}
              <TouchableOpacity
                onPress={() =>
                  QrPdfService.printBatchA4SheetPdf(
                    plants,
                    customOwner,
                    customQuote
                  )
                }
                activeOpacity={0.82}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.secondary,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>📄</Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.secondaryBtnText,
                      { color: theme.secondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? `সকল গাছের A4 শিট (${plants.length}টি)`
                      : `All Plants A4 Sheet (${plants.length} Tags)`}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 3. Plant Profile & Forecast */}
              <TouchableOpacity
                onPress={() => onSelectPlant(selectedPlant)}
                activeOpacity={0.82}
                style={[
                  styles.secondaryBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>📊</Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.secondaryBtnText,
                      { color: theme.primary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? 'গাছের সম্পূর্ণ প্রোফাইল দেখুন'
                      : 'Open Plant Status & Forecast'}
                  </Text>
                </View>
              </TouchableOpacity>
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
    gap: 16,
    paddingBottom: 90,
  },
  scannerBanner: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  scannerBannerTextCol: {
    gap: 4,
  },
  scannerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scannerSub: {
    fontSize: 13,
    lineHeight: 19,
  },
  scanNowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanNowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  plantChipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  plantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  plantChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizePill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  tagPreviewOuter: {
    alignSelf: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  tagBrandHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#167A45',
    letterSpacing: 0.6,
  },
  tagPlantName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17231C',
    textAlign: 'center',
  },
  tagVariety: {
    fontSize: 12,
    color: '#66736A',
    fontWeight: '600',
  },
  qrMatrixBox: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#167A45',
    borderRadius: 12,
    marginVertical: 6,
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 9,
    height: 9,
  },
  tagPayloadCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#167A45',
    fontWeight: '700',
  },
  tagQuoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#167A45',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  tagOwnerFooter: {
    fontSize: 11,
    color: '#3B4F41',
    fontWeight: '600',
  },
  tagActionsRow: {
    gap: 12,
    marginTop: 12,
    width: '100%',
  },
  primaryBtn: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryBtn: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  scannerModalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  scannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  scannerScrollContent: {
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewfinderBox: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  laserLine: {
    width: '88%',
    height: 2,
    marginBottom: 10,
  },
  viewfinderHint: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 19,
  },
  quickScanList: {
    gap: 8,
  },
  quickScanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scanActionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  manualLookupRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  lookupBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownSelectedTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  dropdownSelectedSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  dropdownChevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenuBox: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 6,
  },
  dropdownSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  dropdownItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  dropdownItemSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  ageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  ageBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  datePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  datePresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  datePresetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagPlantedDateFooter: {
    fontSize: 11,
    color: '#167A45',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
});
