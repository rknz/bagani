/**
 * BAGANI — Full-Screen Exit Advertisement Modal & Exit Confirmation (v2.5.0)
 * Developer: ProFix - Web & Soft
 *
 * Professional Real-World AdMob / AdSense Flow:
 * 1. User attempts to exit the application.
 * 2. Full-page interstitial advertisement is displayed with a 5-second countdown timer.
 * 3. After the advertisement countdown ends, user closes the ad.
 * 4. A clean confirmation prompt asks: "Are you sure you want to close the application?"
 * 5. If "Yes", the application closes. If "No", returns to the app.
 */

import React, { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EXIT_SPONSOR_ADS, ExitAdSponsor } from '../../services/ad_service';
import { AppLanguage } from '../l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../theme/app_theme';

interface FullScreenExitAdModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirmExit: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

export const FullScreenExitAdModal: React.FC<FullScreenExitAdModalProps> = ({
  visible,
  onDismiss,
  onConfirmExit,
  theme,
  lang,
}) => {
  const [activeAdIndex] = useState(0);
  const [stage, setStage] = useState<'ad' | 'confirm'>('ad');
  const [countdown, setCountdown] = useState(5);

  const ad: ExitAdSponsor = EXIT_SPONSOR_ADS[activeAdIndex] || EXIT_SPONSOR_ADS[0];

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  // Reset timer whenever the modal becomes visible
  useEffect(() => {
    if (visible) {
      setStage('ad');
      setCountdown(5);
    }
  }, [visible]);

  // 5-Second Countdown Timer
  useEffect(() => {
    if (!visible || stage !== 'ad') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, stage, countdown]);

  const handleOpenCta = async () => {
    if (ad.ctaUrl) {
      try {
        await Linking.openURL(ad.ctaUrl);
      } catch (err) {
        console.warn('Could not open sponsor URL', err);
      }
    }
  };

  const handleCloseAd = () => {
    // Proceed to the confirmation prompt
    setStage('confirm');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={stage === 'confirm'}
      onRequestClose={() => {
        if (stage === 'confirm') onDismiss();
        else handleCloseAd();
      }}
    >
      {stage === 'ad' ? (
        <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
          {/* Top Header Bar */}
          <View
            style={[
              styles.topBar,
              { borderBottomColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <View style={styles.sponsorBadgeWrap}>
              <View style={[styles.adTag, { backgroundColor: theme.primary }]}>
                <Text style={styles.adTagText}>AD</Text>
              </View>
              <Text style={[styles.sponsorBadgeText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                {lang === 'bn' ? 'স্পন্সরড বার্তা • Google AdSense' : 'Sponsored • Google AdSense'}
              </Text>
            </View>

            {/* Countdown / Dismiss Button */}
            {countdown > 0 ? (
              <View
                style={[
                  styles.countdownBadge,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.countdownText, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  ⏱️ {countdown}s
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCloseAd}
                activeOpacity={0.7}
                style={[
                  styles.closePillActive,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={[styles.closePillActiveText, { fontFamily: fontFam }]}>
                  ✕ {lang === 'bn' ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Scrollable Ad Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Sponsor Card */}
            <View
              style={[
                styles.sponsorCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  shadowColor: '#000000',
                },
              ]}
            >
              {/* Visual Header / Banner */}
              <View style={[styles.cardVisualHeader, { backgroundColor: theme.selectedSurface }]}>
                <View style={[styles.logoIconCircle, { backgroundColor: theme.primary }]}>
                  <Text style={{ fontSize: 32 }}>🌿</Text>
                </View>
                <Text style={[styles.brandName, { color: theme.primary, fontFamily: fontFam }]}>
                  {ad.brandName}
                </Text>
                <Text style={[styles.tagline, { color: theme.textPrimary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? ad.taglineBn : ad.taglineEn}
                </Text>
              </View>

              {/* Description Body */}
              <View style={styles.cardBody}>
                <Text style={[styles.description, { color: theme.textSecondary, fontFamily: fontFam }]}>
                  {lang === 'bn' ? ad.descriptionBn : ad.descriptionEn}
                </Text>

                {/* Bullet Highlights */}
                <View style={styles.highlightsBox}>
                  {(lang === 'bn' ? ad.highlightsBn : ad.highlightsEn).map((item, idx) => (
                    <View key={idx} style={styles.highlightRow}>
                      <View style={[styles.bulletDot, { backgroundColor: theme.primary }]} />
                      <Text
                        style={[
                          styles.highlightText,
                          { color: theme.textPrimary, fontFamily: fontFam },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Sponsor CTA Action */}
                <TouchableOpacity
                  onPress={handleOpenCta}
                  activeOpacity={0.85}
                  style={[styles.ctaButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={[styles.ctaButtonText, { fontFamily: fontFam }]}>
                    {lang === 'bn' ? ad.ctaTextBn : ad.ctaTextEn}
                  </Text>
                </TouchableOpacity>

                <Text style={[styles.unitIdLabel, { color: theme.textMuted }]}>
                  Google AdSense Interstitial Placement: {ad.unitId}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Banner Bar */}
          <View
            style={[
              styles.bottomNoticeBar,
              { backgroundColor: theme.surface, borderTopColor: theme.border },
            ]}
          >
            <TouchableOpacity
              onPress={countdown === 0 ? handleCloseAd : undefined}
              activeOpacity={countdown === 0 ? 0.8 : 1}
              style={[
                styles.bottomCloseBtn,
                {
                  backgroundColor:
                    countdown === 0
                      ? theme.primary
                      : theme.mode === 'dark'
                      ? '#334155'
                      : '#E2E8F0',
                },
              ]}
            >
              <Text
                style={[
                  styles.bottomCloseBtnText,
                  {
                    color: countdown === 0 ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: fontFam,
                  },
                ]}
              >
                {countdown > 0
                  ? lang === 'bn'
                    ? `বিজ্ঞাপন বন্ধ করতে অপেক্ষা করুন (${countdown} সেকেন্ড)`
                    : `Please wait ${countdown}s to continue`
                  : lang === 'bn'
                  ? 'বিজ্ঞাপন সমাপ্ত • প্রস্থান করুন →'
                  : 'Skip Ad & Exit App →'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (
        /* STAGE: CONFIRM EXIT PROMPT MODAL */
        <View style={styles.confirmModalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.confirmModalBackdrop}
            onPress={onDismiss}
          />

          <View
            style={[
              styles.confirmModalCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Exit Icon Circle */}
            <View
              style={[
                styles.confirmIconCircle,
                {
                  backgroundColor:
                    theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                },
              ]}
            >
              <Text style={{ fontSize: 32 }}>🚪</Text>
            </View>

            {/* Prompt Title */}
            <Text
              style={[
                styles.confirmTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'আপনি কি অ্যাপ্লিকেশনটি বন্ধ করতে চান?'
                : 'Are you sure you want to close the application?'}
            </Text>

            {/* Subtext */}
            <Text
              style={[
                styles.confirmSubtitle,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {lang === 'bn'
                ? 'আপনার ছাদবাগানের সমস্ত গাছের হিস্ট্রি, কেয়ার শিডিউল ও তথ্য নিরাপদে সংরক্ষিত রয়েছে।'
                : 'All your rooftop plant profiles, care records, and reminders remain safely saved.'}
            </Text>

            {/* Actions: Yes and No */}
            <View style={styles.confirmActionsRow}>
              {/* NO Option (Stay in App) */}
              <TouchableOpacity
                onPress={onDismiss}
                activeOpacity={0.7}
                style={[
                  styles.confirmActionBtn,
                  styles.confirmNoBtn,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confirmNoText,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'না (অ্যাপে থাকুন)' : 'No (Stay)'}
                </Text>
              </TouchableOpacity>

              {/* YES Option (Close App) */}
              <TouchableOpacity
                onPress={onConfirmExit}
                activeOpacity={0.85}
                style={[
                  styles.confirmActionBtn,
                  styles.confirmYesBtn,
                  { backgroundColor: '#DC2626' },
                ]}
              >
                <Text
                  style={[
                    styles.confirmYesText,
                    { fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn' ? 'হ্যাঁ (বন্ধ করুন)' : 'Yes (Close)'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  sponsorBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sponsorBadgeText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  countdownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  countdownText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  closePillActive: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closePillActiveText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 24,
  },
  sponsorCard: {
    width: '100%',
    maxWidth: 580,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardVisualHeader: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  logoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardBody: {
    padding: 20,
    gap: 14,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  highlightsBox: {
    gap: 8,
    paddingVertical: 4,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  ctaButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#167A45',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  unitIdLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomNoticeBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  bottomCloseBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
  },
  bottomCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginTop: 6,
  },
  confirmActionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmNoBtn: {
    borderWidth: 1,
  },
  confirmNoText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmYesBtn: {
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmYesText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
