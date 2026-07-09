// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { registerUser, loginUser } from '../utils/api';
import { useTheme, useThemedStyles } from '../theme';
import { Surface, GradientButton } from '../components/ui';

export default function LoginScreen({ navigation }) {
  // Toggle between login and signup
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { colors, gradients } = useTheme();
  const styles = useThemedStyles(makeStyles);

  // Validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Simple phone validation (adjust based on your requirements)
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateInput = () => {
    // Check if phone/email is provided
    if (!phoneOrEmail.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number or email');
      return false;
    }

    // Validate email or phone format
    const isEmail = phoneOrEmail.includes('@');
    if (isEmail && !validateEmail(phoneOrEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!isEmail && !validatePhone(phoneOrEmail)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }

    // Check password
    if (!password) {
      Alert.alert('Validation Error', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return false;
    }

    // Check confirm password for signup
    if (!isLogin) {
      if (!confirmPassword) {
        Alert.alert('Validation Error', 'Please confirm your password');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateInput()) return;

    setIsLoading(true);

    try {
      const result = await loginUser(phoneOrEmail.trim(), password);

      if (result.success) {
        Alert.alert('Success!', 'Logged in successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Home or check onboarding status
              navigation.replace('Home');
            },
          },
        ]);
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async () => {
    if (!validateInput()) return;

    setIsLoading(true);

    try {
      const result = await registerUser(phoneOrEmail.trim(), password);

      if (result.success) {
        Alert.alert('Success!', 'Account created successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('Home');
            },
          },
        ]);
      } else {
        Alert.alert('Signup Failed', result.error || 'Could not create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during signup. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  // Toggle between login and signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Skip authentication (optional - for testing)
  const handleSkip = () => {
    navigation.navigate('Home');
  };

  const renderPasswordField = (props) => (
    <View style={styles.inputContainer}>
      <Feather name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={!props.visible}
        editable={!isLoading}
        placeholder={props.placeholder}
        value={props.value}
        onChangeText={props.onChangeText}
      />
      <TouchableOpacity onPress={props.onToggleVisible} style={styles.eyeIcon} hitSlop={8}>
        <Feather name={props.visible ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Surface
            gradient={gradients.play}
            elevation="lg"
            radius={60}
            style={styles.logoRing}
            innerStyle={styles.logoRingInner}
          >
            <View style={styles.logoInner}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Surface>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
          <Text style={styles.welcomeSubtitle}>
            {isLogin
              ? 'Sign in to sync your progress across devices'
              : 'Sign up to backup and sync your progress'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Phone/Email Input */}
          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone number or Email"
              placeholderTextColor={colors.textFaint}
              value={phoneOrEmail}
              onChangeText={setPhoneOrEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          {renderPasswordField({
            placeholder: 'Password',
            value: password,
            onChangeText: setPassword,
            visible: showPassword,
            onToggleVisible: () => setShowPassword(!showPassword),
          })}

          {!isLogin &&
            renderPasswordField({
              placeholder: 'Confirm Password',
              value: confirmPassword,
              onChangeText: setConfirmPassword,
              visible: showConfirmPassword,
              onToggleVisible: () => setShowConfirmPassword(!showConfirmPassword),
            })}

          {/* Submit Button */}
          <GradientButton
            title="Submit"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
          />

          {/* Toggle Login/Signup */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
              <Text style={styles.toggleLink}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Feather name="cloud" size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            Signing in lets you back up your progress and notes, and restore them on another device.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = ({ colors, typography, spacing, radii }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl,
    },

    header: {
      alignItems: 'center',
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    logoRing: {
      width: 120,
      height: 120,
    },
    logoRingInner: {
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoInner: {
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logo: {
      width: 88,
      height: 88,
    },

    welcomeSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    welcomeTitle: {
      ...typography.textStyles.displayTitle,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
      ...typography.textStyles.body,
      color: colors.textMuted,
      textAlign: 'center',
    },

    formContainer: {
      marginBottom: spacing.lg,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.base,
      marginBottom: spacing.md,
    },
    inputIcon: {
      marginRight: spacing.md,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.base,
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.md,
      color: colors.text,
    },
    eyeIcon: {
      paddingLeft: spacing.sm,
    },

    submitButton: {
      marginTop: spacing.sm,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs + 2,
      marginTop: spacing.lg,
    },
    toggleText: {
      ...typography.textStyles.body,
      color: colors.textMuted,
    },
    toggleLink: {
      fontFamily: typography.fonts.bold,
      fontSize: typography.fontSizes.body,
      color: colors.primary,
    },

    skipButton: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    skipText: {
      ...typography.textStyles.body,
      color: colors.textFaint,
    },

    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.md,
      padding: spacing.base,
      marginTop: spacing.md,
    },
    infoText: {
      flex: 1,
      ...typography.textStyles.caption,
      color: colors.textMuted,
    },
  });
