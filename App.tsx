import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { WelcomeProvider } from './src/context/WelcomeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { loadIcons } from './src/utils/loadFonts';
import Toast from 'react-native-toast-message';

function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
      <Toast />
    </>
  );
}

function App() {
  useEffect(() => {
    // Preload icons on app start
    loadIcons();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <WelcomeProvider>
            <AuthProvider>
              <TaskProvider>
                <AppContent />
              </TaskProvider>
            </AuthProvider>
          </WelcomeProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
