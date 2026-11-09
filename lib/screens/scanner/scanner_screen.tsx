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
import React, { useEffect, useRef, useState } from 'react';
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
import { QrCameraScannerModal } from '../../core/components/qr_camera_scanner_modal';

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
  onOpenQrScannerTab?: () => void;
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

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  theme,
  lang,
  plants,
  onSaveScanToPlant,
  onSelectPlant,
  onAddNewPlant,
  onOpenQrScannerTab,
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>('diagnose');
  const [examinedPart, setExaminedPart] = useState<ExaminedPart>('leaf');
  const [activePlantHint, setActivePlantHint] = useState<string>('গোলাপ');
  const [plantQueryInput, setPlantQueryInput] = useState<string>('');
  const [targetPlantId, setTargetPlantId] = useState<string>(plants[0]?.id || '');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  // Analysis Progress State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<number>(100);
  const [analysisPhaseText, setAnalysisPhaseText] = useState<string>('');

  // Active Scan Result from AI Service
  const [scanResult, setScanResult] = useState<ComprehensiveScanResult | null>(null);

  // Live Camera Scanner State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const cameraVideoRef = useRef<any>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Live QR Camera Scanner Modal State
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

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

  // Run initial analysis on mount
  useEffect(() => {
    executeAnalysis(activePlantHint, examinedPart, scanMode);
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
          cameraVideoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn('Camera stream error, using fallback:', err);
        handleNativeCameraFallback();
      }
    } else {
      handleNativeCameraFallback();
    }
  };

  const stopLiveCamera = () => {
    if (cameraStreamRef.current) {
      try {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      cameraStreamRef.current = null;
    }
    setIsLiveCameraOpen(false);
  };

  const handleCaptureSnapshot = () => {
    if (cameraVideoRef.current) {
      const video = cameraVideoRef.current;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedImageUri(dataUrl);
          stopLiveCamera();
          executeAnalysis(activePlantHint, examinedPart, scanMode, dataUrl);
          return;
        }
      } catch (e) {
        console.warn('Snapshot capture error', e);
      }
    }
    stopLiveCamera();
  };

  const handleNativeCameraFallback = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        setCapturedImageUri(uri);
        executeAnalysis(activePlantHint, examinedPart, scanMode, uri);
      }
    } catch (e) {
      console.warn('Camera capture error', e);
    }
  };

  const executeAnalysis = async (
    plantIdentifier: string,
    part: ExaminedPart,
    mode: ScanMode,
    customUri?: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisProgress(20);
    setAnalysisPhaseText(
      lang === 'bn'
        ? '১. ইমেজ কালার স্পেকট্রাম ও টেক্সচার বিশ্লেষণ হচ্ছে...'
        : '1. Extracting visual leaf morphology & image vectors...'
    );

    const timer1 = setTimeout(() => {
      setAnalysisProgress(60);
      setAnalysisPhaseText(
        lang === 'bn'
          ? '২. গ্লোবাল ইন্টারনেট ও উইকিপিডিয়া ক্লাউড অনুসন্ধান হচ্ছে...'
          : '2. Querying global Wikipedia Botanical Cloud & scientific repository...'
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
          imageUri: customUri || capturedImageUri || '',
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
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const uri = res.assets[0].uri;
        setCapturedImageUri(uri);
        executeAnalysis(activePlantHint, examinedPart, scanMode, uri);
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
                    ? 'অনলাইন এআই প্ল্যান্ট ডায়াগনোসিস ও স্ক্যানার'
                    : 'Online AI Plant Diagnosis & Global Scanner'}
                </Text>
              </View>
              <Text style={[styles.captionText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn'
                  ? 'বিশ্বের যেকোনো ফুল, ফল বা গাছের ছবি তুলুন—গুগল লেন্স ও উইকিপিডিয়া ক্লাউডের মাধ্যমে জাত ও রোগ নির্ণয় করুন।'
                  : 'Point camera or upload image of any plant globally for online taxonomy identification & organic pathology remedies.'}
              </Text>
            </View>

            {/* Direct 1-Tap QR Camera Scanner Trigger */}
            <TouchableOpacity
              onPress={() => setQrModalVisible(true)}
              style={[
                styles.qrSwitchPill,
                {
                  backgroundColor: theme.selectedSurface,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 13,
                  fontWeight: '700',
                  fontFamily: fontFam,
                }}
              >
                📷 {lang === 'bn' ? 'QR ট্যাগ স্ক্যান' : 'QR Tag Scan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher: Disease Diagnosis vs Species Identifier */}
          <View style={styles.modeRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleSwitchMode('diagnose')}
              style={[
                styles.modeBtn,
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
                    fontSize: 12.5,
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
                styles.modeBtn,
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
                    fontSize: 12.5,
                    fontFamily: fontFam,
                    textAlign: 'center',
                  }}
                >
                  {lang === 'bn' ? 'জাত ও প্রজাতি' : 'Species Identifier'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Live Camera Viewfinder Stream */}
          {isLiveCameraOpen && (
            <View style={[styles.liveCameraBox, { borderColor: theme.primary }]}>
              {Platform.OS === 'web' && (
                <video
                  ref={(el) => {
                    cameraVideoRef.current = el;
                    if (el && cameraStreamRef.current && el.srcObject !== cameraStreamRef.current) {
                      el.srcObject = cameraStreamRef.current;
                      el.setAttribute('playsinline', 'true');
                      el.play().catch(() => {});
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

        {/* Global Botanical Plant Selector & Online Search Input */}
        <View style={[styles.mainCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="9" stroke={theme.primary} strokeWidth="2" />
              <Path d="M3 12H21" stroke={theme.primary} strokeWidth="1.8" />
              <Path d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21C9.5 18.5 8.5 15.5 8.5 12C8.5 8.5 9.5 5.5 12 3Z" stroke={theme.primary} strokeWidth="1.8" />
            </Svg>
            <Text style={[styles.cardHeading, { color: theme.textPrimary, fontFamily: fontFam, marginBottom: 0 }]}>
              {lang === 'bn' ? 'কোন উদ্ভিদ বা প্রজাতির রোগ নির্ণয় করবেন? (Global Search)' : 'Target Plant or Species (Global Search):'}
            </Text>
          </View>

          {/* Plant Search / Input Box */}
          <View style={[styles.plantHintInputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="7" stroke={theme.textSecondary} strokeWidth="2" />
              <Path d="M16.5 16.5L21 21" stroke={theme.textSecondary} strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
            <TextInput
              value={plantQueryInput}
              onChangeText={setPlantQueryInput}
              onSubmitEditing={() => handlePlantQuerySubmit(plantQueryInput)}
              placeholder={
                lang === 'bn'
                  ? 'গাছের নাম লিখুন (যেমন: গোলাপ, জবা, গাঁদা, স্ট্রবেরি, ড্রাগন ফল, ক্যাকটাস, তুলসী, মরিচ)...'
                  : 'Enter any plant name (e.g. Rose, Hibiscus, Strawberry, Dragon fruit, Cactus, Tulsi)...'
              }
              placeholderTextColor={theme.textSecondary}
              style={[styles.plantHintInput, { color: theme.textPrimary, fontFamily: fontFam }]}
            />
            {plantQueryInput ? (
              <TouchableOpacity onPress={() => setPlantQueryInput('')} style={{ padding: 4 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => handlePlantQuerySubmit(plantQueryInput)}
              style={[styles.plantHintSearchBtn, { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', gap: 5 }]}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx="11" cy="11" r="7" stroke="#FFFFFF" strokeWidth="2.2" />
                <Path d="M16.5 16.5L21 21" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12.5, fontFamily: fontFam }}>
                {lang === 'bn' ? 'সার্চ' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Plant Species Chips */}
          <Text style={[styles.fieldLabel, { color: theme.textSecondary, fontFamily: fontFam, marginTop: 10 }]}>
            {lang === 'bn' ? 'জনপ্রিয় উদ্ভিদ সাজেশন (ট্যাপ করে তাৎক্ষণিক রোগ বা জাত দেখুন):' : 'Popular Plant Suggestions:'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {[
              'গোলাপ (Rose)',
              'গাঁদা (Marigold)',
              'জবা (Hibiscus)',
              'ড্রাগন ফল',
              'স্ট্রবেরি (Strawberry)',
              'আম (Mango)',
              'মাল্টা (Malta)',
              'পেয়ারা (Guava)',
              'টমেটো (Tomato)',
              'লাউ ও শসা',
              'ক্যাকটাস (Cactus)',
              'তুলসী (Tulsi)',
              'অর্কিড (Orchid)',
            ].map((chip) => {
              const term = chip.split(' ')[0].replace(/[()]/g, '');
              const active = activePlantHint.toLowerCase().includes(term.toLowerCase());
              return (
                <TouchableOpacity
                  key={chip}
                  onPress={() => handleSelectSeedPlant(term)}
                  style={[
                    styles.seedPill,
                    {
                      backgroundColor: active ? theme.selectedSurface : theme.surfaceElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: active ? theme.primary : theme.textPrimary, fontSize: 12.5, fontWeight: '700', fontFamily: fontFam }}>
                    🌱 {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Examined Part Selector (Leaf, Fruit, Flower, Soil, Whole Plant) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 }}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="7" stroke={theme.primary} strokeWidth="2" />
              <Path d="M16.5 16.5L21 21" stroke={theme.primary} strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
            <Text style={[styles.cardHeading, { color: theme.textPrimary, fontFamily: fontFam, marginBottom: 0 }]}>
              {lang === 'bn' ? 'গাছের কোন অংশে সমস্যা? (Examined Part)' : 'Examined Plant Part:'}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
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
                    🌐 {lang === 'bn' ? 'অনলাইন ক্লাউড ভেরিফাইড' : 'Online Verified'}
                  </Text>
                </View>
              </View>
            </View>

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

            {/* Live Online Sourced Knowledge Card (Wikipedia REST API) */}
            <View style={[styles.onlineSourceCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 16 }}>🌐</Text>
                  <Text style={[styles.sourceTag, { color: theme.primary, fontFamily: fontFam }]}>
                    {scanResult.onlineSource.sourceName}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleOpenOnlineSource} activeOpacity={0.75}>
                  <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700', fontFamily: fontFam }}>
                    {lang === 'bn' ? 'উইকিপিডিয়া দেখুন ↗' : 'View Wikipedia ↗'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sourceSummary, { color: theme.textSecondary, fontFamily: fontFam }]}>
                "{lang === 'bn' ? scanResult.onlineSource.summaryBn : scanResult.onlineSource.summaryEn}"
              </Text>
            </View>

            {/* Action 1: Add Newly Identified Plant to My Garden */}
            {onAddNewPlant && (
              <TouchableOpacity
                onPress={handleAddScannedPlantToGarden}
                activeOpacity={0.85}
                style={[styles.addGardenBtn, { backgroundColor: theme.selectedSurface, borderColor: theme.primary }]}
              >
                <Text style={{ fontSize: 18 }}>🌱</Text>
                <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 14, fontFamily: fontFam }}>
                  + {lang === 'bn' ? 'এই গাছটি আমার ছাদবাগানে যুক্ত করুন' : 'Add This Plant to My Garden'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Action 2: Save Report to Plant History */}
            {plants.length > 0 && (
              <View style={styles.saveSection}>
                <Text style={[styles.captionText, { color: theme.textSecondary, fontWeight: '700', fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'কোন গাছের ইতিহাসে এই রিপোর্ট সংরক্ষণ করবেন?' : 'Log this diagnosis to plant history:'}
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
                  {plants.map((p) => {
                    const active = p.id === targetPlantId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setTargetPlantId(p.id)}
                        style={[
                          styles.plantChip,
                          {
                            backgroundColor: active ? theme.primary : theme.surfaceElevated,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={{ color: active ? '#FFFFFF' : theme.textPrimary, fontSize: 13, fontWeight: '600', fontFamily: fontFam }}>
                          🌱 {lang === 'bn' ? p.nameBengali : p.nameEnglish}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => {
                    if (onSaveScanToPlant && targetPlantId) {
                      onSaveScanToPlant(
                        targetPlantId,
                        scanResult.issueTitleBn,
                        scanResult.issueTitleEn,
                        scanResult.organicTreatmentsBn[0] || 'জৈব প্রতিকার সম্পন্ন',
                        scanResult.organicTreatmentsEn[0] || 'Organic remedy applied',
                        scanResult.healthState
                      );
                      Alert.alert(
                        lang === 'bn' ? '✓ টাইমলাইনে সংরক্ষিত' : '✓ Saved to Plant History',
                        lang === 'bn'
                          ? 'এআই ডায়াগনোসিস ফলাফলটি গাছের পরিচর্যা ইতিহাসে সংরক্ষিত হয়েছে।'
                          : 'Diagnostic report logged to plant timeline.'
                      );
                    }
                  }}
                  activeOpacity={0.85}
                  style={[styles.prominentSaveBtn, { backgroundColor: theme.primary }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18 }}>💾</Text>
                    <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: 14.5, fontWeight: '700', fontFamily: fontFam }]}>
                      {lang === 'bn'
                        ? 'আক্রান্ত গাছের টাইমলাইনে রিপোর্ট সংরক্ষণ করুন'
                        : 'Save Report to Plant History'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Responsive Live Camera & Gallery QR Scanner Modal */}
      <QrCameraScannerModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        plants={plants}
        onScanSuccess={(plant) => {
          setQrModalVisible(false);
          if (onSelectPlant) onSelectPlant(plant);
        }}
        theme={theme}
        lang={lang}
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
  qrSwitchPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    width: '100%',
  },
  modeBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
  plantHintInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginTop: 4,
  },
  plantHintInput: {
    flex: 1,
    fontSize: 12.5,
    height: '100%',
  },
  plantHintSearchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sourceTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  sourceSummary: {
    fontSize: 11.5,
    lineHeight: 17,
    fontStyle: 'italic',
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
  saveSection: {
    gap: 8,
    marginTop: 4,
  },
  plantChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  prominentSaveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
