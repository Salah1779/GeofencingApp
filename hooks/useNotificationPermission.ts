// utils/useNotificationPermission.ts
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

const useNotificationPermission = () => {
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        setNotificationPermissionGranted(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Notification Permission Denied',
            'Please enable notifications to receive updates.',
            [
              { text: 'OK', style: 'cancel' }, 
              {
                text: 'Settings',
                onPress: async () => {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                    console.error('Error opening settings:', error);
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        setNotificationPermissionGranted(false);
        Alert.alert('Error', 'Failed to request notification permission.');
      }
    };

    requestNotificationPermission();
  }, []);

  return { notificationPermissionGranted };
};

export default useNotificationPermission;