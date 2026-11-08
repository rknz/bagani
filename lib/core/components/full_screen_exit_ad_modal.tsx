/**
 * BAGANI — Full-Screen Exit Advertisement Modal (Phase 2)
 * Developer: ProFix - Web & Soft
 *
 * Compliance:
 * - Appears ONLY when the user is closing or exiting the application
 * - Replaces all persistent top and bottom banner ads
 * - Complies with Google AdMob & Play Store Interstitial/Exit Ad guidelines:
 *   1. Clearly marked as "Sponsored / বিজ্ঞাপন"
 *   2. Dismissible via top-right '✕' without forcing clicks
 *   3. Offers explicit "Exit App" or "Stay in BAGANI" options
 */

import React, { useState } from 'react';
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
import { AppLanguage } from '../l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../theme/app_theme';
import { EXIT_SPONSOR_ADS, ExitAdSponsor } from '../../services/ad_service';

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
  const ad: ExitAdSponsor = EXIT_SPONSOR_ADS[activeAdIndex] || EXIT_SPONSOR_ADS[0];

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const handleOpenCta = async () => {
    if (ad.ctaUrl) {
      try {
        await Linking.openURL(ad.ctaUrl);
      } catch (err) {
        console.warn('Could not open sponsor URL', err);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        {/* Top Header Bar */}
        <View style={[styles.topBar, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={styles.sponsorBadgeWrap}>
            <View style={[styles.adTag, { backgroundColor: theme.primary }]}>
              <Text style={styles.adTagText}>AD</Text>
            </View>
            <Text style={[styles.sponsorBadgeText, { color: theme.textSecondary, fontFamily: fontFam }]}>
              {lang === 'bn' ? 'স্পন্সরড বার্তা • ProFix - Web & Soft' : 'Sponsored Partner • ProFix'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onDismiss}
            activeOpacity={0.7}
            style={[styles.closePill, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          >
            <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '700', fontFamily: fontFam }}>
              ✕ {lang === 'bn' ? 'ফিরে যান' : 'Close'}
            </Text>
          </TouchableOpacity>
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
                {(lang === 'bn' ? ad.highlightsBn : ad.highlightsEn).map(
                  (item, idx) => (
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
                  )
                )}
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
                AdMob Interstitial Unit: {ad.unitId}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Exit Confirmation Dock */}
        <View style={[styles.exitDock, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <View style={styles.exitDialogTextWrap}>
            <Text style={[styles.exitQuestion, { color: theme.textPrimary, fontFamily: fontFam }]}>
              {lang === 'bn' ? 'অ্যাপ থেকে বের হতে চান?' : 'Exit BAGANI App?'}
            </Text>
            <Text style={[styles.exitSub, { color: theme.textSecondary, fontFamily: fontFam }]}>
              {lang === 'bn'
                ? 'আপনার সকল গাছের তথ্য ও কেয়ার রিমাইন্ডার সংরক্ষিত রয়েছে।'
                : 'All your plant logs and reminders are safely saved.'}
            </Text>
          </View>

          <View style={styles.exitActionsRow}>
            {/* Stay in App Button */}
            <TouchableOpacity
              onPress={onDismiss}
              activeOpacity={0.82}
              style={[
                styles.actionBtn,
                styles.stayBtn,
                {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.stayBtnText, { fontFamily: fontFam }]}>
                🌿 {lang === 'bn' ? 'অ্যাপে থাকুন' : 'Stay in Bagani'}
              </Text>
            </TouchableOpacity>

            {/* Exit App Button */}
            <TouchableOpacity
              onPress={onConfirmExit}
              activeOpacity={0.82}
              style={[
                styles.actionBtn,
                styles.exitBtn,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.exitBtnText,
                  { color: theme.danger, fontFamily: fontFam },
                ]}
              >
                🚪 {lang === 'bn' ? 'অ্যাপ বন্ধ করুন' : 'Exit Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
  closePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  sponsorCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardVisualHeader: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardBody: {
    padding: 20,
    gap: 16,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
  },
  highlightsBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: 10,
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
    fontWeight: '600',
    flex: 1,
  },
  ctaButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  unitIdLabel: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: -4,
  },
  exitDock: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  exitDialogTextWrap: {
    alignItems: 'center',
    gap: 2,
  },
  exitQuestion: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  exitSub: {
    fontSize: 12.5,
  },
  exitActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayBtn: {
    // Primary green
  },
  stayBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  exitBtn: {
    borderWidth: 1,
  },
  exitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
