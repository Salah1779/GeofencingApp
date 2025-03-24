import * as Notifications from 'expo-notifications';

// Configure notification handler (typically called once in the app's entry point)
export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

// Send a notification with the given message
export const sendNotification = async (message: string): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Zone Alert',
        body: message,
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
