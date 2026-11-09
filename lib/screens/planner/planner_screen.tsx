import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import { AppThemeColors } from '../../core/theme/app_theme';
import { PlantCategory } from '../../models/plant_model';
import {
  RooftopLifecycleStage,
  SunlightExposure,
} from '../../models/rooftop_plan_model';

interface PlannerScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
}

interface GeoBagRecommendation {
  bagSizeInches: string;
  suitablePlantsBn: string;
  suitablePlantsEn: string;
  recommendedCount: number;
  estimatedSoilWeightKg: number;
}

const ROOFTOP_LIFECYCLE_GUIDES: RooftopLifecycleStage[] = [
  {
    stageNumber: 1,
    titleBengali: 'ছাদ ড্যাম্প-প্রুফিং ও নিরাপদ ভার বহন প্রস্তুতি',
    titleEnglish: 'Roof Waterproofing & Safe Structural Load Setup',
    summaryBengali: 'ছাদের মূল স্ল্যাব সরাসরি ভেজা মাটির সংস্পর্শ থেকে রক্ষা করুন।',
    summaryEnglish: 'Keep the roof slab isolated from direct dampness.',
    checklistItemsBengali: [
      'প্রতিটি টব বা জিও ব্যাগের নিচে অন্তত ২-৩ ইঞ্চি উঁচু রিং, ইট বা লোহার স্ট্যান্ড ব্যবহার করুন।',
      'ভারী ফলের গাছগুলো (ড্রাম/বড় জিও ব্যাগ) ছাদের বিম বা কলামের বরাবর কার্নিশের ধারে বসান।',
      'পানি নিষ্কাশনের ড্রেন যেন শুকনো পাতা বা মাটিতে বন্ধ না হয় তা নিশ্চিত করুন।',
    ],
    checklistItemsEnglish: [
      'Place every Geo-Bag on 2–3 inch elevated rings or stands for airflow.',
      'Position heavier fruit containers along load-bearing beams and columns.',
      'Keep roof drainage outlets clear of soil and fallen leaves.',
    ],
  },
  {
    stageNumber: 2,
    titleBengali: 'হালকা জিও ব্যাগ নির্বাচন ও ড্রেনেজ সিস্টেম',
    titleEnglish: 'Lightweight Geo-Bag Selection & Drainage Layer',
    summaryBengali: 'মাটির টবের চেয়ে জিও ব্যাগ ছাদের ওজন ৪০% পর্যন্ত কমায়।',
    summaryEnglish: 'Geo-bags reduce dead weight on the roof by up to 40%.',
    checklistItemsBengali: [
      'জিও ব্যাগের নিচে ১ ইঞ্চি ইটের খোয়া বা কোকো হাস্ক চিপস দিয়ে ড্রেনেজ লেয়ার তৈরি করুন।',
      'সবজির জন্য ১২×১২ ইঞ্চি এবং বারোমাসি ফলের জন্য ১৮×১৮ বা ২৪×২৪ ইঞ্চি জিও ব্যাগ বেছে নিন।',
    ],
    checklistItemsEnglish: [
      'Add a 1-inch layer of brick chips or coco husk at the bottom for root aeration.',
      'Use 12x12" bags for vegetables and 18x18"–24x24" bags for fruit trees.',
    ],
  },
  {
    stageNumber: 3,
    titleBengali: 'আদর্শ জৈব মাটি প্রস্তুতি (৪০:৩০:২০:১০ ফর্মুলা)',
    titleEnglish: 'Ideal Organic Soil Mix Formula (40:30:20:10)',
    summaryBengali: 'হালকা, ঝুরঝুরে ও পুষ্টিসমৃদ্ধ পটিং মিক্স তৈরি।',
    summaryEnglish: 'Prepare a lightweight, nutrient-dense potting mix.',
    checklistItemsBengali: [
      '৪০% দোআঁশ মাটি + ৩০% ভার্মি কম্পোস্ট + ২০% কোকোপিট মিশিয়ে নিন।',
      '১০% জৈব উপাদান হিসেবে নিম খৈল, হাড়ের গুঁড়ো, শিং কুঁচি ও ট্রাইকোডার্মা মিশিয়ে ১০ দিন ঢেকে রাখুন।',
    ],
    checklistItemsEnglish: [
      'Blend 40% Loamy Soil + 30% Vermicompost + 20% Cocopeat.',
      'Add 10% Neem Cake, Bone Meal & Trichoderma bio-fungicide; cure for 10 days.',
    ],
  },
  {
    stageNumber: 4,
    titleBengali: 'সুস্থ কলমের চারা নির্বাচন ও বিকেলে রোপণ',
    titleEnglish: 'Healthy Grafted Sapling Selection & Afternoon Planting',
    summaryBengali: 'ছাদবাগানে দ্রুত ফলনের জন্য বীজের বদলে কলমের চারা রোপণ করুন।',
    summaryEnglish: 'Always choose grafted saplings for early rooftop fruiting.',
    checklistItemsBengali: [
      'চারা রোপণের উপযুক্ত সময় বিকেল ৪টার পর; রোপণের পর হালকা পানি দিন।',
      'কলমের জয়েন্ট (Grafting Union) যেন কখনোই মাটির নিচে চাপা না পড়ে।',
    ],
    checklistItemsEnglish: [
      'Transplant saplings after 4 PM to avoid transplant shock.',
      'Keep the graft union 2–3 inches above the soil line.',
    ],
  },
  {
    stageNumber: 5,
    titleBengali: 'নিয়মিত সেচ, তরল জৈব সার ও বালাই দমন',
    titleEnglish: 'Scheduled Watering, Liquid Bio-Feed & Pest Defense',
    summaryBengali: 'আবহাওয়া অনুযায়ী পরিমিত পানি ও জৈব প্রতিরোধ ব্যবস্থা।',
    summaryEnglish: 'Weather-indexed watering and organic neem protection.',
    checklistItemsBengali: [
      'প্রতি ১৫ দিন অন্তর পাতলা সরিষার খৈল পচা পানি বা কলার খোসা ভেজানো পটাশ পানি দিন।',
      'প্রতি ১০ দিনে একবার বিকেলে নিম তেল ও সাবান পানির জৈব স্প্রে করুন।',
    ],
    checklistItemsEnglish: [
      'Feed fermented mustard-cake liquid or banana-peel tea every 15 days.',
      'Spray organic Neem oil emulsion every 10 days in the late afternoon.',
    ],
  },
  {
    stageNumber: 6,
    titleBengali: 'ফলন সংগ্রহ ও হারভেস্ট-পরবর্তী প্রুনিং (ডাল ছাঁটাই)',
    titleEnglish: 'Harvesting & Post-Harvest Canopy Pruning',
    summaryBengali: 'ফল সংগ্রহের পর সঠিক ছাঁটাই পরবর্তী মৌসুমে দ্বিগুণ ফলন নিশ্চিত করে।',
    summaryEnglish: 'Light pruning after harvest stimulates new fruiting shoots.',
    checklistItemsBengali: [
      'ফল বোঁটাসহ সিকেচার দিয়ে কাটুন এবং মরা বা রোগাক্রান্ত ডাল ছাঁটাই করুন।',
      'কাটা অংশে ছত্রাকনাশক বা কাঁচা হলুদ/অ্যালোভেরা জেল লাগিয়ে দিন এবং জৈব সার প্রয়োগ করুন।',
    ],
    checklistItemsEnglish: [
      'Harvest with secateurs leaving a small stem and prune inward/dead branches.',
      'Seal cut ends with turmeric/aloe gel and top-dress with vermicompost.',
    ],
  },
];

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  theme,
  lang,
}) => {
  const [totalRoofSqFtInput, setTotalRoofSqFtInput] = useState('600');
  const [sunlight, setSunlight] = useState<SunlightExposure>('full_sun');
  const [hasHighDust, setHasHighDust] = useState(true);
  const [isDroughtProne, setIsDroughtProne] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<PlantCategory[]>([
    'fruit',
    'vegetable',
    'herb',
  ]);
  const [completedStages, setCompletedStages] = useState<
    Record<number, boolean>
  >({
    1: true,
    2: true,
  });

  const toggleCategory = (cat: PlantCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const planSummary = useMemo(() => {
    const rawSqFt = Math.max(50, Number(totalRoofSqFtInput) || 400);
    const usableSqFt = Math.round(rawSqFt * 0.65);
    const maxSafeLoadKg = usableSqFt * 35;

    const smallCount = Math.max(2, Math.floor(usableSqFt * 0.04));
    const mediumCount = Math.max(2, Math.floor(usableSqFt * 0.03));
    const largeCount =
      sunlight === 'full_sun' ? Math.max(1, Math.floor(usableSqFt * 0.015)) : 1;

    const geoBags: GeoBagRecommendation[] = [
      {
        bagSizeInches: '12x12 inch (১০ গ্যালন)',
        suitablePlantsBn: 'মরিচ, বেগুন, টমেটো, পুদিনা ও ধনেপাতা',
        suitablePlantsEn: 'Chili, Brinjal, Tomato, Mint & Coriander',
        recommendedCount: smallCount,
        estimatedSoilWeightKg: smallCount * 14,
      },
      {
        bagSizeInches: '16x16 inch (২০ গ্যালন)',
        suitablePlantsBn: 'বারোমাসি লেবু, ডালিম, পেয়ারা ও শিম',
        suitablePlantsEn: 'All-Season Lemon, Pomegranate, Guava & Beans',
        recommendedCount: mediumCount,
        estimatedSoilWeightKg: mediumCount * 28,
      },
      {
        bagSizeInches: '24x24 inch (৪৫ গ্যালন - হাফ ড্রাম বিকল্প)',
        suitablePlantsBn: 'কাটিমন বারোমাসি আম, মাল্টা ও ড্রাগন ফল',
        suitablePlantsEn: 'Katimon Mango, Malta & Dragon Fruit',
        recommendedCount: largeCount,
        estimatedSoilWeightKg: largeCount * 55,
      },
    ];

    const totalEstimatedWeightKg = geoBags.reduce(
      (acc, item) => acc + item.estimatedSoilWeightKg,
      0
    );

    const totalSoilKg = Math.round(totalEstimatedWeightKg * 0.85);
    const loamKg = Math.round(totalSoilKg * 0.4);
    const compostKg = Math.round(totalSoilKg * 0.3);
    const cocopeatKg = Math.round(totalSoilKg * 0.2);
    const bioAmendmentKg = Math.max(1, Math.round(totalSoilKg * 0.1));

    const recommendedVarieties = [
      sunlight === 'full_sun'
        ? lang === 'bn'
          ? '🥭 কাটিমন বারোমাসি আম (রোদপ্রিয় ও উচ্চ ফলনশীল)'
          : '🥭 Katimon All-Season Mango (Full Sun & High Yield)'
        : lang === 'bn'
        ? '🌿 পুদিনা, থানকুনি ও অ্যালোভেরা (আংশিক ছায়া সহনশীল)'
        : '🌿 Mint, Thankuni & Aloe Vera (Shade Tolerant)',
      hasHighDust
        ? lang === 'bn'
          ? '🍋 সিডলেস বারোমাসি লেবু ও থাই পেয়ারা (ধুলোবালি সহনশীল পাতা)'
          : '🍋 Seedless Lemon & Thai Guava (Dust-Resilient Foliage)'
        : lang === 'bn'
        ? '🍅 বারি হাইব্রিড টমেটো ও ক্যাপসিকাম'
        : '🍅 BARI Hybrid Tomato & Capsicum',
      isDroughtProne
        ? lang === 'bn'
          ? '🐉 ড্রাগন ফল ও ডালিম (খরা ও কম পানিতে টিকে থাকে)'
          : '🐉 Dragon Fruit & Pomegranate (Drought Tolerant)'
        : lang === 'bn'
        ? '🌶️ নাগা মরিচ ও চেরি টমেটো'
        : '🌶️ Naga Chili & Cherry Tomato',
    ];

    return {
      rawSqFt,
      usableSqFt,
      maxSafeLoadKg,
      totalEstimatedWeightKg,
      geoBags,
      loamKg,
      compostKg,
      cocopeatKg,
      bioAmendmentKg,
      recommendedVarieties,
    };
  }, [totalRoofSqFtInput, sunlight, hasHighDust, isDroughtProne, lang]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Wizard Card: Input Roof Dimensions & Conditions */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          🏡{' '}
          {lang === 'bn'
            ? 'স্মার্ট ছাদবাগান প্ল্যানার উইজার্ড (Smart Rooftop Wizard)'
            : 'Smart Rooftop Garden Planner Wizard'}
        </Text>
        <Text style={[styles.subText, { color: theme.textSecondary }]}>
          {lang === 'bn'
            ? 'আপনার ছাদের আয়তন, রোদ ও পরিবেশ অনুযায়ী নিরাপদ ওজন, জিও ব্যাগ ও জৈব মাটির নিখুঁত হিসাব।'
            : 'Calculate safe structural load, Geo-Bag layout, and exact organic soil mix for your roof.'}
        </Text>

        {/* Roof Area Input */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {lang === 'bn'
            ? 'ছাদের মোট আয়তন (বর্গফুট / Sq. Ft.):'
            : 'Total Roof Area (Sq. Ft.):'}
        </Text>
        <TextInput
          value={totalRoofSqFtInput}
          onChangeText={setTotalRoofSqFtInput}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              backgroundColor: theme.surfaceElevated,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="600"
          placeholderTextColor={theme.textSecondary}
        />

        {/* Sunlight Exposure */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {lang === 'bn'
            ? 'দৈনিক রোদের পরিমাণ (Sunlight):'
            : 'Daily Sunlight Exposure:'}
        </Text>
        <View style={styles.pillRow}>
          {(
            [
              {
                id: 'full_sun',
                bn: '☀️ পূর্ণ রোদ (৬+ ঘণ্টা)',
                en: '☀️ Full Sun (6+ hrs)',
              },
              {
                id: 'partial_shade',
                bn: '⛅ আংশিক ছায়া (৩-৫ ঘণ্টা)',
                en: '⛅ Partial Shade (3-5 hrs)',
              },
              {
                id: 'low_light',
                bn: '🌥️ কম আলো (ইনডোর/বারান্দা)',
                en: '🌥️ Low Light / Balcony',
              },
            ] as { id: SunlightExposure; bn: string; en: string }[]
          ).map((item) => {
            const active = sunlight === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSunlight(item.id)}
                style={[
                  styles.pill,
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
                  {lang === 'bn' ? item.bn : item.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dust & Drought Toggles */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {lang === 'bn'
            ? 'পরিবেশগত অবস্থা (Environmental Conditions):'
            : 'Environmental Conditions:'}
        </Text>
        <View style={styles.pillRow}>
          <TouchableOpacity
            onPress={() => setHasHighDust(!hasHighDust)}
            style={[
              styles.pill,
              {
                backgroundColor: hasHighDust
                  ? theme.primary
                  : theme.surfaceElevated,
                borderColor: hasHighDust ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: hasHighDust ? '#FFFFFF' : theme.textPrimary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              💨 {lang === 'bn' ? 'অতিরিক্ত ধুলোবালি আছে' : 'High Urban Dust'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsDroughtProne(!isDroughtProne)}
            style={[
              styles.pill,
              {
                backgroundColor: isDroughtProne
                  ? theme.primary
                  : theme.surfaceElevated,
                borderColor: isDroughtProne ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: isDroughtProne ? '#FFFFFF' : theme.textPrimary,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              🔥 {lang === 'bn' ? 'খরা বা পানির স্বল্পতা' : 'Drought / Low Water'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plant Category Preferences */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
          {lang === 'bn'
            ? 'পছন্দের গাছের ধরন:'
            : 'Preferred Plant Categories:'}
        </Text>
        <View style={styles.pillRow}>
          {(
            [
              { id: 'fruit', bn: '🥭 ফলজ', en: '🥭 Fruit' },
              { id: 'vegetable', bn: '🍅 সবজি', en: '🍅 Vegetable' },
              { id: 'flower', bn: '🌺 ফুল', en: '🌺 Flower' },
              { id: 'herb', bn: '🌿 মসলা ও ভেষজ', en: '🌿 Herb & Medicinal' },
            ] as { id: PlantCategory; bn: string; en: string }[]
          ).map((cat) => {
            const active = selectedCategories.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active
                      ? theme.secondary
                      : theme.surfaceElevated,
                    borderColor: active ? theme.secondary : theme.border,
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
                  {lang === 'bn' ? cat.bn : cat.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Output Card: Structural Load, Geo-Bag Plan & Soil Mix Formula */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.primary },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          📐{' '}
          {lang === 'bn'
            ? 'আপনার ছাদের কাস্টম বাগান ব্লুপ্রিন্ট'
            : 'Your Custom Rooftop Blueprint'}
        </Text>

        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricBox,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.primary }]}>
              {planSummary.usableSqFt} sq.ft
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              {lang === 'bn' ? 'ব্যবহারযোগ্য বাগান এলাকা (৬৫%)' : 'Usable Garden Area (65%)'}
            </Text>
          </View>

          <View
            style={[
              styles.metricBox,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.success }]}>
              {planSummary.totalEstimatedWeightKg} kg
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
              {lang === 'bn'
                ? `স্ট্রাকচারাল সীমা: ${planSummary.maxSafeLoadKg} kg`
                : `Safe Load Limit: ${planSummary.maxSafeLoadKg} kg`}
            </Text>
          </View>
        </View>

        {/* Graphical Layout Blueprint Preview */}
        <View
          style={[
            styles.blueprintPreviewCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 16, lineHeight: 22 }}>🗺️</Text>
            <Text style={[styles.blueprintHeading, { color: theme.textPrimary, flex: 1, lineHeight: 22 }]}>
              {lang === 'bn' ? 'ছাদের গ্রাফিক্যাল লেআউট প্রিভিউ (Rooftop Zones):' : 'Graphical Rooftop Zone Layout:'}
            </Text>
          </View>

          <View style={styles.roofDiagram}>
            {/* Zone 1: Full Sun & Structural Beam */}
            <View style={[styles.zoneRow, { backgroundColor: 'rgba(22, 122, 69, 0.08)', borderColor: theme.primary }]}>
              <View style={styles.zoneHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, flex: 1 }}>
                  <Text style={{ fontSize: 13, lineHeight: 18 }}>☀️</Text>
                  <Text style={{ fontWeight: '700', fontSize: 12, lineHeight: 18, color: theme.primary, flex: 1 }}>
                    {lang === 'bn' ? 'জোন ১: দক্ষিণ ও পশ্চিম কিনারা (বিমের ওপর ভারী টব)' : 'Zone 1: South-West Beam (Heavy Bags)'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                  {lang === 'bn' ? 'রোদ: ৬-৮ ঘণ্টা • ফলজ গাছ' : '6-8h Sun • Fruits'}
                </Text>
              </View>
              <View style={styles.miniBagsRow}>
                {['আম (১৬")', 'পেয়ারা (১৬")', 'লেবু (১২")', 'ডালিম (১৬")'].map((lbl, i) => (
                  <View key={i} style={[styles.miniBagChip, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                    <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '600' }}>🪴 {lbl}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Zone 2: Partial Sun & Vegetables */}
            <View style={[styles.zoneRow, { backgroundColor: 'rgba(2, 132, 199, 0.08)', borderColor: theme.info }]}>
              <View style={styles.zoneHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, flex: 1 }}>
                  <Text style={{ fontSize: 13, lineHeight: 18 }}>⛅</Text>
                  <Text style={{ fontWeight: '700', fontSize: 12, lineHeight: 18, color: theme.info, flex: 1 }}>
                    {lang === 'bn' ? 'জোন ২: পূর্ব ও উত্তর প্রান্ত (হালকা সবজি ও মসলা)' : 'Zone 2: East-North (Vegetables & Herbs)'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                  {lang === 'bn' ? 'রোদ: ৩-৫ ঘণ্টা' : '3-5h Sun'}
                </Text>
              </View>
              <View style={styles.miniBagsRow}>
                {['টমেটো (১০")', 'মরিচ (১০")', 'বেগুন (১২")', 'পুদিনা (৮")'].map((lbl, i) => (
                  <View key={i} style={[styles.miniBagChip, { backgroundColor: theme.surface, borderColor: theme.info }]}>
                    <Text style={{ fontSize: 11, color: theme.info, fontWeight: '600' }}>🌱 {lbl}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Walkway & Drainage */}
            <View style={[styles.walkwayRow, { backgroundColor: theme.selectedSurface, borderColor: theme.border, flexDirection: 'row', alignItems: 'flex-start', gap: 6 }]}>
              <Text style={{ fontSize: 13, lineHeight: 17 }}>🚶</Text>
              <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', lineHeight: 17, flex: 1 }}>
                {lang === 'bn' ? '৩৫% হাঁটার পথ ও ড্রেনেজ নিষ্কাশন ব্যবস্থা (Waterproofing & Walkway Protected)' : '35% Walkway & Drainage Passage'}
              </Text>
            </View>
          </View>
        </View>

        {/* Geo-Bag Allocation */}
        <Text style={[styles.subHeading, { color: theme.textPrimary }]}>
          🛍️{' '}
          {lang === 'bn'
            ? 'প্রস্তাবিত জিও ব্যাগ সাইজ ও বন্টন:'
            : 'Recommended Geo-Bag Allocation:'}
        </Text>
        <View style={styles.geoBagsGrid}>
          {planSummary.geoBags.map((bag, idx) => (
            <View
              key={idx}
              style={[
                styles.geoBagCard,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.geoBagHeader}>
                <View style={[styles.bagIconPill, { backgroundColor: theme.selectedSurface }]}>
                  <Text style={{ fontSize: 16 }}>🛍️</Text>
                  <Text style={{ fontWeight: '800', color: theme.primary, fontSize: 12.5 }}>
                    {bag.bagSizeInches}
                  </Text>
                </View>
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 13 }}>
                  {bag.recommendedCount} {lang === 'bn' ? 'টি ব্যাগ' : 'bags'}
                </Text>
              </View>
              <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 18 }}>
                {lang === 'bn' ? bag.suitablePlantsBn : bag.suitablePlantsEn}
              </Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 11.5, marginTop: 4 }}>
                ~{bag.estimatedSoilWeightKg} kg {lang === 'bn' ? 'মাটি' : 'soil'}
              </Text>
            </View>
          ))}
        </View>

        {/* Custom Soil Mix Formula with Visual Breakdown Bar */}
        <View
          style={[
            styles.soilBox,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.subHeading, { color: theme.textPrimary }]}>
            🧪{' '}
            {lang === 'bn'
              ? 'আদর্শ জৈব মাটি ফর্মুলা ও শতাংশ অনুপাত (৪০:৩০:২০:১০):'
              : 'Ideal Organic Soil Mix Formula (40:30:20:10):'}
          </Text>

          {/* Visual Multi-Segment Bar */}
          <View style={styles.soilBarWrap}>
            <View style={[styles.soilSegment, { width: '40%', backgroundColor: '#8C5A2B' }]} />
            <View style={[styles.soilSegment, { width: '30%', backgroundColor: '#382513' }]} />
            <View style={[styles.soilSegment, { width: '20%', backgroundColor: '#C87D32' }]} />
            <View style={[styles.soilSegment, { width: '10%', backgroundColor: theme.primary }]} />
          </View>

          {/* Detailed Metric Grid */}
          <View style={styles.soilDetailGrid}>
            <View style={[styles.soilDetailChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#8C5A2B' }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textPrimary }}>
                  {lang === 'bn' ? 'দোআঁশ মাটি (৪০%)' : 'Loam (40%)'}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary }}>
                {planSummary.loamKg} kg
              </Text>
            </View>

            <View style={[styles.soilDetailChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#382513' }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textPrimary }}>
                  {lang === 'bn' ? 'ভার্মিকম্পোস্ট (৩০%)' : 'Compost (30%)'}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary }}>
                {planSummary.compostKg} kg
              </Text>
            </View>

            <View style={[styles.soilDetailChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#C87D32' }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textPrimary }}>
                  {lang === 'bn' ? 'কোকোপিট (২০%)' : 'Cocopeat (20%)'}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary }}>
                {planSummary.cocopeatKg} kg
              </Text>
            </View>

            <View style={[styles.soilDetailChip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.textPrimary }}>
                  {lang === 'bn' ? 'জৈব সার/খৈল (১০%)' : 'Bio-Amend (10%)'}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary }}>
                {planSummary.bioAmendmentKg} kg
              </Text>
            </View>
          </View>
        </View>

        {/* Recommended Resilient Varieties */}
        <Text style={[styles.subHeading, { color: theme.textPrimary }]}>
          🌟{' '}
          {lang === 'bn'
            ? 'আপনার ছাদের আবহাওয়ায় সেরা গাছের জাত:'
            : 'Best Plant Varieties for Your Conditions:'}
        </Text>
        {planSummary.recommendedVarieties.map((v, i) => (
          <Text
            key={i}
            style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}
          >
            {v}
          </Text>
        ))}
      </View>

      {/* 6-Stage End-to-End Practical Rooftop Gardening Lifecycle Guide */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          📋{' '}
          {lang === 'bn'
            ? 'শুরু থেকে ফলন: ৬ ধাপের ছাদবাগান গাইডলাইন'
            : '6-Stage End-to-End Rooftop Lifecycle Guide'}
        </Text>

        {ROOFTOP_LIFECYCLE_GUIDES.map((stage) => {
          const isDone = !!completedStages[stage.stageNumber];
          return (
            <TouchableOpacity
              key={stage.stageNumber}
              onPress={() =>
                setCompletedStages((prev) => ({
                  ...prev,
                  [stage.stageNumber]: !prev[stage.stageNumber],
                }))
              }
              style={[
                styles.stageItem,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: isDone ? theme.success : theme.border,
                },
              ]}
            >
              <View style={styles.stageHeaderRow}>
                <Text
                  style={{
                    color: isDone ? theme.success : theme.primary,
                    fontWeight: '800',
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {isDone ? '✅' : `০${stage.stageNumber}.`}{' '}
                  {lang === 'bn' ? stage.titleBengali : stage.titleEnglish}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: isDone ? theme.success : theme.textSecondary,
                    fontWeight: '700',
                  }}
                >
                  {isDone
                    ? lang === 'bn'
                      ? 'সম্পন্ন'
                      : 'Completed'
                    : lang === 'bn'
                    ? 'ট্যাপ করে সম্পন্ন করুন'
                    : 'Tap to mark done'}
                </Text>
              </View>

              {(lang === 'bn'
                ? stage.checklistItemsBengali
                : stage.checklistItemsEnglish
              ).map((point, pIdx) => (
                <Text
                  key={pIdx}
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    lineHeight: 19,
                    marginLeft: 6,
                  }}
                >
                  • {point}
                </Text>
              ))}
            </TouchableOpacity>
          );
        })}
      </View>
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
  subText: {
    fontSize: 13,
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  bagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  soilBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  blueprintPreviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  blueprintHeading: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  roofDiagram: {
    gap: 8,
  },
  zoneRow: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  miniBagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniBagChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  walkwayRow: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  geoBagsGrid: {
    gap: 8,
  },
  geoBagCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  geoBagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bagIconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  soilBarWrap: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  soilSegment: {
    height: '100%',
  },
  soilDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  soilDetailChip: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  soilText: {
    fontSize: 12,
    lineHeight: 19,
  },
  stageItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
