/**
 * BAGANI — Built-In Legal, Privacy Policy, Terms & Data Safety Modal
 * Ensures 100% Google Play Store & Apple App Store Review Compliance
 */

import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { APP_CONFIG } from '../../core/constants/app_constants';
import { AppLanguage } from '../../core/l10n/translations';
import { AppThemeColors } from '../../core/theme/app_theme';

interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {lang === 'bn'
                ? 'প্রাইভেসি পলিসি ও শর্তাবলী (Privacy & Terms)'
                : 'Privacy Policy, Terms & Data Safety'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.surfaceElevated },
              ]}
            >
              <Text style={[styles.closeText, { color: theme.textPrimary }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            <Text style={[styles.sectionHead, { color: theme.primary }]}>
              1. {APP_CONFIG.appName} — {APP_CONFIG.developerName}
            </Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              {lang === 'bn'
                ? 'BAGANI (Smart Gardening & Plant Care) অ্যাপটি গুগল প্লে স্টোর (Android 10+) এবং অ্যাপল অ্যাপ স্টোর (iOS 15.0 - iOS 27+) এর সমস্ত প্রাইভেসি, ডেটা সেফটি এবং ইউজার গাইডলাইন মেনে তৈরি করা হয়েছে।'
                : 'BAGANI (Smart Gardening & Plant Care) is engineered in full compliance with Google Play Store (Android 10+) and Apple App Store (iOS 15.0 to iOS 27+) privacy, data safety, and user protection standards.'}
            </Text>

            <Text style={[styles.sectionHead, { color: theme.primary }]}>
              2. {lang === 'bn' ? 'পারমিশন ও ডেটা সুরক্ষা' : 'Permissions & Data Safety'}
            </Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              {lang === 'bn'
                ? '• ক্যামেরা ও ফটো পিকার: শুধুমাত্র টবের QR কোড স্ক্যান এবং গাছের পাতার রোগ নির্ণয়ের ছবি তোলার জন্য ব্যবহৃত হয়।\n• লোকেশন: কেবল স্থানীয় আবহাওয়া ভিত্তিক পানি ও সার দেওয়ার সময়সূচি এবং নিকটস্থ কৃষি অফিস/নার্সারি খুঁজে পেতে ব্যবহৃত হয়।\n• অফলাইন ও ক্লাউড ব্যাকআপ: আপনার সব গাছের তথ্য লোকাল ডাটাবেজে এবং আপনার Google অ্যাকাউন্টে নিরাপদে সিঙ্ক থাকে।'
                : '• Camera & Photo Picker: Used exclusively for scanning plant QR tags and capturing leaf photos for disease diagnosis.\n• Coarse Location: Used only while the app is open to provide local weather care schedules and nearby agriculture directories.\n• Offline & Cloud Sync: Your garden records are stored locally first and backed up securely to your account.'}
            </Text>

            <Text style={[styles.sectionHead, { color: theme.primary }]}>
              3.{' '}
              {lang === 'bn'
                ? 'অ্যাকাউন্ট ও ডেটা ডিলিট করার অধিকার'
                : 'Account & Cloud Data Deletion Right'}
            </Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              {lang === 'bn'
                ? 'ব্যবহারকারী যেকোনো সময় প্রোফাইল বা সেটিংস থেকে "Delete Account & Cloud Data" বাটনে ক্লিক করে তার সম্পূর্ণ অ্যাকাউন্ট ও ক্লাউড ডেটা স্থায়ীভাবে মুছে ফেলতে পারবেন।'
                : 'Users can permanently delete their account and all associated cloud and local data at any time directly from the Profile/Settings screen.'}
            </Text>

            <Text style={[styles.sectionHead, { color: theme.primary }]}>
              4.{' '}
              {lang === 'bn'
                ? 'এআই কৃষি ও উদ্ভিদ পরামর্শ ডিসক্লেইমার'
                : 'AI Botanical Guidance Disclaimer'}
            </Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              {lang === 'bn'
                ? 'অ্যাপের এআই ক্যামেরা স্ক্যানার এবং গ্রোথ পূর্বাভাস ছাদ বাগান পরিচর্যার সহায়ক নির্দেশিকা হিসেবে কাজ করে। জটিল কৃষি সমস্যায় স্থানীয় কৃষি অফিসের পরামর্শ নেওয়ার সুবিধা অ্যাপে যুক্ত রয়েছে।'
                : 'AI plant identification, disease remedies, and growth forecasts are provided as horticultural guidance for rooftop gardeners.'}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    padding: 18,
    gap: 10,
  },
  sectionHead: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
  },
});

