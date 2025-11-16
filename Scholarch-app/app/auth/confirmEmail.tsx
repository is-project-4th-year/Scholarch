//confirmEmail.tsx

// screens/EmailVerificationPage.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function confirmEmail() {
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Get email from route params or state management
  // For now, using placeholder - you'll pass this from SignUp page
  const userEmail = "user@example.com"; // TODO: Get from navigation params or global state

  // Handle resend verification email
  const handleResendEmail = async () => {
    if (resendTimer > 0) return; // Prevent spam clicking

    setIsResending(true);

    try {
      // TODO: Implement Firebase resend verification email logic
      // await sendEmailVerification(auth.currentUser);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Email Sent! 📧',
        'A new verification link has been sent to your email.',
        [{ text: 'OK' }]
      );

      // Start 60-second cooldown timer
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Resend email error:', error);
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Navigate to login page
  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  // Navigate back to sign up (clear form)
  const handleBackToSignUp = () => {
    router.back();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Check Your Email 📬</Text>
        <Text style={styles.headerSubtitle}>
          We've sent you a verification link
        </Text>
      </LinearGradient>

      {/* Content Section */}
      <View style={styles.content}>
        
        {/* Email Icon/Illustration */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>✉️</Text>
          </View>
        </View>

        {/* Main Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Verify Your Email Address</Text>
          <Text style={styles.messageText}>
            We've sent a verification link to:
          </Text>
          <Text style={styles.emailText}>{userEmail}</Text>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              1. Check your inbox (and spam folder, just in case!)
            </Text>
            <Text style={styles.instructionText}>
              2. Click the verification link in the email
            </Text>
            <Text style={styles.instructionText}>
              3. Come back here and click "Go to Login"
            </Text>
          </View>
        </View>

        {/* Resend Email Section */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the email?</Text>
          <TouchableOpacity
            style={[
              styles.resendButton,
              (isResending || resendTimer > 0) && styles.resendButtonDisabled
            ]}
            onPress={handleResendEmail}
            disabled={isResending || resendTimer > 0}
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text style={styles.resendButtonText}>
                {resendTimer > 0 
                  ? `Resend in ${resendTimer}s` 
                  : '🔄 Resend Verification Email'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.loginButtonText}>✓ Go to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignUp}
          >
            <Text style={styles.backButtonText}>← Back to Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Tip: The verification link expires in 24 hours. If it expires, you can request a new one.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  content: {
    padding: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 60,
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  resendContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#6366f1',
    minWidth: 200,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  helpText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
    textAlign: 'center',
  },
});