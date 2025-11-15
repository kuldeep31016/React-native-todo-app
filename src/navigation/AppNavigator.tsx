import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LandingScreen } from '../screens/LandingScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
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
        {/* Landing Screen - Always accessible, no auth required */}
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        
        {/* Task Management Screens - Available to all users */}
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
        
        {/* Settings - Available to all users */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
        
        {/* Statistics - Only for authenticated users (handled in screen) */}
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
