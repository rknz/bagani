/**
 * BAGANI — Home Dashboard & Weather-Based Care Screen
 * Preserves 100% of all core BAGANI features while using the Brand Color System (#167A45, #20A464, #E7F4EB):
 * - Personalized Welcome Hero, Avatar, Quote, Dual Date (Bengali বঙ্গাব্দ + English) & Time
 * - Live Weather Widget (Tap to expand Past 7 Days + Today + Next 7 Days Forecast + Plant Watering Prescriptions)
 * - Spacious 2x2 Garden Statistics Grid (single-line labels, zero wrapping/overflow)
 * - Urgent Care Notification Cards with 1-Tap Checkbox (✓) that logs directly to Plant Timeline
 * - Quick Action Shortcuts (+ Register New Plant, Scan QR Tag, AI Disease Finder)
 * - Filterable Grid View & List View of Registered Plants with "View Current & Future Status →"
 * - Recent Plant Activities
 */

import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { APP_CONFIG } from '../../core/constants/app_constants';
import { AppLanguage, TRANSLATIONS } from '../../core/l10n/translations';
import { AddPlantModal } from '../../core/components/add_plant_modal';
import { AddCareTaskModal } from '../../core/components/add_care_task_modal';
import { BotanicalSearchModal } from '../../core/components/botanical_search_modal';
import { PlantSelectorDropdown } from '../../core/components/plant_selector_dropdown';
import { QrCameraScannerModal } from '../../core/components/qr_camera_scanner_modal';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import {
  getDynamicGreeting,
  getFormattedDualDate,
  toBengaliNumber,
} from '../../core/utils/date_utils';
import {
  CareTaskStatus,
  GranularCareTask,
} from '../../models/care_schedule_model';
import { PlantTimelineLog } from '../../models/plant_log_model';
import { PlantModel } from '../../models/plant_model';
import { UserModel } from '../../models/user_model';
import { LocalDbService } from '../../services/local_db_service';
import { NotificationService } from '../../services/notification_service';
import { WeatherService } from '../../services/weather_service';

interface HomeScreenProps {
  user: UserModel;
  plants: PlantModel[];
  careTasks: GranularCareTask[];
  theme: AppThemeColors;
  lang: AppLanguage;
  onSelectPlant: (plant: PlantModel) => void;
  onToggleTaskCheckbox: (task: GranularCareTask) => void;
  onSaveTaskStatus?: (
    task: GranularCareTask,
    nextStatus: CareTaskStatus
  ) => void;
  onAddCareTask?: (task: GranularCareTask) => void;
  onAddNewPlant: (plant: PlantModel) => void;
  onOpenQrScanner: () => void;
  onOpenAiDiagnosis?: () => void;
  onOpenMyGarden?: () => void;
  onOpenWeatherDashboard?: () => void;
  onOpenPlanner?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  plants,
  careTasks,
  theme,
  lang,
  onSelectPlant,
  onToggleTaskCheckbox,
  onSaveTaskStatus,
  onAddCareTask,
  onAddNewPlant,
  onOpenQrScanner,
  onOpenAiDiagnosis,
  onOpenMyGarden,
  onOpenWeatherDashboard,
  onOpenPlanner,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [botanicalSearchOpen, setBotanicalSearchOpen] = useState(false);
  const [botanicalInitialQuery, setBotanicalInitialQuery] = useState('');
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<PlantTimelineLog[]>([]);

  // Urgent Care Selection & Status Draft Map (taskId -> 'completed' | 'do_later')
  const [selectedTaskDrafts, setSelectedTaskDrafts] = useState<
    Record<string, CareTaskStatus>
  >({});
  const [urgentCareSelectedPlantId, setUrgentCareSelectedPlantId] =
    useState<string>('all');
  const [urgentCareFilter, setUrgentCareFilter] = useState<
    'all' | 'pending' | 'do_later' | 'completed'
  >('pending');
  const [careTaskModalOpen, setCareTaskModalOpen] = useState(false);

