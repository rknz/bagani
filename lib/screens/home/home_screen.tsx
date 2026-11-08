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
import { QrCameraScannerModal } from '../../core/components/qr_camera_scanner_modal';
import Svg, { Path } from 'react-native-svg';
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
  const [taskFilter, setTaskFilter] = useState<
    'all' | 'pending' | 'do_later' | 'completed'
  >('all');
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
        {/* 1. Modern Header Row (Matching Reference) */}
        <View style={styles.modernHeaderRow}>
          <View style={styles.modernHeaderLeft}>
            <View
              style={[
                styles.modernAvatarCircle,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              {user.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={styles.modernAvatarImg}
                />
              ) : (
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={{ width: 34, height: 28 }}
                  resizeMode="contain"
                />
              )}
            </View>
            <View style={{ justifyContent: 'center' }}>
              <Text
                style={[
                  styles.modernGreetingSubtitle,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {greeting}!
              </Text>
              <Text
                style={[
                  styles.modernUserName,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {user.displayName || 'Antony Thomas'}
              </Text>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 11.5,
                  fontWeight: '600',
                  fontFamily: fontFam,
                }}
              >
                📍 {user.district}
              </Text>
            </View>
          </View>

          {/* Floating Circular Notification Bell Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => setWeatherExpanded(!weatherExpanded)}
            style={[
              styles.modernBellBtn,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {attentionCount > 0 && (
              <View
                style={[
                  styles.modernBellBadge,
                  { backgroundColor: theme.danger },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Modern Capsule-Style Search Bar (Matching Reference) */}
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
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.modernSearchInnerLeft}>
              <Text style={{ fontSize: 16 }}>🔍</Text>
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
                  : 'Search ...'}
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
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 7V5C3 3.89543 3.89543 3 5 3H7"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <Path
                  d="M17 3H19C20.1046 3 21 3.89543 21 5V7"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <Path
                  d="M21 17V19C21 20.1046 20.1046 21 19 21H17"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <Path
                  d="M7 21H5C3.89543 21 3 20.1046 3 19V17"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <Path
                  d="M7 12H17"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </Svg>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* 3. Modern Hero Banner Card (Matching Reference) */}
        <View
          style={[
            styles.modernHeroCard,
            {
              backgroundColor: '#113A23',
            },
          ]}
        >
          {/* Decorative ambient elements */}
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
                  { color: '#113A23', fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'বাগান পরিকল্পনা শুরু করুন'
                  : 'Create a free planting plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Dual Date & Live District Weather Bar */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >

          {/* Dual Date (Bengali + English) & Live District Weather Bar */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setWeatherExpanded(!weatherExpanded)}
            style={[
              styles.weatherSummaryBar,
              {
                backgroundColor: theme.selectedSurface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dateText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              📅 {bengaliDate}  •  {englishDate}  •  ⏰ {timeString}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
              <Text style={{ fontSize: 13, lineHeight: 18 }}>☀️</Text>
              <Text
                style={[
                  styles.weatherLiveText,
                  { flex: 1, color: theme.primary, fontFamily: fontFam, lineHeight: 18 },
                ]}
              >
                {user.district}: {weatherWindow.today.tempCelsius}°C (আর্দ্রতা{' '}
                {weatherWindow.today.humidityPercent}% • বৃষ্টি{' '}
                {weatherWindow.today.rainProbabilityPercent}%) —{' '}
                {lang === 'bn'
                  ? 'গত ৭ দিন ও আগামী ৭ দিনের পূর্বাভাস ▾'
                  : 'Tap for 15-Day Weather & Care ▾'}
              </Text>
            </View>
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

        {/* Tier 3: Garden Health (Visual Score & Progress Bar) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>🌿</Text>
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
                      ? 'rgba(20, 99, 59, 0.12)'
                      : healthScorePercent >= 50
                      ? 'rgba(217, 119, 6, 0.12)'
                      : 'rgba(220, 38, 38, 0.12)',
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
                  fontSize: 13,
                  fontWeight: '800',
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn' ? toBengaliNumber(healthScorePercent) : healthScorePercent}% {lang === 'bn' ? 'সুস্থ' : 'Healthy'}
              </Text>
            </View>
          </View>

          {/* Visual Progress Bar */}
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
                fontSize: 12.5,
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

        {/* Tier 4: Spacious 2x2 Garden Statistics Grid (Single-Line Labels, Zero Overflow) */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.selectedSurface },
              ]}
            >
              <Text style={styles.statIconText}>🌳</Text>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: theme.textPrimary }]}>
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

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.selectedSurface },
              ]}
            >
              <Text style={styles.statIconText}>✅</Text>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
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

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.selectedSurface },
              ]}
            >
              <Text style={styles.statIconText}>⚠️</Text>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: theme.warning }]}>
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

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: theme.selectedSurface },
              ]}
            >
              <Text style={styles.statIconText}>💧</Text>
            </View>
            <View style={styles.statTextCol}>
              <Text style={[styles.statNumber, { color: theme.secondary }]}>
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

        {/* 3. Urgent Care Notification & Interactive Selection with Right-Side Save Button */}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
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
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.primary,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>➕</Text>
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

          {/* Filter Tabs: All | Pending | Do Later | Completed */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {(
              [
                {
                  id: 'all',
                  bn: `সব (${careTasks.length})`,
                  en: `All (${careTasks.length})`,
                },
                {
                  id: 'pending',
                  bn: `বাকি (${
                    careTasks.filter(
                      (x) => !x.isCompleted && x.status !== 'do_later'
                    ).length
                  })`,
                  en: `Pending (${
                    careTasks.filter(
                      (x) => !x.isCompleted && x.status !== 'do_later'
                    ).length
                  })`,
                },
                {
                  id: 'do_later',
                  bn: `পরে করব (${
                    careTasks.filter((x) => x.status === 'do_later').length
                  })`,
                  en: `Do Later (${
                    careTasks.filter((x) => x.status === 'do_later').length
                  })`,
                },
                {
                  id: 'completed',
                  bn: `সম্পন্ন (${
                    careTasks.filter(
                      (x) => x.isCompleted || x.status === 'completed'
                    ).length
                  })`,
                  en: `Completed (${
                    careTasks.filter(
                      (x) => x.isCompleted || x.status === 'completed'
                    ).length
                  })`,
                },
              ] as const
            ).map((tab) => {
              const active = taskFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setTaskFilter(tab.id)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    backgroundColor: active
                      ? theme.primary
                      : theme.surfaceElevated,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : theme.textSecondary,
                      fontSize: 12,
                      fontWeight: '700',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? tab.bn : tab.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {careTasks
            .filter((task) => {
              const effectiveStatus: CareTaskStatus = task.isCompleted
                ? 'completed'
                : task.status || 'pending';
              if (taskFilter === 'pending')
                return effectiveStatus === 'pending';
              if (taskFilter === 'do_later')
                return effectiveStatus === 'do_later';
              if (taskFilter === 'completed')
                return effectiveStatus === 'completed';
              return true;
            })
            .map((task) => {
              const isSelected = task.id in selectedTaskDrafts;
              const draftChoice =
                selectedTaskDrafts[task.id] ||
                (task.isCompleted ? 'completed' : 'completed');
              const effectiveStatus: CareTaskStatus = task.isCompleted
                ? 'completed'
                : task.status || 'pending';

              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskItem,
                    {
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      backgroundColor:
                        effectiveStatus === 'completed'
                          ? theme.selectedSurface
                          : theme.surfaceElevated,
                      borderColor: isSelected
                        ? theme.primary
                        : effectiveStatus === 'completed'
                        ? theme.primary
                        : theme.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedTaskDrafts((prev) => {
                          const next = { ...prev };
                          if (task.id in next) {
                            delete next[task.id];
                          } else {
                            next[task.id] =
                              effectiveStatus === 'completed'
                                ? 'do_later'
                                : 'completed';
                          }
                          return next;
                        });
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          {
                            backgroundColor:
                              isSelected || effectiveStatus === 'completed'
                                ? theme.primary
                                : theme.surface,
                            borderColor: theme.primary,
                          },
                        ]}
                      >
                        <Text style={styles.checkboxMark}>
                          {isSelected || effectiveStatus === 'completed'
                            ? '✓'
                            : ''}
                        </Text>
                      </View>

                      <View style={[styles.taskTextCol, { gap: 3 }]}>
                        {/* Row 1: Plant Name, Nature badge & Push notification */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Text
                            style={[
                              styles.taskTitle,
                              {
                                color: theme.textPrimary,
                                textDecorationLine:
                                  effectiveStatus === 'completed'
                                    ? 'line-through'
                                    : 'none',
                                fontFamily: fontFam,
                                fontWeight: '800',
                              },
                            ]}
                          >
                            🌱 {lang === 'bn' ? task.plantNameBengali : task.plantNameEnglish}
                          </Text>

                          {task.taskType && (
                            <View style={{ backgroundColor: theme.selectedSurface, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: theme.primary }}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary, fontFamily: fontFam }}>
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
                            <View style={{ backgroundColor: 'rgba(20, 99, 59, 0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10.5, color: theme.primary, fontWeight: '700' }}>🔔 পুশ অ্যালার্ট</Text>
                            </View>
                          )}
                        </View>

                        {/* Row 2: Specific Task Title */}
                        {(task.titleBengali || task.titleEnglish) && (
                          <Text
                            style={{
                              fontSize: 13.5,
                              fontWeight: '700',
                              color: theme.primary,
                              fontFamily: fontFam,
                            }}
                          >
                            {lang === 'bn' ? task.titleBengali : task.titleEnglish}
                            {task.waterAmountLiters ? ` • 💧 ${task.waterAmountLiters}L` : ''}
                          </Text>
                        )}

                        {/* Row 3: Action steps */}
                        <Text
                          style={[
                            styles.taskSub,
                            { color: theme.textPrimary, fontFamily: fontFam, lineHeight: 18 },
                          ]}
                        >
                          👉 <Text style={{ fontWeight: '700' }}>{lang === 'bn' ? 'পদক্ষেপ: ' : 'Action: '}</Text>
                          {lang === 'bn'
                            ? task.actionDetailsBengali || task.fertilizerOrSprayInstructionBengali
                            : task.actionDetailsEnglish || task.fertilizerOrSprayInstructionEnglish}
                        </Text>

                        {/* Row 4: Reasoning behind the task */}
                        {(task.reasoningBengali || task.reasoningEnglish || task.shadeOrMoistureAdvisoryBengali) && (
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.textSecondary,
                              fontFamily: fontFam,
                              lineHeight: 16,
                            }}
                          >
                            💡 <Text style={{ fontWeight: '700' }}>{lang === 'bn' ? 'কারণ: ' : 'Reason: '}</Text>
                            {lang === 'bn'
                              ? task.reasoningBengali || task.shadeOrMoistureAdvisoryBengali
                              : task.reasoningEnglish || task.shadeOrMoistureAdvisoryEnglish}
                          </Text>
                        )}

                        {/* Row 5: Due date & slot */}
                        <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                          📅 {task.dueDateIso.split('T')[0]} • {task.recommendedTimeSlot === 'morning' ? '🌅 সকাল' : task.recommendedTimeSlot === 'afternoon' ? '☀️ দুপুর' : '🌇 বিকাল/সন্ধ্যা'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Right-Hand Side: Status Badge OR "Save" Button when selected */}
                    {isSelected ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          if (onSaveTaskStatus) {
                            onSaveTaskStatus(task, draftChoice);
                          } else {
                            onToggleTaskCheckbox(task);
                          }
                          setSelectedTaskDrafts((prev) => {
                            const next = { ...prev };
                            delete next[task.id];
                            return next;
                          });
                        }}
                        style={{
                          backgroundColor: theme.primary,
                          paddingHorizontal: 14,
                          paddingVertical: 9,
                          borderRadius: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: 13,
                            fontFamily: fontFam,
                          }}
                        >
                          💾 {lang === 'bn' ? 'সেভ করুন' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedTaskDrafts((prev) => ({
                            ...prev,
                            [task.id]:
                              effectiveStatus === 'completed'
                                ? 'do_later'
                                : 'completed',
                          }));
                        }}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor:
                            effectiveStatus === 'completed'
                              ? theme.primary
                              : effectiveStatus === 'do_later'
                              ? 'rgba(217, 119, 6, 0.14)'
                              : theme.surface,
                          borderWidth: 1,
                          borderColor:
                            effectiveStatus === 'completed'
                              ? theme.primary
                              : effectiveStatus === 'do_later'
                              ? theme.warning
                              : theme.border,
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              effectiveStatus === 'completed'
                                ? '#FFFFFF'
                                : effectiveStatus === 'do_later'
                                ? theme.warning
                                : theme.primary,
                            fontSize: 11.5,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          {effectiveStatus === 'completed'
                            ? lang === 'bn'
                              ? '✓ সম্পন্ন'
                              : '✓ Completed'
                            : effectiveStatus === 'do_later'
                            ? lang === 'bn'
                              ? '⏰ পরে করব'
                              : '⏰ Do Later'
                            : lang === 'bn'
                            ? 'নির্বাচন করুন'
                            : 'Select'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Action Choice Bar when Selected: "Already Completed" vs "Do It Later" */}
                  {isSelected && (
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 12,
                          fontWeight: '600',
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? 'অবস্থা নির্বাচন:' : 'Choose Action:'}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          setSelectedTaskDrafts((prev) => ({
                            ...prev,
                            [task.id]: 'completed',
                          }))
                        }
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          backgroundColor:
                            draftChoice === 'completed'
                              ? theme.primary
                              : theme.surface,
                          borderColor:
                            draftChoice === 'completed'
                              ? theme.primary
                              : theme.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              draftChoice === 'completed'
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          ✓{' '}
                          {lang === 'bn'
                            ? 'সম্পন্ন করেছি (Completed)'
                            : 'Already Completed'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setSelectedTaskDrafts((prev) => ({
                            ...prev,
                            [task.id]: 'do_later',
                          }))
                        }
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          backgroundColor:
                            draftChoice === 'do_later'
                              ? theme.warning
                              : theme.surface,
                          borderColor:
                            draftChoice === 'do_later'
                              ? theme.warning
                              : theme.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              draftChoice === 'do_later'
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          ⏰{' '}
                          {lang === 'bn'
                            ? 'পরে করব (Do Later)'
                            : 'Do It Later'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
        </View>

        {/* 4. Quick Action Shortcuts: + Add Plant, Plant QR, AI Diagnosis */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAddModalOpen(true)}
            style={[
              styles.shortcutBtnPrimary,
              {
                backgroundColor: theme.primary,
                flexDirection: 'row',
                gap: 8,
              },
            ]}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.22)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '800',
                  lineHeight: 18,
                }}
              >
                +
              </Text>
            </View>
            <Text style={[styles.shortcutBtnText, { fontFamily: fontFam }]}>
              {lang === 'bn' ? 'গাছ যুক্ত করুন' : 'Add Plant'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setCameraScannerOpen(true)}
            style={[
              styles.shortcutBtnSecondary,
              {
                backgroundColor: theme.surface,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.shortcutBtnTextAlt,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              📷 {t.scanQrBtn}
            </Text>
          </TouchableOpacity>

          {onOpenAiDiagnosis && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onOpenAiDiagnosis}
              style={[
                styles.shortcutBtnSecondary,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.shortcutBtnTextAlt,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                🔬 {lang === 'bn' ? 'এআই রোগ নির্ণয়' : 'AI Doctor'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setBotanicalSearchOpen(true)}
            style={[
              styles.shortcutBtnSecondary,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.shortcutBtnTextAlt,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              🌿 {lang === 'bn' ? 'উদ্ভিদ ও জাত সার্চ' : 'Botanical Search'}
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
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              🌳 {t.myPlantsTitle} (
              {lang === 'bn'
                ? toBengaliNumber(filteredPlants.length)
                : filteredPlants.length}
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
                ? '🔍 গাছের নাম, জাত বা QR কোড দিয়ে খুঁজুন...'
                : '🔍 Search by plant name, variety or QR ID...'
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

          {/* Plant Cards in Grid or List View */}
          <View
            style={
              viewMode === 'grid' ? styles.plantsGridWrap : styles.plantsListWrap
            }
          >
            {filteredPlants.map((plant) => {
              const forecast = LocalDbService.getPlantForecast(plant);
              return (
                <TouchableOpacity
                  key={plant.id}
                  activeOpacity={0.82}
                  onPress={() => onSelectPlant(plant)}
                  style={[
                    viewMode === 'grid'
                      ? styles.plantCardGrid
                      : styles.plantCardList,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.cardEmojiCircle,
                        { backgroundColor: theme.selectedSurface },
                      ]}
                    >
                      <Text style={styles.cardEmoji}>🌱</Text>
                    </View>
                    <View
                      style={[
                        styles.healthDotPill,
                        {
                          backgroundColor:
                            plant.healthState === 'healthy'
                              ? theme.selectedSurface
                              : theme.warning + '18',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            plant.healthState === 'healthy'
                              ? theme.primary
                              : theme.warning,
                          fontSize: 11,
                          fontWeight: '600',
                        }}
                      >
                        {plant.healthState === 'healthy'
                          ? lang === 'bn'
                            ? '● সুস্থ'
                            : '● Healthy'
                          : lang === 'bn'
                          ? '● যত্ন প্রয়োজন'
                          : '● Care Needed'}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cardPlantName,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cardVariety,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {plant.variety}
                  </Text>

                  <View style={styles.cardMetaRow}>
                    <Text
                      style={[styles.cardMetaText, { color: theme.primary }]}
                    >
                      ⏳{' '}
                      {lang === 'bn'
                        ? `বয়স: ${toBengaliNumber(forecast.ageInDays)} দিন`
                        : `Age: ${forecast.ageInDays}d`}
                    </Text>
                    <Text
                      style={[styles.cardMetaText, { color: theme.secondary }]}
                    >
                      💧 {plant.estimatedMoisturePercent}%
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      color: theme.textSecondary,
                      fontSize: 11.5,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    🪴{' '}
                    {lang === 'bn'
                      ? forecast.containerSummaryBn ||
                        `${plant.containerSizeInches}" জিও ব্যাগ`
                      : forecast.containerSummaryEn ||
                        `${plant.containerSizeInches}" Geo-Bag`}
                  </Text>

                  <View
                    style={[
                      styles.cardFooterTag,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cardFooterText,
                        { color: theme.primary, fontFamily: fontFam },
                      ]}
                    >
                      🔮{' '}
                      {lang === 'bn'
                        ? 'সার ও পরিচর্যা গাইড দেখুন →'
                        : 'Care & Fertilizer Guide →'}
                    </Text>
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
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: 13.5,
                      fontFamily: fontFam,
                    }}
                  >
                    🌐{' '}
                    {searchQuery.trim()
                      ? lang === 'bn'
                        ? `ইন্টারনেটে "${searchQuery}" অনুসন্ধান করুন`
                        : `Search "${searchQuery}" Online`
                      : lang === 'bn'
                      ? 'অনলাইনে গাছ ও প্রজাতি অনুসন্ধান করুন'
                      : 'Search Species Online'}
                  </Text>
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
    paddingBottom: 32,
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
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  modernAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modernAvatarImg: {
    width: '100%',
    height: '100%',
  },
  modernGreetingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  modernUserName: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  modernBellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  modernBellBadge: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    position: 'absolute',
    top: 9,
    right: 9,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  modernSearchRow: {
    width: '100%',
    marginTop: 2,
  },
  modernSearchPill: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  modernSearchInnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modernSearchPlaceholder: {
    fontSize: 14.5,
  },
  modernSearchScanBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#167A45',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modernSearchFilterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernHeroCard: {
    width: '100%',
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    minHeight: 170,
    justifyContent: 'flex-end',
    padding: 22,
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroContentWrap: {
    gap: 14,
    zIndex: 2,
  },
  heroTextWrap: {
    gap: 8,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroTagText: {
    color: '#EAF8EE',
    fontSize: 12,
    fontWeight: '700',
  },
  modernHeroHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
    maxWidth: 320,
  },
  heroCtaPillBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  heroCtaPillText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  healthScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  healthTrackWrap: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
  },
  healthFillBar: {
    height: '100%',
    borderRadius: 5,
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
    rowGap: 12,
  },
  statCard: {
    width: '48.6%',
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  statIconWrap: {
    width: 40,
    height: 40,
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
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12.5,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 12,
  },
  checkboxBox: {
    width: 22,
    height: 22,
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
  shortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcutBtnPrimary: {
    flexGrow: 1,
    minHeight: DESIGN_TOKENS.buttonHeight,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shortcutBtnSecondary: {
    flexGrow: 1,
    minHeight: DESIGN_TOKENS.buttonHeight,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shortcutBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shortcutBtnTextAlt: {
    fontSize: 14,
    fontWeight: '600',
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
  plantCardGrid: {
    width: '48.6%',
    padding: 14,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 8,
    minWidth: 0,
  },
  plantCardList: {
    width: '100%',
    padding: 15,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 8,
    minWidth: 0,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  cardEmojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardEmoji: {
    fontSize: 18,
  },
  healthDotPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardPlantName: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  cardVariety: {
    fontSize: 13,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  cardFooterTag: {
    marginTop: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 12.5,
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
