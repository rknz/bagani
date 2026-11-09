/**
 * BAGANI — Modern Award-Winning Floating Pill & Circle Bottom Navigation Bar
 * Design inspiration: Fryd & Apple Design Award-winning mobile interfaces
 * Active item expands into a white capsule pill with emerald border and label
 * Inactive items collapse into solid emerald-green circles with crisp white SVG icons
 */

import React from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AppScreenRoute } from '../../screens';
import { AppLanguage } from '../l10n/translations';
import { APP_TYPOGRAPHY, AppThemeColors } from '../theme/app_theme';

interface BottomNavBarProps {
  activeRoute: AppScreenRoute;
  onSelectRoute: (route: AppScreenRoute) => void;
  theme: AppThemeColors;
  lang: AppLanguage;
}

interface NavItemConfig {
  route: AppScreenRoute;
  labelBn: string;
  labelEn: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { route: 'home', labelBn: 'হোম', labelEn: 'Home' },
  { route: 'my_garden', labelBn: 'বাগান', labelEn: 'Garden' },
  { route: 'scan', labelBn: 'স্ক্যান', labelEn: 'Scan' },
  { route: 'guide', labelBn: 'গাইড', labelEn: 'Guide' },
  { route: 'profile', labelBn: 'প্রোফাইল', labelEn: 'Profile' },
];

const renderNavIcon = (
  route: AppScreenRoute,
  color: string,
  isActive: boolean,
  theme: AppThemeColors
) => {
  switch (route) {
    case 'home':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? 'none' : color}
          />
          <Path
            d="M9 21V13H15V21"
            stroke={isActive ? color : theme.primary}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'my_garden':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 13V8M12 8C12 8 8.5 7 8.5 4.5C10.5 4.5 12 6 12 8ZM12 8C12 8 15.5 7 15.5 4.5C13.5 4.5 12 6 12 8Z"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6.5 13H17.5L16 20.5H8L6.5 13Z"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? 'none' : color}
          />
          <Path d="M5 13H19" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'scan':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 8V5C3 3.89543 3.89543 3 5 3H8"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path
            d="M16 3H19C20.1046 3 21 3.89543 21 5V8"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path
            d="M21 16V19C21 20.1046 20.1046 21 19 21H16"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path
            d="M8 21H5C3.89543 21 3 20.1046 3 19V16"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Rect x="9" y="9" width="6" height="6" rx="1.5" fill={color} />
        </Svg>
      );

    case 'guide':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14.5 4.5L19.5 9.5L16.5 12.5L11.5 7.5L14.5 4.5Z"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? 'none' : color}
          />
          <Path
            d="M11.5 7.5L4.5 14.5V17.5H7.5L14.5 10.5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M3.5 20.5L7.5 16.5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </Svg>
      );

    case 'profile':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? 'none' : color}
          />
          <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2.2" fill={isActive ? 'none' : color} />
        </Svg>
      );
  }
};

interface BottomNavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  onPress: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
  fontFam: string;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  item,
  isActive,
  onPress,
  theme,
  lang,
  fontFam,
}) => {
  const anim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isActive ? 1 : 0,
      duration: 250,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const targetPillWidth = lang === 'bn' ? 104 : 112;

  const itemWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, targetPillWidth],
  });

  const textOpacity = anim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });

  const textTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });

  const textWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, lang === 'bn' ? 48 : 56],
  });

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.primary,
      theme.mode === 'dark' ? '#1E2F25' : '#FFFFFF',
    ],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', theme.primary],
  });

  const iconScale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.93, 1],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.84}
      style={{ overflow: 'visible' }}
    >
      <Animated.View
        style={[
          styles.navItemAnimatedBox,
          {
            width: itemWidth,
            backgroundColor: bgColor,
            borderColor: borderColor,
            transform: [{ scale: iconScale }],
          },
        ]}
      >
        {/* Layered Icons for smooth cross-fading */}
        <View style={styles.iconLayerWrapper}>
          <Animated.View
            style={[
              styles.iconAbsoluteLayer,
              {
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            {renderNavIcon(item.route, '#FFFFFF', false, theme)}
          </Animated.View>

          <Animated.View
            style={[
              styles.iconAbsoluteLayer,
              {
                opacity: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ]}
          >
            {renderNavIcon(item.route, theme.primary, true, theme)}
          </Animated.View>
        </View>

        {/* Sliding and fading label */}
        <Animated.View
          style={{
            width: textWidth,
            opacity: textOpacity,
            overflow: 'hidden',
            transform: [{ translateX: textTranslateX }],
          }}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.activeLabelText,
              {
                color: theme.primary,
                fontFamily: fontFam,
              },
            ]}
          >
            {lang === 'bn' ? item.labelBn : item.labelEn}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeRoute,
  onSelectRoute,
  theme,
  lang,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const resolveActive = (itemRoute: AppScreenRoute): boolean => {
    if (activeRoute === itemRoute) return true;
    if (activeRoute === 'weather_dashboard' && itemRoute === 'home') return true;
    if (activeRoute === 'plant_profile' && itemRoute === 'my_garden') return true;
    if ((activeRoute === 'scanner' || activeRoute === 'qr_tracker') && itemRoute === 'scan') return true;
    if ((activeRoute === 'planner' || activeRoute === 'directory') && itemRoute === 'guide') return true;
    if ((activeRoute === 'settings' || activeRoute === 'notifications') && itemRoute === 'profile') return true;
    return false;
  };

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={styles.barOuter}>
      <View
        style={[
          styles.barDock,
          {
            backgroundColor: theme.mode === 'dark' ? '#17251D' : '#FFFFFF',
            borderColor: theme.mode === 'dark' ? '#2A3C30' : 'rgba(0,0,0,0.06)',
          },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = resolveActive(item.route);
          return (
            <BottomNavItem
              key={item.route}
              item={item}
              isActive={isActive}
              onPress={() => onSelectRoute(item.route)}
              theme={theme}
              lang={lang}
              fontFam={fontFam}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barOuter: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  barDock: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 36,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    gap: 6,
  },
  navItemAnimatedBox: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  iconLayerWrapper: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconAbsoluteLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabelText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginLeft: 6,
  },
});
