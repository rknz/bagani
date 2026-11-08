/**
 * BAGANI — User Profile & Preferences Model
 * Supports Google Sign-In, Apple Sign-In (iOS), Editable Profile, and Gardener Taste FAQ
 */

import { AppLanguage } from '../core/l10n/translations';
import { ThemeModePreference } from '../core/theme/app_theme';

export type CultivationInterest = 'fruits' | 'vegetables' | 'both';
export type OriginPreference = 'deshi' | 'exotic' | 'both';
export type TastePreference = 'sweet' | 'sour_tangy' | 'both';

export interface GardenerTasteProfile {
  cultivationInterest: CultivationInterest;
  originPreference: OriginPreference;
  tastePreference: TastePreference;
}

export interface UserModel {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  district: string;
  address?: string;
  organizationOrProfession?: string;
  authProvider: 'google' | 'apple' | 'guest';
  hasPasswordConfigured: boolean;
  language: AppLanguage;
  themePreference: ThemeModePreference;
  tasteProfile?: GardenerTasteProfile;
  createdAtIso: string;
  lastCloudSyncIso?: string;
}

