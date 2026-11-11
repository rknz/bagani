import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { FullScreenExitAdModal } from './lib/core/components/full_screen_exit_ad_modal';
import { BottomNavBar } from './lib/core/components/bottom_nav_bar';
import { ScreenTransition } from './lib/core/components/screen_transition';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppLanguage, TRANSLATIONS } from './lib/core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  applyGlobalFontScale,
  DARK_THEME,
  DESIGN_TOKENS,
  ensureWebFontsLoaded,
  FontScalePreference,
  LIGHT_THEME,
  ThemeModePreference,
} from './lib/core/theme/app_theme';
import {
  CareTaskStatus,
  GranularCareTask,
} from './lib/models/care_schedule_model';
import { PlantTimelineLog } from './lib/models/plant_log_model';
import { PlantHealthState, PlantModel } from './lib/models/plant_model';
import { UserModel } from './lib/models/user_model';
import { AppScreenRoute } from './lib/screens';
import { AuthScreen } from './lib/screens/auth/auth_screen';
import { GuideScreen, GuideSubTab } from './lib/screens/guide/guide_screen';
import { HomeScreen } from './lib/screens/home/home_screen';
import { MyGardenScreen } from './lib/screens/my_garden/my_garden_screen';
import { NotificationsModal } from './lib/screens/notifications/notifications_modal';
import { OnboardingModal } from './lib/screens/onboarding/onboarding_modal';
import { PlantProfileScreen } from './lib/screens/plant_profile/plant_profile_screen';
import { QrTrackerScreen } from './lib/screens/qr_tracker/qr_tracker_screen';
import { ScannerScreen } from './lib/screens/scanner/scanner_screen';
import { SettingsScreen } from './lib/screens/settings/settings_screen';
import { QrCameraScannerModal } from './lib/core/components/qr_camera_scanner_modal';
import {
  AdConfiguration,
  AdService,
  BannerPlacementPosition,
  DEFAULT_AD_CONFIG,
} from './lib/services/ad_service';
import { AuthService } from './lib/services/auth_service';
import { LocalDbService } from './lib/services/local_db_service';
import { NotificationService } from './lib/services/notification_service';

