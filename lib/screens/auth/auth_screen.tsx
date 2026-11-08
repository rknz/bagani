/**
 * BAGANI — Clean Minimalist Login / Sign-Up & Profile Editor
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { APP_CONFIG } from '../../core/constants/app_constants';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import {
  CultivationInterest,
  OriginPreference,
  TastePreference,
  UserModel,
} from '../../models/user_model';
import { AuthService, BANGLADESH_DISTRICTS } from '../../services/auth_service';

interface AuthScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  initialUser?: UserModel | null;
  onCompleteAuth: (user: UserModel) => void;
  onCancelEdit?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  theme,
  lang,
  initialUser,
  onCompleteAuth,
  onCancelEdit,
}) => {
  const [step, setStep] = useState<'login' | 'customize_profile'>(
    initialUser ? 'customize_profile' : 'login'
  );
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Editable Profile Fields
  const [emailInput, setEmailInput] = useState(
    initialUser?.email || 'bagani.profix@gmail.com'
  );
  const [displayName, setDisplayName] = useState(
    initialUser?.displayName || 'সবুজ বাগানি'
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    initialUser?.photoUrl
  );
  const [district, setDistrict] = useState(
    initialUser?.district || BANGLADESH_DISTRICTS[0].bn
  );
  const [address, setAddress] = useState(
    initialUser?.address || 'পিঙ্গলহাটি, জামালপুর সদর'
  );
  const [organization, setOrganization] = useState(
    initialUser?.organizationOrProfession || 'ProFix - Web & Soft'
  );
  const [appPassword, setAppPassword] = useState('');

  // Gardener Taste Fields
  const [cultivationInterest, setCultivationInterest] =
    useState<CultivationInterest>(
      initialUser?.tasteProfile?.cultivationInterest || 'both'
    );
  const [originPreference, setOriginPreference] = useState<OriginPreference>(
    initialUser?.tasteProfile?.originPreference || 'both'
  );
  const [tastePreference, setTastePreference] = useState<TastePreference>(
    initialUser?.tasteProfile?.tastePreference || 'sweet'
  );

  // Sync state whenever initialUser prop changes
  useEffect(() => {
    if (initialUser) {
      setStep('customize_profile');
      setEmailInput(initialUser.email || 'bagani.profix@gmail.com');
      setDisplayName(initialUser.displayName || 'সবুজ বাগানি');
      setPhotoUrl(initialUser.photoUrl);
      setDistrict(initialUser.district || BANGLADESH_DISTRICTS[0].bn);
      setAddress(initialUser.address || '');
      setOrganization(initialUser.organizationOrProfession || '');
      setCultivationInterest(
        initialUser.tasteProfile?.cultivationInterest || 'both'
      );
      setOriginPreference(initialUser.tasteProfile?.originPreference || 'both');
      setTastePreference(initialUser.tasteProfile?.tastePreference || 'sweet');
    } else {
      setStep('login');
    }
  }, [initialUser]);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const handleDirectLoginOrSignup = async () => {
    const gUser = await AuthService.signInWithGoogle(emailInput);
    const finalName =
      authMode === 'signup' && displayName.trim()
        ? displayName.trim()
        : gUser.displayName;
    const saved = await AuthService.saveUserProfile(gUser, {
      displayName: finalName,
      email: emailInput.trim() || 'gardener@gmail.com',
      language: lang,
    });
    onCompleteAuth(saved);
  };

  const handleGoogleLogin = async () => {
    const gUser = await AuthService.signInWithGoogle(emailInput);
    const saved = await AuthService.saveUserProfile(gUser, {
      language: lang,
    });
    onCompleteAuth(saved);
  };

  const handleAppleLogin = async () => {
    const aUser = await AuthService.signInWithApple();
    const saved = await AuthService.saveUserProfile(aUser, {
      language: lang,
    });
    onCompleteAuth(saved);
  };

  const handlePickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSaveProfileChanges = async () => {
    const baseUser =
      initialUser || (await AuthService.signInWithGoogle(emailInput));
    const saved = await AuthService.saveUserProfile(baseUser, {
      displayName: displayName.trim() || baseUser.displayName || 'সবুজ বাগানি',
      email: emailInput.trim() || baseUser.email || 'gardener@gmail.com',
      photoUrl,
      district: district || BANGLADESH_DISTRICTS[0].bn,
      address: address.trim(),
      organizationOrProfession: organization.trim(),
      hasPasswordConfigured:
        appPassword.trim().length > 0 || baseUser.hasPasswordConfigured,
      language: lang,
      tasteProfile: {
        cultivationInterest,
        originPreference,
        tastePreference,
      },
    });
    onCompleteAuth(saved);
  };

  // STEP 1: CLEAN, CENTERED LOGIN / SIGN-UP SCREEN (No Top/Bottom Bars, Zero Clutter)
  if (step === 'login') {
    return (
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.loginCenteredOuter}
      >
        <View
          style={[
            styles.loginCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Brand Logo & Title */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.loginTitle,
              { color: theme.textPrimary, fontFamily: fontFam },
            ]}
          >
            {APP_CONFIG.appName}
          </Text>
          <Text
            style={[
              styles.loginSub,
              { color: theme.textSecondary, fontFamily: fontFam },
            ]}
          >
            {authMode === 'signin'
              ? lang === 'bn'
                ? 'আপনার অ্যাকাউন্টে সাইন ইন করুন'
                : 'Sign in to your account'
              : lang === 'bn'
              ? 'নতুন অ্যাকাউন্ট তৈরি করুন'
              : 'Create your account'}
          </Text>

          {/* Sign In / Sign Up Mode Switcher */}
          <View
            style={[
              styles.authModeToggle,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setAuthMode('signin')}
              style={[
                styles.authModeBtn,
                authMode === 'signin' && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.authModeText,
                  {
                    color:
                      authMode === 'signin' ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: fontFam,
                  },
                ]}
              >
                {lang === 'bn' ? 'সাইন ইন' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuthMode('signup')}
              style={[
                styles.authModeBtn,
                authMode === 'signup' && { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.authModeText,
                  {
                    color:
                      authMode === 'signup' ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: fontFam,
                  },
                ]}
              >
                {lang === 'bn' ? 'সাইন আপ' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          {authMode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={lang === 'bn' ? 'আপনার নাম' : 'Enter your name'}
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceElevated,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    fontFamily: fontFam,
                  },
                ]}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'ইমেইল' : 'Email'}
            </Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </Text>
            <TextInput
              value={appPassword}
              onChangeText={setAppPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          {/* Primary Sign In / Create Account Button */}
          <TouchableOpacity
            onPress={handleDirectLoginOrSignup}
            activeOpacity={0.85}
            style={[styles.primaryAuthBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.primaryAuthBtnText, { fontFamily: fontFam }]}>
              {authMode === 'signin'
                ? lang === 'bn'
                  ? 'সাইন ইন'
                  : 'Sign In'
                : lang === 'bn'
                ? 'অ্যাকাউন্ট তৈরি করুন'
                : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Clean Divider */}
          <View style={styles.dividerRow}>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'অথবা' : 'or'}
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
          </View>

          {/* Social Sign-In Buttons */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
            style={[
              styles.socialBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.socialBtnText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'Google দিয়ে চালিয়ে যান' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAppleLogin}
            activeOpacity={0.85}
            style={[
              styles.socialBtn,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.socialBtnText,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'Apple দিয়ে চালিয়ে যান' : 'Continue with Apple'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // STEP 2: EDIT PROFILE SCREEN (Full Bottom Navigation Bar remains visible)
  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.editScrollOuter}
    >
      <View style={styles.editContainer}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.editHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.titleLeft,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'প্রোফাইল এডিট করুন' : 'Edit Profile'}
              </Text>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? 'আপনার ব্যক্তিগত তথ্য ও বাগানের পছন্দ হালনাগাদ করুন'
                  : 'Update your personal information and gardening preferences'}
              </Text>
            </View>

            {onCancelEdit && (
              <TouchableOpacity
                onPress={onCancelEdit}
                style={[
                  styles.cancelTopBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
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
                  ← {lang === 'bn' ? 'ফিরে যান' : 'Back'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Photo Picker */}
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarEmoji}>🌿</Text>
              )}
            </View>
            <View style={styles.avatarTextCol}>
              <TouchableOpacity
                onPress={handlePickProfilePhoto}
                style={[
                  styles.photoPickBtn,
                  {
                    backgroundColor: theme.selectedSurface,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.photoPickText,
                    { color: theme.primary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? '📷 ছবি পরিবর্তন করুন'
                    : '📷 Change Profile Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Editable Name */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          {/* Editable Email */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
            </Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          {/* District Selector */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'জেলা' : 'District'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              {BANGLADESH_DISTRICTS.map((d) => {
                const selected = district === d.bn || district === d.en;
                return (
                  <TouchableOpacity
                    key={d.en}
                    onPress={() => setDistrict(d.bn)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? theme.primary
                          : theme.surfaceElevated,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: selected ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                        },
                      ]}
                    >
                      📍 {lang === 'bn' ? d.bn : d.en}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Address & Organization */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'ঠিকানা / ছাদের অবস্থান'
                : 'Address / Rooftop Location'}
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'পেশা বা প্রতিষ্ঠান'
                : 'Profession / Organization'}
            </Text>
            <TextInput
              value={organization}
              onChangeText={setOrganization}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surfaceElevated,
                  color: theme.textPrimary,
                  borderColor: theme.border,
                  fontFamily: fontFam,
                },
              ]}
            />
          </View>

          {/* Gardener Preferences */}
          <View
            style={[
              styles.faqBox,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.faqTitle,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              🌱{' '}
              {lang === 'bn'
                ? 'বাগানির পছন্দ ও রুচি'
                : 'Gardening Preferences'}
            </Text>

            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'চাষের আগ্রহ:' : 'Cultivation Focus:'}
            </Text>
            <View style={styles.optionRow}>
              {(
                [
                  { val: 'fruits', bn: '🍎 ফল গাছ', en: '🍎 Fruits' },
                  { val: 'vegetables', bn: '🥦 শাকসবজি', en: '🥦 Vegetables' },
                  { val: 'both', bn: '🌿 উভয়ই', en: '🌿 Both' },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setCultivationInterest(opt.val)}
                  style={[
                    styles.optChip,
                    {
                      backgroundColor:
                        cultivationInterest === opt.val
                          ? theme.primary
                          : theme.surface,
                      borderColor:
                        cultivationInterest === opt.val
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        cultivationInterest === opt.val
                          ? '#FFFFFF'
                          : theme.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? opt.bn : opt.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.label,
                {
                  color: theme.textSecondary,
                  marginTop: 8,
                  fontFamily: fontFam,
                },
              ]}
            >
              {lang === 'bn' ? 'জাতের পছন্দ:' : 'Preferred Varieties:'}
            </Text>
            <View style={styles.optionRow}>
              {(
                [
                  { val: 'deshi', bn: '🇧🇩 দেশি জাত', en: '🇧🇩 Deshi' },
                  { val: 'exotic', bn: '🌏 বিদেশি জাত', en: '🌏 Exotic' },
                  { val: 'both', bn: '✨ উভয়ই', en: '✨ Both' },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setOriginPreference(opt.val)}
                  style={[
                    styles.optChip,
                    {
                      backgroundColor:
                        originPreference === opt.val
                          ? theme.primary
                          : theme.surface,
                      borderColor:
                        originPreference === opt.val
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        originPreference === opt.val
                          ? '#FFFFFF'
                          : theme.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? opt.bn : opt.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.label,
                {
                  color: theme.textSecondary,
                  marginTop: 8,
                  fontFamily: fontFam,
                },
              ]}
            >
              {lang === 'bn' ? 'স্বাদের পছন্দ:' : 'Taste Preference:'}
            </Text>
            <View style={styles.optionRow}>
              {(
                [
                  { val: 'sweet', bn: '🍯 মিষ্টি', en: '🍯 Sweet' },
                  { val: 'sour_tangy', bn: '🍋 টক-মিষ্টি', en: '🍋 Tangy' },
                  { val: 'both', bn: '🍊 সব ধরনের', en: '🍊 All' },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.val}
                  onPress={() => setTastePreference(opt.val)}
                  style={[
                    styles.optChip,
                    {
                      backgroundColor:
                        tastePreference === opt.val
                          ? theme.primary
                          : theme.surface,
                      borderColor:
                        tastePreference === opt.val
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        tastePreference === opt.val
                          ? '#FFFFFF'
                          : theme.textPrimary,
                      fontSize: 12,
                      fontWeight: '600',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? opt.bn : opt.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Save & Cancel Action Row */}
          <View style={styles.bottomActionRow}>
            {onCancelEdit && (
              <TouchableOpacity
                onPress={onCancelEdit}
                activeOpacity={0.8}
                style={[
                  styles.cancelBottomBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontWeight: '700',
                    fontSize: 14,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSaveProfileChanges}
              activeOpacity={0.85}
              style={[
                styles.saveProfileBtn,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={[styles.primaryAuthBtnText, { fontFamily: fontFam }]}>
                {lang === 'bn' ? '✓ পরিবর্তন সেভ করুন' : '✓ Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loginCenteredOuter: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DESIGN_TOKENS.screenHorizontalPadding,
    paddingVertical: 48,
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    padding: 28,
    gap: 14,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 2,
  },
  logoImage: {
    width: 84,
    height: 68,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  loginSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  authModeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
  },
  authModeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authModeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryAuthBtn: {
    minHeight: 48,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  primaryAuthBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  socialBtn: {
    minHeight: 46,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editScrollOuter: {
    width: '100%',
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: DESIGN_TOKENS.screenHorizontalPadding,
    paddingVertical: DESIGN_TOKENS.spacing.md,
    paddingBottom: 36,
  },
  card: {
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  editHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelTopBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
  },
  titleLeft: {
    fontSize: 20,
    fontWeight: '800',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  avatarTextCol: {
    flex: 1,
    gap: 6,
  },
  photoPickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  photoPickText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: DESIGN_TOKENS.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  chipScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  faqBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  faqTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  bottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  cancelBottomBtn: {
    paddingHorizontal: 20,
    minHeight: 48,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveProfileBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
