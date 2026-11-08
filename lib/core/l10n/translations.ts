/**
 * BAGANI — Bilingual Localization Dictionary (Bengali & English)
 * Supports instant 1-tap toggle between Bengali ('bn') and English ('en').
 */

export type AppLanguage = 'bn' | 'en';

export interface TranslationStrings {
  appName: string;
  subtitle: string;
  tagline: string;
  inspQuote: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  navHome: string;
  navPlanner: string;
  navQrScan: string;
  navAiFinder: string;
  navDirectory: string;
  navSettings: string;
  myPlantsTitle: string;
  addPlantBtn: string;
  scanQrBtn: string;
  currentStatusTab: string;
  futureForecastTab: string;
  weatherWidgetTitle: string;
  urgentCareAlertTitle: string;
  bannerAdLabel: string;
  developerCredit: string;
}

export const TRANSLATIONS: Record<AppLanguage, TranslationStrings> = {
  bn: {
    appName: 'BAGANI (বাগানি)',
    subtitle: 'স্মার্ট ছাদ বাগান ও গাছের পরিচর্যা',
    tagline: 'Grow Smart, Live Green.',
    inspQuote: '“গাছ লাগান, পরিবেশ বাঁচান — সবুজ হোক প্রতিটি ছাদ”',
    greetingMorning: 'শুভ সকাল',
    greetingAfternoon: 'শুভ বিকেল',
    greetingEvening: 'শুভ সন্ধ্যা',
    navHome: 'হোম ড্যাশবোর্ড',
    navPlanner: 'বাগান প্ল্যানার',
    navQrScan: 'QR স্ক্যান ও ট্যাগ',
    navAiFinder: 'AI রোগ নির্ণয়',
    navDirectory: 'কৃষি ডিরেক্টরি',
    navSettings: 'সেটিংস',
    myPlantsTitle: 'আমার রেজিস্টার্ড গাছসমূহ',
    addPlantBtn: '+ গাছ যুক্ত করুন',
    scanQrBtn: 'প্ল্যান্ট QR',
    currentStatusTab: 'বর্তমান অবস্থা (Current Status)',
    futureForecastTab: 'ভবিষ্যৎ অবস্থা ও পূর্বাভাস (Forecast)',
    weatherWidgetTitle: 'লাইভ আবহাওয়া ও ৭ দিনের পূর্বাভাস',
    urgentCareAlertTitle: 'জরুরি পরিচর্যা',
    bannerAdLabel: 'স্পন্সরড বিজ্ঞাপন • ProFix - Web & Soft',
    developerCredit: 'Developed by ProFix - Web & Soft',
  },
  en: {
    appName: 'BAGANI',
    subtitle: 'Smart Gardening & Plant Care',
    tagline: 'Grow Smart, Live Green.',
    inspQuote: '“Plant Trees, Save Nature — Make Every Rooftop Green”',
    greetingMorning: 'Good Morning',
    greetingAfternoon: 'Good Afternoon',
    greetingEvening: 'Good Evening',
    navHome: 'Home',
    navPlanner: 'Garden Planner',
    navQrScan: 'QR Tag & Scan',
    navAiFinder: 'AI Plant Finder',
    navDirectory: 'Agri Directory',
    navSettings: 'Settings',
    myPlantsTitle: 'My Registered Rooftop Plants',
    addPlantBtn: '+ Add Plant',
    scanQrBtn: 'Plant QR',
    currentStatusTab: 'Current Status',
    futureForecastTab: 'Future Outlook & Forecast',
    weatherWidgetTitle: 'Live Weather & 7-Day Forecast',
    urgentCareAlertTitle: 'Urgent Care',
    bannerAdLabel: 'Sponsored Ad • ProFix - Web & Soft',
    developerCredit: 'Developed by ProFix - Web & Soft',
  },
};

