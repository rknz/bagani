/**
 * BAGANI — Minimalist Splash & 3-Step Onboarding Walkthrough (Screens 1 & 2 of DESIGN_SYSTEM.md)
 */

import React, { useState } from 'react';
import {
  Image,
  Modal,
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
} from '../../core/theme/app_theme';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

const SLIDES = [
  {
    icon: '📷',
    titleBn: 'ডিজিটাল প্ল্যান্ট রেজিস্ট্রেশন ও QR ট্যাগ',
    titleEn: 'Digital Plant Registration & QR Tags',
    descBn:
      'আপনার ছাদবাগানের প্রতিটি গাছকে ইউনিক QR কোড ট্যাগ দিয়ে চিহ্নিত করুন এবং এক স্ক্যানেই গাছের সম্পূর্ণ প্রোফাইল দেখুন।',
    descEn:
      'Register every rooftop pot with a printable QR tag and scan anytime to view its digital profile and care history.',
  },
  {
    icon: '🔬',
    titleBn: 'এআই রোগ নির্ণয় ও ভবিষ্যৎ পূর্বাভাস',
    titleEn: 'AI Disease Diagnosis & Growth Forecast',
    descBn:
      'পাতার ছবি ও লক্ষণ বিশ্লেষণ করে রোগ নির্ণয় করুন এবং গাছের বর্তমান বয়স ও ফল ধরার সম্ভাব্য সময় (Harvesting Countdown) ট্র্যাক করুন।',
    descEn:
      'Detect leaf diseases with organic treatment steps and track real-time plant status and harvesting countdowns.',
  },
  {
    icon: '🌦️',
    titleBn: 'আবহাওয়া ভিত্তিক সুনির্দিষ্ট পরিচর্যা',
    titleEn: 'Weather-Indexed Smart Care',
    descBn:
      'আপনার জেলার লাইভ আবহাওয়া ও বৃষ্টির পূর্বাভাস অনুযায়ী প্রতিদিন কোন গাছে কত লিটার পানি ও সার প্রয়োজন তার স্বয়ংক্রিয় নির্দেশনা পান।',
    descEn:
      'Receive daily watering and organic fertilizer recommendations tailored to your local temperature and rain forecast.',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
}) => {
  const [step, setStep] = useState<'splash' | number>('splash');
  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.background },
        ]}
      >
        {step === 'splash' ? (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.mainHeading,
                { color: theme.primary, fontFamily: fontFam },
              ]}
            >
              {APP_CONFIG.appName}
            </Text>
            <Text
              style={[
                styles.sectionSub,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {APP_CONFIG.subtitle}
            </Text>
            <Text
              style={[
                styles.caption,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {APP_CONFIG.tagline} • {APP_CONFIG.developerName}
            </Text>

            <TouchableOpacity
              onPress={() => setStep(0)}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.btnText, { fontFamily: fontFam }]}>
                {lang === 'bn'
                  ? 'অনবোর্ডিং ট্যুর শুরু করুন →'
                  : 'Explore Onboarding →'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontWeight: '600',
                  fontFamily: fontFam,
                }}
              >
                {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Return to App'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.selectedSurface },
              ]}
            >
              <Text style={{ fontSize: 28 }}>{SLIDES[step].icon}</Text>
            </View>

            <Text
              style={[
                styles.slideTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? SLIDES[step].titleBn : SLIDES[step].titleEn}
            </Text>

            <Text
              style={[
                styles.slideDesc,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn' ? SLIDES[step].descBn : SLIDES[step].descEn}
            </Text>

            <View style={styles.dotsRow}>
              {SLIDES.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        idx === step ? theme.primary : theme.border,
                      width: idx === step ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                if (step < SLIDES.length - 1) {
                  setStep(step + 1);
                } else {
                  setStep('splash');
                  onClose();
                }
              }}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.btnText, { fontFamily: fontFam }]}>
                {step < SLIDES.length - 1
                  ? lang === 'bn'
                    ? 'পরবর্তী ধাপ →'
                    : 'Next →'
                  : lang === 'bn'
                  ? 'শুরু করুন →'
                  : 'Get Started →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.screenHorizontalPadding,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: DESIGN_TOKENS.spacing.xl,
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing.md,
  },
  logo: {
    width: 140,
    height: 110,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  caption: {
    fontSize: 13,
    textAlign: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  slideDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  primaryBtn: {
    width: '100%',
    minHeight: DESIGN_TOKENS.buttonHeight,
    borderRadius: DESIGN_TOKENS.buttonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  skipBtn: {
    paddingVertical: 6,
  },
});
