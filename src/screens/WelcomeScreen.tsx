import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import { useWelcome } from '../context/WelcomeContext';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { markWelcomeAsSeen } = useWelcome();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    await markWelcomeAsSeen();
    navigation.replace('Landing');
  };

  return (
    <View style={styles.container}>
      {/* Animated Background with Gradient */}
      <LinearGradient
        colors={['#2196F3', '#1976D2', '#0D47A1']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative 3D Spheres */}
        <View style={styles.sphereContainer}>
          <View style={[styles.sphere, styles.sphere1]} />
          <View style={[styles.sphere, styles.sphere2]} />
          <View style={[styles.sphere, styles.sphere3]} />
          <View style={[styles.sphere, styles.sphere4]} />
          <View style={[styles.sphere, styles.sphere5]} />
        </View>

        {/* Wavy Background Shapes */}
        <View style={styles.waveContainer}>
          <View style={[styles.wave, styles.wave1]} />
          <View style={[styles.wave, styles.wave2]} />
          <View style={[styles.wave, styles.wave3]} />
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
        >
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>
              Enter personal details to your employee account
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

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
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signInButton, { borderColor: colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
            activeOpacity={0.8}
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
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    backgroundColor: '#64B5F6',
    top: '10%',
    left: '10%',
  },
  sphere2: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    top: '20%',
    right: '15%',
  },
  sphere3: {
    width: 100,
    height: 100,
    backgroundColor: '#90CAF9',
    bottom: '30%',
    left: '20%',
  },
  sphere4: {
    width: 60,
    height: 60,
    backgroundColor: '#BBDEFB',
    bottom: '20%',
    right: '10%',
  },
  sphere5: {
    width: 90,
    height: 90,
    backgroundColor: '#E3F2FD',
    top: '50%',
    right: '30%',
  },
  waveContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wave: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 200,
  },
  wave1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.3,
  },
  wave2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.4,
    right: -width * 0.2,
  },
  wave3: {
    width: width * 0.8,
    height: width * 0.8,
    top: '40%',
    left: -width * 0.2,
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
