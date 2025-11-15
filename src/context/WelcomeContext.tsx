import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SHOWN_KEY = '@welcome_shown';

interface WelcomeContextType {
  hasSeenWelcome: boolean | null;
  markWelcomeAsSeen: () => Promise<void>;
  resetWelcome: () => Promise<void>;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export const WelcomeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
      setHasSeenWelcome(value === 'true');
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setHasSeenWelcome(false);
    }
  };

  const markWelcomeAsSeen = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      setHasSeenWelcome(true);
    } catch (error) {
      console.error('Error marking welcome as seen:', error);
    }
  };

  const resetWelcome = async () => {
    try {
      await AsyncStorage.removeItem(WELCOME_SHOWN_KEY);
      setHasSeenWelcome(false);
    } catch (error) {
      console.error('Error resetting welcome:', error);
    }
  };

  return (
    <WelcomeContext.Provider
      value={{
        hasSeenWelcome,
        markWelcomeAsSeen,
        resetWelcome,
      }}
    >
      {children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = () => {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  return context;
};

