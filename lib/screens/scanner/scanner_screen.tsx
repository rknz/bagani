/**
 * BAGANI — Online AI Botanical Vision, Plant Pathology Diagnostic & Species Identification Hub
 * Developer: ProFix - Web & Soft
 *
 * Capabilities:
 * 1. Global Live Camera & Gallery Photo Capture for Plant & Disease Identification
 * 2. True Internet-Connected Botanical Retrieval (Wikipedia REST API & Global Knowledge Cloud)
 * 3. Supports ANY Plant Worldwide (Flowers, Fruits, Vegetables, Medicinal Herbs, Indoor, Cacti)
 * 4. Multi-Part Analysis: Leaf, Fruit, Flower, Soil/Roots, or Whole Plant
 * 5. Google Lens & Visual AI Deep Scan integration for reverse-image recognition
 * 6. Step-by-Step Organic Treatments & Bio-Remedies with Exact Dosages
 * 7. Comprehensive Care & Maintenance Guidelines (Water, Sunlight, Soil Mix %, Pruning)
 * 8. 1-Tap "Add to My Garden" for newly scanned plants
 * 9. Log Report directly to Plant History Timeline
 * 10. Live Camera QR Scanner Modal with instant profile navigation
 */

import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import { PlantCategory, PlantHealthState, PlantModel } from '../../models/plant_model';
import {
  AiScannerService,
  BOTANICAL_CLOUD_DATABASE,
  ComprehensiveScanResult,
  ExaminedPart,
  ScanMode,
} from '../../services/ai_scanner_service';
import { BotanicalSearchModal } from '../../core/components/botanical_search_modal';
import {
  BotanicalEncyclopediaEntry,
  OnlineBotanicalService,
} from '../../services/online_botanical_service';

interface ScannerScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  plants: PlantModel[];
  onSaveScanToPlant?: (
    plantId: string,
    diagnosisBn: string,
    diagnosisEn: string,
    remedyBn: string,
    remedyEn: string,
    healthState: PlantHealthState
  ) => void;
  onSelectPlant?: (plant: PlantModel) => void;
  onAddNewPlant?: (plant: PlantModel) => void;
}

const EXAMINED_PARTS: {
  id: ExaminedPart;
  icon: string;
  nameBn: string;
  nameEn: string;
}[] = [
    { id: 'leaf', icon: '🌿', nameBn: 'পাতা (Leaf)', nameEn: 'Leaf' },
    { id: 'fruit', icon: '🍋', nameBn: 'ফল (Fruit)', nameEn: 'Fruit' },
    { id: 'flower', icon: '🌸', nameBn: 'ফুল (Flower)', nameEn: 'Flower' },
    { id: 'soil', icon: '🪴', nameBn: 'মাটি ও শিকড় (Soil)', nameEn: 'Soil/Root' },
    { id: 'plant', icon: '🌱', nameBn: 'সমগ্র গাছ (Plant)', nameEn: 'Whole Plant' },
  ];

