import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, onAuthStateChanged } from '../services/auth';
import { createUserProfile, getUserProfile } from '../services/firestore';
import { UserProfile } from '../services/firestore';
import { syncLocalTasksToFirebase } from '../utils/syncManager';
import { loadLocalTasks } from '../services/localStorage';

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLocalMode: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (email?: string, password?: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      setIsLocalMode(!authUser);
      
      if (authUser) {
        try {
          let profile = await getUserProfile(authUser.uid);
          if (!profile) {
            // Create profile if it doesn't exist
            const newProfile = {
              name: authUser.displayName || 'User',
              email: authUser.email || '',
              photoURL: authUser.photoURL || undefined,
            };
            // Remove undefined photoURL if it doesn't exist
            if (!newProfile.photoURL) {
              delete newProfile.photoURL;
            }
            await createUserProfile(authUser.uid, newProfile);
            profile = {
              ...newProfile,
              createdAt: new Date(),
            } as UserProfile;
          }
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email?: string, password?: string) => {
    try {
      // Get local tasks before signing in
      const localTasks = await loadLocalTasks();
      
      let result;
      
      if (email && password) {
        // Email/Password sign in
        result = await signInWithEmail(email, password);
      } else {
        // Google sign in
        result = await signInWithGoogle();
      }
      
      if (result && result.user) {
        // Wait a bit for Firebase to update
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 500);
        });
        
        // Check if profile exists, if not create it
        let profile = await getUserProfile(result.user.uid);
        
        if (!profile) {
          const newProfile: any = {
            name: result.user.displayName || 'User',
            email: result.user.email || email || '',
          };
          
          // Only add photoURL if it exists
          if (result.user.photoURL) {
            newProfile.photoURL = result.user.photoURL;
          }
          
          await createUserProfile(result.user.uid, newProfile);
          profile = {
            ...newProfile,
            createdAt: new Date(),
          } as UserProfile;
        }
        
        setUserProfile(profile);
        setIsLocalMode(false);

        // Sync local tasks to Firebase if any exist
        if (localTasks.length > 0) {
          try {
            await syncLocalTasksToFirebase(result.user.uid, localTasks);
          } catch (error) {
            console.error('Error syncing local tasks:', error);
            // Don't throw - user is still signed in
          }
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async (email?: string, password?: string, fullName?: string) => {
    try {
      // Get local tasks before signing up
      const localTasks = await loadLocalTasks();
      
      let result;
      
      if (email && password && fullName) {
        // Email/Password sign up
        result = await signUpWithEmail(email, password, fullName);
      } else {
        // Google sign up (same as sign in)
        result = await signInWithGoogle();
      }
      
      if (result && result.user) {
        // Wait a bit for Firebase to update
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 500);
        });
        
        // Create profile for new user
        const newProfile: any = {
          name: fullName || result.user.displayName || 'User',
          email: result.user.email || email || '',
        };
        
        // Only add photoURL if it exists
        if (result.user.photoURL) {
          newProfile.photoURL = result.user.photoURL;
        }
        
        await createUserProfile(result.user.uid, newProfile);
        
        const profile = {
          ...newProfile,
          createdAt: new Date(),
        } as UserProfile;
        
        setUserProfile(profile);
        setIsLocalMode(false);

        // Sync local tasks to Firebase if any exist
        if (localTasks.length > 0) {
          try {
            await syncLocalTasksToFirebase(result.user.uid, localTasks);
          } catch (error) {
            console.error('Error syncing local tasks:', error);
          }
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    // Always clear local state first (synchronous, no errors possible)
    setUser(null);
    setUserProfile(null);
    setIsLocalMode(true);
    
    // Then sign out from services (non-blocking)
    try {
      await signOut();
    } catch (error) {
      // Log but don't throw - state is already cleared
      console.log('Sign out service completed (local state cleared):', error);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const cleanProfile: any = {
        name: profile.name || userProfile?.name || 'User',
        email: profile.email || userProfile?.email || '',
      };
      
      if (profile.photoURL) {
        cleanProfile.photoURL = profile.photoURL;
      }
      
      await createUserProfile(user.uid, cleanProfile);
      setUserProfile(prev => prev ? { ...prev, ...cleanProfile, createdAt: prev.createdAt } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isLocalMode,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
