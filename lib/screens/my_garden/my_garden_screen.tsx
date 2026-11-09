/**
 * BAGANI — My Garden Screen (Screens 5, 6 & 8 of DESIGN_SYSTEM.md)
 * Refined to professional Play Store standards with cohesive design system.
 */

import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppLanguage } from '../../core/l10n/translations';
import { AddPlantModal } from '../../core/components/add_plant_modal';
import { BotanicalSearchModal } from '../../core/components/botanical_search_modal';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import { toBengaliNumber } from '../../core/utils/date_utils';
import { PlantModel } from '../../models/plant_model';
import { UserModel } from '../../models/user_model';
import { LocalDbService } from '../../services/local_db_service';

interface MyGardenScreenProps {
  user: UserModel;
  plants: PlantModel[];
  theme: AppThemeColors;
  lang: AppLanguage;
  onSelectPlant: (plant: PlantModel) => void;
  onAddNewPlant: (plant: PlantModel) => void;
  onOpenQrTagDesigner: () => void;
}

/**
 * Botanical species icon helper:
 * Maps plant variety / species keywords to recognizable botanical emojis
 * when a user-uploaded photo is not present.
 */
const getPlantSpeciesIcon = (plant: PlantModel): string => {
  const query = `${plant.nameBengali} ${plant.nameEnglish} ${plant.variety}`.toLowerCase();
  if (query.includes('আম') || query.includes('mango')) return '🥭';
  if (
    query.includes('লেবু') ||
    query.includes('lemon') ||
    query.includes('lime') ||
    query.includes('কাগজি')
  )
    return '🍋';
  if (
    query.includes('মাল্টা') ||
    query.includes('কমলা') ||
    query.includes('orange') ||
    query.includes('malta')
  )
    return '🍊';
  if (
    query.includes('পেয়ারা') ||
    query.includes('পেয়ারা') ||
    query.includes('guava')
  )
    return '🍐';
  if (
    query.includes('বেদানা') ||
    query.includes('ডালিম') ||
    query.includes('pomegranate') ||
    query.includes('anaar')
  )
    return '🍎';
  if (query.includes('টমেটো') || query.includes('tomato')) return '🍅';
  if (
    query.includes('মরিচ') ||
    query.includes('chili') ||
    query.includes('chilli') ||
    query.includes('pepper')
  )
    return '🌶️';
  if (query.includes('গোলাপ') || query.includes('rose')) return '🌹';
  if (
    query.includes('জবা') ||
    query.includes('ফুল') ||
    query.includes('flower') ||
    plant.category === 'flower'
  )
    return '🌸';
  if (
    query.includes('বেগুন') ||
    query.includes('brinjal') ||
    query.includes('eggplant')
  )
    return '🍆';
  if (plant.category === 'fruit') return '🥭';
  return '🌿';
};

