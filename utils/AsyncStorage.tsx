// utils/storageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a type for the value to ensure type safety
export type StorageValue = string | number | boolean | object | null;

// Function to store data in AsyncStorage
export const storeData = async (key: string, value: StorageValue): Promise<void> => {
  try {
    // Convert value to string before storing
    await AsyncStorage.setItem(key, JSON.stringify(value));
    // console.log('Data stored successfully');
  } catch (e: unknown) {
    // Use unknown type for errors and cast to Error for better error handling
    console.error('Failed to save data to storage:', e instanceof Error ? e.message : e);
  }
};

// Function to retrieve data from AsyncStorage
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) return null;
    return JSON.parse(jsonValue) as T;
  } catch (e: unknown) {
    console.error('Error getting data:', e instanceof Error ? e.message : String(e));
    return null; // Return null in case of error to ensure consistent return type
  }
};

export const  removeData= async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e: unknown) {
    console.error('Error removing data:', e instanceof Error ? e.message : String(e));
  }
};