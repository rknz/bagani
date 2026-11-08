/**
 * BAGANI — Notifications Center Modal (Screen 14 of DESIGN_SYSTEM.md)
 * Allows viewing all arrived notifications & created tasks, selecting items,
 * choosing "Already Completed" vs "Do It Later", and clicking "Save" on the right-hand side.
 */

import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLanguage } from '../../core/l10n/translations';
import {
  APP_TYPOGRAPHY,
  AppThemeColors,
  DESIGN_TOKENS,
} from '../../core/theme/app_theme';
import {
  CareTaskStatus,
  GranularCareTask,
} from '../../models/care_schedule_model';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: AppThemeColors;
  lang: AppLanguage;
  careTasks: GranularCareTask[];
  onToggleTask: (task: GranularCareTask) => void;
  onSaveTaskStatus?: (
    task: GranularCareTask,
    nextStatus: CareTaskStatus
  ) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  theme,
  lang,
  careTasks,
  onToggleTask,
  onSaveTaskStatus,
}) => {
  const [filterTab, setFilterTab] = useState<
    'all' | 'pending' | 'do_later' | 'completed'
  >('all');
  const [selectedDrafts, setSelectedDrafts] = useState<
    Record<string, CareTaskStatus>
  >({});

  const fontFam =
    lang === 'bn'
      ? APP_TYPOGRAPHY.fontFamilyBengali
      : APP_TYPOGRAPHY.fontFamilyEnglish;

  const filteredList = careTasks.filter((t) => {
    const status: CareTaskStatus = t.isCompleted
      ? 'completed'
      : t.status || 'pending';
    if (filterTab === 'pending') return status === 'pending';
    if (filterTab === 'do_later') return status === 'do_later';
    if (filterTab === 'completed') return status === 'completed';
    return true;
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.headerRow, { borderBottomColor: theme.border }]}>
            <View style={styles.titleRow}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: theme.textPrimary, fontFamily: fontFam },
                ]}
              >
                {lang === 'bn'
                  ? `নোটিফিকেশন ও পরিচর্যা তালিকা (${careTasks.length})`
                  : `Notifications & Care Tasks (${careTasks.length})`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Tabs inside Notification Center */}
          <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
            {(
              [
                {
                  id: 'all',
                  bn: `সব (${careTasks.length})`,
                  en: `All (${careTasks.length})`,
                },
                {
                  id: 'pending',
                  bn: `বাকি (${
                    careTasks.filter(
                      (x) => !x.isCompleted && x.status !== 'do_later'
                    ).length
                  })`,
                  en: `Pending (${
                    careTasks.filter(
                      (x) => !x.isCompleted && x.status !== 'do_later'
                    ).length
                  })`,
                },
                {
                  id: 'do_later',
                  bn: `পরে করব (${
                    careTasks.filter((x) => x.status === 'do_later').length
                  })`,
                  en: `Do Later (${
                    careTasks.filter((x) => x.status === 'do_later').length
                  })`,
                },
                {
                  id: 'completed',
                  bn: `সম্পন্ন (${
                    careTasks.filter(
                      (x) => x.isCompleted || x.status === 'completed'
                    ).length
                  })`,
                  en: `Completed (${
                    careTasks.filter(
                      (x) => x.isCompleted || x.status === 'completed'
                    ).length
                  })`,
                },
              ] as const
            ).map((tab) => {
              const active = filterTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setFilterTab(tab.id)}
                  style={[
                    styles.tabBtn,
                    {
                      backgroundColor: active
                        ? theme.primary
                        : theme.surfaceElevated,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#FFFFFF' : theme.textSecondary,
                      fontSize: 11.5,
                      fontWeight: '700',
                      fontFamily: fontFam,
                    }}
                  >
                    {lang === 'bn' ? tab.bn : tab.en}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filteredList.map((task) => {
              const isSelected = task.id in selectedDrafts;
              const draftChoice = selectedDrafts[task.id] || 'completed';
              const effectiveStatus: CareTaskStatus = task.isCompleted
                ? 'completed'
                : task.status || 'pending';

              return (
                <View
                  key={task.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor:
                        effectiveStatus === 'completed'
                          ? theme.selectedSurface
                          : theme.surfaceElevated,
                      borderColor: isSelected
                        ? theme.primary
                        : effectiveStatus === 'completed'
                        ? theme.primary
                        : theme.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.notifTopRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDrafts((prev) => {
                          const next = { ...prev };
                          if (task.id in next) {
                            delete next[task.id];
                          } else {
                            next[task.id] =
                              effectiveStatus === 'completed'
                                ? 'do_later'
                                : 'completed';
                          }
                          return next;
                        });
                      }}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 10,
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {effectiveStatus === 'completed'
                          ? '✅'
                          : effectiveStatus === 'do_later'
                          ? '⏰'
                          : '🔔'}
                      </Text>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text
                          style={{
                            color: theme.textPrimary,
                            fontWeight: '700',
                            fontSize: 14,
                            fontFamily: fontFam,
                            textDecorationLine:
                              effectiveStatus === 'completed'
                                ? 'line-through'
                                : 'none',
                          }}
                        >
                          🌱 {lang === 'bn' ? task.plantNameBengali : task.plantNameEnglish}
                          {task.titleBengali ? ` • ${lang === 'bn' ? task.titleBengali : task.titleEnglish}` : ''}
                        </Text>
                        <Text
                          style={{
                            color: theme.textSecondary,
                            fontSize: 12.5,
                            lineHeight: 18,
                            fontFamily: fontFam,
                          }}
                        >
                          👉 {lang === 'bn'
                            ? task.actionDetailsBengali || task.fertilizerOrSprayInstructionBengali
                            : task.actionDetailsEnglish || task.fertilizerOrSprayInstructionEnglish}
                        </Text>
                        {(task.reasoningBengali || task.reasoningEnglish) && (
                          <Text
                            style={{
                              color: theme.textMuted,
                              fontSize: 11.5,
                              fontFamily: fontFam,
                            }}
                          >
                            💡 {lang === 'bn' ? task.reasoningBengali : task.reasoningEnglish}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Right-side Save button or Select/Status badge */}
                    {isSelected ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (onSaveTaskStatus) {
                            onSaveTaskStatus(task, draftChoice);
                          } else {
                            onToggleTask(task);
                          }
                          setSelectedDrafts((prev) => {
                            const next = { ...prev };
                            delete next[task.id];
                            return next;
                          });
                        }}
                        style={[
                          styles.saveBtn,
                          { backgroundColor: theme.primary },
                        ]}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: 12.5,
                            fontFamily: fontFam,
                          }}
                        >
                          💾 {lang === 'bn' ? 'সেভ' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedDrafts((prev) => ({
                            ...prev,
                            [task.id]:
                              effectiveStatus === 'completed'
                                ? 'do_later'
                                : 'completed',
                          }));
                        }}
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              effectiveStatus === 'completed'
                                ? theme.primary
                                : effectiveStatus === 'do_later'
                                ? 'rgba(217, 119, 6, 0.14)'
                                : theme.surface,
                            borderColor:
                              effectiveStatus === 'completed'
                                ? theme.primary
                                : effectiveStatus === 'do_later'
                                ? theme.warning
                                : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              effectiveStatus === 'completed'
                                ? '#FFFFFF'
                                : effectiveStatus === 'do_later'
                                ? theme.warning
                                : theme.primary,
                            fontSize: 11,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          {effectiveStatus === 'completed'
                            ? lang === 'bn'
                              ? '✓ সম্পন্ন'
                              : '✓ Completed'
                            : effectiveStatus === 'do_later'
                            ? lang === 'bn'
                              ? '⏰ পরে করব'
                              : '⏰ Do Later'
                            : lang === 'bn'
                            ? 'নির্বাচন'
                            : 'Select'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {isSelected && (
                    <View
                      style={[
                        styles.choiceBar,
                        { borderTopColor: theme.border },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedDrafts((prev) => ({
                            ...prev,
                            [task.id]: 'completed',
                          }))
                        }
                        style={[
                          styles.choicePill,
                          {
                            backgroundColor:
                              draftChoice === 'completed'
                                ? theme.primary
                                : theme.surface,
                            borderColor:
                              draftChoice === 'completed'
                                ? theme.primary
                                : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              draftChoice === 'completed'
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          ✓{' '}
                          {lang === 'bn'
                            ? 'সম্পন্ন করেছি'
                            : 'Already Completed'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setSelectedDrafts((prev) => ({
                            ...prev,
                            [task.id]: 'do_later',
                          }))
                        }
                        style={[
                          styles.choicePill,
                          {
                            backgroundColor:
                              draftChoice === 'do_later'
                                ? theme.warning
                                : theme.surface,
                            borderColor:
                              draftChoice === 'do_later'
                                ? theme.warning
                                : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color:
                              draftChoice === 'do_later'
                                ? '#FFFFFF'
                                : theme.textPrimary,
                            fontSize: 12,
                            fontWeight: '700',
                            fontFamily: fontFam,
                          }}
                        >
                          ⏰ {lang === 'bn' ? 'পরে করব' : 'Do It Later'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 23, 19, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.screenHorizontalPadding,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    borderRadius: DESIGN_TOKENS.mainCardRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.cardPadding,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: DESIGN_TOKENS.cardPadding,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  listContent: {
    padding: DESIGN_TOKENS.cardPadding,
    gap: DESIGN_TOKENS.spacing.sm,
  },
  notifCard: {
    padding: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.smallCardRadius,
    borderWidth: 1,
    gap: 8,
  },
  notifTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
  },
  choiceBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  choicePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
});
