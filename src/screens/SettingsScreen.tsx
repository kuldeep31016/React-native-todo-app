import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWelcome } from '../context/WelcomeContext';
import { resetWelcomeScreen } from '../utils/resetWelcome';
import Toast from 'react-native-toast-message';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, mode, isDark, setThemeMode } = useTheme();
  const { user, userProfile, signOut } = useAuth();
  const { resetWelcome } = useWelcome();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // Reset welcome screen first (non-blocking)
            try {
              await resetWelcome();
            } catch (resetError) {
              console.log('Reset welcome (non-blocking):', resetError);
            }
            
            // Sign out (non-blocking - errors are ignored)
            try {
              await signOut();
            } catch (signOutError: any) {
              // Silently handle any sign out errors - state will be cleared anyway
              console.log('Sign out completed (state cleared):', signOutError?.message || 'OK');
            }
            
            // Show success message
            Toast.show({
              type: 'success',
              text1: 'Signed out',
              text2: 'You have been signed out successfully',
              visibilityTime: 2000,
            });
            
            // Always navigate to Welcome screen
            setTimeout(() => {
              try {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              } catch (navError) {
                // Fallback navigation methods
                try {
                  navigation.replace('Welcome');
                } catch (replaceError) {
                  // Last resort: navigate
                  navigation.navigate('Welcome');
                }
              }
            }, 200);
          },
        },
      ]
    );
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setThemeMode(newMode);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface }]}>
          {userProfile?.photoURL ? (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {userProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Icon name="account-circle" size={60} color={colors.background} />
            </View>
          )}
          <Text style={[styles.profileName, { color: colors.text }]}>
            {userProfile?.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {userProfile?.email || user?.email || ''}
          </Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Icon name="brightness-6" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'light' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <Icon
                name="light-mode"
                size={20}
                color={mode === 'light' ? colors.background : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: mode === 'light' ? colors.background : colors.text,
                  },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'dark' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <Icon
                name="dark-mode"
                size={20}
                color={mode === 'dark' ? colors.background : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: mode === 'dark' ? colors.background : colors.text,
                  },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                {
                  backgroundColor: mode === 'system' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleThemeChange('system')}
            >
              <Icon
                name="settings-brightness"
                size={20}
                color={mode === 'system' ? colors.background : colors.text}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: mode === 'system' ? colors.background : colors.text,
                  },
                ]}
              >
                System
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ABOUT
          </Text>

          <View style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>App Version</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            onPress={async () => {
              const success = await resetWelcomeScreen();
              if (success) {
                Alert.alert(
                  'Welcome Screen Reset',
                  'Welcome screen has been reset. Please restart the app to see it again.',
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <View style={styles.settingLeft}>
              <Icon name="refresh" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Reset Welcome Screen</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error }]}
          onPress={handleSignOut}
        >
          <Icon name="logout" size={20} color={colors.background} />
          <Text style={[styles.signOutText, { color: colors.background }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

