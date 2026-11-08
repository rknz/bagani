/**
 * BAGANI — Monetization & Advertisement Service (Phase 2)
 * Developer: ProFix - Web & Soft
 *
 * Policies:
 * - Persistent top and bottom ad banners have been permanently removed from main app screens.
 * - Full-screen interstitial ad is permitted exclusively when the user is closing or exiting the application.
 * - Fully compliant with Google Play Ad Policy and Apple ATT guidelines.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type BannerPlacementPosition = 'none' | 'bottom' | 'top' | 'both';

export interface ExitAdSponsor {
  id: string;
  brandName: string;
  taglineBn: string;
  taglineEn: string;
  descriptionBn: string;
  descriptionEn: string;
  highlightsBn: string[];
  highlightsEn: string[];
  ctaUrl?: string;
  ctaTextBn: string;
  ctaTextEn: string;
  unitId: string;
}

export interface AdConfiguration {
  bannersEnabled: boolean; // Permanently false — no ads at top or bottom
  exitAdsEnabled: boolean; // Allowed full-screen ad on app exit
  adsEnabled: boolean; // Legacy flag — false for banners
  placementPosition: BannerPlacementPosition;
  personalizedAdsConsent: boolean;
  attAuthorizedOnIos: boolean;
  androidBannerUnitId: string;
  iosBannerUnitId: string;
  androidExitUnitId: string;
  iosExitUnitId: string;
}

const AD_CONFIG_STORAGE_KEY = '@bagani_ad_config_v2';

export const DEFAULT_AD_CONFIG: AdConfiguration = {
  bannersEnabled: false, // Permanently disabled at top and bottom
  exitAdsEnabled: true, // Only show full screen ad on exit
  adsEnabled: false, // No banners
  placementPosition: 'none',
  personalizedAdsConsent: true,
  attAuthorizedOnIos: true,
  // Official Google AdMob standard test/placeholder IDs ready for production swap by ProFix - Web & Soft
  androidBannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  iosBannerUnitId: 'ca-app-pub-3940256099942544/2934735716',
  androidExitUnitId: 'ca-app-pub-3940256099942544/1033173712',
  iosExitUnitId: 'ca-app-pub-3940256099942544/4411468910',
};

export interface gardeningSponsorMessage {
  id: string;
  headlineBn: string;
  headlineEn: string;
  subtextBn: string;
  subtextEn: string;
  badgeText: string;
}

export const ROTATING_BANNER_ADS: gardeningSponsorMessage[] = [
  {
    id: 'ad_profix_1',
    headlineBn: 'ProFix - Web & Soft • স্মার্ট গার্ডেনিং সলিউশন',
    headlineEn: 'ProFix - Web & Soft • Smart Gardening Solutions',
    subtextBn: 'উন্নত মানের জিও ব্যাগ, ভার্মিকম্পোস্ট ও কলমের চারা সংগ্রহ করুন',
    subtextEn: 'Get premium Geo Bags, Vermicompost & Grafted Saplings',
    badgeText: 'AD',
  },
  {
    id: 'ad_profix_2',
    headlineBn: 'ছাদ বাগানের ওয়াটারপ্রুফিং ও জৈব সার গাইড',
    headlineEn: 'Rooftop Waterproofing & Organic Fertilizer Guide',
    subtextBn: 'BAGANI অ্যাপের সাথে আপনার ছাদ হোক ১০০% সুরক্ষিত ও ফলবতী',
    subtextEn: 'Keep your rooftop 100% safe and fruitful with BAGANI',
    badgeText: 'AD',
  },
];

export const EXIT_SPONSOR_ADS: ExitAdSponsor[] = [
  {
    id: 'exit_profix_1',
    brandName: 'ProFix - Web & Soft',
    taglineBn: 'স্মার্ট ছাদ বাগান ও ডিজিটাল টেকনোলজি সলিউশন',
    taglineEn: 'Smart Rooftop Gardening & Digital Tech Solutions',
    descriptionBn:
      'উন্নত মানের ইউভি প্রোটেক্টেড জিও ব্যাগ, খাঁটি ভার্মিকম্পোস্ট, কলমের চারা ও স্বয়ংক্রিয় সেচ ব্যবস্থাপনায় আপনার ছাদ হোক সম্পূর্ণ নিরাপদ ও ফলবতী।',
    descriptionEn:
      'Premium UV-protected geo bags, pure vermicompost, grafted saplings, and automated irrigation to make your rooftop garden safe and bountiful.',
    highlightsBn: [
      '১০০% অর্গানিক পুষ্টি ও কেঁচো কম্পোস্ট সার',
      'টেকসই ইউভি-ট্রিটেড জিও ব্যাগ ও ড্রেনেজ ম্যাট',
      'ছাদ সুরক্ষা ও উন্নত ওয়াটারপ্রুফিং কনসালটেন্সি',
    ],
    highlightsEn: [
      '100% Organic compost & vermiculture nutrition',
      'Durable UV-treated geo-bags & root-barrier drainage mats',
      'Rooftop safety & waterproofing consultation',
    ],
    ctaTextBn: '🌐 বিস্তারিত জানুন ও ভিজিট করুন',
    ctaTextEn: '🌐 Learn More & Visit Partner',
    ctaUrl: 'https://profixtech.com',
    unitId: 'ca-app-pub-3940256099942544/1033173712',
  },
  {
    id: 'exit_profix_2',
    brandName: 'BAGANI Pro Agro Care',
    taglineBn: 'জৈব কৃষি উপকরণ ও রোগবালাই ব্যবস্থাপনা',
    taglineEn: 'Organic Plant Nutrition & Pest Management',
    descriptionBn:
      'ছাদবাগানের ফল ও সবজির রোগ প্রতিরোধে নিম তেল, ট্রাইকোডার্মা ও উন্নত জাতের বারোমাসি চারার বিশ্বস্ত ঠিকানা।',
    descriptionEn:
      'Cold-pressed Neem oil, Trichoderma bio-fungicide, and verified all-season fruit grafts for home gardeners.',
    highlightsBn: [
      'কোল্ড-প্রেসড খাঁটি নিম তেল পেস্টিসাইড',
      'প্রাকৃতিক ট্রাইকোডার্মা বায়ো-ফাংগিসাইড',
      'বারোমাসি কাটিমন আম ও ভিয়েতনামি মাল্টা চারা',
    ],
    highlightsEn: [
      'Pure cold-pressed neem oil bio-pesticide',
      'Organic Trichoderma bio-fungicide',
      'Certified all-season Katimon mango & Malta grafts',
    ],
    ctaTextBn: '🌿 প্রোডাক্ট ক্যাটালগ দেখুন',
    ctaTextEn: '🌿 View Product Catalog',
    ctaUrl: 'https://profixtech.com/agro',
    unitId: 'ca-app-pub-3940256099942544/1033173712',
  },
];

export class AdService {
  static async getAdConfig(): Promise<AdConfiguration> {
    try {
      const raw = await AsyncStorage.getItem(AD_CONFIG_STORAGE_KEY);
      if (!raw) return DEFAULT_AD_CONFIG;
      return {
        ...DEFAULT_AD_CONFIG,
        ...(JSON.parse(raw) as Partial<AdConfiguration>),
        bannersEnabled: false, // Force banners disabled per user directive
        adsEnabled: false,
        placementPosition: 'none',
      };
    } catch {
      return DEFAULT_AD_CONFIG;
    }
  }

  static async updateAdConfig(
    updates: Partial<AdConfiguration>
  ): Promise<AdConfiguration> {
    const current = await this.getAdConfig();
    const next: AdConfiguration = {
      ...current,
      ...updates,
      bannersEnabled: false, // Ensure banners never get enabled
      adsEnabled: false,
      placementPosition: 'none',
    };
    await AsyncStorage.setItem(AD_CONFIG_STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  static getActiveUnitId(config: AdConfiguration): string {
    return Platform.OS === 'ios'
      ? config.iosBannerUnitId
      : config.androidBannerUnitId;
  }

  static getActiveExitUnitId(config: AdConfiguration): string {
    return Platform.OS === 'ios'
      ? config.iosExitUnitId
      : config.androidExitUnitId;
  }
}