export const MyGardenScreen: React.FC<MyGardenScreenProps> = ({
  user,
  plants,
  theme,
  lang,
  onSelectPlant,
  onAddNewPlant,
  onOpenQrTagDesigner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<
    'all' | 'all_season' | 'attention'
  >('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [botanicalSearchOpen, setBotanicalSearchOpen] = useState(false);
  const [botanicalInitialQuery, setBotanicalInitialQuery] = useState('');

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Search & Filter Logic (strictly preserved)
  const filteredPlants = plants.filter((p) => {
    const matchesSearch =
      p.nameBengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.qrCodeId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'all_season') return p.isAllSeason;
    if (filterMode === 'attention') return p.healthState !== 'healthy';
    return true;
  });

  const allCount = plants.length;
  const allSeasonCount = plants.filter((p) => p.isAllSeason).length;
  const attentionCount = plants.filter((p) => p.healthState !== 'healthy').length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollOuter}
    >
      <View style={styles.container}>
        {/* Garden Overview Section (Main Container) */}
        <View
          style={[
            styles.mainCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Header Row: Title & Subtitle + View Toggle */}
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <View style={styles.titleWithIconRow}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={theme.primary}
                    fillOpacity={0.15}
                    stroke={theme.primary}
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'আমার ছাদবাগান' : 'My Rooftop Garden'}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.captionText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? `মোট ${toBengaliNumber(plants.length)}টি ডিজিটাল গাছ রেজিস্টার্ড`
                  : `${plants.length} digital plants registered`}
              </Text>
            </View>

            {/* Segmented Control for Grid / List View */}
            <View
              style={[
                styles.segmentedWrapper,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewMode('grid')}
                style={[
                  styles.segmentBtn,
                  viewMode === 'grid' && [
                    styles.segmentBtnActive,
                    { backgroundColor: theme.primary },
                  ],
                ]}
              >
                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke={
                      viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary
                    }
                    strokeWidth="2"
                  />
                  <Rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke={
                      viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary
                    }
                    strokeWidth="2"
                  />
                  <Rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke={
                      viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary
                    }
                    strokeWidth="2"
                  />
                  <Rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1.5"
                    stroke={
                      viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary
                    }
                    strokeWidth="2"
                  />
                </Svg>
                <Text
                  style={[
                    styles.segmentBtnText,
                    {
                      color:
                        viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: fontFam,
                    },
                  ]}
                >
                  Grid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewMode('list')}
                style={[
                  styles.segmentBtn,
                  viewMode === 'list' && [
                    styles.segmentBtnActive,
                    { backgroundColor: theme.primary },
                  ],
                ]}
              >
                <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke={
                      viewMode === 'list' ? '#FFFFFF' : theme.textSecondary
                    }
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.segmentBtnText,
                    {
                      color:
                        viewMode === 'list' ? '#FFFFFF' : theme.textSecondary,
                      fontFamily: fontFam,
                    },
                  ]}
                >
                  List
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Plant Search Bar */}
          <View
            style={[
              styles.searchBarContainer,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              style={styles.searchIconLeft}
            >
              <Circle
                cx="11"
                cy="11"
                r="7"
                stroke={theme.textSecondary}
                strokeWidth="2"
              />
              <Path
                d="M20 20L16.5 16.5"
                stroke={theme.textSecondary}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                lang === 'bn'
                  ? 'গাছের নাম, জাত বা QR কোড দিয়ে খুঁজুন...'
                  : 'Search plant by name, variety or QR ID...'
              }
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.searchInputInner,
                {
                  color: theme.textPrimary,
                  fontFamily: fontFam,
                },
              ]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSearchQuery('')}
                style={styles.searchClearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill={theme.border} />
                  <Path
                    d="M8 8L16 16M16 8L8 16"
                    stroke={theme.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>

          {/* Plant Filter Buttons (Horizontal Strip with dynamic counts) */}
          <View style={styles.filterStripWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContainer}
            >
              {[
                {
                  id: 'all',
                  bn: `সব গাছ (${toBengaliNumber(allCount)})`,
                  en: `All Plants (${allCount})`,
                },
                {
                  id: 'all_season',
                  bn: `বারোমাসি জাত (${toBengaliNumber(allSeasonCount)})`,
                  en: `All-Season (${allSeasonCount})`,
                },
                {
                  id: 'attention',
                  bn: `যত্ন প্রয়োজন (${toBengaliNumber(attentionCount)})`,
                  en: `Needs Care (${attentionCount})`,
                },
              ].map((f) => {
                const active = filterMode === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    activeOpacity={0.8}
                    onPress={() => setFilterMode(f.id as any)}
                    style={[
                      styles.filterChipItem,
                      {
                        backgroundColor: active
                          ? theme.primary
                          : theme.surfaceElevated,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: active ? '#FFFFFF' : theme.textSecondary,
                          fontWeight: active ? '700' : '500',
                          fontFamily: fontFam,
                        },
                      ]}
                    >
                      {lang === 'bn' ? f.bn : f.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Symmetrical Action Buttons: Add Plant, Plant QR, Search Species */}
          <View style={styles.actionBlock}>
            <View style={styles.actionRowTwoCol}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setAddModalOpen(true)}
                style={[
                  styles.actionBtnHalf,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V19M5 12H19"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: '#FFFFFF', fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'গাছ যুক্ত করুন' : 'Add Plant'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={onOpenQrTagDesigner}
                style={[
                  styles.actionBtnHalf,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 3H9V9H3V3Z"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M15 3H21V9H15V3Z"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M3 15H9V21H3V15Z"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M15 15H18V18H15V15Z"
                    fill={theme.textPrimary}
                  />
                  <Path
                    d="M18 18H21V21H18V18Z"
                    fill={theme.textPrimary}
                  />
                  <Path
                    d="M15 21H18"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'প্ল্যান্ট QR' : 'Plant QR'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                setBotanicalInitialQuery(searchQuery || '');
                setBotanicalSearchOpen(true);
              }}
              style={[
                styles.actionBtnFull,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  borderWidth: 1,
                },
              ]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke={theme.textPrimary}
                  strokeWidth="1.8"
                />
                <Path
                  d="M3 12H21"
                  stroke={theme.textPrimary}
                  strokeWidth="1.5"
                />
                <Path
                  d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z"
                  stroke={theme.textPrimary}
                  strokeWidth="1.5"
                />
              </Svg>
              <Text
                style={[
                  styles.actionBtnText,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'উদ্ভিদ প্রজাতি ও জাত খুঁজুন'
                  : 'Search Species & Varieties'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registered Plants Grid / List */}
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
                  activeOpacity={0.85}
                  onPress={() => onSelectPlant(plant)}
                  style={[
                    styles.plantCardListRefined,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {/* Left: Plant Photo / Species Avatar */}
                  <View
                    style={[
                      styles.listPhotoWrap,
                      {
                        backgroundColor: theme.selectedSurface,
                      },
                    ]}
                  >
                    {plant.photoUri ? (
                      <Image
                        source={{ uri: plant.photoUri }}
                        style={styles.plantFullImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ fontSize: 32 }}>
                        {getPlantSpeciesIcon(plant)}
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
                          fontSize: 9.5,
                          fontWeight: '700',
                          color:
                            plant.estimatedMoisturePercent < 50
                              ? '#EA580C'
                              : '#0284C7',
                        }}
                      >
                        💧 {toBengaliNumber(plant.estimatedMoisturePercent)}%
                      </Text>
                    </View>
                  </View>

                  {/* Right: Meta & Information Hierarchy */}
                  <View style={styles.listMetaCol}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.qrBadgePill,
                          {
                            backgroundColor: theme.selectedSurface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.qrBadgeText,
                            { color: theme.primary },
                          ]}
                        >
                          {plant.qrCodeId}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.healthPillBadge,
                          {
                            backgroundColor: isHealthy
                              ? 'rgba(22, 122, 69, 0.12)'
                              : 'rgba(234, 88, 12, 0.12)',
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isHealthy ? '#167A45' : '#EA580C',
                            fontSize: 10.5,
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

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.listPlantTitle,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
                    </Text>

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
                          `${toBengaliNumber(plant.containerSizeInches)}" জিও ব্যাগ`
                        : forecast.containerSummaryEn ||
                          `${plant.containerSizeInches}" Geo-Bag`}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Svg
                          width={11.5}
                          height={11.5}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke={theme.textSecondary}
                            strokeWidth="1.8"
                          />
                          <Path
                            d="M12 7V12L15 15"
                            stroke={theme.textSecondary}
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </Svg>
                        <Text
                          style={[
                            styles.metaItemText,
                            { color: theme.textSecondary, fontFamily: fontFam },
                          ]}
                        >
                          {lang === 'bn'
                            ? `বয়স: ${toBengaliNumber(forecast.ageInDays)} দিন`
                            : `Age: ${forecast.ageInDays}d`}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.cardFooterText,
                          { color: theme.primary, fontFamily: fontFam },
                        ]}
                      >
                        {lang === 'bn' ? 'পরিচর্যা গাইড →' : 'Care Guide →'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }

            // Grid View Card (Refined to 11-section specifications)
            return (
              <TouchableOpacity
                key={plant.id}
                activeOpacity={0.85}
                onPress={() => onSelectPlant(plant)}
                style={[
                  styles.plantCardGridRefined,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                {/* 7.1 Image Area (96px height) */}
                <View
                  style={[
                    styles.gridImageHeader,
                    {
                      backgroundColor: theme.selectedSurface,
                    },
                  ]}
                >
                  {plant.photoUri ? (
                    <Image
                      source={{ uri: plant.photoUri }}
                      style={styles.plantFullImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 36 }}>
                      {getPlantSpeciesIcon(plant)}
                    </Text>
                  )}

                  {/* 7.2 Floating Status Badge */}
                  <View
                    style={[
                      styles.gridHealthFloatBadge,
                      {
                        backgroundColor: isHealthy
                          ? 'rgba(22, 122, 69, 0.12)'
                          : 'rgba(234, 88, 12, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isHealthy ? '#167A45' : '#EA580C',
                        fontSize: 10.5,
                        fontWeight: '700',
                        fontFamily: fontFam,
                      }}
                    >
                      {isHealthy
                        ? lang === 'bn'
                          ? '● সুস্থ'
                          : '● Healthy'
                        : lang === 'bn'
                        ? '⚠️ যত্ন'
                        : '⚠️ Care'}
                    </Text>
                  </View>
                </View>

                {/* 7.3 Information Area */}
                <View style={styles.gridContentWrap}>
                  <View
                    style={[
                      styles.qrBadgePill,
                      {
                        backgroundColor: theme.selectedSurface,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.qrBadgeText,
                        { color: theme.primary },
                      ]}
                    >
                      {plant.qrCodeId}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.gridPlantTitle,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.gridPlantSubtitle,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {plant.variety} •{' '}
                    {lang === 'bn'
                      ? forecast.containerSummaryBn ||
                        `${toBengaliNumber(plant.containerSizeInches)}" টব`
                      : forecast.containerSummaryEn ||
                        `${plant.containerSizeInches}" Pot`}
                  </Text>

                  {/* 7.4 Age & Moisture Information */}
                  <View style={styles.gridMetaRow}>
                    <View style={styles.metaItem}>
                      <Svg
                        width={11.5}
                        height={11.5}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke={theme.textSecondary}
                          strokeWidth="1.8"
                        />
                        <Path
                          d="M12 7V12L15 15"
                          stroke={theme.textSecondary}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </Svg>
                      <Text
                        style={[
                          styles.metaItemText,
                          { color: theme.textSecondary, fontFamily: fontFam },
                        ]}
                      >
                        {lang === 'bn'
                          ? `${toBengaliNumber(forecast.ageInDays)} দিন`
                          : `${forecast.ageInDays}d`}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Svg
                        width={11.5}
                        height={11.5}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          d="M12 2.69L6 10.6C4.4 12.7 4 14.4 4 16A8 8 0 0020 16C20 14.4 19.6 12.7 18 10.6L12 2.69Z"
                          fill={
                            plant.estimatedMoisturePercent < 50
                              ? '#EA580C'
                              : '#0284C7'
                          }
                        />
                      </Svg>
                      <Text
                        style={[
                          styles.metaItemText,
                          {
                            color:
                              plant.estimatedMoisturePercent < 50
                                ? '#EA580C'
                                : '#0284C7',
                            fontWeight: '700',
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {toBengaliNumber(plant.estimatedMoisturePercent)}%
                      </Text>
                    </View>
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
                  ? 'কোনো গাছ পাওয়া যায়নি'
                  : 'No matching plants found'}
              </Text>
              <Text
                style={[
                  styles.emptySearchSubtitle,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {searchQuery.trim()
                  ? lang === 'bn'
                    ? 'ইন্টারনেট থেকে সরাসরি এই উদ্ভিদের বৈজ্ঞানিক তথ্য, ছবি, মাটির ফর্মুলা ও পরিচর্যা গাইড লোড করতে নিচের বাটনে ট্যাপ করুন:'
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                  }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <Path d="M3 12H21" stroke="#FFFFFF" strokeWidth="1.8" />
                    <Path
                      d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                    />
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
                      ? 'অনলাইনে উদ্ভিদ সার্চ করুন'
                      : 'Search Species Online'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

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

        {/* Structured Botanical Search & Variety Encyclopedia Modal */}
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
              lastHealthDiagnosisSummary:
                'অনলাইন ভেরিফাইড চারা — সতেজ ও সুস্থ অবস্থা',
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
    gap: 14,
    paddingBottom: 110, // Safe distance from bottom floating dock
  },
  // Overview Section (Main Container)
  mainCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  captionText: {
    fontSize: 12,
  },
  // Segmented Control (Grid / List)
  segmentedWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  segmentBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1.5,
  },
  segmentBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  // Plant Search Bar
  searchBarContainer: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 9,
  },
  searchIconLeft: {
    flexShrink: 0,
  },
  searchInputInner: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Filter Chips Horizontal Strip
  filterStripWrap: {
    width: '100%',
  },
  filterScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  filterChipItem: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  // Symmetrical Action Buttons
  actionBlock: {
    width: '100%',
    gap: 8,
    marginTop: 2,
  },
  actionRowTwoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtnHalf: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  actionBtnFull: {
    width: '100%',
    height: 42,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Registered Plants Grid / List Wrappers
  plantsGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  plantsListWrap: {
    gap: 10,
  },
  // Refined Grid Card (7.0 - 8.0)
  plantCardGridRefined: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
  plantFullImg: {
    width: '100%',
    height: '100%',
  },
  gridHealthFloatBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridContentWrap: {
    padding: 11,
    gap: 4,
  },
  qrBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qrBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  gridPlantTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
    minHeight: 36,
  },
  gridPlantSubtitle: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  gridMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 11,
  },
  // Refined List Card
  plantCardListRefined: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 10,
    gap: 11,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  listPhotoWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  listMoistureBadge: {
    position: 'absolute',
    bottom: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
  },
  listMetaCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  healthPillBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  listPlantTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  cardFooterText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  // Empty State
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
    fontSize: 15.5,
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
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
