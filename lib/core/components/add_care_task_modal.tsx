/**
 * BAGANI — Schedule Plant Care Task Modal (AddCareTaskModal)
 * Developer: ProFix - Web & Soft
 *
 * Fully supports user requirements:
 * 1. Select specific plants from the garden (or entire garden)
 * 2. Specify Nature of the task (Watering, Fertilizer, Pest Control, Pruning, Soil Aeration, Sunlight)
 * 3. Required Action steps (e.g. 5ml neem oil in 1L water)
 * 4. Exact Reasoning behind the task (e.g. prevent leaf curl, boost flowering)
 * 5. Scheduled Date & Time Slot (Morning, Noon, Evening)
 * 6. Automated Push Notification scheduling for the designated date/time
 */

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../theme/app_theme';
import {
  CareTaskType,
  GranularCareTask,
  TimeOfDaySlot,
} from '../../models/care_schedule_model';
import { PlantModel } from '../../models/plant_model';
import { NotificationService } from '../../services/notification_service';
import { PlantSelectorDropdown } from './plant_selector_dropdown';

interface AddCareTaskModalProps {
  visible: boolean;
  onClose: () => void;
  plants: PlantModel[];
  onSaveTask: (newTask: GranularCareTask) => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

interface NatureTemplate {
  type: CareTaskType;
  icon: string;
  nameBn: string;
  nameEn: string;
  defaultTitleBn: string;
  defaultTitleEn: string;
  defaultActionBn: string;
  defaultActionEn: string;
  defaultReasonBn: string;
  defaultReasonEn: string;
  defaultLiters?: number;
  recommendedSlot: TimeOfDaySlot;
}

const CARE_TASK_NATURES: NatureTemplate[] = [
  {
    type: 'watering',
    icon: '💧',
    nameBn: 'পরিমিত সেচ (Watering)',
    nameEn: 'Watering',
    defaultTitleBn: 'গাছের গোড়ায় পরিমিত সেচ',
    defaultTitleEn: 'Morning Plant Watering',
    defaultActionBn: 'টবের ড্রেনেজ দিয়ে পানি বের না হওয়া পর্যন্ত মাটির আর্দ্রতা অনুযায়ী ১.৫–২.০ লিটার পানি দিন।',
    defaultActionEn: 'Apply 1.5–2.0 liters of clean water according to soil moisture level.',
    defaultReasonBn: 'মাটির আর্দ্রতা ৩০%-৪০% বজায় রাখা ও শিকড়ের স্বাভাবিক পুষ্টি গ্রহণ অব্যাহত রাখতে।',
    defaultReasonEn: 'Maintain 30%-40% root-zone moisture for vital nutrient uptake.',
    defaultLiters: 1.8,
    recommendedSlot: 'morning',
  },
  {
    type: 'fertilizer',
    icon: '🧪',
    nameBn: 'জৈব সার প্রয়োগ (Fertilizer)',
    nameEn: 'Fertilizer',
    defaultTitleBn: 'ভার্মিকম্পোস্ট ও হাড়ের গুঁড়া মিশ্রণ প্রয়োগ',
    defaultTitleEn: 'Apply Vermicompost & Bio-Nutrition',
    defaultActionBn: 'টবের ওপরের ২ ইঞ্চি মাটি আলগা করে ২০০ গ্রাম ভার্মিকম্পোস্ট ও ১ চামচ হাড়ের গুঁড়া মিশিয়ে পানি দিন।',
    defaultActionEn: 'Loosen top 2 inches of soil, blend 200g vermicompost + 1 tbsp bone meal, and water lightly.',
    defaultReasonBn: 'গাছের নতুন কান্ড গঠন, অনুখাদ্য সরবরাহ ও শিকড়ের দীর্ঘমেয়াদি শক্তি বৃদ্ধির জন্য।',
    defaultReasonEn: 'Provide balanced slow-release micronutrients to invigorate new shoot development.',
    recommendedSlot: 'afternoon',
  },
  {
    type: 'pest_control',
    icon: '🛡️',
    nameBn: 'বালাই ও রোগ দমন (Pest Control)',
    nameEn: 'Pest Control',
    defaultTitleBn: 'পাতা কোঁকড়ানো ও পোকা দমনে নিম তেল স্প্রে',
    defaultTitleEn: 'Organic Neem Oil Folia Spray',
    defaultActionBn: '১ লিটার পানিতে ৫ মিলি কোল্ড-প্রেসড নিম তেল ও ২ ফোঁটা তরল সাবান গুলে পাতার উপরে ও উল্টো পিঠে স্প্রে করুন।',
    defaultActionEn: 'Mix 5ml cold-pressed neem oil + 2 drops mild soap in 1L water; spray thoroughly under foliage.',
    defaultReasonBn: 'জাবপোকা, মিলিবাগ ও ছত্রাকের আক্রমণ প্রতিরোধ এবং কচি পাতার সুরক্ষা নিশ্চিত করতে।',
    defaultReasonEn: 'Prevent aphid, mealybug, and fungal infestations to safeguard tender growth.',
    recommendedSlot: 'evening',
  },
  {
    type: 'pruning',
    icon: '✂️',
    nameBn: 'ছাঁটাই ও প্রুনিং (Pruning)',
    nameEn: 'Pruning',
    defaultTitleBn: 'শুকনো ডাল ও রোগাক্রান্ত পাতা ছাঁটাই',
    defaultTitleEn: 'Sanitary & Canopy Pruning',
    defaultActionBn: 'জীবাণুমুক্ত কাঁচি দিয়ে শুকনা, হলুদ পাতা ও ক্রস-ব্রাঞ্চ ৪৫ ডিগ্রি কোণে কাটুন এবং কাটার মুখে ফাঙ্গিসাইড পেস্ট লাগান।',
    defaultActionEn: 'Sterilize shear, cut dead or crossing branches at 45° angle, and apply organic fungicide paste.',
    defaultReasonBn: 'ক্যানোপির ভেতর পর্যাপ্ত সূর্যালোক ও বায়ু চলাচল বৃদ্ধি করে ফাঙ্গাল ইনফেকশন কমাতে।',
    defaultReasonEn: 'Improve canopy aeration and sunlight penetration to eliminate fungal spore pockets.',
    recommendedSlot: 'morning',
  },
  {
    type: 'soil_work',
    icon: '🪴',
    nameBn: 'নিড়ানি ও মাটি খোঁচানো (Soil Aeration)',
    nameEn: 'Soil Aeration',
    defaultTitleBn: 'টবের মাটি হালকা খোঁচানো ও আগাছা দমন',
    defaultTitleEn: 'Pot Soil Aeration & Weeding',
    defaultActionBn: 'টবের পার্শ্ববর্তী মাটি নিড়ানি দিয়ে ২ ইঞ্চি গভীরে আলগা করুন যাতে শিকড় না কাটে এবং আগাছা তুলে ফেলুন।',
    defaultActionEn: 'Gently cultivate top 2 inches with a hand fork avoiding main taproot, clear all weeds.',
    defaultReasonBn: 'মাটিতে বায়ু চলাচল বাড়ানো, শিকড়ের অক্সিজেনের অভাব দূর করা ও ক্ষতিকর শ্যাওলা দূর করতে।',
    defaultReasonEn: 'Improve rhizosphere oxygenation and prevent topsoil crusting and algal growth.',
    recommendedSlot: 'morning',
  },
  {
    type: 'sunlight',
    icon: '☀️',
    nameBn: 'স্থান ও রোদ পরিবর্তন (Sunlight Rotation)',
    nameEn: 'Sunlight Rotation',
    defaultTitleBn: 'পর্যাপ্ত রোদের জন্য টবের স্থান পরিবর্তন',
    defaultTitleEn: 'Rotate Pot for Balanced Sunlight',
    defaultActionBn: 'টবটিকে ৯০ ডিগ্রি ঘুরিয়ে দক্ষিণ-পূর্ব কোণের পূর্ণ রোদযুক্ত স্থানে স্থানান্তর করুন।',
    defaultActionEn: 'Rotate container 90 degrees to face morning south-east sun for balanced canopy development.',
    defaultReasonBn: 'গাছের একমুখী বৃদ্ধি রোধ করা ও ক্লোরোফিল তৈরিতে সুষম সূর্যালোক নিশ্চিত করতে।',
    defaultReasonEn: 'Prevent phototropism leaning and maximize photosynthetic chlorophyll synthesis.',
    recommendedSlot: 'morning',
  },
  {
    type: 'general',
    icon: '📌',
    nameBn: 'অন্যান্য কাস্টম কাজ (Custom Task)',
    nameEn: 'Custom Task',
    defaultTitleBn: 'বিশেষ পরিচর্যা ও তদারকি',
    defaultTitleEn: 'Special Care & Inspection',
    defaultActionBn: 'গাছের সার্বিক বৃদ্ধি ও টবের ড্রেনেজ পর্যবেক্ষণ করে প্রয়োজনীয় পদক্ষেপ গ্রহণ করুন।',
    defaultActionEn: 'Inspect overall plant vitality, soil drainage holes, and take necessary measures.',
    defaultReasonBn: 'গাছের সুস্থতা যাচাই ও আগাম রোগবালাই শনাক্ত করতে।',
    defaultReasonEn: 'Proactively monitor health and prevent unexpected planting setbacks.',
    recommendedSlot: 'afternoon',
  },
];

const REASON_CHIPS_BN = [
  '🌿 নতুন পাতা ও বৃদ্ধির জন্য',
  '🐛 পোকা ও রোগবালাই প্রতিরোধে',
  '🌸 ফুল ও ফল ঝরা বন্ধ করতে',
  '💧 মাটির আর্দ্রতা সামঞ্জস্য রাখতে',
  '☀️ সূর্যালোক ও বাতাস চলাচলে',
];

const REASON_CHIPS_EN = [
  '🌿 Vital shoot growth',
  '🐛 Pest & blight prevention',
  '🌸 Prevent flower/fruit drop',
  '💧 Optimal moisture balance',
  '☀️ Aeration & sunlight access',
];

export const AddCareTaskModal: React.FC<AddCareTaskModalProps> = ({
  visible,
  onClose,
  plants,
  onSaveTask,
  theme,
  lang,
}) => {
  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Selected Plant: 'all' or plant ID
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0]?.id || 'all'
  );
  // Plant dropdown open state & search query
  const [isPlantDropdownOpen, setIsPlantDropdownOpen] = useState<boolean>(false);
  const [plantFilterQuery, setPlantFilterQuery] = useState<string>('');

  const selectedPlantObj =
    selectedPlantId === 'all'
      ? null
      : plants.find((p) => p.id === selectedPlantId) || null;

  const selectedPlantIcon =
    selectedPlantId === 'all'
      ? '🏡'
      : selectedPlantObj?.category === 'fruit'
      ? '🍋'
      : selectedPlantObj?.category === 'flower'
      ? '🌸'
      : '🌿';

  const selectedPlantTitle =
    selectedPlantId === 'all'
      ? lang === 'bn'
        ? 'সম্পূর্ণ বাগান (সকল গাছ)'
        : 'Whole Garden (All Plants)'
      : lang === 'bn'
      ? `${selectedPlantObj?.nameBengali || ''} (${selectedPlantObj?.nameEnglish || ''})`
      : `${selectedPlantObj?.nameEnglish || ''} (${selectedPlantObj?.nameBengali || ''})`;

  const selectedPlantSubtitle =
    selectedPlantId === 'all'
      ? lang === 'bn'
        ? 'বাগানের সকল গাছে একযোগে প্রযোজ্য'
        : 'Applies to all plants in garden'
      : `${selectedPlantObj?.variety || 'দেশি জাত'} • ${selectedPlantObj?.rooftopZone || 'ছাদ বাগান'}`;

  const filteredPlants = plants.filter((p) => {
    if (!plantFilterQuery.trim()) return true;
    const q = plantFilterQuery.toLowerCase();
    return (
      p.nameBengali.toLowerCase().includes(q) ||
      p.nameEnglish.toLowerCase().includes(q) ||
      (p.variety && p.variety.toLowerCase().includes(q)) ||
      (p.rooftopZone && p.rooftopZone.toLowerCase().includes(q))
    );
  });

  // Task Nature
  const [selectedNature, setSelectedNature] = useState<CareTaskType>('watering');

  // Task Form Fields
  const [taskTitle, setTaskTitle] = useState<string>(
    lang === 'bn'
      ? CARE_TASK_NATURES[0].defaultTitleBn
      : CARE_TASK_NATURES[0].defaultTitleEn
  );
  const [actionDetails, setActionDetails] = useState<string>(
    lang === 'bn'
      ? CARE_TASK_NATURES[0].defaultActionBn
      : CARE_TASK_NATURES[0].defaultActionEn
  );
  const [reasoning, setReasoning] = useState<string>(
    lang === 'bn'
      ? CARE_TASK_NATURES[0].defaultReasonBn
      : CARE_TASK_NATURES[0].defaultReasonEn
  );
  const [waterLiters, setWaterLiters] = useState<string>('1.8');
  const [timeSlot, setTimeSlot] = useState<TimeOfDaySlot>('morning');

  // Date selection (Offset in days from today)
  const [dateOffsetDays, setDateOffsetDays] = useState<number>(0);
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

  // Push Notification state
  const [enableNotification, setEnableNotification] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Switch nature templates automatically
  const handleSelectNature = (nature: NatureTemplate) => {
    setSelectedNature(nature.type);
    setTaskTitle(lang === 'bn' ? nature.defaultTitleBn : nature.defaultTitleEn);
    setActionDetails(
      lang === 'bn' ? nature.defaultActionBn : nature.defaultActionEn
    );
    setReasoning(
      lang === 'bn' ? nature.defaultReasonBn : nature.defaultReasonEn
    );
    setTimeSlot(nature.recommendedSlot);
    if (nature.defaultLiters) {
      setWaterLiters(nature.defaultLiters.toString());
    }
  };

  const computeScheduledDateIso = (): string => {
    if (isCustomDate && customDateInput.trim()) {
      const parsed = new Date(customDateInput.trim());
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    const d = new Date();
    d.setDate(d.getDate() + dateOffsetDays);
    return d.toISOString();
  };

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      Alert.alert(
        lang === 'bn' ? 'কাজের নাম লিখুন' : 'Task Title Required',
        lang === 'bn'
          ? 'অনুগ্রহ করে পরিচর্যার কাজের একটি নাম দিন।'
          : 'Please enter a title for this care task.'
      );
      return;
    }

    if (!actionDetails.trim()) {
      Alert.alert(
        lang === 'bn' ? 'পদক্ষেপ লিখুন' : 'Action Details Required',
        lang === 'bn'
          ? 'অনুগ্রহ করে কী করতে হবে সেই পদক্ষেপ উল্লেখ করুন।'
          : 'Please describe the action steps.'
      );
      return;
    }

    setIsSubmitting(true);

    const chosenPlant =
      selectedPlantId === 'all'
        ? null
        : plants.find((p) => p.id === selectedPlantId);

    const plantNameBn = chosenPlant
      ? chosenPlant.nameBengali
      : 'সম্পূর্ণ বাগান (সকল গাছ)';
    const plantNameEn = chosenPlant
      ? chosenPlant.nameEnglish
      : 'All Garden Plants';

    const scheduledDateIso = computeScheduledDateIso();

    const newTask: GranularCareTask = {
      id: 'tsk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      plantId: chosenPlant ? chosenPlant.id : 'all_garden_plants',
      plantNameBengali: plantNameBn,
      plantNameEnglish: plantNameEn,
      dueDateIso: scheduledDateIso,
      isUrgentNext3Days: dateOffsetDays <= 3,
      recommendedTimeSlot: timeSlot,
      taskType: selectedNature,
      titleBengali: taskTitle.trim(),
      titleEnglish: taskTitle.trim(),
      actionDetailsBengali: actionDetails.trim(),
      actionDetailsEnglish: actionDetails.trim(),
      fertilizerOrSprayInstructionBengali: actionDetails.trim(),
      fertilizerOrSprayInstructionEnglish: actionDetails.trim(),
      reasoningBengali: reasoning.trim(),
      reasoningEnglish: reasoning.trim(),
      shadeOrMoistureAdvisoryBengali: reasoning.trim(),
      shadeOrMoistureAdvisoryEnglish: reasoning.trim(),
      waterAmountLiters: selectedNature === 'watering' ? Number(waterLiters) || 1.8 : undefined,
      isCompleted: false,
      status: 'pending',
      savedAtIso: new Date().toISOString(),
      notificationScheduled: enableNotification,
    };

    // Schedule Push Notification if toggled
    let notifResult = null;
    if (enableNotification) {
      notifResult = await NotificationService.scheduleCareTaskPushNotification(
        newTask,
        lang
      );
      if (notifResult.success) {
        newTask.notificationId = notifResult.notificationId;
      }
    }

    onSaveTask(newTask);
    setIsSubmitting(false);

    Alert.alert(
      lang === 'bn' ? '✅ পরিচর্যা শিডিউল সম্পন্ন' : '✅ Task Scheduled',
      lang === 'bn'
        ? `"${plantNameBn}"-এর জন্য "${taskTitle}" সফলভাবে যুক্ত হয়েছে।${
            enableNotification
              ? '\n🔔 নির্ধারিত তারিখে পুশ নোটিফিকেশন অ্যালার্ট পাঠানো হবে।'
              : ''
          }`
        : `Task "${taskTitle}" scheduled for "${plantNameEn}".${
            enableNotification
              ? '\n🔔 Push notification alert set for scheduled date.'
              : ''
          }`
    );

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: fontFam }]}>
                🌱 {lang === 'bn' ? 'নতুন পরিচর্যা শিডিউল' : 'Schedule Care Task'}
              </Text>
              <Text style={[styles.modalSub, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn'
                  ? 'গাছ নির্বাচন, করণীয় পদক্ষেপ, কারণ ও তারিখ নির্ধারণ করুন'
                  : 'Select plant, action steps, reasoning & notification date'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form Body */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: Select Plant (Dropdown Menu) */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepBadgeText}>১</Text>
                </View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'গাছ নির্বাচন করুন (ড্রপডাউন)' : 'Select Target Plant'}
                </Text>
              </View>

              {/* Reusable Shared Dropdown Selector */}
              <PlantSelectorDropdown
                plants={plants}
                selectedPlantId={selectedPlantId}
                onSelectPlantId={(id) => setSelectedPlantId(id)}
                theme={theme}
                lang={lang}
                allowAllPlantsOption={true}
              />
            </View>

            {/* STEP 2: Nature / Type of Task */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepBadgeText}>২</Text>
                </View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'কাজের ধরন (Nature of Task)' : 'Nature of Task'}
                </Text>
              </View>

              <View style={styles.natureGrid}>
                {CARE_TASK_NATURES.map((nature) => {
                  const isActive = selectedNature === nature.type;
                  return (
                    <TouchableOpacity
                      key={nature.type}
                      onPress={() => handleSelectNature(nature)}
                      activeOpacity={0.8}
                      style={[
                        styles.natureChip,
                        {
                          backgroundColor: isActive
                            ? theme.selectedSurface
                            : theme.surfaceElevated,
                          borderColor: isActive ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>{nature.icon}</Text>
                      <Text
                        style={[
                          styles.natureChipText,
                          {
                            color: isActive
                              ? theme.primary
                              : theme.textPrimary,
                            fontFamily: fontFam,
                          },
                        ]}
                      >
                        {lang === 'bn' ? nature.nameBn : nature.nameEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* STEP 3: Task Title & Required Actions */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepBadgeText}>৩</Text>
                </View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'কাজের শিরোনাম ও প্রয়োজনীয় পদক্ষেপ' : 'Action Steps & Instructions'}
                </Text>
              </View>

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'কাজের নাম / শিরোনাম:' : 'Task Title:'}
                </Text>
                <TextInput
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  placeholder={lang === 'bn' ? 'যেমন: বিকেলে নিম তেল স্প্রে' : 'e.g. Afternoon Neem Oil Spray'}
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      fontFamily: fontFam,
                    },
                  ]}
                />
              </View>

              {/* Detailed Action Steps */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'করণীয় পদক্ষেপ (কীভাবে যত্ন নিবেন):' : 'Required Actions (How-to steps):'}
                </Text>
                <TextInput
                  value={actionDetails}
                  onChangeText={setActionDetails}
                  multiline
                  numberOfLines={3}
                  placeholder={lang === 'bn' ? 'পদক্ষেপের বিস্তারিত লিখুন...' : 'Describe action steps...'}
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      fontFamily: fontFam,
                    },
                  ]}
                />
              </View>

              {/* Water Liters (if watering) */}
              {selectedNature === 'watering' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? 'পানির পরিমাণ (লিটার):' : 'Water Volume (Liters):'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TextInput
                      value={waterLiters}
                      onChangeText={setWaterLiters}
                      keyboardType="numeric"
                      placeholder="2.0"
                      placeholderTextColor={theme.textMuted}
                      style={[
                        styles.textInput,
                        {
                          width: 120,
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                          color: theme.textPrimary,
                        },
                      ]}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 14, fontFamily: fontFam }}>
                      {lang === 'bn' ? 'লিটার' : 'Liters'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* STEP 4: Reasoning Behind the Task */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepBadgeText}>৪</Text>
                </View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'যত্নের পেছনের কারণ (Reasoning)' : 'Reasoning Behind Task'}
                </Text>
              </View>

              <Text style={[styles.helperNotice, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn'
                  ? 'এই পরিচর্যাটি কেন প্রয়োজন? এটি গাছের কী উপকার করবে?'
                  : 'Why is this task needed? How will it benefit plant health?'}
              </Text>

              <TextInput
                value={reasoning}
                onChangeText={setReasoning}
                multiline
                numberOfLines={2}
                placeholder={
                  lang === 'bn'
                    ? 'যেমন: পাতা কোঁকড়ানো রোধে ও বর্ষাকালে ছত্রাক প্রতিরোধ করতে'
                    : 'e.g. Prevent leaf-curl disease and fungal spores'
                }
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                    fontFamily: fontFam,
                  },
                ]}
              />

              {/* Quick Inspiration Chips */}
              <View style={styles.chipQuickRow}>
                {(lang === 'bn' ? REASON_CHIPS_BN : REASON_CHIPS_EN).map(
                  (chip, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setReasoning(chip)}
                      activeOpacity={0.7}
                      style={[
                        styles.quickTag,
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: theme.textSecondary,
                          fontFamily: fontFam,
                        }}
                      >
                        {chip}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* STEP 5: Scheduled Date & Time Slot */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.stepBadgeText}>৫</Text>
                </View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? 'নির্ধারিত তারিখ ও সময়সূচি' : 'Scheduled Date & Time'}
                </Text>
              </View>

              {/* Date Option Chips */}
              <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn' ? 'তারিখ নির্বাচন:' : 'Select Due Date:'}
              </Text>
              <View style={styles.dateChipGrid}>
                {[
                  { offset: 0, bn: 'আজ (Today)', en: 'Today' },
                  { offset: 1, bn: 'আগামীকাল', en: 'Tomorrow' },
                  { offset: 3, bn: '৩ দিন পর', en: 'In 3 Days' },
                  { offset: 7, bn: '১ সপ্তাহ পর', en: 'In 1 Week' },
                ].map((item) => {
                  const active = !isCustomDate && dateOffsetDays === item.offset;
                  return (
                    <TouchableOpacity
                      key={item.offset}
                      onPress={() => {
                        setIsCustomDate(false);
                        setDateOffsetDays(item.offset);
                      }}
                      activeOpacity={0.8}
                      style={[
                        styles.dateChip,
                        {
                          backgroundColor: active
                            ? theme.primary
                            : theme.surfaceElevated,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active ? '#FFFFFF' : theme.textPrimary,
                          fontSize: 12.5,
                          fontWeight: '700',
                          fontFamily: fontFam,
                        }}
                      >
                        📅 {lang === 'bn' ? item.bn : item.en}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  onPress={() => setIsCustomDate(true)}
                  activeOpacity={0.8}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: isCustomDate
                        ? theme.primary
                        : theme.surfaceElevated,
                      borderColor: isCustomDate ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isCustomDate ? '#FFFFFF' : theme.textPrimary,
                      fontSize: 12.5,
                      fontWeight: '700',
                      fontFamily: fontFam,
                    }}
                  >
                    📆 {lang === 'bn' ? 'কাস্টম তারিখ' : 'Custom Date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {isCustomDate && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: fontFam }]}>
                    {lang === 'bn' ? 'তারিখ লিখুন (YYYY-MM-DD):' : 'Enter Date (YYYY-MM-DD):'}
                  </Text>
                  <TextInput
                    value={customDateInput}
                    onChangeText={setCustomDateInput}
                    placeholder="2026-11-10"
                    placeholderTextColor={theme.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                      },
                    ]}
                  />
                </View>
              )}

              {/* Time Slot */}
              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12, fontFamily: fontFam }]}>
                {lang === 'bn' ? 'দিনের কোন সময়ে করবেন:' : 'Preferred Time Slot:'}
              </Text>
              <View style={styles.timeSlotRow}>
                {[
                  {
                    id: 'morning',
                    icon: '🌅',
                    labelBn: 'সকাল',
                    labelEn: 'Morning',
                    timeBn: '০৮:০০ AM',
                    timeEn: '08:00 AM',
                  },
                  {
                    id: 'afternoon',
                    icon: '☀️',
                    labelBn: 'দুপুর',
                    labelEn: 'Noon',
                    timeBn: '০১:০০ PM',
                    timeEn: '01:00 PM',
                  },
                  {
                    id: 'evening',
                    icon: '🌇',
                    labelBn: 'বিকাল/সন্ধ্যা',
                    labelEn: 'Evening',
                    timeBn: '০৫:৩০ PM',
                    timeEn: '05:30 PM',
                  },
                ].map((slot) => {
                  const active = timeSlot === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => setTimeSlot(slot.id as TimeOfDaySlot)}
                      activeOpacity={0.8}
                      style={[
                        styles.slotBtn,
                        {
                          backgroundColor: active
                            ? theme.primary
                            : theme.surfaceElevated,
                          borderColor: active ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>{slot.icon}</Text>
                      <Text
                        style={{
                          fontSize: 12.5,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : theme.textPrimary,
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? slot.labelBn : slot.labelEn}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10.5,
                          fontWeight: '600',
                          color: active ? 'rgba(255,255,255,0.85)' : theme.textSecondary,
                          fontFamily: fontFam,
                        }}
                      >
                        {lang === 'bn' ? slot.timeBn : slot.timeEn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* STEP 6: Push Notification Toggle */}
            <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setEnableNotification(!enableNotification)}
                activeOpacity={0.8}
                style={styles.notifToggleRow}
              >
                <View
                  style={[
                    styles.checkboxSquare,
                    {
                      backgroundColor: enableNotification ? theme.primary : 'transparent',
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  {enableNotification && (
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.notifTitle,
                    { color: theme.textPrimary, fontFamily: fontFam, flex: 1 },
                  ]}
                >
                  🔔 {lang === 'bn' ? 'পুশ নোটিফিকেশন' : 'Push notification'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={[styles.modalFooter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.saveBtnText, { fontFamily: fontFam }]}>
                {isSubmitting
                  ? lang === 'bn'
                    ? 'সংরক্ষণ করা হচ্ছে...'
                    : 'Saving...'
                  : lang === 'bn'
                  ? 'টাস্ক সংরক্ষণ'
                  : 'Save Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownSelectedTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownSelectedSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  dropdownChevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenuBox: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  dropdownSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  dropdownItemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  dropdownItemSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  natureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  natureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  natureChipText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
  },
  textArea: {
    minHeight: 68,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    textAlignVertical: 'top',
  },
  helperNotice: {
    fontSize: 12,
    lineHeight: 18,
  },
  chipQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  quickTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeSlotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  notifToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  notifSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

