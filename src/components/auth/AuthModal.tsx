import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import Toast from 'react-native-toast-message';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const { refreshTasks } = useTasks();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      await refreshTasks();
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'Successfully signed in',
      });
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.code === 'auth/user-not-found') {
        Alert.alert(
          'Account Not Found',
          'No account found with this email. Would you like to sign up instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Up',
              onPress: () => {
                onClose();
                // Navigate to sign up - you might need to pass navigation prop
              },
            },
          ]
        );
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Wrong Password', 'The password you entered is incorrect. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else if (error.code === 'auth/invalid-credential') {
        Alert.alert('Invalid Credentials', 'Email or password is incorrect. Please try again.');
      } else {
        Alert.alert(
          'Sign In Failed',
          error.message || 'Invalid email or password. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn();
      await refreshTasks();
      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Successfully signed in with Google',
      });
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      // Don't show alert if user cancelled the account picker
      if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
        // User cancelled - just stop loading, no alert needed
        return;
      }
      // Show more helpful error message for DEVELOPER_ERROR
      if (error.message?.includes('SHA-1') || error.message?.includes('configuration error')) {
        Alert.alert(
          'Configuration Error',
          'Google Sign-In is not properly configured. Please check:\n\n1. SHA-1 certificate fingerprint is added to Firebase\n2. Web Client ID is correct\n3. google-services.json is in place\n\nSee FIREBASE_SETUP.md for details.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Sign In Failed',
          error.message || 'Unable to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modal, { backgroundColor: colors.surface }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Sign In
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
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
                  <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Enter Password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
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

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsContainer}>
                  <TouchableOpacity style={styles.checkboxContainer}>
                    <Icon name="check-box-outline-blank" size={20} color={colors.textSecondary} />
                    <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={[styles.forgotPassword, { color: colors.primary }]}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.signInButton,
                    {
                      backgroundColor: colors.primary,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleEmailSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={[styles.signInButtonText, { color: colors.background }]}>Sign in</Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.dividerText, { color: colors.textSecondary }]}>Sign in with</Text>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </View>

                {/* Google Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      opacity: loading ? 0.7 : 1,
                    },
                  ]}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Icon name="login" size={24} color={colors.primary} />
                  <Text style={[styles.googleButtonText, { color: colors.text }]}>Continue with Google</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
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
  signInButtonText: {
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

