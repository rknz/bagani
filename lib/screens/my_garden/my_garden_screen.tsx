/**
 * BAGANI — My Garden Screen (Screens 5, 6 & 8 of DESIGN_SYSTEM.md)
 */

import React, { useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';
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

  const [newNameBn, setNewNameBn] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newBagSize, setNewBagSize] = useState('20');
  const [newIsAllSeason, setNewIsAllSeason] = useState(true);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

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
        {/* Top Action Header */}
        <View
          style={[
            styles.mainCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                🌳 {lang === 'bn' ? 'আমার ছাদবাগান' : 'My Rooftop Garden'}
              </Text>
              <Text
                style={[
                  styles.captionText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? `মোট ${toBengaliNumber(plants.length)}টি ডিজিটাল গাছ রেজিস্টার্ড রয়েছে`
                  : `${plants.length} plants digitally registered with QR IDs`}
              </Text>
            </View>

            <View style={styles.viewToggleRow}>
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

          {/* Manual Plant Search Input */}
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
              styles.inputField,
              {
                backgroundColor: theme.surfaceElevated,
                color: theme.textPrimary,
                borderColor: theme.border,
                fontFamily: fontFam,
              },
            ]}
          />

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(
              [
                { id: 'all', bn: 'সব গাছ', en: 'All Plants' },
                { id: 'all_season', bn: 'বারোমাসি জাত', en: 'All-Season' },
                { id: 'attention', bn: 'যত্ন প্রয়োজন', en: 'Needs Attention' },
              ] as const
            ).map((f) => {
              const active = filterMode === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setFilterMode(f.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active
                        ? theme.selectedSurface
                        : theme.surfaceElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.primary : theme.textSecondary,
                      fontSize: 12.5,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? f.bn : f.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons: + Add Plant & Plant QR */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => setAddModalOpen(true)}
              style={[
                styles.primaryBtn,
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
              <Text
                style={[
                  styles.btnText,
                  { color: '#FFFFFF', fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'গাছ যুক্ত করুন' : 'Add Plant'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onOpenQrTagDesigner}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                📷 {lang === 'bn' ? 'প্ল্যান্ট QR' : 'Plant QR'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setBotanicalInitialQuery(searchQuery || '');
                setBotanicalSearchOpen(true);
              }}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                🌿 {lang === 'bn' ? 'উদ্ভিদ সার্চ' : 'Search Species'}
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
                        backgroundColor: isHealthy ? theme.selectedSurface : 'rgba(217, 119, 6, 0.12)',
                        borderColor: isHealthy ? theme.primary : theme.warning,
                      },
                    ]}
                  >
                    {plant.photoUri ? (
                      <Image source={{ uri: plant.photoUri }} style={styles.plantFullImg} />
                    ) : (
                      <Text style={{ fontSize: 32 }}>
                        {plant.category === 'fruit' ? '🍋' : plant.category === 'flower' ? '🌸' : '🌿'}
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
                      <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>
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
                            borderColor: isHealthy ? theme.primary : theme.warning,
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14 }}>🌱</Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.cardHeading,
                          { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
                        ]}
                      >
                        {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
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
                        ? forecast.containerSummaryBn || `${plant.containerSizeInches}" জিও ব্যাগ`
                        : forecast.containerSummaryEn || `${plant.containerSizeInches}" Geo-Bag`}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={[styles.captionText, { color: theme.textSecondary }]}>
                        ⏳ {lang === 'bn' ? `বয়স: ${toBengaliNumber(forecast.ageInDays)} দিন` : `Age: ${forecast.ageInDays}d`}
                      </Text>
                      <Text style={[styles.cardFooterText, { color: theme.primary, fontFamily: fontFam }]}>
                        {lang === 'bn' ? 'পরিচর্যা গাইড →' : 'Care Guide →'}
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
                      backgroundColor: isHealthy ? theme.selectedSurface : 'rgba(217, 119, 6, 0.12)',
                    },
                  ]}
                >
                  {plant.photoUri ? (
                    <Image source={{ uri: plant.photoUri }} style={styles.plantFullImg} />
                  ) : (
                    <Text style={{ fontSize: 36 }}>
                      {plant.category === 'fruit' ? '🍋' : plant.category === 'flower' ? '🌸' : '🌿'}
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
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                      {isHealthy ? (lang === 'bn' ? 'সুস্থ' : 'Healthy') : (lang === 'bn' ? 'যত্ন' : 'Care')}
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

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 14 }}>🌱</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cardHeading,
                        { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
                      ]}
                    >
                      {lang === 'bn' ? plant.nameBengali : plant.nameEnglish}
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
                    <Text style={[styles.captionText, { color: theme.textSecondary }]}>
                      ⏳ {lang === 'bn' ? `${toBengaliNumber(forecast.ageInDays)} দিন` : `${forecast.ageInDays}d`}
                    </Text>
                    <Text style={[styles.captionText, { color: theme.primary, fontWeight: '700' }]}>
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
    paddingBottom: 90,
  },
  mainCard: {
    width: '100%',
    padding: DESIGN_TOKENS.cardPadding,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  captionText: {
    fontSize: 13,
  },
  viewToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  inputField: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    flexGrow: 1,
    minHeight: DESIGN_TOKENS.buttonHeight,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryBtn: {
    flexGrow: 1,
    minHeight: DESIGN_TOKENS.buttonHeight,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
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
    padding: DESIGN_TOKENS.cardPadding,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 8,
    minWidth: 0,
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
  plantCardList: {
    width: '100%',
    padding: DESIGN_TOKENS.cardPadding,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 8,
    minWidth: 0,
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
  healthPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    padding: 20,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    gap: 12,
  },
  seasonBtn: {
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
