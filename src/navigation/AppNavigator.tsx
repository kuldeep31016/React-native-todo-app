import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { LandingScreen } from '../screens/LandingScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { useWelcome } from '../context/WelcomeContext';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { hasSeenWelcome } = useWelcome();
  const { colors } = useTheme();

  // Show loading while checking welcome status
  if (hasSeenWelcome === null) {
    return <LoadingSpinner />;
  }

  // Determine initial route
  const initialRouteName = hasSeenWelcome ? 'Landing' : 'Welcome';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Welcome Screen - Show first time only */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* Authentication Screens */}
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />

        {/* Landing Screen - Main screen */}
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        
        {/* Task Management Screens */}
        <Stack.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{
            title: 'New Task',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{
            title: 'Task Details',
          }}
        />
        
        {/* Settings */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        
        {/* Statistics */}
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: 'Statistics',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
