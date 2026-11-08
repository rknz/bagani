/**
 * BAGANI — Banner Ad Slot (Permanently Disabled per User Directive)
 * Persistent top and bottom ad banners have been removed.
 * Returns null unconditionally.
 */

import React from 'react';
import { AdConfiguration } from '../../services/ad_service';
import { AppLanguage } from '../l10n/translations';
import { AppThemeColors } from '../theme/app_theme';

interface BannerAdSlotProps {
  position?: 'top' | 'bottom';
  adConfig?: AdConfiguration;
  theme?: AppThemeColors;
  lang?: AppLanguage;
  onTogglePosition?: () => void;
}

export const BannerAdSlot: React.FC<BannerAdSlotProps> = () => {
  // Top and bottom banners permanently disabled
  return null;
};
