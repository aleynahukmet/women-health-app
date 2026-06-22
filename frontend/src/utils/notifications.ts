import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { subDays, parseISO, isAfter } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleAllNotifications(predictions: any, prefs: any) {
  // Cancel all previous notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!prefs) return;

  // 1. Period Reminder (3 days before)
  if (prefs.period_reminder && predictions?.next_period_date) {
    const periodDate = parseISO(predictions.next_period_date);
    const reminderDate = subDays(periodDate, 3);
    if (isAfter(reminderDate, new Date())) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌸 Period Reminder",
          body: "Your period is expected in 3 days. Take care of yourself! ✨",
          data: { type: 'period_reminder' },
        },
        trigger: reminderDate,
      });
    }
  }

  // 2. Fertility Window Reminder
  if (prefs.fertility_reminder && predictions?.current_cycle?.fertile_window?.start) {
    const fertileDate = parseISO(predictions.current_cycle.fertile_window.start);
    if (isAfter(fertileDate, new Date())) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✨ Fertile Window",
          body: "Your fertile window starts today. 🌿",
          data: { type: 'fertility_reminder' },
        },
        trigger: fertileDate,
      });
    }
  }

  // 3. Daily Symptom Reminder (Every evening at 8 PM)
  if (prefs.daily_reminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📝 Daily Log",
        body: "How are you feeling today? Don't forget to log your symptoms! ✨",
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      } as any,
    });
  }

  // 4. Water Reminder (Every 3 hours during the day)
  if (prefs.water_reminder) {
    // Schedule a few reminders during the day
    const hours = [10, 13, 16, 19];
    for (const hour of hours) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💧 Hydration Check",
          body: "Time for a glass of water! Stay hydrated. 🌊",
          data: { type: 'water_reminder' },
        },
        trigger: {
          hour,
          minute: 0,
          repeats: true,
        } as any,
      });
    }
  }

  console.log('All notifications rescheduled based on preferences');
}

export async function schedulePeriodReminder(nextPeriodDate: string) {
  // Legacy method - redirect to new system if possible or keep as fallback
  const defaultPrefs = { period_reminder: true };
  await scheduleAllNotifications({ next_period_date: nextPeriodDate }, defaultPrefs);
}
