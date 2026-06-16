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

export async function schedulePeriodReminder(nextPeriodDate: string) {
  // Cancel all previous notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  const periodDate = parseISO(nextPeriodDate);
  const reminderDate = subDays(periodDate, 3); // 3 days before

  // Only schedule if the reminder date is in the future
  if (isAfter(reminderDate, new Date())) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌸 Period Reminder",
        body: "Your period is expected in 3 days. Take care of yourself! ✨",
        data: { type: 'period_reminder' },
      },
      trigger: reminderDate,
    });
    
    console.log('Scheduled notification for:', reminderDate);
  }
}
