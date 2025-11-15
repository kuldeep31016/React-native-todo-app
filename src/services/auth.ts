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
    console.log('🔵 Step 1: Starting Google Sign-In...');
    
    // Check if your device supports Google Play
    console.log('🔵 Step 2: Checking Google Play Services...');
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log('✅ Google Play Services available');
    
    // Sign out from Google Sign-In first to ensure clean state
    // This helps avoid DEVELOPER_ERROR issues when signing in again
    try {
      console.log('🔵 Step 3: Signing out from previous session...');
      await GoogleSignin.signOut();
      // Small delay after sign out
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 200);
      });
    } catch (signOutError) {
      // Ignore sign out errors - user might not be signed in
      console.log('⚠️ Sign out error (can ignore):', signOutError);
    }
    
    // Perform Google Sign-In - this will show the account picker
    console.log('🔵 Step 4: Opening Google account picker...');
    const signInResult = await GoogleSignin.signIn();
    console.log('✅ Step 5: User selected account:', signInResult);
    if (!signInResult) {
      throw new Error('Google Sign-In failed: No result returned');
    }
    
    // Wait a moment for sign-in to complete
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    
    // Get ID token after sign in - with multiple retries
    let idToken: string | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!idToken && retryCount < maxRetries) {
      try {
        console.log(`🔵 Step 6: Getting ID token (attempt ${retryCount + 1}/${maxRetries})...`);
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
        console.log('✅ Step 7: Got ID token successfully!');
        break;
      } catch (tokenError) {
        retryCount++;
        console.log(`❌ ERROR getting tokens (attempt ${retryCount}/${maxRetries}):`, tokenError);
        
        if (retryCount < maxRetries) {
          // Wait longer with each retry
          await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 500 * retryCount);
          });
        } else {
          // Last attempt failed
          throw new Error('Failed to get ID token from Google Sign-In after multiple attempts. Please check your Firebase configuration and SHA-1 certificate fingerprint.');
        }
      }
    }
    
    if (!idToken) {
      throw new Error('Failed to get ID token from Google Sign-In. Please check your Firebase configuration and SHA-1 certificate fingerprint.');
    }
    
    // Create a Google credential with the token
    console.log('🔵 Step 8: Creating Firebase credential...');
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    // This will work for both new and existing accounts
    console.log('🔵 Step 9: Signing in to Firebase...');
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log('✅ SUCCESS! User signed in:', userCredential.user.email);
    
    return userCredential;
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === '12501' || error.message?.includes('cancel') || error.message?.includes('cancelled')) {
      throw new Error('Sign in was cancelled');
    }
    
    // Handle DEVELOPER_ERROR specifically
    if (error.code === 'DEVELOPER_ERROR' || error.code === '10' || error.message?.includes('DEVELOPER_ERROR')) {
      console.error('Google Sign-In DEVELOPER_ERROR:', error);
      throw new Error('DEVELOPER_ERROR: Please add SHA-1 fingerprint (5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25) to Firebase Console > Project Settings > Your apps > Android app');
    }
    
    // Handle account linking errors (if account exists with different provider)
    if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/email-already-in-use') {
      console.error('Account exists with different credential:', error);
      throw new Error('An account with this email already exists. Please sign in with your original method.');
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
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
