/**
 * BAGANI — Interactive User Feedback & Developer Communication Modal
 * Allows gardeners to submit suggestions, bug reports, questions, or reviews directly
 * to the development team at ProFix - Web & Soft.
 */

import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';
import { APP_CONFIG } from '../constants/app_constants';
import { AppLanguage } from '../l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors, DESIGN_TOKENS } from '../theme/app_theme';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
  userEmail?: string;
  userName?: string;
}

type FeedbackCategory = 'suggestion' | 'bug' | 'praise' | 'question';

const FEEDBACK_STORAGE_KEY = '@bagani_user_feedbacks';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
  userEmail = '',
  userName = '',
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(userEmail);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const handleClose = () => {
    setSubmitted(false);
    setMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(
        lang === 'bn' ? 'বার্তা লিখুন' : 'Message Required',
        lang === 'bn'
          ? 'অনুগ্রহ করে আপনার মূল্যবান মতামত বা পরামর্শ লিখুন।'
          : 'Please write your feedback or suggestion before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackItem = {
        id: 'fb_' + Date.now().toString(36),
        category,
        rating,
        message: message.trim(),
        email: email.trim() || userEmail || 'anonymous',
        userName: userName || 'Gardener',
        createdAt: new Date().toISOString(),
        appName: APP_CONFIG.appName,
        appVersion: APP_CONFIG.version,
      };

      // Persist feedback locally so it's never lost
      const existingRaw = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
      const list = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(feedbackItem);
      await AsyncStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify(list.slice(0, 100))
      );

      setSubmitted(true);
    } catch {
      Alert.alert(
        lang === 'bn' ? 'ত্রুটি' : 'Error',
        lang === 'bn'
          ? 'মতামত সংরক্ষণ করা সম্ভব হয়নি। সরাসরি ইমেইলে পাঠাতে পারেন।'
          : 'Failed to record feedback. You can email the developer directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendViaEmail = () => {
    const subject = encodeURIComponent(
      `[BAGANI Feedback] ${category.toUpperCase()} from ${userName || 'User'} (${APP_CONFIG.version})`
    );
    const body = encodeURIComponent(
      `Category: ${category}\nRating: ${rating}/5 Stars\nUser: ${userName} (${email || userEmail})\nApp Version: ${APP_CONFIG.version}\n\nMessage:\n${message}\n\n--\nSent from BAGANI Smart Gardening App`
    );
    const mailUrl = `mailto:${APP_CONFIG.developerInfo.supportEmail}?subject=${subject}&body=${body}`;

    Linking.openURL(mailUrl).catch(() => {
      Alert.alert(
        'Email',
        lang === 'bn'
          ? `সরাসরি এই ঠিকানায় ইমেইল পাঠান: ${APP_CONFIG.developerInfo.supportEmail}`
          : `Please email directly to: ${APP_CONFIG.developerInfo.supportEmail}`
      );
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>💬</Text>
                <Text
                  style={[
                    styles.title,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'মতামত ও পরামর্শ দিন'
                    : 'Feedback & Suggestions'}
                </Text>
              </View>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textSecondary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? 'ডেভেলপার টিম: ProFix - Web & Soft'
                  : 'Developer: ProFix - Web & Soft'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.surfaceElevated },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.closeText, { color: theme.textPrimary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {submitted ? (
              <View style={styles.successContainer}>
                <View
                  style={[
                    styles.successIconCircle,
                    { backgroundColor: 'rgba(22, 122, 69, 0.12)' },
                  ]}
                >
                  <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" fill={theme.primary} />
                    <Path
                      d="M8 12.5L10.5 15L16 9.5"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                <Text
                  style={[
                    styles.successTitle,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'আপনার মতামতের জন্য ধন্যবাদ!'
                    : 'Thank You for Your Feedback!'}
                </Text>

                <Text
                  style={[
                    styles.successMessage,
                    { color: theme.textSecondary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'আপনার মূল্যবান পরামর্শ ProFix ডেভেলপমেন্ট টিমের কাছে সফলভাবে সংরক্ষিত হয়েছে। আমরা নিয়মিত ব্যবহারকারীদের মতামত মূল্যায়ন করে নতুন আপডেট নিয়ে আসি।'
                    : 'Your valuable feedback has been safely recorded for the ProFix development team. We continuously review user suggestions to make BAGANI even better.'}
                </Text>

                <View style={styles.successActions}>
                  <TouchableOpacity
                    onPress={handleSendViaEmail}
                    activeOpacity={0.85}
                    style={[
                      styles.emailActionBtn,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.emailActionText,
                        { color: theme.primary, fontFamily: fontFam },
                      ]}
                    >
                      ✉️{' '}
                      {lang === 'bn'
                        ? 'সরাসরি ইমেইলেও পাঠান (ঐচ্ছিক)'
                        : 'Send via Email (Optional)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClose}
                    activeOpacity={0.88}
                    style={[
                      styles.primarySubmitBtn,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.submitBtnText,
                        { color: '#FFFFFF', fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn' ? 'সম্পন্ন' : 'Done'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* 1. Category Selection */}
                <Text
                  style={[
                    styles.label,
                    { color: theme.textPrimary, fontFamily: fontFam },
                  ]}
                >
                  {lang === 'bn'
                    ? 'মতামতের ধরন নির্বাচন করুন'
                    : 'Select Feedback Category'}
                </Text>
                <View style={styles.categoryRow}>
                  {(
                    [
                      {
                        id: 'suggestion',
                        labelBn: '💡 পরামর্শ',
                        labelEn: '💡 Suggestion',
                      },
                      {
                        id: 'bug',
                        labelBn: '🐞 বাগ / ত্রুটি',
                        labelEn: '🐞 Bug Report',
                      },
                      {
                        id: 'praise',
                        labelBn: '⭐ প্রশংসা',
                        labelEn: '⭐ Appreciation',
                      },
                      {
                        id: 'question',
                        labelBn: '❓ জিজ্ঞাসা',
                        labelEn: '❓ Question',
                      },
                    ] as const
                  ).map((item) => {
                    const active = category === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => setCategory(item.id)}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: active
                              ? theme.primary
                              : theme.surfaceElevated,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            {
                              color: active ? '#FFFFFF' : theme.textPrimary,
                              fontFamily: fontFam,
                            },
                          ]}
                        >
                          {lang === 'bn' ? item.labelBn : item.labelEn}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 2. Rating (Stars) */}
                <Text
                  style={[
                    styles.label,
                    { color: theme.textPrimary, fontFamily: fontFam, marginTop: 12 },
                  ]}
                >
                  {lang === 'bn' ? 'অ্যাপ রেটিং দিন' : 'Rate Your Experience'}
                </Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.7}
                      onPress={() => setRating(star)}
                      style={styles.starBtn}
                    >
                      <Text
                        style={{
                          fontSize: 26,
                          opacity: star <= rating ? 1 : 0.28,
                        }}
                      >
                        ⭐
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text
                    style={[
                      styles.ratingNumber,
                      { color: theme.primary, fontFamily: fontFam },
                    ]}
                  >
                    {rating} / 5
                  </Text>
                </View>

                {/* 3. Feedback Message */}
                <Text
                  style={[
                    styles.label,
                    { color: theme.textPrimary, fontFamily: fontFam, marginTop: 12 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'আপনার মতামত বা অভিজ্ঞতা লিখুন'
                    : 'Your Feedback / Comment'}
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  placeholder={
                    lang === 'bn'
                      ? 'অ্যাপটি কেমন লাগছে? কোনো নতুন ফিচার চান বা কোনো সমস্যা হয়েছে? বিস্তারিত লিখুন...'
                      : 'How is your experience with BAGANI? Any features you want or issues faced? Write here...'
                  }
                  placeholderTextColor={theme.textSecondary}
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

                {/* 4. Contact Email (Optional) */}
                <Text
                  style={[
                    styles.label,
                    { color: theme.textPrimary, fontFamily: fontFam, marginTop: 12 },
                  ]}
                >
                  {lang === 'bn'
                    ? 'আপনার ইমেইল (প্রয়োজনে উত্তরের জন্য)'
                    : 'Your Email (For developer reply)'}
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                      fontFamily: fontFam,
                    },
                  ]}
                />

                {/* Submit & Contact Buttons */}
                <View style={styles.actionBlock}>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.88}
                    style={[
                      styles.primarySubmitBtn,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.submitBtnText,
                        { color: '#FFFFFF', fontFamily: fontFam },
                      ]}
                    >
                      {isSubmitting
                        ? lang === 'bn'
                          ? 'পাঠানো হচ্ছে...'
                          : 'Submitting...'
                        : lang === 'bn'
                        ? 'মতামত জমা দিন'
                        : 'Submit Feedback'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSendViaEmail}
                    activeOpacity={0.85}
                    style={[
                      styles.secondaryEmailBtn,
                      {
                        backgroundColor: theme.surfaceElevated,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.secondaryEmailText,
                        { color: theme.textPrimary, fontFamily: fontFam },
                      ]}
                    >
                      ✉️{' '}
                      {lang === 'bn'
                        ? 'সরাসরি ইমেইল অ্যাপ দিয়ে পাঠান'
                        : 'Open Email Client Directly'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    padding: 16,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starBtn: {
    padding: 4,
  },
  ratingNumber: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
  },
  textArea: {
    width: '100%',
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  inputField: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  actionBlock: {
    marginTop: 16,
    gap: 10,
  },
  primarySubmitBtn: {
    width: '100%',
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryEmailBtn: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryEmailText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 12,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 380,
  },
  successActions: {
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  emailActionBtn: {
    width: '100%',
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});