  // New Plant Form state
  const [newNameBn, setNewNameBn] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newBagSize, setNewBagSize] = useState('20');
  const [newIsAllSeason, setNewIsAllSeason] = useState(true);

  const t = TRANSLATIONS[lang];
  const { englishDate, bengaliDate, timeString } = getFormattedDualDate();
  const greeting = getDynamicGreeting(lang);
  const [weatherWindow, setWeatherWindow] = useState(() =>
    LocalDbService.get15DayWeatherWindow()
  );

  useEffect(() => {
    let active = true;
    WeatherService.fetchLive15DayWeather(user.district).then((res) => {
      if (active) {
        setWeatherWindow({
          past7Days: res.past7Days,
          today: res.today,
          next7Days: res.next7Days,
        });
      }
    });
    LocalDbService.getTimelineLogs().then((logs) => {
      if (active) setRecentLogs(logs.slice(0, 4));
    });
    return () => {
      active = false;
    };
  }, [user.district, plants, careTasks]);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const filteredPlants = plants.filter(
    (p) =>
      p.nameBengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPlants = plants.length;
  const healthyPlants = plants.filter((p) => p.healthState === 'healthy').length;
  const attentionCount = plants.filter((p) => p.healthState !== 'healthy').length;
  const avgMoisture =
    totalPlants > 0
      ? Math.round(
          plants.reduce((acc, p) => acc + p.estimatedMoisturePercent, 0) /
            totalPlants
        )
      : 0;
  const healthScorePercent =
    totalPlants > 0 ? Math.round((healthyPlants / totalPlants) * 100) : 100;

  const handleCreatePlant = () => {
    const cleanName = newNameBn.trim() || 'ব্যানানা ম্যাঙ্গো (আম)';
    const cleanVar = newVariety.trim() || 'থাই বারোমাসি কলম';
    const qrId = 'BAGANI-QR-' + (1000 + plants.length + 1);

    const created: PlantModel = {
      id: 'plt_' + Date.now().toString(36),
      qrCodeId: qrId,
      nameBengali: cleanName,
      nameEnglish: cleanName,
      variety: cleanVar,
      category: 'fruit',
      isAllSeason: newIsAllSeason,
      plantedDateIso: new Date().toISOString(),
      containerSizeInches: Number(newBagSize) || 20,
      rooftopZone: `ছাদ বাগান সারি - টব #${plants.length + 1}`,
      healthState: 'healthy',
      lastHealthDiagnosisSummary: 'নতুন রেজিস্টার্ড চারা — সুস্থ অবস্থা',
      lastWateredIso: new Date().toISOString(),
      lastFertilizedIso: new Date().toISOString(),
      estimatedMoisturePercent: 75,
      qrTagConfig: {
        qrCodeValue: qrId,
        tagSize: 'medium',
        plantName: cleanName,
        varietyName: cleanVar,
        isAllSeason: newIsAllSeason,
        customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
        ownerName: user.displayName,
        ownerAddressOrCode: `${user.district} • ${qrId}`,
      },
    };
    onAddNewPlant(created);
    setNewNameBn('');
    setNewVariety('');
    setAddModalOpen(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollOuter}
    >
      <View style={styles.container}>
        {/* 1. Header & Greeting Row */}
        <View style={styles.modernHeaderRow}>
          <View style={styles.modernHeaderLeft}>
            <View
              style={[
                styles.modernAvatarCircle,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.border,
                },
              ]}
            >
              {user.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={styles.modernAvatarImg}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: theme.primary,
                    fontFamily: fontFam,
                  }}
                >
                  {(user.displayName || 'B').slice(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ justifyContent: 'center', gap: 1 }}>
              <Text
                style={[
                  styles.modernGreetingSubtitle,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {greeting} 👋
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.modernUserName,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {user.displayName || (lang === 'bn' ? 'বাগানপ্রেমী' : 'Gardener')}
              </Text>
            </View>
          </View>

          {/* District Location Chip */}
          <View
            style={[
              styles.modernDistrictChip,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill={theme.primary}
              />
            </Svg>
            <Text
              style={[
                styles.modernDistrictText,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {user.district}
            </Text>
          </View>
        </View>

        {/* 2. Modern Balanced Search Bar */}
        <View style={styles.modernSearchRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              setBotanicalInitialQuery(searchQuery || '');
              setBotanicalSearchOpen(true);
            }}
            style={[
              styles.modernSearchPill,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.modernSearchInnerLeft}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke={theme.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 21L16.65 16.65"
                  stroke={theme.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text
                style={[
                  styles.modernSearchPlaceholder,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {searchQuery
                  ? searchQuery
                  : lang === 'bn'
                  ? 'গাছ বা পরিচর্যার গাইড খুঁজুন...'
                  : 'Search plants or care guides...'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={(e) => {
                e?.stopPropagation?.();
                setCameraScannerOpen(true);
              }}
              style={[
                styles.modernSearchScanBtn,
                { backgroundColor: theme.primary },
              ]}
              accessibilityLabel={
                lang === 'bn' ? 'ক্যামেরা দিয়ে QR স্ক্যান করুন' : 'Scan Plant QR Tag'
              }
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <Path
                  d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <Path
                  d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <Path
                  d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <Path
                  d="M7 12H17"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 3. Modern Hero Banner Card */}
        <View
          style={[
            styles.modernHeroCard,
            {
              backgroundColor: '#123B29',
            },
          ]}
        >
          {/* Decorative ambient element */}
          <View style={styles.heroGlowCircle} />

          <View style={styles.heroContentWrap}>
            <View style={styles.heroTextWrap}>
              <View style={styles.heroTagBadge}>
                <Text style={styles.heroTagText}>
                  🌱 {lang === 'bn' ? 'স্মার্ট গার্ডেনিং' : 'Smart Rooftop Care'}
                </Text>
              </View>
              <Text
                style={[
                  styles.modernHeroHeading,
                  { fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'সবুজ ও সুন্দর ছাদবাগান পরিকল্পনা করুন'
                  : 'Create Lush & Beautiful Planting Plans'}
              </Text>
            </View>

            {/* White Pill CTA Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() =>
                onOpenPlanner
                  ? onOpenPlanner()
                  : onOpenWeatherDashboard
                  ? onOpenWeatherDashboard()
                  : null
              }
              style={styles.heroCtaPillBtn}
            >
              <Text
                style={[
                  styles.heroCtaPillText,
                  { color: '#123B29', fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'বাগান পরিকল্পনা শুরু করুন'
                  : 'Create a free planting plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Weather Information Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Header Row: Dual Date & Time with SVG icons */}
          <View style={styles.weatherCardTopRow}>
            <View style={styles.weatherDateRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke={theme.textSecondary}
                  strokeWidth="1.9"
                />
                <Path
                  d="M16 2V6M8 2V6M3 10H21"
                  stroke={theme.textSecondary}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.weatherDateText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {bengaliDate}  •  {englishDate}
              </Text>
            </View>

            <View style={styles.weatherTimeRow}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke={theme.textSecondary}
                  strokeWidth="1.9"
                />
                <Path
                  d="M12 7V12L15 15"
                  stroke={theme.textSecondary}
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.weatherTimeText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {timeString}
              </Text>
            </View>
          </View>

          {/* Main Weather Metric Block */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setWeatherExpanded(!weatherExpanded)}
            style={[
              styles.weatherMainBlock,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.weatherMainLeft}>
              <Text
                style={[
                  styles.weatherTempBig,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                {weatherWindow.today.tempCelsius}°C
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="4.5"
                    stroke={theme.primary}
                    strokeWidth="1.9"
                  />
                  <Path
                    d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34"
                    stroke={theme.primary}
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.weatherDistrictLabel,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {user.district} • {weatherWindow.today.condition === 'rainy' ? (lang === 'bn' ? 'বৃষ্টিপাত' : 'Rainy') : (lang === 'bn' ? 'রৌদ্রোজ্জ্বল' : 'Sunny')}
                </Text>
              </View>
            </View>

            <View style={styles.weatherMainRight}>
              <View
                style={[
                  styles.weatherMetricPill,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2.69L17.66 8.35C19.22 9.91 20 11.83 20 14C20 18.42 16.42 22 12 22C7.58 22 4 18.42 4 14C4 11.83 4.78 9.91 6.34 8.35L12 2.69Z"
                    stroke="#0284C7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.weatherMetricText,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'আর্দ্রতা' : 'Humidity'} {weatherWindow.today.humidityPercent}%
                </Text>
              </View>
              <View
                style={[
                  styles.weatherMetricPill,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2"
                    stroke="#2563EB"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.weatherMetricText,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'বৃষ্টি' : 'Rain'} {weatherWindow.today.rainProbabilityPercent}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Expand Toggle Link */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setWeatherExpanded(!weatherExpanded)}
            style={styles.weatherToggleFooter}
          >
            <Text
              style={[
                styles.weatherToggleText,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {weatherExpanded
                ? (lang === 'bn' ? '▲ পূর্বাভাস বন্ধ করুন' : '▲ Close Forecast')
                : (lang === 'bn' ? '▼ ১৫ দিনের আবহাওয়া ও সেচ পরামর্শ দেখুন' : '▼ View 15-Day Forecast & Watering Guide')}
            </Text>
          </TouchableOpacity>

          {/* Expandable 15-Day Weather Window + Plant Watering Prescriptions */}
          {weatherExpanded && (
            <View
              style={[
                styles.weatherExpandBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.weatherGroupTitle,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                ⏪{' '}
                {lang === 'bn'
                  ? 'গত ৭ দিনের আবহাওয়া রেকর্ড:'
                  : 'Past 7 Days Weather:'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.weatherStrip}
              >
                {weatherWindow.past7Days.map((w, i) => (
                  <View
                    key={i}
                    style={[
                      styles.weatherPill,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.wDay, { color: theme.textSecondary }]}
                    >
                      {lang === 'bn' ? w.dayLabelBengali : w.dayLabelEnglish}
                    </Text>
                    <Text style={[styles.wTemp, { color: theme.textPrimary }]}>
                      {w.condition === 'rainy' ? '🌧️' : '☀️'} {w.tempCelsius}°C
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <Text
                style={[
                  styles.weatherGroupTitle,
                  { color: theme.primary, fontFamily: fontFam, marginTop: 6 },
                ]}
              >
                ⏩{' '}
                {lang === 'bn'
                  ? 'আগামী ৭ দিনের আবহাওয়া পূর্বাভাস:'
                  : 'Upcoming 7 Days Forecast:'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.weatherStrip}
              >
                {weatherWindow.next7Days.map((w, i) => (
                  <View
                    key={i}
                    style={[
                      styles.weatherPill,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text style={[styles.wDay, { color: theme.textPrimary }]}>
                      {lang === 'bn' ? w.dayLabelBengali : w.dayLabelEnglish}
                    </Text>
                    <Text style={[styles.wTemp, { color: theme.primary }]}>
                      {w.condition === 'rainy' ? '🌧️' : '☀️'} {w.tempCelsius}°C
                      (💧{w.rainProbabilityPercent}%)
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <Text
                style={[
                  styles.weatherGroupTitle,
                  {
                    color: theme.textPrimary,
                    fontFamily: fontFam,
                    marginTop: 6,
                  },
                ]}
              >
                💧{' '}
                {lang === 'bn'
                  ? 'গাছ অনুযায়ী আজকের সেচ পরামর্শ:'
                  : 'Plant-Specific Watering Recommendations:'}
              </Text>
              {plants.slice(0, 3).map((p) => {
                const presc = NotificationService.computeWeatherPrescription(
                  p,
                  weatherWindow.today
                );
                return (
                  <View
                    key={p.id}
                    style={[
                      styles.prescRow,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.textPrimary,
                        fontWeight: '600',
                        fontSize: 13,
                        fontFamily: fontFam,
                      }}
                    >
                      🌱 {lang === 'bn' ? p.nameBengali : p.nameEnglish} (
                      {p.containerSizeInches}" Bag)
                    </Text>
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 12.5,
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn' ? presc.advisoryBn : presc.advisoryEn}
                    </Text>
                  </View>
                );
              })}

              {onOpenWeatherDashboard && (
                <TouchableOpacity
                  onPress={onOpenWeatherDashboard}
                  style={{
                    marginTop: 6,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                    backgroundColor: theme.selectedSurface,
                    borderWidth: 1,
                    borderColor: theme.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontWeight: '700',
                      fontSize: 13,
                      fontFamily: fontFam,
                    }}
                  >
                    🌦️{' '}
                    {lang === 'bn'
                      ? 'পূর্ণাঙ্গ আবহাওয়া ও পরিচর্যা ড্যাশবোর্ড খুলুন →'
                      : 'Open Full Weather & Care Dashboard →'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* 5. Garden Health (Visual Score & Progress Bar) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                  stroke={theme.primary}
                  strokeWidth="1.9"
                />
                <Path
                  d="M12 6C8.5 6 6 8.5 6 12C6 14.5 7.5 16.5 9.5 17.5L12 11L14.5 17.5C16.5 16.5 18 14.5 18 12C18 8.5 15.5 6 12 6Z"
                  fill={theme.primary}
                  opacity={0.3}
                />
              </Svg>
              <Text
                style={[
                  styles.sectionHeaderTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'বাগানের স্বাস্থ্য' : 'Garden Health'}
              </Text>
            </View>

            <View
              style={[
                styles.healthScoreBadge,
                {
                  backgroundColor:
                    healthScorePercent >= 80
                      ? 'rgba(20, 99, 59, 0.10)'
                      : healthScorePercent >= 50
                      ? 'rgba(217, 119, 6, 0.10)'
                      : 'rgba(220, 38, 38, 0.10)',
                  borderColor:
                    healthScorePercent >= 80
                      ? theme.primary
                      : healthScorePercent >= 50
                      ? theme.warning
                      : theme.danger,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    healthScorePercent >= 80
                      ? theme.primary
                      : healthScorePercent >= 50
                      ? theme.warning
                      : theme.danger,
                  fontSize: 12,
                  fontWeight: '800',
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn' ? toBengaliNumber(healthScorePercent) : healthScorePercent}% {lang === 'bn' ? 'সুস্থ' : 'Healthy'}
              </Text>
            </View>
          </View>

          {/* Visual Progress Bar - Sleek 6px height */}
          <View
            style={[
              styles.healthTrackWrap,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.healthFillBar,
                {
                  width: `${Math.max(6, healthScorePercent)}%`,
                  backgroundColor:
                    healthScorePercent >= 80
                      ? theme.primary
                      : healthScorePercent >= 50
                      ? theme.warning
                      : theme.danger,
                },
              ]}
            />
          </View>

          <View style={styles.healthStatusFooter}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                lineHeight: 16.5,
                fontFamily: fontFam,
                flex: 1,
              }}
            >
              {healthScorePercent >= 80
                ? lang === 'bn'
                  ? '✅ চমৎকার অবস্থা! অধিকাংশ গাছ নিখুঁতভাবে সতেজ ও রোগমুক্ত।'
                  : '✅ Excellent! Most plants are flourishing and disease-free.'
                : attentionCount > 0
                ? lang === 'bn'
                  ? `⚠️ ${toBengaliNumber(attentionCount)}টি গাছে বিশেষ নজর দিন। সেচ ও রোগ নির্ণয় প্রয়োজন।`
                  : `⚠️ ${attentionCount} plants need attention. Check moisture and scan for pests.`
                : lang === 'bn'
                ? '🌱 নতুন চারা যুক্ত করে বাগানের যত্ন শুরু করুন।'
                : '🌱 Add your first plant to begin tracking rooftop care.'}
            </Text>

            {attentionCount > 0 && onOpenMyGarden && (
              <TouchableOpacity
                onPress={onOpenMyGarden}
                style={[
                  styles.quickCareBtn,
                  { backgroundColor: theme.selectedSurface, borderColor: theme.warning },
                ]}
              >
                <Text
                  style={{
                    color: theme.warning,
                    fontSize: 11.5,
                    fontWeight: '700',
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'গাছ দেখুন →' : 'View Plants →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 6. Harmonized 2x2 Garden Statistics Grid */}
        <View style={styles.statsGrid}>
          {/* Card 1: Total Plants */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: 'rgba(22, 122, 69, 0.10)' },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22V13M12 13C12 13 8 11.5 8 7C10.5 7 12 9 12 13ZM12 13C12 13 16 11.5 16 7C13.5 7 12 9 12 13Z"
                  stroke="#167A45"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: '#167A45' }]}>
                {lang === 'bn' ? toBengaliNumber(totalPlants) : totalPlants}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.statLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'মোট গাছ' : 'Total Plants'}
              </Text>
            </View>
          </View>

          {/* Card 2: Healthy Plants */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: 'rgba(22, 163, 74, 0.10)' },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke="#16A34A" strokeWidth="2" />
                <Path
                  d="M8.5 12.5L10.5 14.5L15.5 9.5"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: '#16A34A' }]}>
                {lang === 'bn' ? toBengaliNumber(healthyPlants) : healthyPlants}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.statLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'সুস্থ গাছ' : 'Healthy Plants'}
              </Text>
            </View>
          </View>

          {/* Card 3: Needs Care */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                {
                  backgroundColor:
                    attentionCount > 0
                      ? 'rgba(234, 88, 12, 0.10)'
                      : 'rgba(107, 127, 114, 0.08)',
                },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.7 1.82 20C2 20.3 2.26 20.55 2.58 20.73C2.89 20.9 3.24 21 3.6 21H20.4C20.76 21 21.11 20.9 21.42 20.73C21.74 20.55 22 20.3 22.18 20C22.36 19.7 22.45 19.35 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.15C12.65 2.98 12.3 2.89 11.94 2.89C11.58 2.89 11.23 2.98 10.92 3.15C10.61 3.32 10.35 3.56 10.17 3.86L10.29 3.86Z"
                  stroke={attentionCount > 0 ? '#EA580C' : theme.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M12 9V13M12 17H12.01"
                  stroke={attentionCount > 0 ? '#EA580C' : theme.textSecondary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTextCol}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color:
                      attentionCount > 0 ? '#EA580C' : theme.textSecondary,
                  },
                ]}
              >
                {lang === 'bn'
                  ? toBengaliNumber(attentionCount)
                  : attentionCount}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.statLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'যত্ন প্রয়োজন' : 'Needs Care'}
              </Text>
            </View>
          </View>

          {/* Card 4: Average Moisture */}
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: 'rgba(2, 132, 199, 0.10)' },
              ]}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2.69L17.66 8.35C19.22 9.91 20 11.83 20 14C20 18.42 16.42 22 12 22C7.58 22 4 18.42 4 14C4 11.83 4.78 9.91 6.34 8.35L12 2.69Z"
                  stroke="#0284C7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: '#0284C7' }]}>
                {lang === 'bn'
                  ? `${toBengaliNumber(avgMoisture)}%`
                  : `${avgMoisture}%`}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.statLabel,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'গড় আর্দ্রতা' : 'Avg Moisture'}
              </Text>
            </View>
          </View>
        </View>

        {/* 7. Urgent Care Notification & Interactive Selection with Right-Side Save Button */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                flex: 1,
                minWidth: 0,
              }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M10.3 21C10.6 21.6 11.2 22 12 22C12.8 22 13.4 21.6 13.7 21"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text
                numberOfLines={1}
                style={[
                  styles.sectionHeaderTitle,
                  { color: theme.textPrimary, fontFamily: fontFam, flexShrink: 1 },
                ]}
              >
                {t.urgentCareAlertTitle}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setCareTaskModalOpen(true)}
              activeOpacity={0.82}
              style={{
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.primary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
              }}
            >
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                <Path d="M12 5V19M5 12H19" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              </Svg>
              <Text
                numberOfLines={1}
                style={{
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: '700',
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn' ? 'শিডিউল টাস্ক' : 'Schedule Task'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plant Selector Filter: Reusing the exact Step 1 Plant Selector */}
          <PlantSelectorDropdown
            plants={plants}
            selectedPlantId={urgentCareSelectedPlantId}
            onSelectPlantId={(id) => setUrgentCareSelectedPlantId(id)}
            theme={theme}
            lang={lang}
            allowAllPlantsOption={true}
            label={
              lang === 'bn'
                ? 'নির্দিষ্ট গাছের কাজ ফিল্টার করুন:'
                : 'Filter tasks by target plant:'
            }
          />

          {/* Urgent Care Status Filter Chips: All, Pending, Do Later, Completed */}
          {(() => {
            const plantScopedTasks = careTasks.filter((task) => {
              if (
                urgentCareSelectedPlantId !== 'all' &&
                task.plantId !== urgentCareSelectedPlantId
              ) {
                return false;
              }
              return true;
            });

            const countAll = plantScopedTasks.length;
            const countPending = plantScopedTasks.filter(
              (t) => !t.isCompleted && (t.status === 'pending' || !t.status)
            ).length;
            const countDoLater = plantScopedTasks.filter(
              (t) => !t.isCompleted && t.status === 'do_later'
            ).length;
            const countCompleted = plantScopedTasks.filter(
              (t) => t.isCompleted || t.status === 'completed'
            ).length;

            const displayedUrgentTasks = plantScopedTasks.filter((task) => {
              const effectiveStatus: CareTaskStatus = task.isCompleted
                ? 'completed'
                : task.status || 'pending';
              if (urgentCareFilter === 'all') return true;
              if (urgentCareFilter === 'pending') return effectiveStatus === 'pending';
              if (urgentCareFilter === 'do_later') return effectiveStatus === 'do_later';
              if (urgentCareFilter === 'completed') return effectiveStatus === 'completed';
              return true;
            });

            return (
              <View style={{ gap: 10 }}>
                {/* Filter buttons row: All, Pending, Do Later, Completed */}
                <View style={styles.urgentFilterRow}>
                  {[
                    { key: 'all', label: lang === 'bn' ? 'সব' : 'All', count: countAll },
                    { key: 'pending', label: lang === 'bn' ? 'অপেক্ষমান' : 'Pending', count: countPending },
                    { key: 'do_later', label: lang === 'bn' ? 'পরে করব' : 'Do Later', count: countDoLater },
                    { key: 'completed', label: lang === 'bn' ? 'সম্পন্ন' : 'Completed', count: countCompleted },
                  ].map((chip) => {
                    const isActive = urgentCareFilter === chip.key;
                    return (
                      <TouchableOpacity
                        key={chip.key}
                        activeOpacity={0.8}
                        onPress={() => setUrgentCareFilter(chip.key as any)}
                        style={[
                          styles.urgentFilterChip,
                          {
                            backgroundColor: isActive ? theme.primary : theme.surfaceElevated,
                            borderColor: isActive ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.urgentFilterText,
                            {
                              color: isActive ? '#FFFFFF' : theme.textSecondary,
                              fontFamily: fontFam,
                              fontWeight: isActive ? '700' : '600',
                            },
                          ]}
                        >
                          {chip.label} ({lang === 'bn' ? toBengaliNumber(chip.count) : chip.count})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Empty State */}
                {displayedUrgentTasks.length === 0 ? (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 24,
                      paddingHorizontal: 16,
                      gap: 8,
                      backgroundColor: theme.surfaceElevated,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>🌿</Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: theme.primary,
                        fontFamily: fontFam,
                        textAlign: 'center',
                      }}
                    >
                      {urgentCareFilter === 'completed'
                        ? lang === 'bn'
                          ? 'কোনো টাস্ক সম্পন্ন তালিকায় নেই'
                          : 'No completed tasks yet'
                        : urgentCareFilter === 'do_later'
                        ? lang === 'bn'
                          ? "কোনো টাস্ক 'পরে করব' তালিকায় নেই"
                          : 'No tasks deferred to later'
                        : lang === 'bn'
                        ? 'সকল পরিচর্যা টাস্ক সম্পন্ন!'
                        : 'All Urgent Tasks Completed!'}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.textSecondary,
                        fontFamily: fontFam,
                        textAlign: 'center',
                      }}
                    >
                      {lang === 'bn'
                        ? 'আপনার বাগানের সকল গাছ পরিচ্ছন্ন ও সুস্থ অবস্থায় রয়েছে।'
                        : 'All plants in your rooftop garden are healthy and up to date.'}
                    </Text>
                  </View>
                ) : (
                  displayedUrgentTasks.map((task) => {
                    const isCompleted = task.isCompleted || task.status === 'completed';
                    const isDoLater = !isCompleted && task.status === 'do_later';

                    return (
                      <View
                        key={task.id}
                        style={[
                          styles.taskItem,
                          {
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            backgroundColor: theme.surfaceElevated,
                            borderColor: isCompleted
                              ? theme.primary
                              : isDoLater
                              ? theme.warning
                              : theme.border,
                            borderWidth: 1,
                            borderRadius: 14,
                            padding: 13,
                            gap: 9,
                            opacity: isCompleted ? 0.88 : 1,
                          },
                        ]}
                      >
                        {/* Top Row: Checkbox, Plant Name, Nature badge & Status */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              if (onSaveTaskStatus) {
                                onSaveTaskStatus(task, isCompleted ? 'pending' : 'completed');
                              } else {
                                onToggleTaskCheckbox(task);
                              }
                            }}
                            style={[
                              styles.checkboxBox,
                              {
                                backgroundColor: isCompleted ? theme.primary : 'transparent',
                                borderColor: isCompleted ? theme.primary : theme.textSecondary,
                                marginTop: 2,
                              },
                            ]}
                          >
                            {isCompleted && <Text style={styles.checkboxMark}>✓</Text>}
                          </TouchableOpacity>

                          <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
                            {/* Plant Name & Badges */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 6,
                              }}
                            >
                              <Text
                                style={[
                                  styles.taskTitle,
                                  {
                                    color: theme.textPrimary,
                                    fontFamily: fontFam,
                                    fontWeight: '800',
                                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                                  },
                                ]}
                              >
                                🌱 {lang === 'bn' ? task.plantNameBengali : task.plantNameEnglish}
                              </Text>

                              {task.taskType && (
                                <View
                                  style={{
                                    backgroundColor: theme.selectedSurface,
                                    paddingHorizontal: 7,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: theme.primary,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: '700',
                                      color: theme.primary,
                                      fontFamily: fontFam,
                                    }}
                                  >
                                    {task.taskType === 'watering'
                                      ? '💧 সেচ'
                                      : task.taskType === 'fertilizer'
                                      ? '🧪 সার'
                                      : task.taskType === 'pest_control'
                                      ? '🛡️ বালাই দমন'
                                      : task.taskType === 'pruning'
                                      ? '✂️ ছাঁটাই'
                                      : task.taskType === 'soil_work'
                                      ? '🪴 মাটি'
                                      : task.taskType === 'sunlight'
                                      ? '☀️ রোদ'
                                      : '📌 পরিচর্যা'}
                                  </Text>
                                </View>
                              )}

                              {task.notificationScheduled && (
                                <View
                                  style={{
                                    backgroundColor: 'rgba(22, 122, 69, 0.08)',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10.5,
                                      color: theme.primary,
                                      fontWeight: '700',
                                    }}
                                  >
                                    🔔 {lang === 'bn' ? 'পুশ অ্যালার্ট' : 'Push'}
                                  </Text>
                                </View>
                              )}

                              {isDoLater && (
                                <View
                                  style={{
                                    backgroundColor: 'rgba(217, 119, 6, 0.12)',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: theme.warning,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10.5,
                                      color: theme.warning,
                                      fontWeight: '700',
                                    }}
                                  >
                                    ⏰ {lang === 'bn' ? 'পরে করব' : 'Do Later'}
                                  </Text>
                                </View>
                              )}

                              {isCompleted && (
                                <View
                                  style={{
                                    backgroundColor: 'rgba(22, 122, 69, 0.12)',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: theme.primary,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10.5,
                                      color: theme.primary,
                                      fontWeight: '700',
                                    }}
                                  >
                                    ✓ {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Specific Task Title */}
                            {(task.titleBengali || task.titleEnglish) && (
                              <Text
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: '700',
                                  color: theme.primary,
                                  fontFamily: fontFam,
                                  textDecorationLine: isCompleted ? 'line-through' : 'none',
                                }}
                              >
                                {lang === 'bn' ? task.titleBengali : task.titleEnglish}
                                {task.waterAmountLiters ? ` • 💧 ${task.waterAmountLiters}L` : ''}
                              </Text>
                            )}

                            {/* Action steps */}
                            <Text
                              style={[
                                styles.taskSub,
                                {
                                  color: theme.textPrimary,
                                  fontFamily: fontFam,
                                  lineHeight: 19,
                                  fontSize: 13.5,
                                },
                              ]}
                            >
                              👉 <Text style={{ fontWeight: '700' }}>{lang === 'bn' ? 'পদক্ষেপ: ' : 'Action: '}</Text>
                              {lang === 'bn'
                                ? task.actionDetailsBengali || task.fertilizerOrSprayInstructionBengali
                                : task.actionDetailsEnglish || task.fertilizerOrSprayInstructionEnglish}
                            </Text>

                            {/* Reasoning */}
                            {(task.reasoningBengali || task.reasoningEnglish || task.shadeOrMoistureAdvisoryBengali) && (
                              <Text
                                style={{
                                  fontSize: 12.5,
                                  color: theme.textSecondary,
                                  fontFamily: fontFam,
                                  lineHeight: 17,
                                }}
                              >
                                💡 <Text style={{ fontWeight: '700' }}>{lang === 'bn' ? 'কারণ: ' : 'Reason: '}</Text>
                                {lang === 'bn'
                                  ? task.reasoningBengali || task.shadeOrMoistureAdvisoryBengali
                                  : task.reasoningEnglish || task.shadeOrMoistureAdvisoryEnglish}
                              </Text>
                            )}

                            {/* Due date & slot */}
                            <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                              📅 {task.dueDateIso.split('T')[0]} • {task.recommendedTimeSlot === 'morning' ? '🌅 সকাল' : task.recommendedTimeSlot === 'afternoon' ? '☀️ দুপুর' : '🌇 বিকাল/সন্ধ্যা'}
                            </Text>
                          </View>
                        </View>

                        {/* Bottom Actions Row: Neatly arranged BELOW the task content */}
                        <View style={styles.taskBottomActionsRow}>
                          {isCompleted ? (
                            <>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: theme.primary,
                                    fontWeight: '700',
                                    fontFamily: fontFam,
                                  }}
                                >
                                  ✓ {lang === 'bn' ? 'টাস্ক সম্পন্ন হয়েছে' : 'Task Completed'}
                                </Text>
                              </View>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                  if (onSaveTaskStatus) {
                                    onSaveTaskStatus(task, 'pending');
                                  } else {
                                    onToggleTaskCheckbox(task);
                                  }
                                }}
                                style={[
                                  styles.taskActionBtnSecondary,
                                  { borderColor: theme.border, backgroundColor: theme.surface },
                                ]}
                              >
                                <Text
                                  style={{
                                    fontSize: 11.5,
                                    color: theme.textSecondary,
                                    fontFamily: fontFam,
                                    fontWeight: '600',
                                  }}
                                >
                                  ↩ {lang === 'bn' ? 'অপেক্ষমান করুন' : 'Mark Pending'}
                                </Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                  const nextStatus = task.status === 'do_later' ? 'pending' : 'do_later';
                                  if (onSaveTaskStatus) {
                                    onSaveTaskStatus(task, nextStatus);
                                  }
                                }}
                                style={[
                                  styles.taskActionBtnSecondary,
                                  {
                                    backgroundColor: isDoLater ? 'rgba(217, 119, 6, 0.12)' : theme.surface,
                                    borderColor: isDoLater ? theme.warning : theme.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    color: isDoLater ? theme.warning : theme.textSecondary,
                                    fontSize: 11.5,
                                    fontWeight: '700',
                                    fontFamily: fontFam,
                                  }}
                                >
                                  ⏰ {isDoLater ? (lang === 'bn' ? 'অপেক্ষমান করুন' : 'Pending') : (lang === 'bn' ? 'পরে করব' : 'Do Later')}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={() => {
                                  if (onSaveTaskStatus) {
                                    onSaveTaskStatus(task, 'completed');
                                  } else {
                                    onToggleTaskCheckbox(task);
                                  }
                                }}
                                style={[
                                  styles.taskActionBtnPrimary,
                                  { backgroundColor: theme.primary },
                                ]}
                              >
                                <Text
                                  style={{
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: '700',
                                    fontFamily: fontFam,
                                  }}
                                >
                                  ✓ {lang === 'bn' ? 'সম্পন্ন করুন' : 'Complete'}
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })()}
        </View>

        {/* 8. Quick Action Shortcuts: 2x2 Equal-Height Grid */}
        <View style={styles.shortcutGrid}>
          {/* Button 1: Add Plant (Primary Action) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAddModalOpen(true)}
            style={[
              styles.shortcutGridBtn,
              {
                backgroundColor: theme.primary,
                borderColor: theme.primary,
              },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 5V19M5 12H19"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </Svg>
            <Text
              numberOfLines={1}
              style={[
                styles.shortcutGridText,
                { color: '#FFFFFF', fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'গাছ যুক্ত করুন' : 'Add Plant'}
            </Text>
          </TouchableOpacity>

          {/* Button 2: Plant QR (Secondary Action) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCameraScannerOpen(true)}
            style={[
              styles.shortcutGridBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
                stroke={theme.textPrimary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Path
                d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
                stroke={theme.textPrimary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Path
                d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
                stroke={theme.textPrimary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Path
                d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
                stroke={theme.textPrimary}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <Rect x="7" y="7" width="4" height="4" fill={theme.textPrimary} />
              <Rect x="13" y="7" width="4" height="4" fill={theme.textPrimary} />
              <Rect x="7" y="13" width="4" height="4" fill={theme.textPrimary} />
              <Rect x="13" y="13" width="4" height="4" fill={theme.textPrimary} />
            </Svg>
            <Text
              numberOfLines={1}
              style={[
                styles.shortcutGridText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'প্ল্যান্ট কিউআর' : 'Plant QR'}
            </Text>
          </TouchableOpacity>

          {/* Button 3: AI Doctor (Secondary Action) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onOpenAiDiagnosis?.()}
            style={[
              styles.shortcutGridBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2L14.4 7.2L20 8L16 12L17 17.6L12 15L7 17.6L8 12L4 8L9.6 7.2L12 2Z"
                stroke={theme.primary}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text
              numberOfLines={1}
              style={[
                styles.shortcutGridText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'এআই ডক্টর' : 'AI Doctor'}
            </Text>
          </TouchableOpacity>

          {/* Button 4: Botanical Search (Secondary Action) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setBotanicalSearchOpen(true)}
            style={[
              styles.shortcutGridBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="7" stroke={theme.primary} strokeWidth="2" />
              <Path d="M20 20L16 16" stroke={theme.primary} strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <Text
              numberOfLines={1}
              style={[
                styles.shortcutGridText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'উদ্ভিদ সার্চ' : 'Botanical Search'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. Registered Plants Header + Search Filter + Grid / List View Switcher */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.plantsHeaderRow}>
            <Text
              style={[
                styles.sectionHeaderTitle,
                { color: theme.textPrimary, fontFamily: fontFam, flexShrink: 1 },
              ]}
              numberOfLines={1}
            >
              🌳 {t.myPlantsTitle} (
              {lang === 'bn'
                ? toBengaliNumber(plants.length)
                : plants.length}
              )
            </Text>

            <View style={styles.viewToggleGroup}>
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                style={[
                  styles.viewToggleBtn,
                  {
                    backgroundColor:
                      viewMode === 'grid'
                        ? theme.primary
                        : theme.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={{
                    color: viewMode === 'grid' ? '#FFFFFF' : theme.textPrimary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  ⊞ Grid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('list')}
                style={[
                  styles.viewToggleBtn,
                  {
                    backgroundColor:
                      viewMode === 'list'
                        ? theme.primary
                        : theme.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={{
                    color: viewMode === 'list' ? '#FFFFFF' : theme.textPrimary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  ☰ List
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              lang === 'bn'
                ? 'গাছের নাম, জাত বা QR কোড দিয়ে খুঁজুন...'
                : 'Search by plant name, variety or QR ID...'
            }
            placeholderTextColor={theme.textSecondary}
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.surfaceElevated,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
          />

          {/* Plant Cards in Grid or List View (Harmonized with Garden Page) */}
          <View
            style={
              viewMode === 'grid' ? styles.plantsGridWrap : styles.plantsListWrap
            }
          >
            {filteredPlants.map((plant) => {
              const forecast = LocalDbService.getPlantForecast(plant);
              const isHealthy = plant.healthState === 'healthy';

              if (viewMode === 'list') {
                return (
                  <TouchableOpacity
                    key={plant.id}
                    activeOpacity={0.84}
                    onPress={() => onSelectPlant(plant)}
                    style={[
                      styles.plantCardListEnhanced,
                      {
                        backgroundColor: theme.surface,
                        borderColor: !isHealthy ? theme.warning : theme.border,
                      },
                      !isHealthy && {
                        shadowColor: theme.warning,
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                      },
                    ]}
                  >
                    {/* Left: Plant Photo / Avatar */}
                    <View
                      style={[
                        styles.listPhotoWrap,
                        {
                          backgroundColor: isHealthy
                            ? theme.selectedSurface
                            : 'rgba(217, 119, 6, 0.12)',
                          borderColor: isHealthy ? theme.primary : theme.warning,
                        },
                      ]}
                    >
                      {plant.photoUri ? (
                        <Image
                          source={{ uri: plant.photoUri }}
                          style={styles.plantFullImg}
                        />
                      ) : (
                        <Text style={{ fontSize: 32 }}>
                          {plant.category === 'fruit'
                            ? '🍋'
                            : plant.category === 'flower'
                            ? '🌸'
                            : '🌿'}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.listMoistureBadge,
                          {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: theme.primary,
                          }}
                        >
                          💧 {plant.estimatedMoisturePercent}%
                        </Text>
                      </View>
                    </View>

                    {/* Right: Meta & Hierarchy */}
                    <View style={styles.listMetaCol}>
                      <View style={styles.cardTopRow}>
                        <Text
                          style={[
                            styles.qrBadge,
                            {
                              color: theme.primary,
                              backgroundColor: theme.selectedSurface,
                            },
                          ]}
                        >
                          {plant.qrCodeId}
                        </Text>
                        <View
                          style={[
                            styles.healthPillBadge,
                            {
                              backgroundColor: isHealthy
                                ? 'rgba(20, 99, 59, 0.10)'
                                : 'rgba(217, 119, 6, 0.12)',
                              borderColor: isHealthy
                                ? theme.primary
                                : theme.warning,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: isHealthy ? theme.primary : theme.warning,
                              fontSize: 11,
                              fontWeight: '700',
                              fontFamily: fontFam,
                            }}
                          >
                            {isHealthy
                              ? lang === 'bn'
                                ? '● সুস্থ'
                                : '● Healthy'
                              : lang === 'bn'
                              ? '⚠️ যত্ন প্রয়োজন'
                              : '⚠️ Needs Care'}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🌱</Text>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.cardHeading,
                            {
                              color: theme.textPrimary,
                              fontFamily: fontFam,
                              flex: 1,
                            },
                          ]}
                        >
                          {lang === 'bn'
                            ? plant.nameBengali
                            : plant.nameEnglish}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.captionText,
                          { color: theme.textSecondary, fontFamily: fontFam },
                        ]}
                      >
                        {plant.variety} •{' '}
                        {lang === 'bn'
                          ? forecast.containerSummaryBn ||
                            `${plant.containerSizeInches}" জিও ব্যাগ`
                          : forecast.containerSummaryEn ||
                            `${plant.containerSizeInches}" Geo-Bag`}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text
                          style={[
                            styles.captionText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          ⏳{' '}
                          {lang === 'bn'
                            ? `বয়স: ${toBengaliNumber(forecast.ageInDays)} দিন`
                            : `Age: ${forecast.ageInDays}d`}
                        </Text>
                        <Text
                          style={[
                            styles.cardFooterText,
                            { color: theme.primary, fontFamily: fontFam },
                          ]}
                        >
                          {lang === 'bn'
                            ? 'পরিচর্যা গাইড →'
                            : 'Care Guide →'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              // Grid View Card
              return (
                <TouchableOpacity
                  key={plant.id}
                  activeOpacity={0.82}
                  onPress={() => onSelectPlant(plant)}
                  style={[
                    styles.plantCardGridEnhanced,
                    {
                      backgroundColor: theme.surface,
                      borderColor: !isHealthy ? theme.warning : theme.border,
                    },
                  ]}
                >
                  {/* Top Image Banner */}
                  <View
                    style={[
                      styles.gridImageHeader,
                      {
                        backgroundColor: isHealthy
                          ? theme.selectedSurface
                          : 'rgba(217, 119, 6, 0.12)',
                      },
                    ]}
                  >
                    {plant.photoUri ? (
                      <Image
                        source={{ uri: plant.photoUri }}
                        style={styles.plantFullImg}
                      />
                    ) : (
                      <Text style={{ fontSize: 36 }}>
                        {plant.category === 'fruit'
                          ? '🍋'
                          : plant.category === 'flower'
                          ? '🌸'
                          : '🌿'}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.gridHealthFloatBadge,
                        {
                          backgroundColor: isHealthy
                            ? 'rgba(20, 99, 59, 0.88)'
                            : 'rgba(217, 119, 6, 0.92)',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: '700',
                        }}
                      >
                        {isHealthy
                          ? lang === 'bn'
                            ? 'সুস্থ'
                            : 'Healthy'
                          : lang === 'bn'
                          ? 'যত্ন'
                          : 'Care'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gridContentWrap}>
                    <Text
                      style={[
                        styles.qrBadge,
                        {
                          color: theme.primary,
                          backgroundColor: theme.selectedSurface,
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      {plant.qrCodeId}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>🌱</Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.cardHeading,
                          {
                            color: theme.textPrimary,
                            fontFamily: fontFam,
                            flex: 1,
                          },
                        ]}
                      >
                        {lang === 'bn'
                          ? plant.nameBengali
                          : plant.nameEnglish}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.captionText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {plant.variety}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text
                        style={[
                          styles.captionText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        ⏳{' '}
                        {lang === 'bn'
                          ? `${toBengaliNumber(forecast.ageInDays)} দিন`
                          : `${forecast.ageInDays}d`}
                      </Text>
                      <Text
                        style={[
                          styles.captionText,
                          { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        💧 {plant.estimatedMoisturePercent}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredPlants.length === 0 && (
              <View
                style={[
                  styles.emptySearchCard,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>
                  🌱🔍
                </Text>
                <Text
                  style={[
                    styles.emptySearchTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {searchQuery.trim()
                    ? lang === 'bn'
                      ? `আপনার বাগানে "${searchQuery}" নামের গাছ নেই`
                      : `No registered plant matching "${searchQuery}"`
                    : lang === 'bn'
                    ? 'আপনার বাগানে কোনো গাছ নেই'
                    : 'No plants in your garden yet'}
                </Text>
                <Text
                  style={[
                    styles.emptySearchSubtitle,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {searchQuery.trim()
                    ? lang === 'bn'
                      ? 'ইন্টারনেট থেকে সরাসরি এই উদ্ভিদের বৈজ্ঞানিক তথ্য, ছবি, মাটির মিশ্রণ ও পরিচর্যা গাইড লোড করতে নিচের বাটনে ট্যাপ করুন:'
                      : 'Fetch global online species information, photos, soil mix formula & care guidelines:'
                    : lang === 'bn'
                    ? 'অনলাইনে যেকোনো গাছ ও জাতের তথ্য জানতে অনুসন্ধান করুন।'
                    : 'Search global botanical database for species and varieties.'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setBotanicalInitialQuery(searchQuery.trim());
                    setBotanicalSearchOpen(true);
                  }}
                  style={[
                    styles.emptySearchActionBtn,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2" />
                      <Path d="M3 12H21" stroke="#FFFFFF" strokeWidth="1.8" />
                      <Path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z" stroke="#FFFFFF" strokeWidth="1.8" />
                    </Svg>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: 13.5,
                        fontFamily: fontFam,
                      }}
                    >
                      {searchQuery.trim()
                        ? lang === 'bn'
                          ? `ইন্টারনেটে "${searchQuery}" অনুসন্ধান করুন`
                          : `Search "${searchQuery}" Online`
                        : lang === 'bn'
                        ? 'অনলাইনে গাছ ও প্রজাতি অনুসন্ধান করুন'
                        : 'Search Species Online'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* 6. Recent Plant Activities */}
        {recentLogs.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Text
              style={[
                styles.sectionHeaderTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              📜{' '}
              {lang === 'bn'
                ? 'সাম্প্রতিক বাগান কার্যক্রম'
                : 'Recent Plant Activities'}
            </Text>

            {recentLogs.map((log) => (
              <View
                key={log.id}
                style={[
                  styles.activityRow,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 15 }}>✅</Text>
                <View style={styles.taskTextCol}>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontWeight: '600',
                      fontSize: 13.5,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? log.titleBengali : log.titleEnglish}
                  </Text>
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 12.5,
                      fontFamily: fontFam,
                    }}
                  >
                    {log.detailsNotes}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Comprehensive Add & Register Plant Modal */}
        <AddPlantModal
          visible={addModalOpen}
          lang={lang}
          theme={theme}
          existingPlantCount={plants.length}
          ownerName={user.displayName}
          ownerDistrict={user.district}
          onClose={() => setAddModalOpen(false)}
          onSavePlant={(created) => {
            onAddNewPlant(created);
            setAddModalOpen(false);
          }}
        />

        {/* Structured Botanical Search & Variety Encyclopedia Modal (Requirement #3) */}
        <BotanicalSearchModal
          visible={botanicalSearchOpen}
          theme={theme}
          lang={lang}
          initialQuery={botanicalInitialQuery}
          onClose={() => setBotanicalSearchOpen(false)}
          onSelectPlantToAdd={(preset) => {
            const qrId = 'BAGANI-QR-' + (1000 + plants.length + 1);
            const createdPlant: PlantModel = {
              id: 'plt_' + Date.now().toString(36),
              qrCodeId: qrId,
              nameBengali: preset.nameBn,
              nameEnglish: preset.nameEn,
              variety: preset.variety,
              category: preset.category,
              isAllSeason: preset.isAllSeason,
              photoUri: preset.photoUrl || '',
              plantedDateIso: new Date().toISOString(),
              containerSizeInches: preset.containerSize || 20,
              containerType: 'geo_bag',
              containerCapacityLabel: `${preset.containerSize || 20} Inch Geo-Bag`,
              growthStage: 'vegetative',
              canopySize: 'medium',
              soilCondition: 'loam_compost',
              sunlightExposure: 'full_sun',
              rooftopZone: `ছাদবাগান সারি - টব #${plants.length + 1}`,
              healthState: 'healthy',
              lastHealthDiagnosisSummary: 'অনলাইন ভেরিফাইড চারা — সতেজ ও সুস্থ অবস্থা',
              lastWateredIso: new Date().toISOString(),
              lastFertilizedIso: new Date().toISOString(),
              estimatedMoisturePercent: 75,
              qrTagConfig: {
                qrCodeValue: qrId,
                tagSize: 'medium',
                plantName: preset.nameBn,
                varietyName: preset.variety,
                isAllSeason: preset.isAllSeason,
                customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
                ownerName: user.displayName,
                ownerAddressOrCode: `${user.district} • ${qrId}`,
              },
            };
            onAddNewPlant(createdPlant);
          }}
        />

        {/* Full-Featured Care Task Scheduling Modal */}
        <AddCareTaskModal
          visible={careTaskModalOpen}
          onClose={() => setCareTaskModalOpen(false)}
          plants={plants}
          onSaveTask={(newTask) => {
            if (onAddCareTask) {
              onAddCareTask(newTask);
            }
          }}
          theme={theme}
          lang={lang}
        />

        {/* Real-Time Live Camera QR Tag Scanner Modal */}
        <QrCameraScannerModal
          visible={cameraScannerOpen}
          onClose={() => setCameraScannerOpen(false)}
          plants={plants}
          onScanSuccess={(scannedPlant) => {
            setCameraScannerOpen(false);
            onSelectPlant(scannedPlant);
          }}
          onAddNewPlantWithQr={(qrCode) => {
            setCameraScannerOpen(false);
            setAddModalOpen(true);
          }}
          theme={theme}
          lang={lang}
        />
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
    paddingBottom: 110,
  },
  modernHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  modernHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  modernAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modernAvatarImg: {
    width: '100%',
    height: '100%',
  },
  modernGreetingSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 16,
  },
  modernUserName: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 21,
  },
  modernDistrictChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  modernDistrictText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  modernSearchRow: {
    width: '100%',
    marginVertical: 4,
  },
  modernSearchPill: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  modernSearchInnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modernSearchPlaceholder: {
    fontSize: 13.5,
  },
  modernSearchScanBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernHeroCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 128,
    justifyContent: 'center',
    padding: 16,
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  heroContentWrap: {
    gap: 8,
    zIndex: 2,
  },
  heroTextWrap: {
    gap: 5,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  heroTagText: {
    color: '#EAF8EE',
    fontSize: 11,
    fontWeight: '700',
  },
  modernHeroHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 23,
    maxWidth: 320,
  },
  heroCtaPillBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 4,
  },
  heroCtaPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  weatherCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  weatherDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weatherTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  weatherMainBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  weatherMainLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  weatherTempBig: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  weatherDistrictLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherMainRight: {
    gap: 6,
    alignItems: 'flex-end',
  },
  weatherMetricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  weatherMetricText: {
    fontSize: 11,
    fontWeight: '600',
  },
  weatherToggleFooter: {
    alignItems: 'center',
    paddingTop: 2,
  },
  weatherToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  healthScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  healthTrackWrap: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    overflow: 'hidden',
  },
  healthFillBar: {
    height: '100%',
    borderRadius: 3,
  },
  healthStatusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickCareBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  card: {
    width: '100%',
    padding: DESIGN_TOKENS.cardPadding,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 12,
  },
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  heroTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  greetingTopLabel: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 13,
    marginTop: 2,
  },
  weatherSummaryBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weatherLiveText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weatherExpandBox: {
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 8,
  },
  weatherGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  weatherStrip: {
    gap: 8,
    paddingVertical: 4,
  },
  weatherPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  wDay: {
    fontSize: 12,
    fontWeight: '500',
  },
  wTemp: {
    fontSize: 13,
    fontWeight: '600',
  },
  prescRow: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  statCard: {
    width: '48.6%',
    height: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statIconText: {
    fontSize: 18,
  },
  statTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 15,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  taskTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskSub: {
    fontSize: 13,
  },
  urgentFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  urgentFilterChip: {
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentFilterText: {
    fontSize: 12,
  },
  taskBottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5EBE6',
  },
  taskActionBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taskActionBtnSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shortcutGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  shortcutGridBtn: {
    width: '48.5%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 7,
  },
  shortcutGridText: {
    fontSize: 13,
    fontWeight: '700',
  },
  plantsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: DESIGN_TOKENS.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  plantsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  plantsListWrap: {
    gap: 12,
  },
  plantCardGridEnhanced: {
    width: '48.6%',
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImageHeader: {
    width: '100%',
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridHealthFloatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gridContentWrap: {
    padding: 12,
    gap: 4,
  },
  plantCardListEnhanced: {
    width: '100%',
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1.2,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listPhotoWrap: {
    width: 82,
    height: 82,
    borderRadius: 14,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  plantFullImg: {
    width: '100%',
    height: '100%',
  },
  listMoistureBadge: {
    position: 'absolute',
    bottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  listMetaCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  qrBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  healthPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  captionText: {
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardFooterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    padding: 20,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seasonToggleBtn: {
    padding: 12,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptySearchCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    gap: 8,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySearchSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 420,
    marginBottom: 6,
  },
  emptySearchActionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