export default function App() {
  const systemScheme = useColorScheme();
  const [themePref, setThemePref] = useState<ThemeModePreference>('light');
  const [lang, setLang] = useState<AppLanguage>('en');
  const [fontScale, setFontScale] = useState<FontScalePreference>('normal');
  const [fontScalePercent, setFontScalePercent] = useState<number>(100);

  const handleUpdateFontScale = (nextPercent: number) => {
    const bounded = Math.max(88, Math.min(118, Math.round(nextPercent)));
    setFontScalePercent(bounded);
    applyGlobalFontScale(bounded);
  };

  const [currentUser, setCurrentUser] = useState<UserModel | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [adConfig, setAdConfig] = useState<AdConfiguration>(DEFAULT_AD_CONFIG);

  const [activeRoute, setActiveRoute] = useState<AppScreenRoute>('home');
  const [plants, setPlants] = useState<PlantModel[]>([]);
  const [careTasks, setCareTasks] = useState<GranularCareTask[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<PlantModel | null>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [globalQrModalOpen, setGlobalQrModalOpen] = useState(false);
  const [guideSubTab, setGuideSubTab] = useState<GuideSubTab>('planner');
  const [exitAdVisible, setExitAdVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const { width: windowWidth } = useWindowDimensions();
  const floatingBtnRight =
    windowWidth > 460 ? Math.round((windowWidth - 440) / 2 + 10) : 18;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Android Hardware Back button & App Exit Interstitial Ad Handler
  useEffect(() => {
    const onBackPress = () => {
      if (globalQrModalOpen) {
        setGlobalQrModalOpen(false);
        return true;
      }
      if (exitAdVisible) {
        setExitAdVisible(false);
        return true;
      }
      if (notificationsOpen) {
        setNotificationsOpen(false);
        return true;
      }
      if (onboardingOpen) {
        setOnboardingOpen(false);
        return true;
      }
      if (isEditingProfile) {
        setIsEditingProfile(false);
        return true;
      }
      if (selectedPlant !== null) {
        setSelectedPlant(null);
        return true;
      }
      if (activeRoute === 'qr_tracker') {
        setActiveRoute('my_garden');
        return true;
      }
      if (activeRoute !== 'home') {
        setActiveRoute('home');
        return true;
      }
      // When at home root, show the full-screen exit ad before closing
      setExitAdVisible(true);
      return true;
    };

    const backSub = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backSub.remove();
  }, [
    exitAdVisible,
    notificationsOpen,
    onboardingOpen,
    isEditingProfile,
    selectedPlant,
    activeRoute,
  ]);

  const handleConfirmAppExit = () => {
    setExitAdVisible(false);
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') {
          window.close();
        }
      } catch {
        // Fallback
      }
    }
  };

  const refreshGardenData = async () => {
    const [loadedPlants, loadedTasks] = await Promise.all([
      LocalDbService.getPlants(),
      LocalDbService.getCareTasks(),
    ]);
    setPlants(loadedPlants);
    setCareTasks(loadedTasks);
    if (selectedPlant) {
      const updatedSelected =
        loadedPlants.find((p) => p.id === selectedPlant.id) || null;
      setSelectedPlant(updatedSelected);
    }
  };

  useEffect(() => {
    ensureWebFontsLoaded();
    (async () => {
      const savedUser = await AuthService.getCurrentUser();
      if (savedUser) {
        const nextTheme =
          savedUser.themePreference === 'dark' ? 'dark' : 'light';
        const nextLang = savedUser.language || 'en';
        const cleanedUser: UserModel = {
          ...savedUser,
          displayName: AuthService.cleanDisplayName(savedUser.displayName),
          language: nextLang,
          themePreference: nextTheme,
        };
        setCurrentUser(cleanedUser);
        setLang(nextLang);
        setThemePref(nextTheme);
      } else {
        // Require valid credentials / explicit login (no automatic guest bypass)
        setCurrentUser(null);
        setLang('en');
        setThemePref('light');
      }
      const savedAds = await AdService.getAdConfig();
      setAdConfig(savedAds);
      await refreshGardenData();
    })();
  }, []);

  const activeMode =
    themePref === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : themePref;

  const theme = activeMode === 'dark' ? DARK_THEME : LIGHT_THEME;
  const t = TRANSLATIONS[lang];

  const handleUpdateThemePref = async (nextPref: ThemeModePreference) => {
    setThemePref(nextPref);
    if (currentUser) {
      const updated = await AuthService.saveUserProfile(currentUser, {
        themePreference: nextPref,
      });
      setCurrentUser(updated);
    }
  };

  const handleUpdateLang = async (nextLang: AppLanguage) => {
    setLang(nextLang);
    if (currentUser) {
      const updated = await AuthService.saveUserProfile(currentUser, {
        language: nextLang,
      });
      setCurrentUser(updated);
    }
  };

  const handleCycleAdPlacement = async () => {
    const order: BannerPlacementPosition[] = ['bottom', 'top', 'both'];
    const nextPos =
      order[(order.indexOf(adConfig.placementPosition) + 1) % order.length];
    const updated = await AdService.updateAdConfig({
      placementPosition: nextPos,
    });
    setAdConfig(updated);
  };

  const handleChangeAdPosition = async (pos: BannerPlacementPosition) => {
    const updated = await AdService.updateAdConfig({
      placementPosition: pos,
    });
    setAdConfig(updated);
  };

  const handleToggleAdsEnabled = async () => {
    const updated = await AdService.updateAdConfig({
      adsEnabled: !adConfig.adsEnabled,
    });
    setAdConfig(updated);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      lang === 'bn'
        ? 'অ্যাকাউন্ট ও ক্লাউড ডেটা ডিলিট করবেন?'
        : 'Delete Account & Cloud Data?',
      lang === 'bn'
        ? 'এটি আপনার অ্যাকাউন্ট এবং সমস্ত সংরক্ষিত বাগান ডেটা স্থায়ীভাবে মুছে ফেলবে।'
        : 'This will permanently erase your account and all synced garden records.',
      [
        { text: lang === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'bn' ? 'স্থায়ীভাবে ডিলিট করুন' : 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await AuthService.deleteAccountAndCloudData();
            setCurrentUser(null);
            setIsEditingProfile(false);
          },
        },
      ]
    );
  };

  const handleExitApp = () => {
    if (adConfig.adsEnabled) {
      setExitAdVisible(true);
    } else {
      Alert.alert(
        lang === 'bn' ? 'অ্যাপ থেকে প্রস্থান' : 'Exit Application',
        lang === 'bn'
          ? 'আপনি কি বাগানি অ্যাপ থেকে প্রস্থান করতে চান?'
          : 'Are you sure you want to exit BAGANI?',
        [
          { text: lang === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
          {
            text: lang === 'bn' ? 'প্রস্থান' : 'Exit',
            style: 'destructive',
            onPress: () => {
              if (Platform.OS === 'android') {
                BackHandler.exitApp();
              } else {
                Alert.alert(
                  lang === 'bn' ? 'ধন্যবাদ' : 'Thank You',
                  lang === 'bn'
                    ? 'বাগানি অ্যাপটি ব্যবহার করার জন্য আপনাকে ধন্যবাদ।'
                    : 'Thank you for using BAGANI.'
                );
              }
            },
          },
        ]
      );
    }
  };

  const handleToggleTaskCheckbox = async (task: GranularCareTask) => {
    const { tasks } = await LocalDbService.toggleTaskCompleted(task);
    setCareTasks(tasks);
    const updatedPlants = await LocalDbService.getPlants();
    setPlants(updatedPlants);
  };

  const handleSaveTaskStatus = async (
    task: GranularCareTask,
    nextStatus: CareTaskStatus
  ) => {
    const { tasks } = await LocalDbService.saveTaskStatus(task, nextStatus);
    setCareTasks(tasks);
    const updatedPlants = await LocalDbService.getPlants();
    setPlants(updatedPlants);
  };

  const handleAddCareTask = async (newTask: GranularCareTask) => {
    const tasks = await LocalDbService.addCareTask(newTask);
    setCareTasks(tasks);
  };

  const handleAddNewPlant = async (newPlant: PlantModel) => {
    const updated = await LocalDbService.addPlant(newPlant);
    setPlants(updated);
    const updatedTasks = await LocalDbService.getCareTasks();
    setCareTasks(updatedTasks);
  };

  const handleSaveAiScanToPlant = async (
    plantId: string,
    diagnosisBn: string,
    diagnosisEn: string,
    remedyBn: string,
    remedyEn: string,
    healthState: PlantHealthState
  ) => {
    const log: PlantTimelineLog = {
      id: 'log_ai_' + Date.now().toString(36),
      plantId,
      actionType: 'health_scan',
      titleBengali: `এআই রোগ নির্ণয়: ${diagnosisBn}`,
      titleEnglish: `AI Scan Diagnosis: ${diagnosisEn}`,
      detailsNotes: lang === 'bn' ? remedyBn : remedyEn,
      completedViaCheckbox: false,
      timestampIso: new Date().toISOString(),
    };
    await LocalDbService.addTimelineLog(log);

    const target = plants.find((p) => p.id === plantId);
    if (target) {
      const updatedPlant: PlantModel = {
        ...target,
        healthState,
        lastHealthDiagnosisSummary: lang === 'bn' ? diagnosisBn : diagnosisEn,
      };
      const nextPlants = await LocalDbService.updatePlant(updatedPlant);
      setPlants(nextPlants);
    }
  };

  const pendingNotificationsCount =
    NotificationService.getPendingUrgentCount(careTasks);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Before the user logs in, show ONLY the clean, centered Login screen (no top bar, no bottom bar, no banners)
  if (!currentUser) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <StatusBar
          barStyle={
            theme.statusBarStyle === 'dark' ? 'dark-content' : 'light-content'
          }
          backgroundColor={theme.background}
        />
        <AuthScreen
          theme={theme}
          lang={lang}
          initialUser={null}
          onCompleteAuth={(savedUser) => {
            setCurrentUser(savedUser);
            setIsEditingProfile(false);
            setActiveRoute('home');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={
          theme.statusBarStyle === 'dark' ? 'dark-content' : 'light-content'
        }
        backgroundColor={theme.background}
      />

      {/* App-Style Top Header Bar */}
      <View
        style={[
          styles.topBarOuter,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.topBarInner}>
          <TouchableOpacity
            style={styles.brandRow}
            activeOpacity={0.85}
            onPress={() => {
              setIsEditingProfile(false);
              setSelectedPlant(null);
              setActiveRoute('home');
            }}
          >
            <Image
              source={require('./assets/images/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <Text
                numberOfLines={1}
                style={[
                  styles.brandTitle,
                  { color: theme.primary, fontFamily: fontFam },
                ]}
              >
                {t.appName}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.brandSub,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {t.subtitle}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            {/* 1. Notifications Bell with Modern Scaled SVG and Minimalist Badge */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: notificationsOpen
                    ? theme.selectedSurface
                    : theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setNotificationsOpen(true)}
              accessibilityLabel={lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
            >
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
                  stroke={notificationsOpen ? theme.primary : theme.textPrimary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M10.3 21C10.6 21.6 11.2 22 12 22C12.8 22 13.4 21.6 13.7 21"
                  stroke={notificationsOpen ? theme.primary : theme.textPrimary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {pendingNotificationsCount > 0 && (
                <View
                  style={[
                    styles.notifCountBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.notifCountText}>
                    {pendingNotificationsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 2. Language Toggle with Modern SVG Globe */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleUpdateLang(lang === 'bn' ? 'en' : 'bn')}
              accessibilityLabel={
                lang === 'bn' ? 'ভাষা পরিবর্তন করুন (Switch Language)' : 'Switch Language'
              }
            >
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="12"
                  cy="12"
                  r="9.5"
                  stroke={theme.textPrimary}
                  strokeWidth="1.8"
                />
                <Path
                  d="M2.5 12H21.5"
                  stroke={theme.textPrimary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <Path
                  d="M12 2.5C15 6 16.5 9 16.5 12C16.5 15 15 18 12 21.5C9 18 7.5 15 7.5 12C7.5 9 9 6 12 2.5Z"
                  stroke={theme.textPrimary}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            {/* 3. Theme Mode Toggle with Modern SVG Sun / Moon */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
              onPress={() =>
                handleUpdateThemePref(
                  activeMode === 'light' ? 'dark' : 'light'
                )
              }
              accessibilityLabel={
                activeMode === 'dark' ? 'Light mode' : 'Dark mode'
              }
            >
              {activeMode === 'dark' ? (
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : (
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="4.5"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                  />
                  <Path
                    d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34"
                    stroke={theme.textPrimary}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content Area with Fluid Transition */}
      <View style={styles.mainBody}>
        <ScreenTransition
          transitionKey={
            isEditingProfile
              ? 'edit_profile'
              : activeRoute === 'plant_profile'
              ? `plant_${selectedPlant?.id || 'none'}`
              : activeRoute === 'qr_tracker'
              ? 'qr_tracker'
              : activeRoute === 'scan' ||
                activeRoute === 'scanner'
              ? `scan_${activeRoute}`
              : activeRoute === 'guide' ||
                activeRoute === 'planner' ||
                activeRoute === 'directory'
              ? `guide_${guideSubTab}_${activeRoute}`
              : activeRoute
          }
        >
          {isEditingProfile ? (
            <AuthScreen
              theme={theme}
              lang={lang}
              initialUser={currentUser}
              onCancelEdit={() => setIsEditingProfile(false)}
              onCompleteAuth={async (savedUser) => {
                setCurrentUser(savedUser);
                setIsEditingProfile(false);
                setActiveRoute('profile');
              }}
            />
          ) : activeRoute === 'plant_profile' && selectedPlant ? (
          <PlantProfileScreen
            plant={selectedPlant}
            theme={theme}
            lang={lang}
            onBack={() => {
              setSelectedPlant(null);
              setActiveRoute('home');
            }}
            onOpenQrDesigner={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('qr_tracker');
            }}
            onPlantUpdated={refreshGardenData}
          />
        ) : activeRoute === 'my_garden' ? (
          <MyGardenScreen
            user={currentUser}
            plants={plants}
            theme={theme}
            lang={lang}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('plant_profile');
            }}
            onAddNewPlant={handleAddNewPlant}
            onOpenQrTagDesigner={() => setActiveRoute('qr_tracker')}
            onOpenQrScanner={() => setGlobalQrModalOpen(true)}
          />
        ) : activeRoute === 'scan' || activeRoute === 'scanner' ? (
          <ScannerScreen
            theme={theme}
            lang={lang}
            plants={plants}
            onSaveScanToPlant={handleSaveAiScanToPlant}
            onAddNewPlant={handleAddNewPlant}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('plant_profile');
            }}
          />
        ) : activeRoute === 'qr_tracker' ? (
          <QrTrackerScreen
            theme={theme}
            lang={lang}
            plants={plants}
            initialPlantId={selectedPlant?.id}
            ownerName={currentUser.displayName}
            onBack={() => {
              if (selectedPlant) {
                setActiveRoute('plant_profile');
              } else {
                setActiveRoute('my_garden');
              }
            }}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('plant_profile');
            }}
            onUpdatePlantQrSettings={async (plantId, updates) => {
              const target = plants.find((p) => p.id === plantId);
              if (!target) return;
              const updatedPlant: PlantModel = {
                ...target,
                qrTagConfig: {
                  ...target.qrTagConfig,
                  tagSize: updates.qrTagSize,
                  customQuoteBengali: updates.customTagQuote,
                  ownerName: updates.ownerDisplayName,
                },
              };
              const nextPlants = await LocalDbService.updatePlant(
                updatedPlant
              );
              setPlants(nextPlants);
            }}
          />
        ) : activeRoute === 'guide' ||
          activeRoute === 'planner' ||
          activeRoute === 'directory' ? (
          <GuideScreen
            theme={theme}
            lang={lang}
            userDistrict={currentUser.district}
            userName={currentUser.displayName}
            plants={plants}
            careTasks={careTasks}
            onToggleTaskCheckbox={handleToggleTaskCheckbox}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('plant_profile');
            }}
            initialSubTab={guideSubTab}
          />
        ) : activeRoute === 'profile' || activeRoute === 'settings' ? (
          <SettingsScreen
            theme={theme}
            themePref={themePref}
            onChangeThemePref={handleUpdateThemePref}
            lang={lang}
            onChangeLang={handleUpdateLang}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
            fontScalePercent={fontScalePercent}
            onChangeFontScalePercent={handleUpdateFontScale}
            user={currentUser}
            onEditProfile={() => setIsEditingProfile(true)}
            onSignOut={async () => {
              await AuthService.signOut();
              setCurrentUser(null);
            }}
            onDeleteAccount={handleDeleteAccount}
            onOpenOnboarding={() => setOnboardingOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onTriggerExit={handleExitApp}
          />
        ) : (
          <HomeScreen
            user={currentUser}
            plants={plants}
            careTasks={careTasks}
            theme={theme}
            lang={lang}
            onSelectPlant={(plant) => {
              setSelectedPlant(plant);
              setActiveRoute('plant_profile');
            }}
            onToggleTaskCheckbox={handleToggleTaskCheckbox}
            onSaveTaskStatus={handleSaveTaskStatus}
            onAddCareTask={handleAddCareTask}
            onAddNewPlant={handleAddNewPlant}
            onOpenQrScanner={() => setActiveRoute('qr_tracker')}
            onOpenAiDiagnosis={() => setActiveRoute('scan')}
            onOpenMyGarden={() => setActiveRoute('my_garden')}
            onOpenWeatherDashboard={() => {
              setGuideSubTab('weather');
              setActiveRoute('guide');
            }}
            onOpenPlanner={() => {
              setGuideSubTab('planner');
              setActiveRoute('guide');
            }}
          />
        )}
        </ScreenTransition>
      </View>

      {/* Global Floating QR Tag Scanner Action Button (Above Bottom Menu on the Right) */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setGlobalQrModalOpen(true)}
          style={[
            styles.globalFloatingQrBtn,
            {
              right: floatingBtnRight,
              backgroundColor: theme.primary,
              borderColor: theme.mode === 'dark' ? '#2A3C30' : '#FFFFFF',
            },
          ]}
          accessibilityLabel={
            lang === 'bn' ? 'QR ট্যাগ স্ক্যান' : 'Scan Plant QR Tag'
          }
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 3H9V9H3V3Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M15 3H21V9H15V3Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3 15H9V21H3V15Z"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M15 15H18V18H15V15Z" fill="#FFFFFF" />
            <Path d="M18 18H21V21H18V18Z" fill="#FFFFFF" />
            <Path
              d="M15 21H18"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      )}

      {/* Global Real-Time QR Camera Scanner Modal */}
      <QrCameraScannerModal
        visible={globalQrModalOpen}
        onClose={() => setGlobalQrModalOpen(false)}
        plants={plants}
        onScanSuccess={(scannedPlant) => {
          setGlobalQrModalOpen(false);
          setSelectedPlant(scannedPlant);
          setActiveRoute('plant_profile');
        }}
        theme={theme}
        lang={lang}
      />

      {/* Always show Bottom Navigation Bar when logged in (including on Edit Profile) */}
      <BottomNavBar
        activeRoute={isEditingProfile ? 'profile' : activeRoute}
        onSelectRoute={(route) => {
          setIsEditingProfile(false);
          if (route !== 'plant_profile') {
            setSelectedPlant(null);
          }
          setActiveRoute(route);
        }}
        theme={theme}
        lang={lang}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        theme={theme}
        lang={lang}
        careTasks={careTasks}
        onToggleTask={handleToggleTaskCheckbox}
        onSaveTaskStatus={handleSaveTaskStatus}
      />

      {/* Splash & Onboarding Walkthrough Modal */}
      <OnboardingModal
        visible={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        theme={theme}
        lang={lang}
      />

      {/* Full-Screen Exit Advertisement Modal (Appears ONLY upon exiting the application) */}
      <FullScreenExitAdModal
        visible={exitAdVisible}
        onDismiss={() => setExitAdVisible(false)}
        onConfirmExit={handleConfirmAppExit}
        theme={theme}
        lang={lang}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  topBarOuter: {
    width: '100%',
    borderBottomWidth: 1,
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
  },
  topBarInner: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DESIGN_TOKENS.screenHorizontalPadding,
    paddingVertical: 6,
    gap: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTextCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 1,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 13,
    opacity: 0.85,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOpacity: 0,
    elevation: 0,
  },
  notifCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  notifCountText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
    lineHeight: 10,
    textAlign: 'center',
    includeFontPadding: false,
  },
  pillBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mainBody: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  globalFloatingQrBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 76,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
});
