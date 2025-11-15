import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: "735114363694-tmqtbtj0rk43pinnv8h16v8o17jn0an0.apps.googleusercontent.com",
  offlineAccess: true,
  // Force account picker to show all accounts every time
  forceCodeForRefreshToken: true,
});

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // Update user profile with display name
    await userCredential.user.updateProfile({
      displayName: fullName,
    });

    // Send email verification (optional - you can disable this)
    // await userCredential.user.sendEmailVerification();
    
    return userCredential;
  } catch (error: any) {
    console.error('Email Sign Up Error:', error);
    throw error;
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    return await auth().signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    console.error('Email Sign In Error:', error);
    throw error;
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Check if user is already signed in to Google Sign-In
    // If yes, sign out first to force account picker to show all accounts
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
      }
    } catch {
      // Ignore sign out errors - we just want to show the picker
      console.log('Signing out from Google Sign-In to show account picker');
    }
    
    // Get the users ID token - this will show the account picker
    // The account picker will show all Google accounts on the device
    // With forceCodeForRefreshToken: true, it will always show the picker
    await GoogleSignin.signIn();
    
    // Get ID token after sign in
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    if (!idToken) {
      throw new Error('Failed to get ID token from Google Sign-In');
    }
    
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    return await auth().signInWithCredential(googleCredential);
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === '12501' || error.message?.includes('cancel')) {
      throw new Error('Sign in was cancelled');
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    // Sign out from Google Sign-In (if signed in)
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
      }
    } catch (googleError: any) {
      // Ignore Google sign out errors - user might not be signed in with Google
      console.log('Google Sign-In sign out:', googleError?.message || 'No Google account to sign out');
    }
    
    // Sign out from Firebase Auth (if signed in)
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await auth().signOut();
      }
    } catch (firebaseError: any) {
      // Ignore Firebase sign out errors - user might already be signed out
      if (firebaseError.code === 'auth/no-current-user') {
        console.log('No current user to sign out from Firebase');
      } else {
        console.log('Firebase sign out:', firebaseError?.message || 'User already signed out');
      }
    }
    
    // Always return success - even if there was no user to sign out
    return true;
  } catch (error: any) {
    // Log error but don't throw - we want sign out to always succeed
    console.log('Sign out completed (with possible warnings):', error?.message || error);
    return true;
  }
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};
