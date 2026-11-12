/**
 * BAGANI — Modern Welcome Wizard & Feature Walkthrough (v2.5.0)
 * Developer: ProFix - Web & Soft
 *
 * Professional onboarding wizard guiding users through:
 * 1. Digital Plant Registration & Printable QR Tags
 * 2. AI Botanical Pathology & 100% Organic Remedies
 * 3. Weather-Indexed Soil Mix & Smart Irrigation Calculator
 * 4. Growth Milestones, Pruning Timeline & Harvesting Countdown
 */

import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { APP_CONFIG } from '../../core/constants/app_constants';
import { AppLanguage } from '../../core/l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../../core/theme/app_theme';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

interface WizardSlide {
  badge: { bn: string; en: string };
  icon: string;
  gradientColors: [string, string];
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  whatYouCanDoBn: string;
  whatYouCanDoEn: string;
  whyItMattersBn: string;
  whyItMattersEn: string;
}

const WIZARD_SLIDES: WizardSlide[] = [
  {
    badge: { bn: 'ফিচার ০১ • ডিজিটাল ট্যাগিং', en: 'FEATURE 01 • DIGITAL TAGGING' },
    icon: '🏷️',
    gradientColors: ['#0F5132', '#198754'],
    titleBn: 'ডিজিটাল প্ল্যান্ট রেজিস্ট্রেশন ও QR কোড ট্যাগ',
    titleEn: 'Digital Plant Registration & Printable QR Tags',
    subtitleBn: 'প্রতিটি টব ও জিও ব্যাগের জন্য স্মার্ট ট্র্যাকিং',
    subtitleEn: 'Unique QR identity for every rooftop container',
    whatYouCanDoBn:
      'আপনার ছাদবাগানের প্রতিটি গাছের জন্য ইউনিক QR কোড জেনারেট করে সরাসরি প্রিন্ট বা PDF হিসেবে সংরক্ষণ করতে পারবেন।',
    whatYouCanDoEn:
      'Generate unique QR code tags for each rooftop pot and export printable PDF tags to affix directly on your containers.',
    whyItMattersBn:
      'গাছ বড় হওয়ার সাথে সাথে জাত ভুলে যাওয়ার ঝুঁকি থাকে না। যেকোনো সময় ট্যাগ স্ক্যান করলেই গাছের বয়স ও মাটির রেশিও দেখা যায়।',
    whyItMattersEn:
      'Eliminates confusion over plant varieties and age as your garden expands. A single camera scan instantly reveals its care log.',
  },
  {
    badge: { bn: 'ফিচার ০২ • এআই উদ্ভিদবিদ্যা', en: 'FEATURE 02 • AI BOTANICAL SCAN' },
    icon: '🔬',
    gradientColors: ['#064E3B', '#0D9488'],
    titleBn: 'এআই রোগ নির্ণয় ও অর্গানিক সমাধান',
    titleEn: 'AI Disease Diagnosis & Organic Remedies',
    subtitleBn: 'ক্যামেরায় পাতার ছবি তুলে তাত্ক্ষণিক পরামর্শ',
    subtitleEn: 'Instant leaf symptom analysis with natural cures',
    whatYouCanDoBn:
      'হলুদ পাতা, অ্যানথ্রাকনোজ কিংবা পোকামাকড়ের আক্রমণের ছবি তুললেই এআই তাৎক্ষণিকভাবে সমস্যা ও জৈব চিকিৎসা প্রদর্শন করবে।',
    whatYouCanDoEn:
      'Snap a photo of discolored leaves or pest damage to get real-time pathology diagnosis and organic treatment protocols.',
    whyItMattersBn:
      'ছাদবাগানে ক্ষতিকর কীটনাশক ব্যবহারের প্রয়োজন পড়ে না; নিমতেল ও ঘরোয়া প্রাকৃতিক উপায়ে গাছ দ্রুত রোগমুক্ত হয়।',
    whyItMattersEn:
      'Protects your family and roof ecosystem from toxic synthetic chemicals by prioritizing safe, 100% organic remedies.',
  },
  {
    badge: { bn: 'ফিচার ০৩ • স্মার্ট সেচ ব্যবস্থা', en: 'FEATURE 03 • SMART IRRIGATION' },
    icon: '💧',
    gradientColors: ['#0369A1', '#0284C7'],
    titleBn: 'আবহাওয়া ও পাত্র অনুযায়ী পানি ক্যালকুলেটর',
    titleEn: 'Weather-Indexed Irrigation & Soil Mix',
    subtitleBn: 'স্থানীয় তাপমাত্রা ও বৃষ্টিপাতের সাথে সমন্বিত',
    subtitleEn: 'Calibrated to local humidity, heat and container size',
    whatYouCanDoBn:
      'টবের ব্যাসার্ধ (১০–২৪ ইঞ্চি), ড্রেন হোল ও জেলা আবহাওয়া অনুযায়ী দৈনিক কত লিটার পানি দেওয়া উচিত তা নির্ভুলভাবে বের করুন।',
    whatYouCanDoEn:
      'Calculate exact daily water volume (in Liters) based on pot diameter, soil mix, and your district’s live forecast.',
    whyItMattersBn:
      'ছাদবাগানের ৮০% গাছ নষ্ট হয় অতিরিক্ত বা অপরিমিত পানির কারণে। সঠিক সেচ গাছের শিকড় পচা ও পাতা ঝরা পুরোপুরি রোধ করে।',
    whyItMattersEn:
      'Over-watering is the #1 cause of rooftop plant death. Precision moisture control prevents root rot and leaf yellowing.',
  },
  {
    badge: { bn: 'ফিচার ০৪ • বৃদ্ধির পূর্বাভাস', en: 'FEATURE 04 • HARVEST COUNTDOWN' },
    icon: '⏳',
    gradientColors: ['#78350F', '#D97706'],
    titleBn: 'গ্রোথ পূর্বাভাস ও ফল সংগ্রহের দিনগণনা',
    titleEn: 'Growth Forecasting & Harvest Countdown',
    subtitleBn: 'চারা রোপণ থেকে পাকা ফল সংগ্রহের সময়সীমা',
    subtitleEn: 'Track vegetative growth, flowering and harvest milestones',
    whatYouCanDoBn:
      'চারা লাগানোর তারিখ থেকে বর্তমান বয়স এবং জাতভিত্তিক ফল পরিপক্ব হওয়ার দিনগণনা (Countdown) ট্র্যাক করতে পারবেন।',
    whatYouCanDoEn:
      'Monitor your plant’s active age in days and watch the countdown to peak fruit maturity and harvesting season.',
    whyItMattersBn:
      'সঠিক সময়ে ৩-শাখা ক্যানোপি প্রুনিং ও সার প্রয়োগ নিশ্চিত করা যায়, যার ফলে টবের ফলন সাধারণের চেয়ে দ্বিগুণ বৃদ্ধি পায়।',
    whyItMattersEn:
      'Enables timely canopy pruning and potassium feeding right before bloom, effectively doubling rooftop harvest yields.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 760;
  const isUltraCompact = windowHeight < 680;

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  if (!visible) return null;

  const activeSlide = WIZARD_SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === WIZARD_SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setCurrentSlideIndex(0);
      onClose();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: theme.background },
        ]}
      >
        {/* Top Header Bar */}
        <View
          style={[
            styles.topHeader,
            {
              borderBottomColor: theme.border,
              backgroundColor: theme.surface,
              paddingVertical: isCompact ? 8 : 12,
            },
          ]}
        >
          {/* Logo & App Brand */}
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.brandTitle, { color: theme.primary, fontFamily: fontFam }]}>
                {APP_CONFIG.appName}
              </Text>
              <Text style={[styles.brandSub, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn' ? 'ওয়েলকাম উইজার্ড ও ফিচার পরিচিতি' : 'Welcome Wizard & Guide'}
              </Text>
            </View>
          </View>

          {/* Skip Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[styles.skipBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <Text style={[styles.skipBtnText, { color: theme.textSecondary, fontFamily: fontFam }]}>
              {lang === 'bn' ? 'এড়িয়ে যান →' : 'Skip →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Wizard Card */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              padding: isCompact ? 10 : 16,
              justifyContent: isCompact ? 'flex-start' : 'center',
              flexGrow: 1,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.wizardCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                maxWidth: Math.min(windowWidth - 20, 580),
              },
            ]}
          >
            {/* Vibrant Banner Box with Decorative Icons */}
            <View
              style={[
                styles.vibrantBanner,
                {
                  backgroundColor: activeSlide.gradientColors[0],
                  paddingVertical: isUltraCompact ? 10 : isCompact ? 14 : 24,
                  gap: isCompact ? 6 : 10,
                },
              ]}
            >
              <View style={styles.bannerBadgePill}>
                <Text style={styles.bannerBadgeText}>
                  {lang === 'bn' ? activeSlide.badge.bn : activeSlide.badge.en}
                </Text>
              </View>

              <View
                style={[
                  styles.largeIconCircle,
                  {
                    width: isUltraCompact ? 46 : isCompact ? 56 : 72,
                    height: isUltraCompact ? 46 : isCompact ? 56 : 72,
                    borderRadius: isUltraCompact ? 23 : isCompact ? 28 : 36,
                    marginVertical: isCompact ? 2 : 4,
                  },
                ]}
              >
                <Text style={{ fontSize: isUltraCompact ? 26 : isCompact ? 32 : 42 }}>
                  {activeSlide.icon}
                </Text>
              </View>

              <Text style={[styles.bannerTitle, { fontFamily: fontFam, fontSize: isCompact ? 16 : 18 }]}>
                {lang === 'bn' ? activeSlide.titleBn : activeSlide.titleEn}
              </Text>
              <Text style={[styles.bannerSubtitle, { fontFamily: fontFam, fontSize: isCompact ? 11.5 : 13 }]}>
                {lang === 'bn' ? activeSlide.subtitleBn : activeSlide.subtitleEn}
              </Text>
            </View>

            {/* Structured Explanation Sections: What You Can Do & Why It Matters */}
            <View style={[styles.cardBody, { padding: isCompact ? 12 : 18, gap: isCompact ? 8 : 14 }]}>
              {/* Box 1: What can be done */}
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    borderLeftColor: theme.primary,
                    padding: isCompact ? 10 : 14,
                    gap: isCompact ? 4 : 6,
                  },
                ]}
              >
                <View style={styles.boxTitleRow}>
                  <Text style={{ fontSize: 16 }}>🎯</Text>
                  <Text
                    style={[
                      styles.boxTitle,
                      { color: theme.textPrimary, fontFamily: fontFam, fontSize: isCompact ? 12.5 : 13.5 },
                    ]}
                  >
                    {lang === 'bn' ? 'কী করা যাবে (What Can Be Done):' : 'What You Can Do:'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.boxDescription,
                    {
                      color: theme.textSecondary,
                      fontFamily: fontFam,
                      fontSize: isCompact ? 11.5 : 13,
                      lineHeight: isCompact ? 17 : 20,
                    },
                  ]}
                >
                  {lang === 'bn' ? activeSlide.whatYouCanDoBn : activeSlide.whatYouCanDoEn}
                </Text>
              </View>

              {/* Box 2: Why it matters */}
              <View
                style={[
                  styles.explanationBox,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    borderLeftColor: '#D97706',
                    padding: isCompact ? 10 : 14,
                    gap: isCompact ? 4 : 6,
                  },
                ]}
              >
                <View style={styles.boxTitleRow}>
                  <Text style={{ fontSize: 16 }}>💡</Text>
                  <Text
                    style={[
                      styles.boxTitle,
                      { color: theme.textPrimary, fontFamily: fontFam, fontSize: isCompact ? 12.5 : 13.5 },
                    ]}
                  >
                    {lang === 'bn' ? 'কেন এটি গুরুত্বপূর্ণ (Why It Matters):' : 'Why It Matters:'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.boxDescription,
                    {
                      color: theme.textSecondary,
                      fontFamily: fontFam,
                      fontSize: isCompact ? 11.5 : 13,
                      lineHeight: isCompact ? 17 : 20,
                    },
                  ]}
                >
                  {lang === 'bn' ? activeSlide.whyItMattersBn : activeSlide.whyItMattersEn}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Interactive Navigation Dock */}
        <View
          style={[
            styles.bottomDock,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              paddingVertical: isCompact ? 10 : 14,
              gap: isCompact ? 8 : 12,
            },
          ]}
        >
          {/* Progress Stepper Indicators */}
          <View style={styles.dotsRow}>
            {WIZARD_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      idx === currentSlideIndex
                        ? theme.primary
                        : theme.mode === 'dark'
                        ? '#334155'
                        : '#E2E8F0',
                    width: idx === currentSlideIndex ? 28 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Action Navigation Buttons */}
          <View style={styles.actionsRow}>
            {/* Previous Button (Hidden on first slide) */}
            {currentSlideIndex > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                activeOpacity={0.7}
                style={[
                  styles.navBtn,
                  styles.prevBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    paddingVertical: isCompact ? 10 : 13,
                  },
                ]}
              >
                <Text style={[styles.prevBtnText, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  ← {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 0.6 }} />
            )}

            {/* Next / Finish Button */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={[
                styles.navBtn,
                styles.nextBtn,
                { backgroundColor: theme.primary, paddingVertical: isCompact ? 10 : 13 },
              ]}
            >
              <Text style={[styles.nextBtnText, { fontFamily: fontFam }]}>
                {isLastSlide
                  ? lang === 'bn'
                    ? 'শুরু করুন ও লগইন পেজে যান →'
                    : 'Get Started & Login →'
                  : lang === 'bn'
                  ? 'পরবর্তী ধাপ →'
                  : 'Next Feature →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  wizardCard: {
    width: '100%',
    maxWidth: 620,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  vibrantBanner: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  bannerBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  largeIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 13,
    textAlign: 'center',
  },
  cardBody: {
    padding: 18,
    gap: 14,
  },
  explanationBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    gap: 6,
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boxTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  boxDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomDock: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  navBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtn: {
    flex: 0.8,
    borderWidth: 1,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1.4,
    shadowColor: '#167A45',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
