/**
 * BAGANI — Clean Minimalist Login / Sign-Up & Profile Editor
 * Complies with Google Play & Apple App Store guidelines:
 * - Logo-only top header (app title text below logo removed)
 * - "Login" and "Sign Up" tabs ("Sign In" renamed to "Login")
 * - Mandatory credential verification (Email/Username + Password)
 * - Email verification flow with clickable activation link
 * - "Continue with Google" available for Android & Web
 * - "Continue with Apple" strictly restricted to iOS (Platform.OS === 'ios')
 * - Full account data linking to Google Account via email
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
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
import {
  AuthService,
  BANGLADESH_DISTRICTS,
  RegisteredAccount,
} from '../../services/auth_service';

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

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  // Sign up form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Activation simulation modal
  const [pendingActivationAccount, setPendingActivationAccount] =
    useState<RegisteredAccount | null>(null);

  // Editable Profile Fields (for Step 2: Edit Profile from Settings)
  const [emailInput, setEmailInput] = useState(
    initialUser?.email || 'gardener@gmail.com'
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

  useEffect(() => {
    if (initialUser) {
      setStep('customize_profile');
      setEmailInput(initialUser.email || 'gardener@gmail.com');
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

  // Handle Login with mandatory username/email and password credentials
  const handleCredentialLogin = async () => {
    setAuthError(null);
    setAuthSuccessNotice(null);

    const identifier = loginIdentifier.trim();
    const pass = loginPassword.trim();

    if (!identifier || !pass) {
      setAuthError(
        lang === 'bn'
          ? 'অনুগ্রহ করে আপনার ইমেইল/ইউজারনেম এবং পাসওয়ার্ড লিখুন।'
          : 'Please enter your email/username and password.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.loginWithCredentials(identifier, pass);
      if (!res.success) {
        if (res.isNotActivated) {
          setAuthError(
            lang === 'bn'
              ? 'আপনার অ্যাকাউন্টটি এখনও সক্রিয় করা হয়নি। অনুগ্রহ করে ইমেইলের ভেরিফিকেশন লিংকে ক্লিক করুন।'
              : 'Account not activated yet. Please click the activation link in your verification email.'
          );
        } else if (res.error === 'user_not_found') {
          setAuthError(
            lang === 'bn'
              ? 'এই ইমেইল বা ইউজারনেম দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য দিন অথবা সাইন আপ করুন।'
              : 'No registered account found with this email or username. Please check your credentials or sign up.'
          );
        } else if (res.error === 'invalid_password') {
          setAuthError(
            lang === 'bn'
              ? 'পাসওয়ার্ড সঠিক নয়। দয়া করে সঠিক পাসওয়ার্ড দিন।'
              : 'Incorrect password. Please verify your password and try again.'
          );
        } else {
          setAuthError(
            lang === 'bn'
              ? 'লগইন ব্যর্থ হয়েছে। তথ্যগুলো পুনরায় পরীক্ষা করুন।'
              : 'Login failed. Please check your credentials.'
          );
        }
        return;
      }

      if (res.user) {
        onCompleteAuth(res.user);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration (Username, Email, Password)
  const handleSignup = async () => {
    setAuthError(null);
    setAuthSuccessNotice(null);

    const uname = signupUsername.trim();
    const email = signupEmail.trim().toLowerCase();
    const pass = signupPassword.trim();
    const confirmPass = signupConfirmPassword.trim();

    if (!uname || uname.length < 3) {
      setAuthError(
        lang === 'bn'
          ? 'ব্যবহারকারীর নাম কমপক্ষে ৩ অক্ষরের হতে হবে।'
          : 'Username must be at least 3 characters long.'
      );
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      setAuthError(
        lang === 'bn'
          ? 'সঠিক ইমেইল ঠিকানা প্রদান করুন।'
          : 'Please provide a valid email address.'
      );
      return;
    }
    if (!pass || pass.length < 6) {
      setAuthError(
        lang === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }
    if (pass !== confirmPass) {
      setAuthError(
        lang === 'bn'
          ? 'উভয় পাসওয়ার্ড একই হতে হবে।'
          : 'Passwords do not match.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AuthService.registerUser({
        username: uname,
        email,
        password: pass,
        district,
      });

      if (!res.success) {
        if (res.error === 'email_already_registered') {
          setAuthError(
            lang === 'bn'
              ? 'এই ইমেইলটি ইতিমধ্যেই নিবন্ধিত রয়েছে। দয়া করে লগইন করুন।'
              : 'This email is already registered. Please log in.'
          );
        } else if (res.error === 'username_already_taken') {
          setAuthError(
            lang === 'bn'
              ? 'এই ব্যবহারকারীর নামটি ইতিমধ্যেই নেওয়া হয়েছে। অন্য নাম দিন।'
              : 'This username is already taken. Please choose another.'
          );
        } else {
          setAuthError(
            lang === 'bn'
              ? 'নিবন্ধন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।'
              : 'Registration failed. Please review your details.'
          );
        }
        return;
      }

      // Success: Show verification email activation prompt
      if (res.account) {
        setPendingActivationAccount(res.account);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger activation via link click simulation
  const handleActivateAccount = async (account: RegisteredAccount) => {
    const res = await AuthService.verifyAndActivateAccount(
      account.email,
      account.activationToken
    );
    if (res.success) {
      setPendingActivationAccount(null);
      setLoginIdentifier(account.email);
      setLoginPassword(account.password);
      setAuthMode('signin');
      setAuthSuccessNotice(
        lang === 'bn'
          ? '✅ আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে! এখন লগইন করুন।'
          : '✅ Your account has been successfully activated! You can now log in.'
      );
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const gUser = await AuthService.signInWithGoogle(loginIdentifier);
      const saved = await AuthService.saveUserProfile(gUser, {
        language: lang,
      });
      onCompleteAuth(saved);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const aUser = await AuthService.signInWithApple();
      const saved = await AuthService.saveUserProfile(aUser, {
        language: lang,
      });
      onCompleteAuth(saved);
    } finally {
      setIsSubmitting(false);
    }
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

  // STEP 1: CLEAN, CENTERED LOGIN / SIGN-UP SCREEN
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
          {/* Logo only (Title and name below logo removed as requested) */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Login / Sign Up Tab Switcher */}
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
              onPress={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
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
                {lang === 'bn' ? 'লগইন' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
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

          {/* Success Notification Banner */}
          {authSuccessNotice && (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: 'rgba(20, 99, 59, 0.12)',
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 12.5,
                  fontWeight: '700',
                  fontFamily: fontFam,
                  textAlign: 'center',
                }}
              >
                {authSuccessNotice}
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {authError && (
            <View
              style={[
                styles.noticeBanner,
                {
                  backgroundColor: 'rgba(220, 38, 38, 0.10)',
                  borderColor: '#DC2626',
                },
              ]}
            >
              <Text
                style={{
                  color: '#DC2626',
                  fontSize: 12.5,
                  fontWeight: '700',
                  fontFamily: fontFam,
                  textAlign: 'center',
                }}
              >
                ⚠️ {authError}
              </Text>
            </View>
          )}

          {/* TAB 1: LOGIN (Requires Valid Email/Username & Password) */}
          {authMode === 'signin' ? (
            <View style={{ gap: 12 }}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'ইমেইল বা ব্যবহারকারীর নাম' : 'Email or Username'}
                </Text>
                <TextInput
                  value={loginIdentifier}
                  onChangeText={setLoginIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={
                    lang === 'bn'
                      ? 'নাম বা ইমেইল লিখুন...'
                      : 'Enter email or username...'
                  }
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      styles.label,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {showLoginPassword
                        ? lang === 'bn'
                          ? 'লুকান'
                          : 'Hide'
                        : lang === 'bn'
                        ? 'দেখুন'
                        : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showLoginPassword}
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

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleCredentialLogin}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={[
                  styles.primaryAuthBtn,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[styles.primaryAuthBtnText, { fontFamily: fontFam }]}
                >
                  {isSubmitting
                    ? lang === 'bn'
                      ? 'যাচাই করা হচ্ছে...'
                      : 'Verifying...'
                    : lang === 'bn'
                    ? 'লগইন'
                    : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* TAB 2: SIGN UP (Username, Email, Password, Verification Flow) */
            <View style={{ gap: 12 }}>
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'ব্যবহারকারীর নাম (Username)' : 'Username'}
                </Text>
                <TextInput
                  value={signupUsername}
                  onChangeText={setSignupUsername}
                  placeholder={lang === 'bn' ? 'যেমন: rafi_green' : 'e.g. green_gardener'}
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
                  {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                </Text>
                <TextInput
                  value={signupEmail}
                  onChangeText={setSignupEmail}
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      styles.label,
                      { color: theme.textSecondary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min 6 characters)'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      {showSignupPassword
                        ? lang === 'bn'
                          ? 'লুকান'
                          : 'Hide'
                        : lang === 'bn'
                        ? 'দেখুন'
                        : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                  secureTextEntry={!showSignupPassword}
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

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                </Text>
                <TextInput
                  value={signupConfirmPassword}
                  onChangeText={setSignupConfirmPassword}
                  secureTextEntry={!showSignupPassword}
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

              <Text
                style={{
                  fontSize: 11.5,
                  color: theme.textSecondary,
                  lineHeight: 16,
                  fontFamily: fontFam,
                }}
              >
                ℹ️{' '}
                {lang === 'bn'
                  ? 'নিবন্ধনের পর আপনার ইমেইলে একটি ভেরিফিকেশন অ্যাক্টিভেশন লিংক পাঠানো হবে। লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করতে হবে।'
                  : 'An activation link will be sent to your email. Click the verification link to activate your account.'}
              </Text>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isSubmitting}
                activeOpacity={0.85}
                style={[
                  styles.primaryAuthBtn,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[styles.primaryAuthBtnText, { fontFamily: fontFam }]}
                >
                  {isSubmitting
                    ? lang === 'bn'
                      ? 'অ্যাকাউন্ট তৈরি হচ্ছে...'
                      : 'Creating Account...'
                    : lang === 'bn'
                    ? 'সাইন আপ'
                    : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

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

          {/* Social Sign-In: On Android only "Continue with Google" is available.
              "Continue with Apple" is strictly restricted to iOS only. */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={isSubmitting}
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

          {/* Render Apple Sign-In ONLY on iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={handleAppleLogin}
              disabled={isSubmitting}
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
          )}
        </View>

        {/* Verification Email Activation Modal */}
        {pendingActivationAccount && (
          <Modal
            transparent
            animationType="fade"
            visible={!!pendingActivationAccount}
            onRequestClose={() => setPendingActivationAccount(null)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.activationCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 40, textAlign: 'center' }}>✉️</Text>
                <Text
                  style={[
                    styles.activationTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে!'
                    : 'Verification Email Sent!'}
                </Text>
                <Text
                  style={[
                    styles.activationDesc,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? `আমরা ${pendingActivationAccount.email} ঠিকানায় একটি অ্যাক্টিভেশন লিংক পাঠিয়েছি। আপনার অ্যাকাউন্ট সক্রিয় করতে লিংকে ক্লিক করুন:`
                    : `We sent an activation link to ${pendingActivationAccount.email}. Please click the link to activate your account:`}
                </Text>

                <View
                  style={[
                    styles.emailLinkBox,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      color: theme.primary,
                      fontFamily: fontFam,
                      fontWeight: '600',
                    }}
                  >
                    https://bagani.app/activate?token=
                    {pendingActivationAccount.activationToken}
                  </Text>
                </View>

                {/* Simulated Link Click to Activate Account */}
                <TouchableOpacity
                  onPress={() =>
                    handleActivateAccount(pendingActivationAccount)
                  }
                  activeOpacity={0.85}
                  style={[
                    styles.primaryAuthBtn,
                    { backgroundColor: theme.primary, width: '100%' },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryAuthBtnText,
                      { fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn'
                      ? '📧 অ্যাকাউন্ট সক্রিয় করুন (Activate Account)'
                      : '📧 Activate Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setPendingActivationAccount(null);
                    setAuthMode('signin');
                  }}
                  style={{ paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 13,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? 'পরে করব / লগইনে যান' : 'Skip to Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    );
  }

  // STEP 2: EDIT PROFILE SCREEN (Settings Route)
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
              {lang === 'bn' ? 'ব্যবহারকারীর নাম' : 'Display Name'}
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
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

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
            </Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
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

          {/* District Selector Chips */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'বাগান বা বাসস্থানের জেলা' : 'Home District'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              {BANGLADESH_DISTRICTS.map((item) => {
                const label = lang === 'bn' ? item.bn : item.en;
                const isSelected = district === item.bn || district === item.en;
                return (
                  <TouchableOpacity
                    key={item.en}
                    onPress={() => setDistrict(item.bn)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceElevated,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder={
                lang === 'bn'
                  ? 'সড়ক, বাড়ি নং, এলাকা...'
                  : 'Street, House No, Area...'
              }
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

          {/* Organization / Profession */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'প্রতিষ্ঠান / পেশা'
                : 'Organization / Profession'}
            </Text>
            <TextInput
              value={organization}
              onChangeText={setOrganization}
              placeholder="e.g. ProFix - Web & Soft"
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

          {/* App Security Password */}
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'অ্যাপ পাসওয়ার্ড (ঐচ্ছিক)'
                : 'App Security Password (Optional)'}
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

          {/* SECTION: Gardener Taste & Preference Profile (Phase 2 Requirement) */}
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
              🌿 {lang === 'bn' ? 'বাগানের রুচি ও পছন্দ' : 'Gardening Taste Profile'}
            </Text>

            {/* Q1: Cultivation Interest */}
            <View style={{ gap: 6, marginVertical: 4 }}>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 13,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? '১. আপনি কী ধরণের গাছ বেশি পছন্দ করেন?'
                  : '1. What type of plants do you prefer cultivating?'}
              </Text>
              <View style={styles.optionRow}>
                {[
                  { id: 'fruits', bn: '🍎 ফলমূল', en: '🍎 Fruits' },
                  { id: 'vegetables', bn: '🥦 শাকসবজি', en: '🥦 Vegetables' },
                  { id: 'both', bn: '🌱 উভয়ই', en: '🌱 Both' },
                ].map((opt) => {
                  const sel = cultivationInterest === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() =>
                        setCultivationInterest(opt.id as CultivationInterest)
                      }
                      style={[
                        styles.optChip,
                        {
                          backgroundColor: sel
                            ? theme.primary
                            : theme.surface,
                          borderColor: sel ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: sel ? '#FFFFFF' : theme.textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? opt.bn : opt.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Q2: Origin Preference */}
            <View style={{ gap: 6, marginVertical: 4 }}>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 13,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? '২. দেশি নাকি বিদেশি জাত বেশি রোপণ করেন?'
                  : '2. Do you prefer native or exotic varieties?'}
              </Text>
              <View style={styles.optionRow}>
                {[
                  { id: 'deshi', bn: '🇧🇩 দেশি জাত', en: '🇧🇩 Native' },
                  { id: 'exotic', bn: '🌍 বিদেশি জাত', en: '🌍 Exotic' },
                  { id: 'both', bn: '🌿 উভয়ই', en: '🌿 Both' },
                ].map((opt) => {
                  const sel = originPreference === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() =>
                        setOriginPreference(opt.id as OriginPreference)
                      }
                      style={[
                        styles.optChip,
                        {
                          backgroundColor: sel
                            ? theme.primary
                            : theme.surface,
                          borderColor: sel ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: sel ? '#FFFFFF' : theme.textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? opt.bn : opt.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Q3: Taste Preference */}
            <View style={{ gap: 6, marginVertical: 4 }}>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 13,
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn'
                  ? '৩. ফলের স্বাদে কোনটিকে প্রাধান্য দেন?'
                  : '3. What flavor profile do you prefer in homegrown fruits?'}
              </Text>
              <View style={styles.optionRow}>
                {[
                  { id: 'sweet', bn: '🍯 মিষ্টি স্বাদ', en: '🍯 Sweet' },
                  { id: 'sour_tangy', bn: '🍋 টক-মিষ্টি', en: '🍋 Tangy/Sour' },
                  { id: 'both', bn: '🍍 সকল স্বাদ', en: '🍍 Any flavor' },
                ].map((opt) => {
                  const sel = tastePreference === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() =>
                        setTastePreference(opt.id as TastePreference)
                      }
                      style={[
                        styles.optChip,
                        {
                          backgroundColor: sel
                            ? theme.primary
                            : theme.surface,
                          borderColor: sel ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: sel ? '#FFFFFF' : theme.textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? opt.bn : opt.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.bottomActionRow}>
            {onCancelEdit && (
              <TouchableOpacity
                onPress={onCancelEdit}
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
                    fontWeight: '600',
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
    padding: 26,
    gap: 14,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 6,
  },
  logoImage: {
    width: 90,
    height: 72,
  },
  authModeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    borderWidth: 1,
  },
  authModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authModeText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  noticeBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
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
    marginVertical: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  activationCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  activationTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  activationDesc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  emailLinkBox: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
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
