/**
 * BAGANI — Weather Dashboard & Automated Plant Care Recommendations (Screens 11 & 12 of DESIGN_SYSTEM.md)
 * Displays:
 * - Current temperature, Humidity, Rain probability, Solar intensity
 * - 15-Day Weather Forecast (7 Days Past + Today + 7 Days Upcoming)
 * - Weather-related care alerts & actionable instructions
 * - Plant-specific watering & organic fertilizer recommendations with completion checkboxes
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import { toBengaliNumber } from '../../core/utils/date_utils';
import {
  DailyWeatherSnapshot,
  GranularCareTask,
} from '../../models/care_schedule_model';
import { PlantModel } from '../../models/plant_model';
import { LocalDbService } from '../../services/local_db_service';
import {
  DistrictCropRecommendation,
  OnlineBotanicalService,
} from '../../services/online_botanical_service';
import { WeatherService } from '../../services/weather_service';

interface WeatherCareScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  userDistrict: string;
  plants: PlantModel[];
  careTasks: GranularCareTask[];
  onToggleTaskCheckbox: (task: GranularCareTask) => void;
  onSelectPlant?: (plant: PlantModel) => void;
}

export const WeatherCareScreen: React.FC<WeatherCareScreenProps> = ({
  theme,
  lang,
  userDistrict,
  plants,
  careTasks,
  onToggleTaskCheckbox,
  onSelectPlant,
}) => {
  const [weatherWindow, setWeatherWindow] = useState<{
    past7Days: DailyWeatherSnapshot[];
    today: DailyWeatherSnapshot;
    next7Days: DailyWeatherSnapshot[];
    isLiveOnline?: boolean;
  }>(() => LocalDbService.get15DayWeatherWindow());

  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'done'>(
    'all'
  );

  useEffect(() => {
    let mounted = true;
    WeatherService.fetchLive15DayWeather(userDistrict).then((liveData) => {
      if (mounted) {
        setWeatherWindow(liveData);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userDistrict]);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const filteredTasks = careTasks.filter((t) => {
    if (filterMode === 'pending') return !t.isCompleted;
    if (filterMode === 'done') return t.isCompleted;
    return true;
  });

  const rainChance = weatherWindow.today.rainProbabilityPercent;
  const temp = weatherWindow.today.tempCelsius;
  const humidity = weatherWindow.today.humidityPercent;

  const cropRecommendations = useMemo(() => {
    return OnlineBotanicalService.getLocationAndWeatherCropRecommendations(
      userDistrict,
      temp,
      humidity,
      rainChance
    );
  }, [userDistrict, temp, humidity, rainChance]);

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollOuter}
    >
      <View style={styles.container}>
        {/* 1. Primary Weather Dashboard Card (Screen 11) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                🌦️{' '}
                {lang === 'bn'
                  ? `লাইভ আবহাওয়া ড্যাশবোর্ড (${userDistrict})`
                  : `Live Weather Dashboard (${userDistrict})`}
              </Text>
              <Text
                style={[
                  styles.subText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'আপনার এলাকার লাইভ তাপমাত্রা, আর্দ্রতা, বৃষ্টির সম্ভাবনা ও স্বয়ংক্রিয় গাছ পরিচর্যা নির্দেশনা'
                  : 'Real-time local temperature, humidity, rain probability & automated plant care'}
              </Text>
            </View>

            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 12,
                  fontWeight: '700',
                  fontFamily: fontFam,
                }}
              >
                {weatherWindow.isLiveOnline
                  ? lang === 'bn'
                    ? '🟢 লাইভ আবহাওয়া'
                    : '🟢 Live Sync'
                  : lang === 'bn'
                  ? '⚡ অফলাইন প্রিসেট'
                  : '⚡ Offline Mode'}
              </Text>
            </View>
          </View>

          {/* 3 Primary Weather Metrics: Temperature, Humidity, Rain Probability */}
          <View style={styles.metricsGrid}>
            <View
              style={[
                styles.metricBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={styles.metricEmoji}>🌡️</Text>
              <Text
                style={[
                  styles.metricVal,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? toBengaliNumber(temp) : temp}°C
              </Text>
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'বর্তমান তাপমাত্রা' : 'Temperature'}
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={styles.metricEmoji}>💧</Text>
              <Text
                style={[
                  styles.metricVal,
                  { color: theme.info, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? toBengaliNumber(humidity) : humidity}%
              </Text>
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'বাতাসের আর্দ্রতা' : 'Humidity'}
              </Text>
            </View>

            <View
              style={[
                styles.metricBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={styles.metricEmoji}>☔</Text>
              <Text
                style={[
                  styles.metricVal,
                  { color: theme.secondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? toBengaliNumber(rainChance) : rainChance}%
              </Text>
              <Text
                style={[
                  styles.metricLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'বৃষ্টির সম্ভাবনা' : 'Rain Probability'}
              </Text>
            </View>
          </View>

          {/* Weather-Related Care Alert Banner */}
          <View
            style={[
              styles.alertBox,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: '700',
                  fontSize: 14,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? 'আবহাওয়া ভিত্তিক বিশেষ সতর্কতা (Weather Care Alert)'
                  : 'Weather-Related Care Alert'}
              </Text>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: fontFam,
                }}
              >
                {rainChance >= 50
                  ? lang === 'bn'
                    ? 'আজ বৃষ্টির সম্ভাবনা বেশি। টবের নিচে জমে থাকা অতিরিক্ত পানি নিষ্কাশনের পথ পরিষ্কার রাখুন এবং আজ তরল সার বা কীটনাশক স্প্রে করা থেকে বিরত থাকুন।'
                    : 'High rain probability today. Keep pot drainage holes clear and avoid foliar sprays or liquid fertilizers today.'
                  : temp >= 32
                  ? lang === 'bn'
                    ? 'তাপমাত্রা বেশি থাকায় দুপুরের কড়া রোদে গাছে পানি দেবেন না। সকাল ৬–৮টা অথবা বিকেল ৫টার পর টবের মাটিতে পরিমিত পানি দিন।'
                    : 'High daytime heat. Never water roots under midday sun; water between 6–8 AM or after 5 PM.'
                  : lang === 'bn'
                  ? 'আজকের আবহাওয়া ছাদবাগানের পরিচর্যা, আগাছা পরিষ্কার এবং জৈব সার প্রয়োগের জন্য অত্যন্ত অনুকূল।'
                  : 'Ideal weather conditions today for pruning, soil aeration, and applying organic compost.'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. 15-Day Weather Forecast Strip (Past 7 Days + Today + Next 7 Days) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text
            style={[
              styles.cardHeading,
              { color: theme.textPrimary, fontFamily: fontFam },
            ]}
          >
            📅{' '}
            {lang === 'bn'
              ? '১৫ দিনের আবহাওয়া পরিক্রমা (বিগত ৭ দিন • আজ • আগামী ৭ দিন)'
              : '15-Day Weather Forecast (Past 7 Days • Today • Next 7 Days)'}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastStrip}
          >
            {[
              ...weatherWindow.past7Days,
              weatherWindow.today,
              ...weatherWindow.next7Days,
            ].map((day, idx) => {
              const isToday = idx === 7;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: isToday
                        ? theme.primary
                        : theme.surfaceElevated,
                      borderColor: isToday ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isToday ? '#FFFFFF' : theme.textSecondary,
                      fontSize: 11,
                      fontWeight: '700',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? day.dayLabelBengali : day.dayLabelEnglish}
                  </Text>
                  <Text style={{ fontSize: 18 }}>
                    {day.condition === 'rainy'
                      ? '🌧️'
                      : day.condition === 'hot_dry'
                      ? '☀️'
                      : '⛅'}
                  </Text>
                  <Text
                    style={{
                      color: isToday ? '#FFFFFF' : theme.textPrimary,
                      fontSize: 14,
                      fontWeight: '800',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn'
                      ? toBengaliNumber(day.tempCelsius)
                      : day.tempCelsius}
                    °C
                  </Text>
                  <Text
                    style={{
                      color: isToday ? '#E7F4EB' : theme.info,
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    💧{day.rainProbabilityPercent}%
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. Automated Plant Care Recommendations (Screen 12 of DESIGN_SYSTEM.md) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text
                style={[
                  styles.cardHeading,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                📋{' '}
                {lang === 'bn'
                  ? 'স্বয়ংক্রিয় গাছ পরিচর্যা ও পানির রুটিন'
                  : 'Automated Plant-Specific Care Recommendations'}
              </Text>
              <Text
                style={[
                  styles.subText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'চেকবক্সে টিক (✓) দিলে তা স্বয়ংক্রিয়ভাবে গাছের টাইমলাইনে সেভ হবে'
                  : 'Check off completed care tasks to log them directly into the plant timeline'}
              </Text>
            </View>

            <View style={styles.filterPillsRow}>
              {(
                [
                  { id: 'all', bn: 'সব', en: 'All' },
                  { id: 'pending', bn: 'বাকি', en: 'Pending' },
                  { id: 'done', bn: 'সম্পন্ন', en: 'Done' },
                ] as const
              ).map((f) => {
                const active = filterMode === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setFilterMode(f.id)}
                    style={[
                      styles.filterPill,
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
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn' ? f.bn : f.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {filteredTasks.map((task) => {
            const matchedPlant = plants.find((p) => p.id === task.plantId);
            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: task.isCompleted
                      ? theme.selectedSurface
                      : theme.surfaceElevated,
                    borderColor: task.isCompleted
                      ? theme.primary
                      : theme.border,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onToggleTaskCheckbox(task)}
                  style={styles.taskMainRow}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: task.isCompleted
                          ? theme.primary
                          : 'transparent',
                        borderColor: task.isCompleted
                          ? theme.primary
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {task.isCompleted && (
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: '800',
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.taskTitleRow}>
                      <Text
                        style={{
                          color: theme.textPrimary,
                          fontWeight: '700',
                          fontSize: 15,
                          fontFamily: fontFam,
                          textDecorationLine: task.isCompleted
                            ? 'line-through'
                            : 'none',
                        }}
                      >
                        {lang === 'bn'
                          ? task.plantNameBengali
                          : task.plantNameEnglish}
                      </Text>
                      <View
                        style={[
                          styles.waterPill,
                          {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.primary,
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          💧 {task.waterAmountLiters}L •{' '}
                          {task.recommendedTimeSlot === 'morning'
                            ? lang === 'bn'
                              ? 'সকাল ৬–৮টা'
                              : 'Morning 6–8 AM'
                            : lang === 'bn'
                            ? 'বিকেল ৫–৬টা'
                            : 'Afternoon 5–6 PM'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 13,
                        lineHeight: 20,
                        fontFamily: fontFam,
                      }}
                    >
                      🌱{' '}
                      {lang === 'bn'
                        ? task.fertilizerOrSprayInstructionBengali
                        : task.fertilizerOrSprayInstructionEnglish}
                    </Text>

                    {task.shadeOrMoistureAdvisoryBengali && (
                      <Text
                        style={{
                          color: theme.warning,
                          fontSize: 12,
                          fontWeight: '600',
                          fontFamily: fontFam,
                        }}
                      >
                        ☂️{' '}
                        {lang === 'bn'
                          ? task.shadeOrMoistureAdvisoryBengali
                          : task.shadeOrMoistureAdvisoryEnglish}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {matchedPlant && onSelectPlant && (
                  <TouchableOpacity
                    onPress={() => onSelectPlant(matchedPlant)}
                    style={[
                      styles.openPlantBtn,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 12,
                        fontWeight: '700',
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn'
                        ? '🔮 গাছটির প্রোফাইল ও টাইমলাইন দেখুন →'
                        : '🔮 View Plant Profile & Timeline →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* 4. Real-Time Location & Weather-Based Crop Recommendations (Requirement #4) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <Text
                style={[
                  styles.cardHeading,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                🌾{' '}
                {lang === 'bn'
                  ? `${userDistrict}-এর আবহাওয়া ও ঋতু ভিত্তিক উপযোগী ফল ও সবজি`
                  : `Location-Adapted Crops for ${userDistrict}`}
              </Text>
              <Text
                style={[
                  styles.subText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? `আপনার জেলার বর্তমান তাপমাত্রা (${temp}°C) ও আর্দ্রতা (${humidity}%) অনুযায়ী ছাদবাগানের সেরা ফসল ও বিশেষ পরিচর্যা গাইড`
                  : `Horticultural recommendations matched to local thermal units (${temp}°C) & humidity (${humidity}%)`}
              </Text>
            </View>

            <View
              style={[
                styles.liveBadge,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontWeight: '700',
                  fontSize: 12,
                  fontFamily: fontFam,
                }}
              >
                🎯 {lang === 'bn' ? 'এলাকা অনুযায়ী যাচাইকৃত' : 'Geo-Optimized'}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12, marginTop: 4 }}>
            {cropRecommendations.map((crop) => (
              <View
                key={crop.id}
                style={[
                  styles.cropRecCard,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.cropRecHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.cropTitle,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      {crop.category === 'fruit' ? '🍎 ' : '🥬 '}
                      {lang === 'bn' ? crop.cropNameBn : crop.cropNameEn}
                    </Text>
                    <Text
                      style={[
                        styles.cropVariety,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn' ? 'সেরা জাত: ' : 'Best Variety: '}
                      <Text style={{ color: theme.primary, fontWeight: '700' }}>
                        {lang === 'bn' ? crop.bestVarietyBn : crop.bestVarietyEn}
                      </Text>
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.suitBadge,
                      {
                        backgroundColor: theme.selectedSurface,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 11.5,
                        fontWeight: '700',
                        fontFamily: fontFam,
                      }}
                    >
                      ★ {lang === 'bn' ? crop.suitabilityBadgeBn : crop.suitabilityBadgeEn}
                    </Text>
                  </View>
                </View>

                {/* Why Suitable */}
                <View
                  style={[
                    styles.cropDetailBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontWeight: '700',
                      fontSize: 12,
                      marginBottom: 2,
                      fontFamily: fontFam,
                    }}
                  >
                    🌤️ {lang === 'bn' ? 'কেন আপনার জেলার জন্য উপযুক্ত:' : 'Why Suitable for this District:'}
                  </Text>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12.5,
                      lineHeight: 18,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn'
                      ? crop.whySuitableForDistrictBn
                      : crop.whySuitableForDistrictEn}
                  </Text>
                </View>

                {/* Soil & Planting Guide */}
                <View
                  style={[
                    styles.cropDetailBox,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 13, lineHeight: 18 }}>🪴</Text>
                    <Text
                      style={{
                        flex: 1,
                        color: theme.textPrimary,
                        fontWeight: '700',
                        fontSize: 12,
                        lineHeight: 18,
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn' ? 'টব ও মাটি প্রস্তুতি:' : 'Container & Soil Guide:'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12.5,
                      lineHeight: 18,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn'
                      ? crop.plantingAndSoilGuideBn
                      : crop.plantingAndSoilGuideEn}
                  </Text>
                </View>

                {/* Pruning & Yield Tip */}
                <View
                  style={[
                    styles.cropDetailBox,
                    {
                      backgroundColor: theme.selectedSurface,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 13, lineHeight: 18 }}>✂️</Text>
                    <Text
                      style={{
                        flex: 1,
                        color: theme.primary,
                        fontWeight: '700',
                        fontSize: 12,
                        lineHeight: 18,
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn' ? 'প্রুনিং ও ফলন বাড়ানোর সিক্রেট:' : 'Pruning & Yield Secret:'}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 12.5,
                      lineHeight: 18,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn'
                      ? crop.careAndPruningGuideBn
                      : crop.careAndPruningGuideEn}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollOuter: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: DESIGN_TOKENS.screenHorizontalPadding,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.md,
    paddingBottom: DESIGN_TOKENS.spacing.xl,
  },
  card: {
    padding: DESIGN_TOKENS.cardPadding,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    fontSize: 13,
    lineHeight: 20,
  },
  liveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  metricBox: {
    flex: 1,
    minWidth: 130,
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricEmoji: {
    fontSize: 22,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    marginTop: 4,
  },
  forecastStrip: {
    gap: 8,
    paddingVertical: 4,
  },
  dayChip: {
    width: 82,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
  },
  taskCard: {
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  taskMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  waterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  openPlantBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  cropRecCard: {
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 8,
  },
  cropRecHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  cropVariety: {
    fontSize: 12.5,
    marginTop: 2,
  },
  suitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  cropDetailBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
});
