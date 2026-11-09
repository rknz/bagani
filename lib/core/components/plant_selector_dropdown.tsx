/**
 * BAGANI — Shared Plant Selector Dropdown Component
 * Developer: ProFix - Web & Soft
 *
 * Reusable dropdown component matching Step 1 of Create New Care Schedule flow:
 * - Shows selected plant's category icon, Bengali/English name, variety and rooftop zone
 * - Filterable search input when multiple plants exist
 * - Option for "Whole Garden (All Plants)" or specific plant
 * - Visual checkmark (✓) for currently selected plant
 * - Responsive, layout-safe, works seamlessly in modals and inline card sections
 */

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
} from '../theme/app_theme';
import { PlantModel } from '../../models/plant_model';

export interface PlantSelectorDropdownProps {
  plants: PlantModel[];
  selectedPlantId: string;
  onSelectPlantId: (plantId: string) => void;
  theme: AppThemeColors;
  lang: AppLanguage;
  allowAllPlantsOption?: boolean;
  label?: string;
}

export const PlantSelectorDropdown: React.FC<PlantSelectorDropdownProps> = ({
  plants,
  selectedPlantId,
  onSelectPlantId,
  theme,
  lang,
  allowAllPlantsOption = true,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const selectedPlantObj =
    selectedPlantId === 'all'
      ? null
      : plants.find((p) => p.id === selectedPlantId) || null;

  const selectedPlantIcon =
    selectedPlantId === 'all'
      ? '🏡'
      : selectedPlantObj?.category === 'fruit'
      ? '🍋'
      : selectedPlantObj?.category === 'flower'
      ? '🌸'
      : '🌿';

  const selectedPlantTitle =
    selectedPlantId === 'all'
      ? lang === 'bn'
        ? 'সম্পূর্ণ বাগান (সকল গাছ)'
        : 'Whole Garden (All Plants)'
      : selectedPlantObj
      ? lang === 'bn'
        ? `${selectedPlantObj.nameBengali} (${selectedPlantObj.nameEnglish})`
        : `${selectedPlantObj.nameEnglish} (${selectedPlantObj.nameBengali})`
      : lang === 'bn'
      ? 'গাছ নির্বাচন করুন'
      : 'Select a Plant';

  const selectedPlantSubtitle =
    selectedPlantId === 'all'
      ? lang === 'bn'
        ? `মোট ${plants.length}টি নিবন্ধিত গাছ অন্তর্ভুক্ত`
        : `Includes all ${plants.length} registered plants`
      : selectedPlantObj
      ? `${selectedPlantObj.variety || (lang === 'bn' ? 'দেশি জাত' : 'Local Variety')} • ${
          selectedPlantObj.rooftopZone || (lang === 'bn' ? 'ছাদ বাগান' : 'Rooftop')
        }`
      : lang === 'bn'
      ? 'তালিকা থেকে গাছ বেছে নিন'
      : 'Choose from garden';

  const filteredPlants = plants.filter((p) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      p.nameBengali.toLowerCase().includes(q) ||
      p.nameEnglish.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q) ||
      p.rooftopZone.toLowerCase().includes(q) ||
      p.qrCodeId.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            styles.label,
            { color: theme.textSecondary, fontFamily: fontFam },
          ]}
        >
          {label}
        </Text>
      ) : null}

      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.82}
        style={[
          styles.dropdownTrigger,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: isOpen ? theme.primary : theme.border,
          },
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={selectedPlantTitle}
      >
        <View style={styles.triggerInnerLeft}>
          <Text style={{ fontSize: 20 }}>{selectedPlantIcon}</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={[
                styles.dropdownSelectedTitle,
                { color: theme.textPrimary, fontFamily: fontFam },
              ]}
            >
              {selectedPlantTitle}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.dropdownSelectedSub,
                { color: theme.textSecondary, fontFamily: fontFam },
              ]}
            >
              {selectedPlantSubtitle}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.dropdownChevronBox,
            {
              backgroundColor: isOpen
                ? theme.selectedSurface
                : 'transparent',
            },
          ]}
        >
          <Text
            style={{
              fontSize: 12,
              color: isOpen ? theme.primary : theme.textSecondary,
              fontWeight: '800',
            }}
          >
            {isOpen ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Dropdown Menu List */}
      {isOpen && (
        <View
          style={[
            styles.dropdownMenuBox,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Search field if multiple plants */}
          {plants.length > 3 && (
            <View
              style={[
                styles.dropdownSearchRow,
                {
                  borderBottomColor: theme.border,
                  backgroundColor: theme.surface,
                },
              ]}
            >
              <Text style={{ fontSize: 13, marginRight: 6 }}>🔍</Text>
              <TextInput
                value={filterQuery}
                onChangeText={setFilterQuery}
                placeholder={
                  lang === 'bn'
                    ? 'গাছের নাম লিখে খুঁজুন...'
                    : 'Search plant by name...'
                }
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.dropdownSearchInput,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              />
              {filterQuery.length > 0 && (
                <TouchableOpacity onPress={() => setFilterQuery('')}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.textSecondary,
                      paddingHorizontal: 4,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Scrollable List of Options */}
          <ScrollView
            nestedScrollEnabled={true}
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={true}
          >
            {/* Option 0: Whole Garden */}
            {allowAllPlantsOption &&
              (!filterQuery.trim() ||
                'সম্পূর্ণ বাগান সকল গাছ whole garden'
                  .toLowerCase()
                  .includes(filterQuery.toLowerCase())) && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectPlantId('all');
                    setIsOpen(false);
                    setFilterQuery('');
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        selectedPlantId === 'all'
                          ? theme.selectedSurface
                          : 'transparent',
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>🏡</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.dropdownItemTitle,
                        {
                          color:
                            selectedPlantId === 'all'
                              ? theme.primary
                              : theme.textPrimary,
                          fontFamily: fontFam,
                        },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'সম্পূর্ণ বাগান (সকল গাছ)'
                        : 'Whole Garden (All Plants)'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.dropdownItemSub,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {lang === 'bn'
                        ? 'বাগানের সকল গাছে একযোগে প্রযোজ্য'
                        : 'Applies to all plants'}
                    </Text>
                  </View>
                  {selectedPlantId === 'all' && (
                    <Text
                      style={{
                        color: theme.primary,
                        fontWeight: '800',
                        fontSize: 15,
                        marginLeft: 6,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              )}

            {/* Plant Items */}
            {filteredPlants.map((plant) => {
              const isSelected = selectedPlantId === plant.id;
              const icon =
                plant.category === 'fruit'
                  ? '🍋'
                  : plant.category === 'flower'
                  ? '🌸'
                  : '🌿';
              return (
                <TouchableOpacity
                  key={plant.id}
                  onPress={() => {
                    onSelectPlantId(plant.id);
                    setIsOpen(false);
                    setFilterQuery('');
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor: isSelected
                        ? theme.selectedSurface
                        : 'transparent',
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, marginRight: 8 }}>{icon}</Text>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.dropdownItemTitle,
                        {
                          color: isSelected
                            ? theme.primary
                            : theme.textPrimary,
                          fontFamily: fontFam,
                        },
                      ]}
                    >
                      {lang === 'bn'
                        ? `${plant.nameBengali} (${plant.nameEnglish})`
                        : `${plant.nameEnglish} (${plant.nameBengali})`}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.dropdownItemSub,
                        { color: theme.textSecondary, fontFamily: fontFam },
                      ]}
                    >
                      {plant.variety || (lang === 'bn' ? 'দেশি জাত' : 'Local')} • {plant.rooftopZone || (lang === 'bn' ? 'ছাদ বাগান' : 'Rooftop')}
                    </Text>
                  </View>
                  {isSelected && (
                    <Text
                      style={{
                        color: theme.primary,
                        fontWeight: '800',
                        fontSize: 15,
                        marginLeft: 6,
                      }}
                    >
                      ✓
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredPlants.length === 0 && (
              <View style={{ padding: 14, alignItems: 'center' }}>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12.5,
                    fontFamily: fontFam,
                  }}
                >
                  {lang === 'bn'
                    ? 'কোনো গাছ পাওয়া যায়নি'
                    : 'No plants matching search'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  triggerInnerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  dropdownSelectedTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  dropdownSelectedSub: {
    fontSize: 11,
    marginTop: 1,
    lineHeight: 14,
  },
  dropdownChevronBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dropdownMenuBox: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
});