const ALL_PLANT_SUGGESTIONS = [
  { bn: 'আম (হিমসাগর ও আম্রপালি)', en: 'Mango (Himsagar & Amrapali)', emoji: '🥭' },
  { bn: 'লিচু (বোম্বাই ও চায়না-৩)', en: 'Litchi (Bombay & China-3)', emoji: '🍒' },
  { bn: 'কালো জাম', en: 'Black Plum (Jamun)', emoji: '🫐' },
  { bn: 'মাল্টা (বারি মাল্টা-১)', en: 'Malta (BARI Malta-1)', emoji: '🍊' },
  { bn: 'কুল ও আপেল কুল', en: 'Jujube (Apple Kul)', emoji: '🍏' },
  { bn: 'গোলাপ (ডাচ ও কাশ্মীরি)', en: 'Rose (Dutch & Kashmiri)', emoji: '🌹' },
  { bn: 'কাটিমন আম', en: 'Katimon Mango', emoji: '🥭' },
  { bn: 'গাঁদা', en: 'Marigold', emoji: '🌼' },
  { bn: 'জবা', en: 'Hibiscus', emoji: '🌺' },
  { bn: 'ড্রাগন ফল', en: 'Dragon Fruit', emoji: '🐉' },
  { bn: 'স্ট্রবেরি', en: 'Strawberry', emoji: '🍓' },
  { bn: 'লেবু ও কাগজি লেবু', en: 'Lemon & Lime', emoji: '🍋' },
  { bn: 'পেয়ারা (থাই-৭)', en: 'Guava (Thai-7)', emoji: '🍐' },
  { bn: 'টমেটো (বারি-১৪)', en: 'Tomato', emoji: '🍅' },
  { bn: 'মরিচ ও নাগা মরিচ', en: 'Chili & Naga', emoji: '🌶️' },
  { bn: 'লাউ ও শসা', en: 'Bottle Gourd & Cucumber', emoji: '🥒' },
  { bn: 'মিষ্টি কুমড়া', en: 'Sweet Gourd', emoji: '🎃' },
  { bn: 'বেগুন', en: 'Eggplant', emoji: '🍆' },
  { bn: 'ক্যাকটাস ও সুকুলেন্ট', en: 'Cactus & Succulents', emoji: '🌵' },
  { bn: 'তুলসী', en: 'Tulsi (Holy Basil)', emoji: '🌿' },
  { bn: 'পুদিনা পাতা', en: 'Mint', emoji: '🍃' },
  { bn: 'ধনেপাতা', en: 'Coriander', emoji: '🌱' },
  { bn: 'অ্যালোভেরা', en: 'Aloe Vera', emoji: '🪴' },
  { bn: 'অর্কিড', en: 'Orchid', emoji: '🌸' },
  { bn: 'বেলি ও জুঁই', en: 'Jasmine', emoji: '🤍' },
  { bn: 'পেঁপে (রেড লেডি)', en: 'Papaya (Red Lady)', emoji: '🍈' },
  { bn: 'কাগজ ফুল (বাগানবিলাস)', en: 'Bougainvillea', emoji: '🌺' },
];

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  theme,
  lang,
  plants,
  onSaveScanToPlant,
  onSelectPlant,
  onAddNewPlant,
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>('diagnose');
  const [examinedPart, setExaminedPart] = useState<ExaminedPart>('leaf');
  const [activePlantHint, setActivePlantHint] = useState<string>('');
  const [plantQueryInput, setPlantQueryInput] = useState<string>('');
  const [targetPlantId, setTargetPlantId] = useState<string>(plants[0]?.id || '');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  // Live Botanical Autocomplete & Search Modal States
  const [botanicalSearchModalOpen, setBotanicalSearchModalOpen] = useState<boolean>(false);
  const [liveSearchResults, setLiveSearchResults] = useState<BotanicalEncyclopediaEntry[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);

  // Live debounce botanical search when typing in search input
  useEffect(() => {
    const q = plantQueryInput.trim();
    if (!q) {
      setLiveSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingLive(true);
        const results = await OnlineBotanicalService.searchEncyclopediaOnline(q);
        setLiveSearchResults(results.slice(0, 5));
      } catch (err) {
        console.warn('Live search error', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [plantQueryInput]);

  const displayedSuggestions = useMemo(() => {
    const q = plantQueryInput.trim().toLowerCase();
    if (!q) return ALL_PLANT_SUGGESTIONS;
    const matched = ALL_PLANT_SUGGESTIONS.filter(
      (item) =>
        item.bn.toLowerCase().includes(q) ||
        item.en.toLowerCase().includes(q)
    );
    return matched.length > 0 ? matched : ALL_PLANT_SUGGESTIONS;
  }, [plantQueryInput]);

  // Analysis Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(100);
  const [analysisPhaseText, setAnalysisPhaseText] = useState<string>('');

  // Active Scan Result from AI Service
  const [scanResult, setScanResult] = useState<ComprehensiveScanResult | null>(null);

  // Live Camera Scanner State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraVideoRef = useRef<any>(null);
  const nativeCameraRef = useRef<any>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Restart camera if facing toggled
  useEffect(() => {
    if (isLiveCameraOpen) {
      startLiveCamera();
    }
  }, [cameraFacing]);

  // Run initial analysis only if plant hint is preset or after user action
  useEffect(() => {
    if (activePlantHint) {
      executeAnalysis(activePlantHint, examinedPart, scanMode);
    }
  }, []);

  const startLiveCamera = async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        setIsLiveCameraOpen(true);
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach((t) => t.stop());
          cameraStreamRef.current = null;
        }
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: cameraFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.setAttribute('playsinline', 'true');
          cameraVideoRef.current.play().catch(() => { });
        }
      } catch (err) {
        console.warn('Camera stream error, using fallback:', err);
        handleNativeCameraFallback();
      }
    } else {
      // Native Android / iOS
      try {
        if (!cameraPermission?.granted) {
          const req = await requestCameraPermission();
          if (req?.granted) {
            setIsLiveCameraOpen(true);
          } else {
            Alert.alert(
              lang === 'bn' ? 'ক্যামেরা পারমিশন প্রয়োজন' : 'Camera Permission Required',
              lang === 'bn'
                ? 'গাছের পাতার রোগ নির্ণয় ও ছবি তোলার জন্য ক্যামেরা ব্যবহারের অনুমতি দিন।'
                : 'Please allow camera access in device settings to capture plant photos.'
            );
          }
        } else {
          setIsLiveCameraOpen(true);
        }
      } catch (err) {
        console.warn('Native camera permission error:', err);
        handleNativeCameraFallback();
      }
    }
  };

  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      try {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch { }
      cameraStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const handleCaptureSnapshot = async () => {
    if (Platform.OS === 'web') {
      if (cameraVideoRef.current) {
        const video = cameraVideoRef.current;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64 = dataUrl.split(',')[1];
            setCapturedImageUri(dataUrl);
            stopLiveCamera();
            executeAnalysis(activePlantHint, examinedPart, scanMode, dataUrl, base64);
            return;
          }
        } catch (e) {
          console.warn('Snapshot capture error', e);
        }
      }
    } else {
      // Native Android / iOS snapshot capture from CameraView
      try {
        if (nativeCameraRef.current) {
          const photo = await nativeCameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.85,
          });
          if (photo && photo.uri) {
            setCapturedImageUri(photo.uri);
            stopLiveCamera();
            executeAnalysis(
              activePlantHint,
              examinedPart,
              scanMode,
              photo.uri,
              photo.base64 || undefined
            );
            return;
          }
        }
      } catch (err) {
        console.warn('Native camera capture error', err);
      }
    }
    stopLiveCamera();
  };

  const handleNativeCameraFallback = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          lang === 'bn' ? 'ক্যামেরা পারমিশন প্রয়োজন' : 'Camera Permission Required',
          lang === 'bn'
            ? 'গাছের পাতার ছবি তোলার জন্য ক্যামেরা ব্যবহারের অনুমতি দিন।'
            : 'Please allow camera access in device settings.'
        );
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        const base64 = res.assets[0].base64 || undefined;
        setCapturedImageUri(uri);
        executeAnalysis(activePlantHint, examinedPart, scanMode, uri, base64);
      }
    } catch (e) {
      console.warn('Camera capture error', e);
    }
  };

  const executeAnalysis = async (
    plantIdentifier: string,
    part: ExaminedPart,
    mode: ScanMode,
    customUri?: string,
    customBase64?: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisProgress(20);
    setAnalysisPhaseText(
      lang === 'bn'
        ? '১. ইমেজ কালার স্পেকট্রাম ও টেক্সচার বিশ্লেষণ হচ্ছে...'
        : '1. Extracting visual leaf morphology & image vectors...'
    );

    const targetUri = customUri || capturedImageUri || '';
    let targetBase64 = customBase64;
    if (!targetBase64 && targetUri.startsWith('data:image/')) {
      targetBase64 = targetUri.split(',')[1];
    }

    const timer1 = setTimeout(() => {
      setAnalysisProgress(60);
      setAnalysisPhaseText(
        lang === 'bn'
          ? '২. AI প্যাথলজি ও ক্লাউড বিশ্লেষণ হচ্ছে...'
          : '2. Querying AI Pathology & global botanical cloud...'
      );
    }, 350);

    const timer2 = setTimeout(async () => {
      setAnalysisProgress(90);
      setAnalysisPhaseText(
        lang === 'bn'
          ? '৩. প্যাথলজি নির্ণয় ও অর্গানিক চিকিৎসার ডোজ তৈরি হচ্ছে...'
          : '3. Synthesizing organic treatment pathology...'
      );

      try {
        const result = await AiScannerService.analyzePlantImage({
          imageUri: targetUri,
          base64Image: targetBase64,
          mode,
          examinedPart: part,
          plantHintId: plantIdentifier || activePlantHint,
        });

        setScanResult(result);
        setAnalysisProgress(100);
      } catch (err) {
        console.warn('Scan analysis error', err);
      } finally {
        setTimeout(() => {
          setIsAnalyzing(false);
        }, 200);
      }
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const handleCameraCapture = () => {
    startLiveCamera();
  };

  const handleGalleryUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          lang === 'bn' ? 'গ্যালারি পারমিশন প্রয়োজন' : 'Permission Required',
          lang === 'bn'
            ? 'ছবি নির্বাচনের জন্য ডিভাইসের গ্যালারি ব্যবহারের অনুমতি দিন।'
            : 'Please grant permission to access your photo gallery.'
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        base64: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        const base64 = res.assets[0].base64 || undefined;
        setCapturedImageUri(uri);
        executeAnalysis(activePlantHint, examinedPart, scanMode, uri, base64);
      }
    } catch (e) {
      console.warn('Gallery pick error', e);
    }
  };

  const handleSwitchMode = (nextMode: ScanMode) => {
    setScanMode(nextMode);
    executeAnalysis(activePlantHint, examinedPart, nextMode);
  };

  const handleSwitchExaminedPart = (nextPart: ExaminedPart) => {
    setExaminedPart(nextPart);
    executeAnalysis(activePlantHint, nextPart, scanMode);
  };

  const handleSelectSeedPlant = (identifier: string) => {
    setActivePlantHint(identifier);
    setPlantQueryInput(identifier);
    executeAnalysis(identifier, examinedPart, scanMode);
  };

  const handlePlantQuerySubmit = (customText: string) => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setActivePlantHint(trimmed);
    executeAnalysis(trimmed, examinedPart, scanMode);
  };

  const handleOpenOnlineSource = async () => {
    if (scanResult?.onlineSource?.url) {
      try {
        await Linking.openURL(scanResult.onlineSource.url);
      } catch (err) {
        console.warn('Could not open citation link', err);
      }
    }
  };

  const handleAddScannedPlantToGarden = () => {
    if (!scanResult || !onAddNewPlant) return;
    const qrId = 'BAGANI-QR-' + (1000 + plants.length + 1);
    const newPlant: PlantModel = {
      id: 'plt_' + Date.now().toString(36),
      qrCodeId: qrId,
      nameBengali: scanResult.plantNameBn,
      nameEnglish: scanResult.plantNameEn,
      variety: scanResult.varietyNameBn,
      category: scanResult.category,
      isAllSeason: true,
      plantedDateIso: new Date().toISOString(),
      containerSizeInches: 18,
      containerType: 'geo_bag',
      containerCapacityLabel: '18 Inch Geo-Bag',
      growthStage: 'vegetative',
      canopySize: 'medium',
      soilCondition: 'loam_compost',
      sunlightExposure: 'full_sun',
      rooftopZone: `ছাদবাগান সারি - টব #${plants.length + 1}`,
      healthState: scanResult.healthState,
      lastHealthDiagnosisSummary: scanResult.issueTitleBn,
      lastWateredIso: new Date().toISOString(),
      lastFertilizedIso: new Date().toISOString(),
      estimatedMoisturePercent: 75,
      photoUri: capturedImageUri || scanResult.onlineSource.thumbnailUrl || '',
      qrTagConfig: {
        qrCodeValue: qrId,
        tagSize: 'medium',
        plantName: scanResult.plantNameBn,
        varietyName: scanResult.varietyNameBn,
        isAllSeason: true,
        customQuoteBengali: 'গাছ লাগান, পরিবেশ বাঁচান',
        ownerName: 'ছাদবাগান পরিচর্যা',
        ownerAddressOrCode: qrId,
      },
    };

    onAddNewPlant(newPlant);
    Alert.alert(
      lang === 'bn' ? '✓ বাগানে যুক্ত হয়েছে' : '✓ Added to Garden',
      lang === 'bn'
        ? `"${scanResult.plantNameBn}" গাছটি সফলভাবে আপনার ছাদবাগানে রেজিস্টার করা হয়েছে।`
        : `"${scanResult.plantNameEn}" registered into your garden.`
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, width: '100%' }}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollOuter}
    >
      <View style={styles.container}>
        {/* Top Header Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 200 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 20 }}>🔬</Text>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'অনলাইন ডায়াগনোসিস ও স্ক্যান'
                    : 'Online Diagnosis & Scan'}
                </Text>
              </View>
              <Text style={[styles.captionText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn'
                  ? 'বিশ্বের যেকোনো ফুল, ফল বা গাছের ছবি তুলুন—গুগল লেন্স ও উইকিপিডিয়া ক্লাউডের মাধ্যমে জাত ও রোগ নির্ণয় করুন।'
                  : 'Point camera or upload image of any plant globally for online taxonomy identification & organic pathology remedies.'}
              </Text>
            </View>
          </View>

          {/* Mode Switcher: Disease Diagnosis vs Species Identifier (Arranged vertically: one above the other) */}
          <View style={styles.modeCol}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleSwitchMode('diagnose')}
              style={[
                styles.modeBtnFull,
                {
                  backgroundColor:
                    scanMode === 'diagnose'
                      ? theme.primary
                      : theme.surfaceElevated,
                  borderColor:
                    scanMode === 'diagnose' ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={styles.modeBtnInner}>
                <Text style={{ fontSize: 16 }}>🩺</Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: scanMode === 'diagnose' ? '#FFFFFF' : theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    fontFamily: fontFam,
                    textAlign: 'center',
                  }}
                >
                  {lang === 'bn' ? 'রোগবালাই নির্ণয়' : 'Disease Diagnosis'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleSwitchMode('identify')}
              style={[
                styles.modeBtnFull,
                {
                  backgroundColor:
                    scanMode === 'identify'
                      ? theme.primary
                      : theme.surfaceElevated,
                  borderColor:
                    scanMode === 'identify' ? theme.primary : theme.border,
                },
              ]}
            >
              <View style={styles.modeBtnInner}>
                <Text style={{ fontSize: 16 }}>🌿</Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: scanMode === 'identify' ? '#FFFFFF' : theme.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                    fontFamily: fontFam,
                    textAlign: 'center',
                  }}
                >
                  {lang === 'bn' ? 'জাত ও প্রজাতি' : 'Species Identifier'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2: Global Botanical Plant Selector & Online Search Input (Positioned high so suggestions appear above keyboard) */}
        <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="9" stroke={theme.primary} strokeWidth="2" />
                <Path d="M3 12H21" stroke={theme.primary} strokeWidth="1.8" />
                <Path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z" stroke={theme.primary} strokeWidth="1.8" />
              </Svg>
              <Text style={[styles.cardHeading, { color: theme.textPrimary, fontFamily: fontFam, marginBottom: 0 }]}>
                {lang === 'bn' ? 'উদ্ভিদ বা প্রজাতি খুঁজুন' : 'Find Plant or Species'}
              </Text>
            </View>
            {activePlantHint ? (
              <View style={[styles.activeHintBadge, { backgroundColor: theme.selectedSurface, borderColor: theme.primary }]}>
                <Text style={{ color: theme.primary, fontSize: 11.5, fontWeight: '700', fontFamily: fontFam }}>
                  ✓ {activePlantHint}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Plant Search / Input Box - Firmly Anchored Right Icon Button */}
          <View style={[styles.plantHintInputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={styles.inputLeftIcon}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="7" stroke={theme.textSecondary} strokeWidth="2" />
                <Path d="M16.5 16.5L21 21" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
            </View>
            <TextInput
              value={plantQueryInput}
              onChangeText={setPlantQueryInput}
              onSubmitEditing={() => handlePlantQuerySubmit(plantQueryInput)}
              returnKeyType="search"
              placeholder={
                lang === 'bn'
                  ? 'গাছের নাম লিখুন (যেমন: গোলাপ, জবা, আম, টমেটো, মরিচ)...'
                  : 'Enter plant name (e.g. Rose, Mango, Tomato, Tulsi)...'
              }
              placeholderTextColor={theme.textSecondary}
              style={[styles.plantHintInput, { color: theme.textPrimary, fontFamily: fontFam }]}
            />
            {plantQueryInput ? (
              <TouchableOpacity
                onPress={() => setPlantQueryInput('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.clearBtnAnchored}
                accessibilityLabel="Clear input"
              >
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => handlePlantQuerySubmit(plantQueryInput)}
              activeOpacity={0.82}
              accessibilityLabel={lang === 'bn' ? 'অনুসন্ধান' : 'Search'}
              style={[styles.plantHintSearchBtn, { backgroundColor: theme.primary }]}
            >
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="7" stroke="#FFFFFF" strokeWidth="2.2" />
                <Path d="M16.5 16.5L21 21" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Live Matching Botanical Species & Varieties (Google-Style Knowledge Graph) */}
          {liveSearchResults.length > 0 && (
            <View style={{ marginTop: 10, gap: 8 }}>
              <Text style={[styles.fieldLabel, { color: theme.primary, fontFamily: fontFam, fontWeight: '700' }]}>
                🌿 {lang === 'bn' ? 'শনাক্তকৃত প্রজাতি ও জাতসমূহ (ট্যাপ করে নির্বাচন করুন):' : 'Identified Botanical Species & Cultivars:'}
              </Text>
              {liveSearchResults.map((entry) => {
                const isVar = entry.isVarietyMatch;
                const matchedVar = lang === 'bn' ? entry.matchedVarietyNameBn : entry.matchedVarietyNameEn;
                const parentName = lang === 'bn' ? entry.canonicalNameBn : entry.canonicalNameEn;
                const catLabel =
                  entry.category === 'flower'
                    ? (lang === 'bn' ? '🌸 ফুল' : '🌸 Flower')
                    : entry.category === 'fruit'
                    ? (lang === 'bn' ? '🍋 ফল' : '🍋 Fruit')
                    : entry.category === 'vegetable'
                    ? (lang === 'bn' ? '🥦 সবজি' : '🥦 Vegetable')
                    : (lang === 'bn' ? '🌿 ভেষজ' : '🌿 Herb');

                return (
                  <TouchableOpacity
                    key={entry.id + (matchedVar || '')}
                    onPress={() => {
                      const selPlant = isVar ? `${matchedVar} (${parentName})` : parentName;
                      setActivePlantHint(parentName);
                      setPlantQueryInput(parentName);
                      executeAnalysis(parentName, examinedPart, scanMode);
                    }}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 13.5, fontWeight: '800', color: theme.textPrimary, fontFamily: fontFam }}>
                          {isVar ? matchedVar : parentName}
                        </Text>
                        <View style={{ backgroundColor: theme.selectedSurface, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 10.5, color: theme.primary, fontWeight: '700' }}>{catLabel}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 11.5, color: theme.textSecondary, fontFamily: fontFam, marginTop: 2 }}>
                        {isVar
                          ? (lang === 'bn'
                              ? `মূল উদ্ভিদ: ${parentName} • বৈজ্ঞানিক নাম: ${entry.scientificName}`
                              : `Parent: ${entry.canonicalNameEn} • Scientific: ${entry.scientificName}`)
                          : (lang === 'bn'
                              ? `প্রজাতি: ${entry.scientificName} • জাত: ${entry.varietiesBn.slice(0, 3).join(', ')}...`
                              : `Species: ${entry.scientificName} • Varieties: ${entry.varietiesEn.slice(0, 3).join(', ')}...`)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: theme.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', fontFamily: fontFam }}>
                        {lang === 'bn' ? 'বাছাই' : 'Select'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Quick & Live Search Suggestions (Always Visible Above Keyboard) */}
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, fontFamily: fontFam, marginTop: 10 }]}>
            {plantQueryInput.trim()
              ? (lang === 'bn' ? 'সংশ্লিষ্ট উদ্ভিদ সাজেশন (ট্যাপ করুন):' : 'Matching Plant Suggestions:')
              : (lang === 'bn' ? 'জনপ্রিয় উদ্ভিদ সাজেশন (ট্যাপ করে দ্রুত নির্বাচন করুন):' : 'Popular Plant Suggestions:')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {displayedSuggestions.map((item) => {
              const label = lang === 'bn' ? `${item.bn} (${item.en})` : `${item.en} (${item.bn})`;
              const active =
                activePlantHint.toLowerCase().includes(item.bn.toLowerCase()) ||
                activePlantHint.toLowerCase().includes(item.en.toLowerCase());
              return (
                <TouchableOpacity
                  key={item.en}
                  onPress={() => {
                    const sel = lang === 'bn' ? item.bn : item.en;
                    setPlantQueryInput(sel);
                    handleSelectSeedPlant(sel);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.seedPill,
                    {
                      backgroundColor: active ? theme.selectedSurface : theme.surfaceElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: active ? theme.primary : theme.textPrimary, fontSize: 12.5, fontWeight: '700', fontFamily: fontFam }}>
                    {item.emoji} {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Open Full Google-Style Botanical Knowledge Base Modal Button */}
          <TouchableOpacity
            onPress={() => setBotanicalSearchModalOpen(true)}
            activeOpacity={0.82}
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: theme.selectedSurface,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.primary,
            }}
          >
            <Text style={{ fontSize: 16 }}>🌐</Text>
            <Text style={{ color: theme.primary, fontSize: 12.5, fontWeight: '700', fontFamily: fontFam }}>
              {lang === 'bn'
                ? 'গ্লোবাল বোটানিক্যাল ডাটাবেজে বিস্তারিত খুঁজুন →'
                : 'Search Global Botanical Encyclopedia →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 3: Camera Capture, Photo Picker & Examined Part */}
        <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Examined Part Selector (Leaf, Fruit, Flower, Soil, Whole Plant) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="7" stroke={theme.primary} strokeWidth="2" />
              <Path d="M16.5 16.5L21 21" stroke={theme.primary} strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
            <Text style={[styles.cardHeading, { color: theme.textPrimary, fontFamily: fontFam, marginBottom: 0 }]}>
              {lang === 'bn' ? 'গাছের কোন অংশে সমস্যা? (Examined Part)' : 'Examined Plant Part:'}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 10 }}>
            {EXAMINED_PARTS.map((p) => {
              const active = examinedPart === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handleSwitchExaminedPart(p.id)}
                  style={[
                    styles.partPill,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>{p.icon}</Text>
                  <Text style={{ color: active ? '#FFFFFF' : theme.textPrimary, fontSize: 12.5, fontWeight: '700', fontFamily: fontFam }}>
                    {lang === 'bn' ? p.nameBn : p.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Live Camera Viewfinder Stream */}
          {isLiveCameraOpen && (
            <View style={[styles.liveCameraBox, { borderColor: theme.primary }]}>
              {Platform.OS === 'web' ? (
                <video
                  ref={(el) => {
                    cameraVideoRef.current = el;
                    if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                      el.srcObject = cameraStreamRef.current;
                      el.setAttribute('playsinline', 'true');
                      el.play().catch(() => { });
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              ) : (
                cameraPermission?.granted && (
                  <CameraView
                    ref={nativeCameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing={cameraFacing === 'environment' ? 'back' : 'front'}
                  />
                )
              )}

              {/* Viewfinder Target Reticle */}
              <View style={styles.cameraReticle} pointerEvents="none" />

              {/* Top Controls: Flip Camera & Close Viewfinder */}
              <View style={styles.cameraTopBar}>
                <TouchableOpacity
                  onPress={() =>
                    setCameraFacing((prev) =>
                      prev === 'environment' ? 'user' : 'environment'
                    )
                  }
                  activeOpacity={0.8}
                  style={styles.cameraCircleBtn}
                  accessibilityLabel="Flip camera"
                >
                  <Text style={{ fontSize: 16 }}>🔄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={stopLiveCamera}
                  activeOpacity={0.8}
                  style={[
                    styles.cameraCircleBtn,
                    { backgroundColor: 'rgba(239, 68, 68, 0.85)' },
                  ]}
                  accessibilityLabel="Close camera"
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#FFFFFF',
                      fontWeight: '800',
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Shutter Capture Button */}
              <View style={styles.cameraBottomBar}>
                <TouchableOpacity
                  onPress={handleCaptureSnapshot}
                  activeOpacity={0.85}
                  style={[
                    styles.shutterBtn,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>📸</Text>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: 13.5,
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn'
                      ? 'ছবি তুলুন ও ডায়াগনসিস করুন'
                      : 'Capture & Diagnose'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Hero Capture Actions: Live Camera & Gallery Upload */}
          <View style={styles.captureHeroRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCameraCapture}
              style={[
                styles.captureHeroTile,
                {
                  backgroundColor: isLiveCameraOpen
                    ? theme.primary
                    : theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.captureHeroIconCircle,
                  {
                    backgroundColor: isLiveCameraOpen
                      ? '#FFFFFF'
                      : theme.primary,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: isLiveCameraOpen ? theme.primary : '#FFFFFF',
                  }}
                >
                  📸
                </Text>
              </View>
              <Text
                style={[
                  styles.captureHeroTitle,
                  {
                    color: isLiveCameraOpen ? '#FFFFFF' : theme.textPrimary,
                    fontFamily: fontFam,
                  },
                ]}
              >
                {lang === 'bn' ? 'লাইভ ক্যামেরা স্ক্যান' : 'Live Camera Scan'}
              </Text>
              <Text
                style={[
                  styles.captureHeroSub,
                  {
                    color: isLiveCameraOpen
                      ? 'rgba(255, 255, 255, 0.9)'
                      : theme.textSecondary,
                    fontFamily: fontFam,
                  },
                ]}
              >
                {lang === 'bn'
                  ? 'ক্যামেরা দিয়ে পাতা বা ফুল ধরুন'
                  : 'Point camera at plant/leaf'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleGalleryUpload}
              style={[
                styles.captureHeroTile,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.captureHeroIconCircle,
                  { backgroundColor: theme.surface },
                ]}
              >
                <Text style={{ fontSize: 24 }}>🖼️</Text>
              </View>
              <Text
                style={[
                  styles.captureHeroTitle,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn' ? 'গ্যালারি থেকে আপলোড' : 'Gallery Upload'}
              </Text>
              <Text
                style={[
                  styles.captureHeroSub,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'সংরক্ষিত ছবি নির্বাচন করুন'
                  : 'Upload high-res photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Captured Image Preview if present */}
          {capturedImageUri && (
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Image
                source={{ uri: capturedImageUri }}
                style={styles.previewImg}
                resizeMode="cover"
              />
              <View style={styles.previewBadge}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: '800',
                  }}
                >
                  ✓ {lang === 'bn' ? 'এআই ভিশন দ্বারা বিশ্লেষিত' : 'In-App AI Vision Analyzed'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCapturedImageUri(null)}
                style={styles.previewRemoveBtn}
                accessibilityLabel="Remove photo"
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Analysis Progress Indicator */}
          {isAnalyzing && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text
                  style={[
                    styles.captionText,
                    {
                      color: theme.primary,
                      fontFamily: fontFam,
                      fontWeight: '700',
                    },
                  ]}
                >
                  ⚡ {analysisPhaseText}
                </Text>
                <Text
                  style={[styles.progressNumber, { color: theme.primary }]}
                >
                  {analysisProgress}%
                </Text>
              </View>
              <View
                style={[
                  styles.progressBarTrack,
                  { backgroundColor: theme.surfaceElevated },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${analysisProgress}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* AI & Online Diagnostic Result Box */}
        {scanResult && (
          <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Header: Plant Name, Photo Thumbnail, Scientific Name & Confidence */}
            <View style={styles.resultHeaderRow}>
              {scanResult.onlineSource.thumbnailUrl ? (
                <Image
                  source={{ uri: scanResult.onlineSource.thumbnailUrl }}
                  style={styles.resultPlantThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.resultPlantFallbackThumb, { backgroundColor: theme.selectedSurface }]}>
                  <Text style={{ fontSize: 32 }}>🌿</Text>
                </View>
              )}

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.plantIdentifiedTitle, { color: theme.textPrimary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? scanResult.plantNameBn : scanResult.plantNameEn}
                  </Text>
                  <View style={[styles.familyBadge, { backgroundColor: theme.selectedSurface, borderColor: theme.primary }]}>
                    <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>
                      {scanResult.botanicalFamily}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.scientificText, { color: theme.textSecondary }]}>
                  {scanResult.scientificName} • {lang === 'bn' ? scanResult.varietyNameBn : scanResult.varietyNameEn}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View
                    style={[
                      styles.confidencePill,
                      {
                        backgroundColor:
                          scanResult.healthState === 'healthy'
                            ? theme.selectedSurface
                            : 'rgba(217, 119, 6, 0.12)',
                        borderColor:
                          scanResult.healthState === 'healthy'
                            ? theme.primary
                            : theme.warning,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          scanResult.healthState === 'healthy'
                            ? theme.primary
                            : theme.warning,
                        fontWeight: '800',
                        fontSize: 11.5,
                        fontFamily: fontFam,
                      }}
                    >
                      ✓ {scanResult.confidence}% {lang === 'bn' ? 'নির্ভুলতা' : 'Match'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: theme.primary, fontWeight: '700' }}>
                    {scanResult.isAiVisualInference
                      ? '⚡ Gemini AI Vision'
                      : lang === 'bn'
                      ? '🌐 অনলাইন ভেরিফাইড'
                      : '🌐 Online Verified'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Variety & Parent Plant Identity Origin Banner */}
            {scanResult.isVarietyMatch && (
              <View
                style={[
                  styles.scannerVarietyBanner,
                  {
                    backgroundColor: theme.selectedSurface,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={{ fontSize: 15 }}>🌟</Text>
                  <Text
                    style={[
                      styles.scannerVarietyTitle,
                      { color: theme.primary, fontFamily: fontFam },
                    ]}
                  >
                    {lang === 'bn' ? 'জাত পরিচিতি ও মূল প্রজাতি' : 'Cultivar & Parent Botanical Species'}
                  </Text>
                  <View style={[styles.scannerVarietyChip, { backgroundColor: theme.primary }]}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                      {lang === 'bn' ? 'অনুমোদিত জাত' : 'Verified Cultivar'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.scannerVarietyDesc,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? `💡 "${scanResult.varietyNameBn}" হলো ${scanResult.plantNameBn} (${scanResult.scientificName}) উদ্ভিদের একটি সুপরিচিত জাত।`
                    : `💡 "${scanResult.varietyNameEn}" is an authentic variety of ${scanResult.plantNameEn} (${scanResult.scientificName}).`}
                </Text>
              </View>
            )}

            {/* Disease / Condition Title */}
            <View
              style={[
                styles.issueBanner,
                {
                  backgroundColor:
                    scanResult.healthState === 'healthy'
                      ? theme.selectedSurface
                      : 'rgba(217, 119, 6, 0.12)',
                  borderColor:
                    scanResult.healthState === 'healthy'
                      ? theme.primary
                      : theme.warning,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>
                {scanResult.healthState === 'healthy' ? '✅' : '⚠️'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.issueTitle,
                    {
                      color:
                        scanResult.healthState === 'healthy'
                          ? theme.primary
                          : theme.warning,
                      fontFamily: fontFam,
                    },
                  ]}
                >
                  {lang === 'bn' ? scanResult.issueTitleBn : scanResult.issueTitleEn}
                </Text>
                <Text style={[styles.pathogenText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? scanResult.pathogenOrCauseBn : scanResult.pathogenOrCauseEn}
                </Text>
              </View>
            </View>

            {/* Uncertainty Warning Banner */}
            {scanResult.uncertaintyWarning && (
              <View
                style={[
                  styles.uncertaintyBox,
                  {
                    backgroundColor: 'rgba(217, 119, 6, 0.12)',
                    borderColor: theme.warning,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>⚠️</Text>
                <Text
                  style={[
                    styles.uncertaintyText,
                    { color: '#B45309', fontFamily: fontFam },
                  ]}
                >
                  {scanResult.uncertaintyWarning}
                </Text>
              </View>
            )}

            {/* Symptoms Description */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionSubHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                📋 {lang === 'bn' ? 'লক্ষণ ও ভিজ্যুয়াল সিম্পটম:' : 'Visual Symptoms:'}
              </Text>
              <View style={[styles.detailBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <Text style={[styles.detailText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? scanResult.symptomsBn : scanResult.symptomsEn}
                </Text>
              </View>
            </View>

            {/* Step-by-Step Organic Treatments with Dosages */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionSubHeading, { color: theme.primary, fontFamily: fontFam }]}>
                💊 {lang === 'bn' ? 'সুনির্দিষ্ট জৈব ও ঘরোয়া প্রতিকার (Organic Remedies with Dosages):' : 'Step-by-Step Organic Treatments:'}
              </Text>
              <View style={{ gap: 8 }}>
                {(lang === 'bn'
                  ? scanResult.organicTreatmentsBn
                  : scanResult.organicTreatmentsEn
                ).map((remedy, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.remedyRow,
                      {
                        backgroundColor: theme.selectedSurface,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <View style={[styles.stepNumberBadge, { backgroundColor: theme.primary }]}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.remedyText, { color: theme.textPrimary, fontFamily: fontFam }]}>
                      {remedy}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Complete Maintenance & Care Instructions */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionSubHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                🌱 {lang === 'bn' ? 'ছাদবাগান পরিচর্যা নির্দেশিকা (Maintenance Guidelines):' : 'Rooftop Maintenance Guidelines:'}
              </Text>

              <View style={styles.careGrid}>
                <View style={styles.careCol}>
                  <Text style={[styles.careLabel, { color: theme.primary, fontFamily: fontFam }]}>💧 পানি (Watering):</Text>
                  <Text style={[styles.careVal, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? scanResult.careMaintenanceBn.watering : scanResult.careMaintenanceEn.watering}
                  </Text>
                </View>

                <View style={styles.careCol}>
                  <Text style={[styles.careLabel, { color: theme.primary, fontFamily: fontFam }]}>☀️ রোদ (Sunlight):</Text>
                  <Text style={[styles.careVal, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? scanResult.careMaintenanceBn.sunlight : scanResult.careMaintenanceEn.sunlight}
                  </Text>
                </View>

                <View style={styles.careCol}>
                  <Text style={[styles.careLabel, { color: theme.primary, fontFamily: fontFam }]}>🪴 মাটি ও টব (Soil & Pot):</Text>
                  <Text style={[styles.careVal, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? scanResult.careMaintenanceBn.soilAndContainer : scanResult.careMaintenanceEn.soilAndContainer}
                  </Text>
                </View>

                <View style={styles.careCol}>
                  <Text style={[styles.careLabel, { color: theme.primary, fontFamily: fontFam }]}>✂️ প্রুনিং (Pruning):</Text>
                  <Text style={[styles.careVal, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? scanResult.careMaintenanceBn.pruning : scanResult.careMaintenanceEn.pruning}
                  </Text>
                </View>
              </View>
            </View>

            {/* Sister Varieties of Parent Plant */}
            {scanResult.availableVarietiesBn && scanResult.availableVarietiesBn.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionSubHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  🏷️ {lang === 'bn' ? `${scanResult.plantNameBn}-এর সকল অনুমোদিত জাতসমূহ (${scanResult.availableVarietiesBn.length}টি জাত):` : `All Recognized Cultivars of ${scanResult.plantNameEn} (${scanResult.availableVarietiesBn.length}):`}
                </Text>
                <View style={styles.scannerVarietiesWrap}>
                  {(lang === 'bn' ? scanResult.availableVarietiesBn : scanResult.availableVarietiesEn || scanResult.availableVarietiesBn).map((vName, vIdx) => {
                    const isCurrent = (lang === 'bn' ? scanResult.varietyNameBn : scanResult.varietyNameEn) === vName || scanResult.varietyNameBn.includes(vName) || vName.includes(scanResult.varietyNameBn);
                    return (
                      <View
                        key={vIdx}
                        style={[
                          styles.scannerVarietyPill,
                          {
                            backgroundColor: isCurrent ? theme.selectedSurface : theme.surfaceElevated,
                            borderColor: isCurrent ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: isCurrent ? theme.primary : theme.textPrimary,
                            fontWeight: isCurrent ? '700' : '500',
                            fontSize: 12,
                            fontFamily: fontFam,
                          }}
                        >
                          {isCurrent ? '✓ ' : ''}
                          {vName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Live Online Sourced Knowledge Card (Wikipedia REST API) */}
            <View style={[styles.onlineSourceCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <View style={styles.onlineSourceCenterHeader}>
                <View style={styles.onlineSourceTitleRow}>
                  <Text style={{ fontSize: 16 }}>🌐</Text>
                  <Text style={[styles.sourceTagCentered, { color: theme.primary, fontFamily: fontFam }]}>
                    {lang === 'bn'
                      ? 'উইকিপিডিয়া বোটানিক্যাল এনসাইক্লোপিডিয়া'
                      : 'Wikipedia Botanical Encyclopedia'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleOpenOnlineSource}
                  activeOpacity={0.75}
                  style={styles.wikiLinkBtn}
                >
                  <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                    {lang === 'bn' ? 'উইকিপিডিয়া দেখুন ↗' : 'View Wikipedia ↗'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sourceSummary, { color: theme.textSecondary, fontFamily: fontFam }]}>
                "{lang === 'bn' ? scanResult.onlineSource.summaryBn : scanResult.onlineSource.summaryEn}"
              </Text>
            </View>

            {/* DAE Bangladesh Krishi Call Center Helpline Touchpoint */}
            {scanResult.expertConsultContact && (
              <View
                style={[
                  styles.expertCard,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontSize: 24 }}>👨‍🌾</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[
                        styles.expertTitle,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'সরকারি কৃষি কর্মকর্তার পরামর্শ'
                        : 'Agricultural Extension Expert Support'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.expertSub,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? scanResult.expertConsultContact.serviceNameBn
                        : scanResult.expertConsultContact.serviceNameEn}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      Linking.openURL(
                        `tel:${scanResult.expertConsultContact?.hotline || '16123'}`
                      )
                    }
                    style={[styles.callBtn, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.callBtnText}>
                      📞 {scanResult.expertConsultContact.hotline}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action 1: Add Plant to Garden */}
            {onAddNewPlant && (
              <TouchableOpacity
                onPress={handleAddScannedPlantToGarden}
                activeOpacity={0.85}
                style={[styles.addGardenBtn, { backgroundColor: theme.selectedSurface, borderColor: theme.primary }]}
              >
                <Text style={{ fontSize: 18 }}>🌱</Text>
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 14, fontFamily: fontFam }}>
                  + {lang === 'bn' ? 'বাগানে গাছ যুক্ত করুন' : 'Add Plant to Garden'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty / Welcome Guide Card if no scan result yet */}
        {!scanResult && (
          <View
            style={[
              styles.mainCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                alignItems: 'center',
                paddingVertical: 26,
                paddingHorizontal: 16,
              },
            ]}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.selectedSurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 32 }}>🌱</Text>
            </View>
            <Text
              style={[
                styles.cardHeading,
                { color: theme.textPrimary, fontFamily: fontFam, textAlign: 'center', marginBottom: 6 },
              ]}
            >
              {lang === 'bn'
                ? 'গাছের পাতার ছবি তুলুন অথবা উদ্ভিদ নির্বাচন করুন'
                : 'Capture Leaf Photo or Select Plant'}
            </Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: fontFam,
                textAlign: 'center',
                fontSize: 12.5,
                lineHeight: 18,
                maxWidth: 440,
              }}
            >
              {lang === 'bn'
                ? 'ক্যামেরা দিয়ে আক্রান্ত পাতা বা ফলের স্পষ্ট ছবি তুলে তাৎক্ষণিক এআই রোগ নির্ণয় করুন অথবা উপরের বক্সে যেকোনো গাছের নাম লিখে বৈজ্ঞানিক জাত ও জৈব চিকিৎসা জানুন।'
                : 'Capture a photo of an affected leaf for instant AI pathology diagnosis, or search any plant or variety name above.'}
            </Text>
          </View>
        )}
      </View>

      {/* Global Botanical Knowledge & Variety Search Modal */}
      <BotanicalSearchModal
        visible={botanicalSearchModalOpen}
        onClose={() => setBotanicalSearchModalOpen(false)}
        theme={theme}
        lang={lang}
        initialQuery={plantQueryInput}
        onSelectPlantToAdd={(preset) => {
          setBotanicalSearchModalOpen(false);
          setActivePlantHint(preset.nameBn);
          setPlantQueryInput(preset.nameBn);
          executeAnalysis(preset.nameBn, examinedPart, scanMode);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollOuter: {
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: 960,
    paddingHorizontal: 14,
    gap: 14,
    paddingBottom: 90,
  },
  mainCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  captionText: {
    fontSize: 12,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modeCol: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
    width: '100%',
  },
  modeBtnFull: {
    width: '100%',
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  captureHeroRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  captureHeroTile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  captureHeroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  captureHeroTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  captureHeroSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  previewBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginTop: 6,
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  liveCameraBox: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cameraReticle: {
    width: 170,
    height: 170,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 14,
    borderStyle: 'dashed',
  },
  cameraTopBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBottomBar: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shutterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeading: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  activeHintBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  plantHintInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    height: 46,
    gap: 6,
    marginTop: 4,
    width: '100%',
    overflow: 'hidden',
  },
  inputLeftIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  plantHintInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 13,
    paddingVertical: 0,
    margin: 0,
  },
  clearBtnAnchored: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  plantHintSearchBtn: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  partPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  seedPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  resultPlantThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#00000010',
  },
  resultPlantFallbackThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantIdentifiedTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  familyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  scientificText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  confidencePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  issueBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  issueTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  pathogenText: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionSubHeading: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  remedyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remedyText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  careGrid: {
    gap: 8,
  },
  careCol: {
    gap: 2,
  },
  careLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  careVal: {
    fontSize: 12,
    lineHeight: 17,
  },
  onlineSourceCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  onlineSourceCenterHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  onlineSourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
    width: '100%',
  },
  sourceTagCentered: {
    fontSize: 13.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  wikiLinkBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  sourceSummary: {
    fontSize: 11.5,
    lineHeight: 17,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  addGardenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
  },
  uncertaintyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  uncertaintyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  expertCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  expertTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  expertSub: {
    fontSize: 11,
    marginTop: 2,
  },
  callBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  scannerVarietyBanner: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
    marginBottom: 8,
  },
  scannerVarietyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  scannerVarietyChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scannerVarietyDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  scannerVarietiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scannerVarietyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
});
