/**
 * BAGANI — Dual Calendar (Bengali বঙ্গাব্দ + English Date) & Greeting Utility
 */

import { AppLanguage, TRANSLATIONS } from '../l10n/translations';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BENGALI_MONTHS = [
  'বৈশাখ',
  'জ্যৈষ্ঠ',
  'আষাঢ়',
  'শ্রাবণ',
  'ভাদ্র',
  'আশ্বিন',
  'কার্তিক',
  'অগ্রহায়ণ',
  'পৌষ',
  'মাঘ',
  'ফাল্গুন',
  'চৈত্র',
];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)]);
}

export function getDynamicGreeting(lang: AppLanguage, date = new Date()): string {
  const hour = date.getHours();
  const t = TRANSLATIONS[lang];
  if (hour < 12) return t.greetingMorning;
  if (hour < 18) return t.greetingAfternoon;
  return t.greetingEvening;
}

export function getFormattedDualDate(date = new Date()): {
  englishDate: string;
  bengaliDate: string;
  timeString: string;
} {
  const englishDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeString = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Approximate Bengali calendar calculation (Bangla Academy revised calendar)
  const gregYear = date.getFullYear();
  const gregMonth = date.getMonth(); // 0-11
  const gregDay = date.getDate();

  let banglaYear = gregYear - 593;
  if (gregMonth < 3 || (gregMonth === 3 && gregDay < 14)) {
    banglaYear = gregYear - 594;
  }

  // Month starts around 14th-16th of each Gregorian month
  const monthStartDays = [14, 15, 15, 16, 16, 16, 16, 15, 15, 14, 13, 14];
  let banglaMonthIndex = (gregMonth + 8) % 12;
  const startDay = monthStartDays[banglaMonthIndex];
  let banglaDay = gregDay - startDay + 1;
  if (banglaDay <= 0) {
    banglaMonthIndex = (banglaMonthIndex + 11) % 12;
    banglaDay = 30 + banglaDay;
  }

  const bengaliDate = `${toBengaliNumber(banglaDay)} ${BENGALI_MONTHS[banglaMonthIndex]}, ${toBengaliNumber(banglaYear)} বঙ্গাব্দ`;

  return { englishDate, bengaliDate, timeString };
}

