import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SHOWN_KEY = '@welcome_shown';

/**
 * Reset welcome screen flag - call this to see welcome screen again
 */
export const resetWelcomeScreen = async () => {
  try {
    await AsyncStorage.removeItem(WELCOME_SHOWN_KEY);
    console.log('Welcome screen flag cleared! Restart the app to see welcome screen.');
    return true;
  } catch (error) {
    console.error('Error resetting welcome screen:', error);
    return false;
  }
};

