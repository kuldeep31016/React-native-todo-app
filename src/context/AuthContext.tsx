import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signInWithGoogle, signOut, getCurrentUser, onAuthStateChanged } from '../services/auth';
import { createUserProfile, getUserProfile } from '../services/firestore';
import { UserProfile } from '../services/firestore';
import { syncLocalTasksToFirebase } from '../utils/syncManager';
import { loadLocalTasks } from '../services/localStorage';

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLocalMode: boolean;
  signIn: () => Promise<void>;
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
            profile = {
              name: authUser.displayName || 'User',
              email: authUser.email || '',
              photoURL: authUser.photoURL || undefined,
              createdAt: new Date(),
            };
            await createUserProfile(authUser.uid, profile);
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

  const handleSignIn = async () => {
    try {
      // Get local tasks before signing in
      const localTasks = await loadLocalTasks();
      
      // Sign in with Google
      const result = await signInWithGoogle();
      
      if (result.user) {
        const profile = {
          name: result.user.displayName || 'User',
          email: result.user.email || '',
          photoURL: result.user.photoURL || undefined,
          createdAt: new Date(),
        };
        await createUserProfile(result.user.uid, profile);
        setUserProfile(profile);
        setIsLocalMode(false);

        // Sync local tasks to Firebase if any exist
        if (localTasks.length > 0) {
          try {
            await syncLocalTasksToFirebase(result.user.uid, localTasks);
            // Tasks will be refreshed automatically via Firebase subscription
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

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setUserProfile(null);
      setIsLocalMode(true);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await createUserProfile(user.uid, {
        ...userProfile!,
        ...profile,
      });
      setUserProfile(prev => prev ? { ...prev, ...profile } : null);
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
