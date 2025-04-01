import * as Notifications from 'expo-notifications';
import { Notification } from '@/utils/types';


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


export const sendNotification = async (notif: Notification): Promise<void> => {
  console.log('Sending notification:', notif.message + '  for ' + notif.title);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notif.title,
        body: notif.message,
        //sound: 'default',
        // badge: 1,
        // color: 'rgba(214, 240, 66, 0.5)',
        // priority: Notifications.AndroidNotificationPriority.HIGH,
        // vibrate: [0, 250, 250, 250],
        
      },
      trigger: null, 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { Alert } from 'react-native';

// export const registerForPushNotificationsAsync = async () => {
//   let token;
//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       Alert.alert('Failed to get push token for push notification!');
//       return;
//     }
//     token = (await Notifications.getExpoPushTokenAsync()).data;
//     console.log('Expo Push Token:', token);
//   } else {
//     Alert.alert('Must use physical device for Push Notifications');
//   }
//   return token;
// };

// // Function to send a push notification
// export const sendPushNotification = async (expoPushToken: string, message: string) => {
//   try {
//     const response = await fetch('https://exp.host/--/api/v2/push/send', {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Accept-Encoding': 'gzip, deflate',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         to: expoPushToken,
//         sound: 'default',
//         title: 'Zone Alert',
//         body: message,
//       }),
//     });
//     const result = await response.json();
//     console.log('Push Notification Sent:', result);
//   } catch (error) {
//     console.error('Error sending push notification:', error);
//   }
// };
