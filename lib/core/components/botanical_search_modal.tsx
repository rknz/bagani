/**
 * BAGANI — Global Online Botanical Plant & Variety Search Engine (Google-Style Knowledge Graph)
 * Developer: ProFix - Web & Soft
 *
 * Capabilities:
 * 1. Global Real-Time Internet Search (Wikipedia REST API + Agricultural Knowledge Cloud)
 * 2. Visual Loading Progress Bar with dynamic search status
 * 3. High-Resolution Plant Thumbnail Image Previews
 * 4. Multi-Category Filtering: Flowers, Fruits, Vegetables, Herbs, Indoor
 * 5. Full Agricultural Rooftop Care Profile (Soil Mix %, Pot size, Pruning, Bio-Remedies)
 * 6. 1-Tap "Add to My Garden" with instant registration
 * 7. Live external citations & source verification
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../theme/app_theme';
import {
  BotanicalEncyclopediaEntry,
  OnlineBotanicalService,
} from '../../services/online_botanical_service';
import { PlantCategory } from '../../models/plant_model';

interface BotanicalSearchModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
  initialQuery?: string;
  onSelectPlantToAdd?: (preset: {
    nameBn: string;
    nameEn: string;
    variety: string;
    containerSize: number;
    category: PlantCategory;
    isAllSeason: boolean;
    photoUrl?: string;
    scientificName?: string;
  }) => void;
}

export const BotanicalSearchModal: React.FC<BotanicalSearchModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
  initialQuery = '',
  onSelectPlantToAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<BotanicalEncyclopediaEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<BotanicalEncyclopediaEntry | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | PlantCategory>('all');

  // Loading & Progress State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState('');
  const searchTimeoutRef = useRef<any>(null);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Initialize or update search when visible or initialQuery changes
  useEffect(() => {
    if (visible) {
      const q = initialQuery.trim() || searchQuery.trim();
      executeGlobalSearch(q);
    }
  }, [visible, initialQuery]);

  const executeGlobalSearch = async (text: string) => {
    setIsLoading(true);
    setLoadingProgress(20);
    setLoadingStatusText(
      lang === 'bn'
        ? '🌐 ১. ইন্টারনেটে গ্লোবাল কৃষি ও উদ্ভিদ ক্লাউড অনুসন্ধান হচ্ছে...'
        : '🌐 1. Querying global internet agricultural & botanical cloud...'
    );

    const progressTimer1 = setTimeout(() => {
      setLoadingProgress(55);
      setLoadingStatusText(
        lang === 'bn'
          ? '🔬 ২. উইকিপিডিয়া ও কৃষি ডাটাবেজ থেকে প্রজাতি ও ছবি সংগ্রহ হচ্ছে...'
          : '🔬 2. Fetching botanical taxonomy, species & photos from Wikipedia...'
      );
    }, 280);

    const progressTimer2 = setTimeout(() => {
      setLoadingProgress(85);
      setLoadingStatusText(
        lang === 'bn'
          ? '🌿 ৩. ছাদবাগান উপযোগী মাটির ফর্মুলা ও পরিচর্যা নির্দেশিকা সাজানো হচ্ছে...'
          : '🌿 3. Synthesizing soil mix formula & rooftop care guidelines...'
      );
    }, 600);

    try {
      const results = await OnlineBotanicalService.searchEncyclopediaOnline(text);
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setLoadingProgress(100);
      setSearchResults(results);

      if (results.length > 0) {
        setSelectedEntry(results[0]);
        setSelectedVariety(
          lang === 'bn' ? results[0].varietiesBn[0] || '' : results[0].varietiesEn[0] || ''
        );
      } else {
        setSelectedEntry(null);
      }
    } catch (err) {
      console.warn('Botanical online search error', err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  };

  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      executeGlobalSearch(text);
    }, 450);
  };

  const handleSelectEntry = (entry: BotanicalEncyclopediaEntry) => {
    setSelectedEntry(entry);
    setSelectedVariety(
      lang === 'bn' ? entry.varietiesBn[0] || '' : entry.varietiesEn[0] || ''
    );
  };

  const handleOpenSourceLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn('Could not open source URL', err);
    }
  };

  // Filter results by category chip
  const displayedResults = searchResults.filter((r) => {
    if (selectedCategoryFilter === 'all') return true;
    return r.category === selectedCategoryFilter;
  });

  const getCategoryEmoji = (cat: PlantCategory) => {
    switch (cat) {
      case 'flower':
        return '🌸';
      case 'vegetable':
        return '🥦';
      case 'herb':
        return '🌿';
      case 'indoor':
        return '🪴';
      default:
        return '🍋';
    }
  };

  const getCategoryLabel = (cat: PlantCategory) => {
    switch (cat) {
      case 'flower':
        return lang === 'bn' ? 'ফুল' : 'Flower';
      case 'vegetable':
        return lang === 'bn' ? 'সবজি' : 'Vegetable';
      case 'herb':
        return lang === 'bn' ? 'ঔষধি ও ভেষজ' : 'Herb';
      case 'indoor':
        return lang === 'bn' ? 'ইনডোর ও ক্যাকটাস' : 'Indoor';
      default:
        return lang === 'bn' ? 'ফল' : 'Fruit';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Modal Header */}
          <View
            style={[
              styles.headerRow,
              { borderBottomColor: theme.border, backgroundColor: theme.surfaceElevated },
            ]}
          >
            <View style={{ flex: 1, minWidth: 200 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 18 }}>🌐</Text>
                <Text
                  style={[
                    styles.titleText,
                    { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'অনলাইন উদ্ভিদ ও জাত অনুসন্ধান (Google-Style Botanica)'
                    : 'Global Botanical Plant & Variety Search Engine'}
                </Text>
              </View>
              <Text
                style={[
                  styles.subText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'যেকোনো ফল, ফুল, সবজি বা ভেষজ গাছের নাম লিখুন—ইন্টারনেট থেকে সরাসরি বৈজ্ঞানিক তথ্য ও পূর্ণাঙ্গ পরিচর্যা গাইড লোড হবে।'
                  : 'Search any plant worldwide to fetch online verified taxonomy, photos, soil mix formula & rooftop care.'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16 }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBarWrap}>
            <View
              style={[
                styles.searchInputBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={handleQueryChange}
                placeholder={
                  lang === 'bn'
                    ? 'গাছের নাম লিখুন (যেমন: গোলাপ, গাঁদা, জবা, স্ট্রবেরি, ড্রাগন ফল, টমেটো, লাউ, ক্যাকটাস, তুলসী)...'
                    : 'Search plant (e.g. Rose, Marigold, Hibiscus, Strawberry, Dragon fruit, Tomato, Cactus, Basil)...'
                }
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.searchInput,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => handleQueryChange('')} style={{ padding: 4 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => executeGlobalSearch(searchQuery)}
                style={[styles.searchGoBtn, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12.5, fontFamily: fontFam }}>
                  {lang === 'bn' ? 'খুঁজুন' : 'Search'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Keyword Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {[
                'গোলাপ (Rose)',
                'গাঁদা (Marigold)',
                'জবা (Hibiscus)',
                'স্ট্রবেরি (Strawberry)',
                'ড্রাগন ফল',
                'আম (Mango)',
                'মাল্টা (Malta)',
                'পেয়ারা (Guava)',
                'টমেটো (Tomato)',
                'লাউ ও শসা',
                'ক্যাকটাস (Cactus)',
                'তুলসী (Tulsi)',
              ].map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    const term = chip.split(' ')[0].replace(/[()]/g, '');
                    setSearchQuery(term);
                    executeGlobalSearch(term);
                  }}
                  style={[
                    styles.chipBtn,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: 12,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Filter Pills */}
            <View style={styles.categoryFilterRow}>
              {[
                { id: 'all', labelBn: '🌱 সব', labelEn: '🌱 All' },
                { id: 'flower', labelBn: '🌸 ফুল', labelEn: '🌸 Flower' },
                { id: 'fruit', labelBn: '🍋 ফল', labelEn: '🍋 Fruit' },
                { id: 'vegetable', labelBn: '🥦 সবজি', labelEn: '🥦 Vegetable' },
                { id: 'herb', labelBn: '🌿 ঔষধি', labelEn: '🌿 Herb' },
                { id: 'indoor', labelBn: '🪴 ইনডোর', labelEn: '🪴 Indoor' },
              ].map((c) => {
                const isActive = selectedCategoryFilter === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCategoryFilter(c.id as any)}
                    style={[
                      styles.categoryFilterPill,
                      {
                        backgroundColor: isActive ? theme.primary : theme.surfaceElevated,
                        borderColor: isActive ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isActive ? '#FFFFFF' : theme.textPrimary,
                        fontSize: 11.5,
                        fontWeight: isActive ? '700' : '500',
                        fontFamily: fontFam,
                      }}
                    >
                      {lang === 'bn' ? c.labelBn : c.labelEn}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dynamic Internet Loading Progress Bar */}
            {isLoading && (
              <View style={[styles.loadingBox, { backgroundColor: theme.selectedSurface, borderColor: theme.primary }]}>
                <View style={styles.loadingTrack}>
                  <View
                    style={[
                      styles.loadingProgressFill,
                      {
                        width: `${loadingProgress}%`,
                        backgroundColor: theme.primary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.loadingTextRow}>
                  <Text style={[styles.loadingStatusText, { color: theme.primary, fontFamily: fontFam }]}>
                    {loadingStatusText}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>
                    {loadingProgress}%
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Results + Details View */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Matching Plant Species Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                🌱{' '}
                {lang === 'bn'
                  ? `অনলাইন ভেরিফাইড ফলাফল (${displayedResults.length}টি প্রজাতি পাওয়া গেছে):`
                  : `Online Verified Results (${displayedResults.length} Species):`}
              </Text>
              {searchResults.length > 0 && (
                <Text style={{ fontSize: 11, color: theme.textSecondary, fontFamily: fontFam }}>
                  {lang === 'bn' ? 'ট্যাপ করে বিস্তারিত দেখুন' : 'Tap to inspect details'}
                </Text>
              )}
            </View>

            {/* Horizontal Result Cards Carousel with Photos */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {displayedResults.map((entry) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  return (
                    <TouchableOpacity
                      key={entry.id}
                      activeOpacity={0.82}
                      onPress={() => handleSelectEntry(entry)}
                      style={[
                        styles.speciesCard,
                        {
                          backgroundColor: isSelected
                            ? theme.selectedSurface
                            : theme.surfaceElevated,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      {entry.thumbnailUrl ? (
                        <Image
                          source={{ uri: entry.thumbnailUrl }}
                          style={styles.speciesCardThumb}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.speciesCardFallbackThumb, { backgroundColor: theme.surface }]}>
                          <Text style={{ fontSize: 28 }}>{getCategoryEmoji(entry.category)}</Text>
                        </View>
                      )}

                      <View style={{ padding: 8, flex: 1, justifyContent: 'space-between' }}>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                            <Text style={{ fontSize: 11 }}>{getCategoryEmoji(entry.category)}</Text>
                            <Text
                              numberOfLines={1}
                              style={{
                                color: isSelected ? theme.primary : theme.textPrimary,
                                fontWeight: '700',
                                fontSize: 13,
                                fontFamily: fontFam,
                              }}
                            >
                              {lang === 'bn' ? entry.canonicalNameBn : entry.canonicalNameEn}
                            </Text>
                          </View>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: theme.textSecondary,
                              fontSize: 10.5,
                              fontStyle: 'italic',
                            }}
                          >
                            {entry.scientificName}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <View
                            style={[
                              styles.miniVerifiedBadge,
                              { backgroundColor: theme.primary + '18' },
                            ]}
                          >
                            <Text style={{ color: theme.primary, fontSize: 9.5, fontWeight: '700' }}>
                              ✓ {getCategoryLabel(entry.category)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Selected Entry Detailed Structured Guide (Google-Style Presentation) */}
            {selectedEntry ? (
              <View
                style={[
                  styles.detailsCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                {/* Visual Header Banner with Plant Image & Quick Action */}
                <View style={styles.bannerRow}>
                  {selectedEntry.thumbnailUrl ? (
                    <Image
                      source={{ uri: selectedEntry.thumbnailUrl }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.bannerFallback, { backgroundColor: theme.selectedSurface }]}>
                      <Text style={{ fontSize: 44 }}>{getCategoryEmoji(selectedEntry.category)}</Text>
                    </View>
                  )}

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text
                        style={[
                          styles.speciesName,
                          { color: theme.primary, fontFamily: fontFam },
                        ]}
                      >
                        {lang === 'bn'
                          ? selectedEntry.canonicalNameBn
                          : selectedEntry.canonicalNameEn}
                      </Text>
                      <View
                        style={[
                          styles.verifiedOnlineBadge,
                          { backgroundColor: theme.selectedSurface, borderColor: theme.primary },
                        ]}
                      >
                        <Text style={{ color: theme.primary, fontSize: 10.5, fontWeight: '700' }}>
                          ✓ {lang === 'bn' ? 'অনলাইন ক্লাউড ভেরিফাইড' : 'Online Verified'}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ color: theme.textSecondary, fontStyle: 'italic', fontSize: 12.5, marginTop: 2 }}>
                      {selectedEntry.scientificName} • {getCategoryLabel(selectedEntry.category)}
                    </Text>

                    {selectedEntry.family ? (
                      <Text style={{ color: theme.textSecondary, fontSize: 11.5, marginTop: 2 }}>
                        Family: {selectedEntry.family}
                      </Text>
                    ) : null}

                    {/* Direct Link to Live Wikipedia / Agricultural Database */}
                    {selectedEntry.sourceUrl && (
                      <TouchableOpacity
                        onPress={() => handleOpenSourceLink(selectedEntry.sourceUrl)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}
                      >
                        <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700', textDecorationLine: 'underline' }}>
                          🌐 {lang === 'bn' ? 'উইকিপিডিয়া মূল উৎস দেখুন ›' : 'View Wikipedia Source ›'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Prominent Action Button: Add Plant to My Garden */}
                {onSelectPlantToAdd && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      onSelectPlantToAdd({
                        nameBn: selectedEntry.canonicalNameBn,
                        nameEn: selectedEntry.canonicalNameEn,
                        variety: selectedVariety || selectedEntry.varietiesBn[0] || 'উন্নত জাত',
                        containerSize: selectedEntry.recommendedContainerInches || 18,
                        category: selectedEntry.category,
                        isAllSeason: selectedEntry.isAllSeasonDefault,
                        photoUrl: selectedEntry.thumbnailUrl,
                        scientificName: selectedEntry.scientificName,
                      });
                      onClose();
                    }}
                    style={[
                      styles.addGardenMainBtn,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, fontFamily: fontFam }}>
                      🌱 {lang === 'bn' ? '+ এই গাছটি আমার ছাদবাগানে যুক্ত করুন' : '+ Add This Plant to My Garden'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Encyclopedic Overview Summary */}
                {(selectedEntry.summaryExtractBn || selectedEntry.summaryExtractEn) && (
                  <View style={[styles.overviewBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                    <Text style={{ color: theme.textPrimary, fontSize: 12.5, lineHeight: 19, fontFamily: fontFam }}>
                      {lang === 'bn'
                        ? selectedEntry.summaryExtractBn || selectedEntry.summaryExtractEn
                        : selectedEntry.summaryExtractEn || selectedEntry.summaryExtractBn}
                    </Text>
                  </View>
                )}

                {/* Varieties Selector */}
                <View style={styles.guideBlock}>
                  <Text
                    style={[
                      styles.guideBlockTitle,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    🏷️{' '}
                    {lang === 'bn'
                      ? 'অনলাইন অনুমোদিত উন্নত জাতসমূহ (Certified Varieties):'
                      : 'Available Certified Varieties:'}
                  </Text>
                  <View style={styles.varietyChipsWrap}>
                    {(lang === 'bn'
                      ? selectedEntry.varietiesBn
                      : selectedEntry.varietiesEn
                    ).map((vName, vIdx) => {
                      const isVarSelected = selectedVariety === vName;
                      return (
                        <TouchableOpacity
                          key={vIdx}
                          onPress={() => setSelectedVariety(vName)}
                          style={[
                            styles.varietyChip,
                            {
                              backgroundColor: isVarSelected
                                ? theme.selectedSurface
                                : theme.surfaceElevated,
                              borderColor: isVarSelected
                                ? theme.primary
                                : theme.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              color: isVarSelected
                                ? theme.primary
                                : theme.textPrimary,
                              fontWeight: isVarSelected ? '700' : '500',
                              fontSize: 12.5,
                              fontFamily: fontFam,
                            }}
                          >
                            {isVarSelected ? '✓ ' : ''}
                            {vName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 1. Recommended Container & Soil Mix Formula */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🪴</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? `টব নির্বাচন ও মাটির মিশ্রণ প্রস্তুত প্রণালী (${selectedEntry.recommendedContainerInches}" জিও ব্যাগ বা টব):`
                        : `Recommended Container & Soil Formula (${selectedEntry.recommendedContainerInches}" Geo-Bag / Pot):`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.soilSelectionAndMixBn
                        : selectedEntry.soilSelectionAndMixEn}
                    </Text>
                  </View>
                </View>

                {/* 2. Planting Method & Drainage */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🌱</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'চারা রোপণ ও প্রাথমিক ড্রেনেজ পদ্ধতি:'
                        : 'Sapling Planting & Drainage Bed Method:'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.plantingMethodBn
                        : selectedEntry.plantingMethodEn}
                    </Text>
                  </View>
                </View>

                {/* 3. Ongoing Nutrition, Irrigation & Fertilizer */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🧪</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'পানি ও নিয়মিত পুষ্টি/সার ব্যবস্থাপনা:'
                        : 'Watering & Ongoing Nutrition/Fertilizer Protocol:'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.ongoingCareAndFertilizerBn
                        : selectedEntry.ongoingCareAndFertilizerEn}
                    </Text>
                  </View>
                </View>

                {/* 4. Precision Pruning Technique */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>✂️</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.primary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'প্রিসিশন প্রুনিং ও দ্বিগুণ ফলন কৌশল (Yield Multiplier):'
                        : 'Precision Pruning & Yield Multiplier Technique:'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.selectedSurface,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.pruningTechniqueBn
                        : selectedEntry.pruningTechniqueEn}
                    </Text>
                  </View>
                </View>

                {/* 5. Diseases & Organic Remedies */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🩺</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'সম্ভাব্য রোগবালাই ও জৈব প্রতিকার:'
                        : 'Common Pests, Diseases & Organic Remedies:'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.diseaseAndRemediesBn
                        : selectedEntry.diseaseAndRemediesEn}
                    </Text>
                  </View>
                </View>

                {/* 6. Harvest & Post-Harvest Maintenance */}
                <View style={styles.guideBlock}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, lineHeight: 22 }}>🧺</Text>
                    <Text
                      style={[
                        styles.guideBlockTitle,
                        { flex: 1, color: theme.textPrimary, fontFamily: fontFam, lineHeight: 22 },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'ফসল সংগ্রহ ও পরবর্তী গাছ সংরক্ষণ:'
                        : 'Harvesting & Post-Harvest Maintenance:'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.guideBox,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.guideText,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? selectedEntry.harvestAndPostHarvestBn
                        : selectedEntry.harvestAndPostHarvestEn}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '94%',
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  subText: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  searchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  searchGoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  categoryFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  loadingBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  loadingTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  scrollBody: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  speciesCard: {
    width: 170,
    height: 195,
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  speciesCardThumb: {
    width: '100%',
    height: 105,
    backgroundColor: '#00000010',
  },
  speciesCardFallbackThumb: {
    width: '100%',
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniVerifiedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  bannerFallback: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesName: {
    fontSize: 17,
    fontWeight: '800',
  },
  verifiedOnlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  addGardenMainBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  guideBlock: {
    gap: 6,
  },
  guideBlockTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  varietyChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  varietyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  guideBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  guideText: {
    fontSize: 12.5,
    lineHeight: 19,
  },
});
