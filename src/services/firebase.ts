import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// Firebase will be initialized automatically if google-services.json is present
// For development, you may need to configure it manually
let firebaseApp;

try {
  if (!firebase.apps.length) {
    // Firebase is initialized automatically on Android if google-services.json exists
    firebaseApp = firebase.app();
  } else {
    firebaseApp = firebase.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const db = firebase.firestore();
export default firebaseApp;

