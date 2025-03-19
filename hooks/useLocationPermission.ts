// hooks/useLocationPermission.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const useLocationPermission = () => {
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermissionGranted(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Denied',
            'Please enable location services to use this app fully.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        setLocationPermissionGranted(false);
        Alert.alert('Error', 'Failed to request location permission.');
      }
    };

    requestLocationPermission();
  }, []);

  // Real-time location tracking if permission is granted
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    if (locationPermissionGranted) {
      const startLocationTracking = async () => {
        try {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000, // Update every 5 seconds
              distanceInterval: 10, // Update every 10 meters
            },
            (location) => {
              setUserLocation(location);
            }
          );
        } catch (error) {
          console.error('Error tracking location:', error);
        }
      };

      startLocationTracking();
    }

    // Cleanup subscription on unmount or permission change
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [locationPermissionGranted]);

  return { locationPermissionGranted, userLocation };
};

export default useLocationPermission;