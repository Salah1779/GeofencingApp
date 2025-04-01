import { getData } from "./AsyncStorage"

export const getCurrentStatus = async (
  setStatus: React.Dispatch<React.SetStateAction<string | null>>,
  initialStatus: string | null = null
): Promise<string|null> => {

 
    try {
      const storedStatus = await getData<string>('userStatus');

      if (storedStatus) {
        setStatus(storedStatus);
        return storedStatus;
      }
    } catch (error) {
      console.error('Error retrieving user status:', error);
    }
  
  return 'unknown'; // Default fallback string
}
