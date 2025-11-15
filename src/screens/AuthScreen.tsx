import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';

export const AuthScreen: React.FC = () => {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Successfully signed in',
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Unable to sign in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
          <Icon name="check-circle" size={80} color={colors.background} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Todo App
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Organize your tasks and boost productivity
        </Text>

        <TouchableOpacity
          style={[
            styles.signInButton,
            {
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Icon name="login" size={24} color={colors.background} />
              <Text style={[styles.signInButtonText, { color: colors.background }]}>
                Sign in with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          By signing in, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 280,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    textAlign: 'center',
  },
});

