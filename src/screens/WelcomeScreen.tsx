import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useWelcome } from '../context/WelcomeContext';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { markWelcomeAsSeen } = useWelcome();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    if (isNavigating) return; // Prevent multiple taps
    
    try {
      setIsNavigating(true);
      await markWelcomeAsSeen();
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        if (navigation && navigation.replace) {
          navigation.replace('Landing');
        } else if (navigation && navigation.navigate) {
          navigation.navigate('Landing');
        }
      }, 100);
    } catch (error) {
      console.error('Error in handleGetStarted:', error);
      Alert.alert('Error', 'Unable to proceed. Please try again.');
      setIsNavigating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#2196F3' }]}>
      {/* Gradient-like background using multiple Views */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <View style={[styles.gradientLayer, { backgroundColor: '#0D47A1' }]} />
        <View style={[styles.gradientLayer, { backgroundColor: '#1976D2' }]} />
        <View style={[styles.gradientLayer, { backgroundColor: '#2196F3' }]} />
      </View>

      {/* Decorative Spheres */}
      <View style={styles.sphereContainer} pointerEvents="none">
        <View style={[styles.sphere, styles.sphere1, { backgroundColor: '#64B5F6' }]} />
        <View style={[styles.sphere, styles.sphere2, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.sphere, styles.sphere3, { backgroundColor: '#90CAF9' }]} />
        <View style={[styles.sphere, styles.sphere4, { backgroundColor: '#BBDEFB' }]} />
        <View style={[styles.sphere, styles.sphere5, { backgroundColor: '#E3F2FD' }]} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitleText}>
            Enter personal details to your employee account
          </Text>
        </View>
      </Animated.View>

      {/* Bottom Card with Buttons */}
      <Animated.View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signInButton, { borderColor: colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.7}
            disabled={isNavigating}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.7}
            disabled={isNavigating}
          >
            <Text style={[styles.buttonText, styles.signUpButtonText, { color: colors.background }]}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  sphereContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sphere: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.3,
  },
  sphere1: {
    width: 120,
    height: 120,
    top: '10%',
    left: '10%',
  },
  sphere2: {
    width: 80,
    height: 80,
    top: '20%',
    right: '15%',
  },
  sphere3: {
    width: 100,
    height: 100,
    bottom: '30%',
    left: '20%',
  },
  sphere4: {
    width: 60,
    height: 60,
    bottom: '20%',
    right: '10%',
  },
  sphere5: {
    width: 90,
    height: 90,
    top: '50%',
    right: '30%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  signInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  signUpButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButtonText: {
    color: '#FFFFFF',
  },
});
