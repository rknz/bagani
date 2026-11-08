/**
 * BAGANI (Smart Gardening & Plant Care)
 * Core Identity, Store Metadata & OS Compatibility Constants
 * Developer: ProFix - Web & Soft
 */

export const APP_CONFIG = {
  appName: 'BAGANI',
  appNameBengali: 'বাগানি',
  subtitle: 'Smart Gardening & Plant Care',
  subtitleBengali: 'স্মার্ট ছাদ বাগান ও গাছের পরিচর্যা',
  tagline: 'Grow Smart, Live Green.',
  taglineBengali: 'গাছ লাগান, পরিবেশ বাঁচান।',
  packageName: 'com.profix.bagani',
  bundleIdentifier: 'com.profix.bagani',
  developerName: 'ProFix - Web & Soft',
  version: '1.0.0',
  buildNumber: 1,

  osSupport: {
    androidMinSdk: 29, // Android 10
    androidTargetSdk: 35, // Android 15/16+ & future updates
    iosMinVersion: '15.0', // iOS 15.0
    iosMaxVersion: '27.0+', // iOS 26 / iOS 27+ & future updates
  },

  storeMetadata: {
    playStoreTitle: 'BAGANI: Smart Plant Care',
    playStoreShortDesc:
      'Grow Smart, Live Green. Your ultimate guide for smart gardening & plant care.',
    appStoreTitle: 'BAGANI',
    appStoreSubtitle: 'Smart Gardening & Plant Care',
    appStoreKeywords:
      'gardening,plant,care,smart,weather,identifier,tracker,water,fertilizer,garden',
  },
} as const;

