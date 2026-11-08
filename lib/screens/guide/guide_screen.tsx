/**
 * BAGANI — Guide & Weather Care Hub Screen (Sections 8 & 9 of DESIGN_SYSTEM.md)
 * Combines:
 * 1. Smart Rooftop Garden Planner & 6-Stage Practical Lifecycle Guide
 * 2. Live Weather Dashboard & Automated Plant Care Recommendations (Screens 11 & 12)
 * 3. District Agriculture Directory & Local Gardener Community
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import { GranularCareTask } from '../../models/care_schedule_model';
import { PlantModel } from '../../models/plant_model';
import { ScreenTransition } from '../../core/components/screen_transition';
import { DirectoryScreen } from '../directory/directory_screen';
import { PlannerScreen } from '../planner/planner_screen';
import { WeatherCareScreen } from '../weather/weather_care_screen';

export type GuideSubTab = 'planner' | 'weather' | 'directory';

interface GuideScreenProps {
  theme: AppThemeColors;
  lang: AppLanguage;
  userDistrict: string;
  userName: string;
  plants: PlantModel[];
  careTasks: GranularCareTask[];
  onToggleTaskCheckbox: (task: GranularCareTask) => void;
  onSelectPlant?: (plant: PlantModel) => void;
  initialSubTab?: GuideSubTab;
}

export const GuideScreen: React.FC<GuideScreenProps> = ({
  theme,
  lang,
  userDistrict,
  userName,
  plants,
  careTasks,
  onToggleTaskCheckbox,
  onSelectPlant,
  initialSubTab = 'planner',
}) => {
  const [subTab, setSubTab] = useState<GuideSubTab>(initialSubTab);

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  return (
    <View style={styles.wrapper}>
      {/* Top Segmented Switcher */}
      <View
        style={[
          styles.switcherOuter,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.switcherBar,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setSubTab('planner')}
            activeOpacity={0.82}
            style={[
              styles.segmentBtn,
              {
                backgroundColor:
                  subTab === 'planner' ? theme.primary : 'transparent',
                borderColor:
                  subTab === 'planner' ? theme.primary : 'transparent',
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: subTab === 'planner' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: '700',
                fontSize: 13,
                fontFamily: fontFam,
              }}
            >
              📐 {lang === 'bn' ? 'ছাদবাগান প্ল্যানার' : 'Rooftop Planner'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSubTab('weather')}
            activeOpacity={0.82}
            style={[
              styles.segmentBtn,
              {
                backgroundColor:
                  subTab === 'weather' ? theme.primary : 'transparent',
                borderColor:
                  subTab === 'weather' ? theme.primary : 'transparent',
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color: subTab === 'weather' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: '700',
                fontSize: 13,
                fontFamily: fontFam,
              }}
            >
              🌦️ {lang === 'bn' ? 'আবহাওয়া ও যত্ন' : 'Weather & Care'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSubTab('directory')}
            activeOpacity={0.82}
            style={[
              styles.segmentBtn,
              {
                backgroundColor:
                  subTab === 'directory' ? theme.primary : 'transparent',
                borderColor:
                  subTab === 'directory' ? theme.primary : 'transparent',
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                color:
                  subTab === 'directory' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: '700',
                fontSize: 13,
                fontFamily: fontFam,
              }}
            >
              🏛️ {lang === 'bn' ? 'কৃষি ডিরেক্টরি' : 'Agri Directory'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, width: '100%' }}>
        <ScreenTransition transitionKey={subTab}>
          {subTab === 'planner' ? (
            <PlannerScreen theme={theme} lang={lang} />
          ) : subTab === 'weather' ? (
            <WeatherCareScreen
              theme={theme}
              lang={lang}
              userDistrict={userDistrict}
              plants={plants}
              careTasks={careTasks}
              onToggleTaskCheckbox={onToggleTaskCheckbox}
              onSelectPlant={onSelectPlant}
            />
          ) : (
            <DirectoryScreen
              theme={theme}
              lang={lang}
              userDistrict={userDistrict}
              userName={userName}
            />
          )}
        </ScreenTransition>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
  switcherOuter: {
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: DESIGN_TOKENS.screenHorizontalPadding,
    paddingVertical: 8,
  },
  switcherBar: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    minWidth: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});
