import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWelcome } from '../context/WelcomeContext';
import Toast from 'react-native-toast-message';

interface SignUpScreenProps {
  navigation: any;
  route?: {
    params?: {
      email?: string;
    };
  };
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const { markWelcomeAsSeen } = useWelcome();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleEmailSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Validation Error', 'Please agree to the terms and conditions');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      await markWelcomeAsSeen();
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Welcome to TaskMaster',
      });
      navigation.replace('Landing');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Check if email is already in use
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
        Alert.alert(
          'Account Already Exists',
          'This email address is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => {
                // Navigate to sign in with email pre-filled
                navigation.replace('SignIn', { email: email });
              },
            },
          ]
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
      } else {
        Alert.alert(
          'Sign Up Failed',
          error.message || 'Unable to create account. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await signUp(); // Google sign up
      await markWelcomeAsSeen();
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Successfully signed up with Google',
      });
      navigation.replace('Landing');
    } catch (error: any) {
      console.error('Google sign up error:', error);
      // Don't show alert if user cancelled the account picker
      if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
        // User cancelled - just stop loading, no alert needed
        return;
      }
      // Show more helpful error message for DEVELOPER_ERROR
      if (error.message?.includes('DEVELOPER_ERROR') || error.message?.includes('SHA-1') || error.message?.includes('configuration error')) {
        Alert.alert(
          'Configuration Error',
          'Google Sign-In requires SHA-1 fingerprint.\n\nAdd this to Firebase:\n1. Firebase Console > Project Settings\n2. Your apps > Android app\n3. Add fingerprint:\n\n5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25\n\nWait 5 minutes after adding, then try again.',
          [{ text: 'OK' }]
        );
      } else if (error.message?.includes('account already exists') || error.message?.includes('different credential')) {
        Alert.alert(
          'Account Exists',
          error.message || 'An account with this email already exists. Please sign in instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => {
                navigation.replace('SignIn', { email: email });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Sign Up Failed',
          error.message || 'Unable to sign up with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Get Started</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create your account to get started
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="person" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter Full Name"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="email" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            activeOpacity={0.7}
          >
            <Icon
              name={agreeToTerms ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={agreeToTerms ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>
              I agree to the processing of{' '}
              <Text style={{ color: colors.primary }}>Personal data</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleEmailSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.signUpButtonText, { color: colors.background }]}>Sign up</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Sign up with</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {/* Social Sign Up Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[
                styles.socialButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={handleGoogleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Icon name="person-add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
  },
  signUpButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

