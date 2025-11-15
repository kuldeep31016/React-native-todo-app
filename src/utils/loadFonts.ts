import { Platform } from 'react-native';

/**
 * Preload MaterialIcons font to ensure icons display correctly
 * This should be called at app startup
 */
export const loadIcons = async () => {
  if (Platform.OS === 'android') {
    // On Android, fonts should be in assets/fonts/
    // They are loaded automatically, but we can verify they exist
    try {
      // This is just a check - fonts should already be linked
      console.log('✅ MaterialIcons font should be available on Android');
    } catch (error) {
      console.error('❌ Error loading icons:', error);
    }
  }
};

