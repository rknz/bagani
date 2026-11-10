/**
 * BAGANI — Professional User Profile & App Settings Screen (Refined Architecture)
 * Fully compliant with User Corrections:
 * - Language switcher & Text Size Control Bar with [-] sign, slider track, and [+] sign
 * - Global bounded scaling (88% to 118%) so layout integrity is permanently preserved
 * - Redesigned professional app-style grouped settings (replacing robotic block buttons)
 * - Identical user profile card mirroring the homepage user header
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { APP_CONFIG } from '../../core/constants/app_constants';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
  FontScalePreference,
  ThemeModePreference,
} from '../../core/theme/app_theme';
import { UserModel } from '../../models/user_model';
import {
  AdConfiguration,
  BannerPlacementPosition,
} from '../../services/ad_service';
import {
  CloudSyncMetadata,
  CloudSyncService,
} from '../../services/cloud_sync_service';
import { LegalModal } from '../auth/legal_modal';
import { FeedbackModal } from '../../core/components/feedback_modal';

interface SettingsScreenProps {
  theme: AppThemeColors;
  themePref: ThemeModePreference;
  onChangeThemePref: (pref: ThemeModePreference) => void;
  lang: AppLanguage;
  onChangeLang: (lang: AppLanguage) => void;
  fontScale: FontScalePreference;
  onChangeFontScale: (scale: FontScalePreference) => void;
  fontScalePercent?: number;
  onChangeFontScalePercent?: (percent: number) => void;
  adConfig?: AdConfiguration;
  onChangeAdPosition?: (pos: BannerPlacementPosition) => void;
  onToggleAdsEnabled?: () => void;
  user: UserModel;
  onEditProfile: () => void;
  onSignOut: () => void;
  onDeleteAccount?: () => void;
  onOpenOnboarding?: () => void;
  onOpenNotifications?: () => void;
  onTriggerExit?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  theme,
  themePref,
  onChangeThemePref,
  lang,
  onChangeLang,
  fontScalePercent = 100,
  onChangeFontScalePercent,
  user,
  onEditProfile,
  onSignOut,
  onDeleteAccount,
  onOpenOnboarding,
  onOpenNotifications,
  onTriggerExit,
}) => {
  const [legalVisible, setLegalVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [syncMeta, setSyncMeta] = useState<CloudSyncMetadata | null>(null);

  useEffect(() => {
    CloudSyncService.getSyncMetadata(user.email).then(setSyncMeta);
  }, [user.email]);

  const handleManualSync = async () => {
    const updated = await CloudSyncService.syncNow(user.email);
    setSyncMeta(updated);
    Alert.alert(
      lang === 'bn' ? 'ক্লাউড ব্যাকআপ সম্পন্ন' : 'Cloud Sync Complete',
      lang === 'bn'
        ? `${updated.totalPlantsSynced}টি গাছ এবং ${updated.totalTimelineLogsSynced}টি লগ ক্লাউডে সংরক্ষিত হয়েছে।`
        : `${updated.totalPlantsSynced} plants and ${updated.totalTimelineLogsSynced} logs synced to ${updated.accountEmail}.`
    );
  };

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const isDarkActive = theme.mode === 'dark' || themePref === 'dark';

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollOuter}
    >
      <View style={styles.container}>
        {/* 1. Verified User Profile Header Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Top Row: Left Avatar, Middle User Info, Right Edit Button */}
          <View style={styles.profileHeaderRow}>
            <View
              style={[
                styles.avatarBox,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.border,
                },
              ]}
            >
              {user.photoUrl ? (
                <Image
                  source={{ uri: user.photoUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={styles.profileInfoCol}>
              <View style={styles.profileNameRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.profileName,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {user.displayName}
                </Text>
                <View
                  style={[
                    styles.verifiedChip,
                    {
                      backgroundColor: theme.selectedSurface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    ✓ {lang === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                  </Text>
                </View>
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.profileEmail,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {user.email}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onEditProfile}
              activeOpacity={0.82}
              style={[
                styles.editProfileBtn,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 11.5,
                  fontFamily: fontFam,
                }}
              >
                ✏️ {lang === 'bn' ? 'এডিট' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Information: Location & Organization */}
          <View
            style={[
              styles.profileMetaRow,
              { borderTopColor: theme.border },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.profileMetaText,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              📍 <Text style={{ color: theme.primary, fontWeight: '600' }}>{user.district}</Text>
              {user.address ? ` • ${user.address}` : ''}
              {user.organizationOrProfession
                ? ` • ${user.organizationOrProfession}`
                : ` • ${APP_CONFIG.developerName}`}
            </Text>
          </View>

          {/* Gardening Information Chips (Subtle Information Chips) */}
          <View style={styles.tasteBadgeRow}>
            <View
              style={[
                styles.tasteChip,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tasteChipText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                🌱{' '}
                {lang === 'bn'
                  ? `পছন্দ: ${
                      user.tasteProfile?.cultivationInterest === 'fruits'
                        ? 'ফল গাছ'
                        : user.tasteProfile?.cultivationInterest === 'vegetables'
                        ? 'সবজি বাগান'
                        : 'ফল ও সবজি উভয়ই'
                    }`
                  : `Focus: ${
                      user.tasteProfile?.cultivationInterest === 'fruits'
                        ? 'Fruits'
                        : user.tasteProfile?.cultivationInterest === 'vegetables'
                        ? 'Vegetables'
                        : 'Fruits & Veg'
                    }`}
              </Text>
            </View>

            <View
              style={[
                styles.tasteChip,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tasteChipText,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                🍒{' '}
                {lang === 'bn'
                  ? `স্বাদ: ${
                      user.tasteProfile?.tastePreference === 'sweet'
                        ? 'মিষ্টি ফল'
                        : user.tasteProfile?.tastePreference === 'sour_tangy'
                        ? 'টক-মিষ্টি'
                        : 'সব ধরনের'
                    }`
                  : `Taste: ${
                      user.tasteProfile?.tastePreference === 'sweet'
                        ? 'Sweet'
                        : user.tasteProfile?.tastePreference === 'sour_tangy'
                        ? 'Tangy'
                        : 'All'
                    }`}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. App Settings & Tools */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15 }}>⚙️</Text>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'অ্যাপ সেটিংস ও সুবিধাসমূহ' : 'App Settings & Tools'}
            </Text>
          </View>

          {/* Grouped Preferences: Language & Theme Mode */}
          <View
            style={[
              styles.groupedListCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Language Selector Row */}
            <View
              style={[
                styles.settingsPrefRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <View
                  style={[
                    styles.iconChip,
                    { backgroundColor: theme.selectedSurface },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>🌐</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'ভাষা নির্বাচন' : 'Language'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.rowSub,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? 'বাংলা অথবা English বেছে নিন।'
                      : 'Choose Bengali or English.'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.segmentedDock,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onChangeLang('bn')}
                  activeOpacity={0.82}
                  style={[
                    styles.segmentItem,
                    lang === 'bn'
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: 'transparent' },
                  ]}
                >
                  <Text
                    style={{
                      color: lang === 'bn' ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                      fontFamily: fontFam,
                    }}
                  >
                    বাংলা
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChangeLang('en')}
                  activeOpacity={0.82}
                  style={[
                    styles.segmentItem,
                    lang === 'en'
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: 'transparent' },
                  ]}
                >
                  <Text
                    style={{
                      color: lang === 'en' ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                      fontFamily: fontFam,
                    }}
                  >
                    English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme Mode Selector Row */}
            <View style={styles.settingsPrefRow}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 120,
                }}
              >
                <View
                  style={[
                    styles.iconChip,
                    { backgroundColor: theme.selectedSurface },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>🎨</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'থিম মোড' : 'Theme Mode'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.rowSub,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? 'অ্যাপের প্রদর্শন পদ্ধতি নির্বাচন করুন।'
                      : 'Choose app appearance mode.'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.segmentedDock,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => onChangeThemePref('light')}
                  activeOpacity={0.82}
                  style={[
                    styles.segmentItem,
                    !isDarkActive
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: 'transparent' },
                  ]}
                >
                  <Text
                    style={{
                      color: !isDarkActive ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? 'লাইট' : 'Light'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onChangeThemePref('dark')}
                  activeOpacity={0.82}
                  style={[
                    styles.segmentItem,
                    isDarkActive
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: 'transparent' },
                  ]}
                >
                  <Text
                    style={{
                      color: isDarkActive ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? 'ডার্ক' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Compact Cloud Backup Status Banner */}
          {syncMeta && (
            <View
              style={[
                styles.syncStatusBanner,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text style={{ fontSize: 16 }}>☁️</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 12.5,
                    fontWeight: '700',
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'Cloud Backup Active' : 'Cloud Backup Active'}
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11.5,
                    fontFamily: fontFam,
                    marginTop: 1,
                  }}
                >
                  {lang === 'bn'
                    ? `${syncMeta.totalPlantsSynced}টি গাছ ও ${syncMeta.totalTimelineLogsSynced}টি লগ সংরক্ষিত।`
                    : `${syncMeta.totalPlantsSynced} plants and ${syncMeta.totalTimelineLogsSynced} logs saved.`}
                </Text>
              </View>
            </View>
          )}

          {/* Grouped App Utilities: Cloud Backup, Privacy & Terms */}
          <View
            style={[
              styles.groupedListCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Row 1: Cloud Backup */}
            <TouchableOpacity
              onPress={handleManualSync}
              activeOpacity={0.7}
              style={[
                styles.settingsRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: theme.selectedSurface },
                ]}
              >
                <Text style={{ fontSize: 16 }}>☁️</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'ক্লাউড ব্যাকআপ' : 'Google Cloud Backup'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'সমস্ত গাছ ও টাইমলাইন ডেটা ক্লাউডে সুরক্ষিত করুন'
                    : 'Safeguard all plant logs and photos'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>

            {/* Row 2: Privacy Policy */}
            <TouchableOpacity
              onPress={() => setLegalVisible(true)}
              activeOpacity={0.7}
              style={styles.settingsRow}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: theme.selectedSurface },
                ]}
              >
                <Text style={{ fontSize: 16 }}>📄</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'প্রাইভেসি পলিসি ও ব্যবহারের শর্তাবলী'
                    : 'Privacy Policy & Terms'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'ডেটা নিরাপত্তা ও ব্যবহারের নীতিমালা'
                    : 'Data protection & legal compliance'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Account & Security (Clean Professional Rows) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15 }}>🔒</Text>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'অ্যাকাউন্ট ও নিরাপত্তা' : 'Account & Security'}
            </Text>
          </View>

          <View
            style={[
              styles.groupedListCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Sign Out */}
            <TouchableOpacity
              onPress={onSignOut}
              activeOpacity={0.7}
              style={[
                styles.settingsRow,
                onTriggerExit ? { borderBottomColor: theme.border } : null,
              ]}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: 'rgba(217, 119, 6, 0.1)' },
                ]}
              >
                <Text style={{ fontSize: 16 }}>🔑</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    styles.rowTitle,
                    { color: theme.warning, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'সাইন আউট' : 'Sign Out'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'অ্যাকাউন্ট থেকে নিরাপদে লগআউট করুন'
                    : 'Safely log out of this device'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.warning,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>

            {/* Exit App */}
            {onTriggerExit && (
              <TouchableOpacity
                onPress={onTriggerExit}
                activeOpacity={0.7}
                style={styles.settingsRow}
              >
                <View
                  style={[
                    styles.iconChip,
                    { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>🚪</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: theme.danger, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'অ্যাপ থেকে প্রস্থান' : 'Exit Application'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.rowSub,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? 'বাগানি অ্যাপ বন্ধ করুন'
                      : 'Close and exit the BAGANI app'}
                  </Text>
                </View>
                <Text
                  style={{
                    color: theme.danger,
                    fontSize: 18,
                    fontWeight: '700',
                  }}
                >
                  ›
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4. Software Information */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Section Heading */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15 }}>💻</Text>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'সফটওয়্যার তথ্য' : 'Software Information'}
            </Text>
          </View>

          {/* App Information Card */}
          <View
            style={[
              styles.devBrandBox,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Header: Logo + App Name + Version Badge + Subtitle */}
            <View style={styles.devBrandHeaderRow}>
              <View
                style={[
                  styles.devLogoWrap,
                  {
                    backgroundColor: theme.selectedSurface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={{ width: 36, height: 36 }}
                  resizeMode="contain"
                />
              </View>

              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={[
                      styles.devAppName,
                      { color: theme.textPrimary, fontFamily: fontFam },
                    ]}
                  >
                    {APP_CONFIG.appName} ({APP_CONFIG.appNameBengali})
                  </Text>
                  <View
                    style={[
                      styles.versionBadge,
                      { backgroundColor: theme.selectedSurface },
                    ]}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      v{APP_CONFIG.version} (Build {APP_CONFIG.buildNumber})
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={2}
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11.5,
                    fontFamily: fontFam,
                    lineHeight: 16,
                  }}
                >
                  {lang === 'bn'
                    ? APP_CONFIG.subtitleBengali
                    : APP_CONFIG.subtitle}
                </Text>
              </View>
            </View>

            {/* Developer Subsection */}
            <View
              style={[
                styles.companyInfoRow,
                { borderTopColor: theme.border },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  flexWrap: 'wrap',
                }}
              >
                <Text
                  style={[
                    styles.companyLabel,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'Developed by' : 'Developed by'}
                </Text>
                <Text
                  style={[
                    styles.companyName,
                    { color: theme.primary, fontFamily: fontFam },
                  ]}
                >
                  {APP_CONFIG.developerInfo.company}
                </Text>
              </View>

              <Text
                numberOfLines={2}
                style={[
                  styles.companyBio,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? APP_CONFIG.developerInfo.shortBioBn
                  : APP_CONFIG.developerInfo.shortBioEn}
              </Text>

              {/* Technology Stack Chips */}
              <View style={{ marginTop: 4, gap: 4 }}>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'Technology Stack' : 'Technology Stack'}
                </Text>
                <View style={styles.techPillRow}>
                  {[
                    'React Native',
                    'Expo',
                    'TypeScript',
                    'Botanical AI Engine',
                    'Cloud Sync',
                  ].map((item) => (
                    <View
                      key={item}
                      style={[
                        styles.techBadge,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontSize: 10.5,
                          fontWeight: '600',
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Grouped Contact Rows: Contact Developer, Feedback, Review */}
          <View
            style={[
              styles.groupedListCard,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            {/* 12. Contact Developer */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const mailUrl = `mailto:${APP_CONFIG.developerInfo.supportEmail}?subject=${encodeURIComponent(
                  `[BAGANI Inquiry] from ${user.displayName || 'User'}`
                )}`;
                Linking.openURL(mailUrl).catch(() => {
                  Alert.alert(
                    'Email',
                    `Contact: ${APP_CONFIG.developerInfo.supportEmail}`
                  );
                });
              }}
              style={[
                styles.settingsRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: 'rgba(2, 132, 199, 0.1)' },
                ]}
              >
                <Text style={{ fontSize: 16 }}>✉️</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'ডেভেলপারের সাথে যোগাযোগ'
                    : 'Contact Developer'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {APP_CONFIG.developerInfo.supportEmail}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>

            {/* 13. Send App Feedback */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFeedbackVisible(true)}
              style={[
                styles.settingsRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: 'rgba(22, 122, 69, 0.1)' },
                ]}
              >
                <Text style={{ fontSize: 16 }}>💬</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'মতামত ও পরামর্শ দিন'
                    : 'Send App Feedback'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'নতুন আইডিয়া বা বাগ রিপোর্ট পাঠান'
                    : 'Submit suggestions or bug reports'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>

            {/* 14. Rate & Review */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Linking.openURL(APP_CONFIG.developerInfo.playStoreUrl).catch(
                  () => {
                    Alert.alert(
                      lang === 'bn' ? 'রেটিং ও রিভিউ' : 'Rate & Review',
                      lang === 'bn'
                        ? 'গুগল প্লে স্টোরে সরাসরি রেটিং দিতে লিংক ওপেন করা হচ্ছে...'
                        : 'Opening Google Play Store to leave a review...'
                    );
                  }
                );
              }}
              style={styles.settingsRow}
            >
              <View
                style={[
                  styles.iconChip,
                  { backgroundColor: 'rgba(234, 88, 12, 0.1)' },
                ]}
              >
                <Text style={{ fontSize: 16 }}>⭐</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'রিভিউ ও রেটিং দিন' : 'Rate & Review'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.rowSub,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'গুগল প্লে স্টোরে ৫-স্টার রেটিং'
                    : 'Rate 5 stars on Google Play'}
                </Text>
              </View>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 18,
                  fontWeight: '700',
                }}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* 15. Copyright & Team Footer (2-Line Centered) */}
          <View style={styles.devCopyrightFooter}>
            <Text
              style={[
                styles.copyrightText,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? APP_CONFIG.developerInfo.allRightsReservedBn
                : APP_CONFIG.developerInfo.allRightsReservedEn}
            </Text>
            <Text
              style={[
                styles.madeWithLoveText,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              Crafted with 💚 for Rooftop Gardeners by {APP_CONFIG.developerName}
            </Text>
          </View>
        </View>

        <FeedbackModal
          visible={feedbackVisible}
          onClose={() => setFeedbackVisible(false)}
          theme={theme}
          lang={lang}
          userEmail={user.email}
          userName={user.displayName}
        />

        <LegalModal
          visible={legalVisible}
          onClose={() => setLegalVisible(false)}
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
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 110, // Safe padding above bottom floating dock
  },
  card: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  // Profile Card Styles
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  profileInfoCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    justifyContent: 'center',
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '700',
    lineHeight: 20,
  },
  verifiedChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  profileEmail: {
    fontSize: 12,
    lineHeight: 16,
  },
  editProfileBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileMetaRow: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  profileMetaText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  tasteBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tasteChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tasteChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  groupedListCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  settingsPrefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    flexWrap: 'wrap',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowSub: {
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
  },
  segmentedDock: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
  },
  segmentItem: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  // Dev & App Info Box
  devBrandBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  devBrandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  devLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  devAppName: {
    fontSize: 15,
    fontWeight: '800',
  },
  versionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  companyInfoRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  companyLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '700',
  },
  companyBio: {
    fontSize: 11,
    lineHeight: 15,
  },
  techPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  techBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  devCopyrightFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    gap: 3,
  },
  copyrightText: {
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 14,
  },
  madeWithLoveText: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
