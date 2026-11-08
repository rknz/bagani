/**
 * BAGANI — Granular Weather-Adjusted Care Prescription & Push Notification Service
 * Developer: ProFix - Web & Soft
 *
 * Features:
 * - Dynamic weather-indexed care prescription calculation
 * - Multi-platform Push Notification Scheduling (Expo Native + Web Notification API)
 * - Computes exact trigger date/time matching morning/afternoon/evening slots
 * - Formats localized notifications containing Plant Name, Required Actions, and Reason
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  DailyWeatherSnapshot,
  GranularCareTask,
} from '../models/care_schedule_model';
import { PlantModel } from '../models/plant_model';

const SCHEDULED_NOTIFICATIONS_KEY = '@bagani_scheduled_notifications_v2';

// Configure default notification presentation behavior for native
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Graceful fallback on web or unsupported environments
}

export interface ScheduledNotificationRecord {
  id: string;
  taskId: string;
  plantId: string;
  plantName: string;
  title: string;
  body: string;
  scheduledTimeIso: string;
  platform: string;
}

export class NotificationService {
  /**
   * Request push notification permissions on both Native & Web
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') return true;
          const status = await Notification.requestPermission();
          return status === 'granted';
        }
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (err) {
      console.warn('Failed to request notification permission', err);
      return false;
    }
  }

  /**
   * Schedules a push notification for a designated care task
   */
  static async scheduleCareTaskPushNotification(
    task: GranularCareTask,
    lang: 'bn' | 'en' = 'bn'
  ): Promise<{
    success: boolean;
    notificationId?: string;
    scheduledForIso: string;
  }> {
    // 1. Compute target date and hour based on slot
    const taskDate = new Date(task.dueDateIso);
    let targetHour = 8; // morning default (8:00 AM)
    let targetMinute = 0;

    if (task.recommendedTimeSlot === 'afternoon') {
      targetHour = 13; // 1:00 PM
    } else if (task.recommendedTimeSlot === 'evening') {
      targetHour = 17; // 5:00 PM
      targetMinute = 30;
    }

    const triggerDate = new Date(taskDate);
    triggerDate.setHours(targetHour, targetMinute, 0, 0);

    // If scheduled time has already passed today, set to 1 minute from now for immediate awareness
    const now = new Date();
    const finalTrigger = triggerDate.getTime() > now.getTime() ? triggerDate : new Date(now.getTime() + 60 * 1000);

    // 2. Format rich Title & Body
    const plantName = lang === 'bn' ? task.plantNameBengali : task.plantNameEnglish;
    const taskTitle =
      (lang === 'bn' ? task.titleBengali : task.titleEnglish) ||
      (lang === 'bn' ? 'গাছের বিশেষ যত্ন ও পরিচর্যার সময় হয়েছে' : 'Scheduled Plant Care Time');
    const actions =
      (lang === 'bn' ? task.actionDetailsBengali : task.actionDetailsEnglish) ||
      task.fertilizerOrSprayInstructionBengali ||
      '';
    const reason =
      (lang === 'bn' ? task.reasoningBengali : task.reasoningEnglish) ||
      task.shadeOrMoistureAdvisoryBengali ||
      '';

    const notifTitle = `🌱 ${plantName}: ${taskTitle}`;
    const notifBody = `👉 পদক্ষেপ: ${actions}${reason ? `\n💡 কারণ: ${reason}` : ''}`;

    let notificationId = 'notif_' + Date.now().toString(36);

    try {
      await this.requestPermissions();

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            const delayMs = finalTrigger.getTime() - Date.now();
            if (delayMs > 0 && delayMs < 2147483647) {
              setTimeout(() => {
                try {
                  new Notification(notifTitle, {
                    body: notifBody,
                    icon: '/favicon.ico',
                  });
                } catch {
                  // Ignore web notification failure
                }
              }, delayMs);
            } else {
              new Notification(notifTitle, {
                body: notifBody,
                icon: '/favicon.ico',
              });
            }
          }
        }
      } else {
        const scheduledId = await Notifications.scheduleNotificationAsync({
          content: {
            title: notifTitle,
            body: notifBody,
            data: { taskId: task.id, plantId: task.plantId },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: finalTrigger.getTime(),
          },
        });
        if (scheduledId) {
          notificationId = scheduledId;
        }
      }

      // Persist scheduled record in AsyncStorage
      const record: ScheduledNotificationRecord = {
        id: notificationId,
        taskId: task.id,
        plantId: task.plantId,
        plantName,
        title: notifTitle,
        body: notifBody,
        scheduledTimeIso: finalTrigger.toISOString(),
        platform: Platform.OS,
      };

      const existingRaw = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      const existingList: ScheduledNotificationRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      await AsyncStorage.setItem(
        SCHEDULED_NOTIFICATIONS_KEY,
        JSON.stringify([record, ...existingList].slice(0, 50))
      );

      return {
        success: true,
        notificationId,
        scheduledForIso: finalTrigger.toISOString(),
      };
    } catch (err) {
      console.warn('Notification scheduling error', err);
      return {
        success: false,
        scheduledForIso: finalTrigger.toISOString(),
      };
    }
  }

  /**
   * Computes a dynamic weather-indexed care prescription for a plant
   */
  static computeWeatherPrescription(
    plant: PlantModel,
    todayWeather: DailyWeatherSnapshot
  ): {
    recommendedWaterLiters: number;
    timeSlot: 'morning' | 'afternoon';
    advisoryBn: string;
    advisoryEn: string;
  } {
    const baseLiters =
      plant.containerSizeInches >= 24
        ? 2.5
        : plant.containerSizeInches >= 18
        ? 1.8
        : 1.2;

    if (todayWeather.rainProbabilityPercent >= 60) {
      return {
        recommendedWaterLiters: 0,
        timeSlot: 'afternoon',
        advisoryBn: `আজ বৃষ্টির সম্ভাবনা ${todayWeather.rainProbabilityPercent}%। পানি দেওয়া বন্ধ রাখুন এবং টবের নিচে পানি জমে থাকলে নিষ্কাশন করুন।`,
        advisoryEn: `Rain probability is ${todayWeather.rainProbabilityPercent}%. Skip watering today and check pot drainage.`,
      };
    }

    if (todayWeather.tempCelsius >= 33) {
      const boostedLiters = Number((baseLiters * 1.25).toFixed(1));
      return {
        recommendedWaterLiters: boostedLiters,
        timeSlot: 'morning',
        advisoryBn: `তাপমাত্রা ${todayWeather.tempCelsius}°C — সকাল ৮টার আগে ${boostedLiters} লিটার পানি দিন এবং বিকেলে পাতায় হালকা পানি স্প্রে করুন।`,
        advisoryEn: `High heat (${todayWeather.tempCelsius}°C) — water ${boostedLiters}L before 8 AM and mist foliage in late afternoon.`,
      };
    }

    return {
      recommendedWaterLiters: baseLiters,
      timeSlot: 'morning',
      advisoryBn: `স্বাভাবিক আবহাওয়া (${todayWeather.tempCelsius}°C) — সকালে ${baseLiters} লিটার পানি দিন।`,
      advisoryEn: `Pleasant weather (${todayWeather.tempCelsius}°C) — apply ${baseLiters}L water in the morning.`,
    };
  }

  /**
   * Counts pending urgent tasks for the next 3 days
   */
  static getPendingUrgentCount(tasks: GranularCareTask[]): number {
    return tasks.filter((t) => !t.isCompleted && t.isUrgentNext3Days).length;
  }
}
