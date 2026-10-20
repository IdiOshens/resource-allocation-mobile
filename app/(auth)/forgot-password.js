import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from "../../components/ui/CustomInput";
import PasswordInput from "../../components/ui/PasswordInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { requestPasswordReset, resetPassword } from "../../services/api/auth";
import { COLORS } from "../../constants/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Stage 1 = Email submission; Stage 2 = Token + New password submission
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [devTokenHint, setDevTokenHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ---- Stage 1: Request Password Reset ----
  const handleRequestReset = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(trimmedEmail);
      setIsLoading(false);

      if (result.success) {
        const receivedToken = result.data?.token || "";
        if (receivedToken) {
          setResetToken(receivedToken);
          setDevTokenHint(receivedToken);
        }

        Alert.alert(
          "Reset Token Generated",
          receivedToken
            ? "A reset token has been generated. (In development, it is prefilled below)."
            : "If an account matches that email, a reset token was created.",
          [{ text: "Continue", onPress: () => setStage(2) }]
        );
      } else {
        Alert.alert("Request Failed", result.message || "Could not process request.");
      }
    } catch (err) {
      setIsLoading(false);
      Alert.alert(
        "Connection Error",
        "Could not connect to the API server. Please check your network and XAMPP."
      );
    }
  };

  // ---- Stage 2: Submit New Password ----
  const handleResetPassword = async () => {
    const newErrors = {};

    if (!resetToken.trim()) {
      newErrors.token = "Reset token is required";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await resetPassword(
        resetToken.trim(),
        newPassword,
        confirmPassword
      );
      setIsLoading(false);

      if (result.success) {
        Alert.alert(
          "Success",
          "Your password has been reset successfully. Please log in with your new password.",
          [{ text: "Log In", onPress: () => router.replace("/(auth)/login") }]
        );
      } else {
        Alert.alert("Reset Failed", result.message || "Failed to reset password.");
      }
    } catch (err) {
      setIsLoading(false);
      Alert.alert(
        "Connection Error",
        "Could not connect to the API server. Please check your network and XAMPP."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (stage === 2) {
                setStage(1);
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={stage === 1 ? "key-outline" : "lock-open-outline"}
                size={56}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.title}>
              {stage === 1 ? "Forgot Password" : "Set New Password"}
            </Text>
            <Text style={styles.subtitle}>
              {stage === 1
                ? "Enter your registered email address to receive a password reset token"
                : "Enter the reset token along with your new password"}
            </Text>
          </View>

          <View style={styles.form}>
            {stage === 1 ? (
              // Stage 1: Email Form
              <>
                <CustomInput
                  label="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="Enter your registered email"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  required
                />

                <PrimaryButton
                  title="Request Reset Token"
                  onPress={handleRequestReset}
                  loading={isLoading}
                  style={styles.actionButton}
                />

                <TouchableOpacity
                  style={styles.alreadyHaveToken}
                  onPress={() => setStage(2)}
                >
                  <Text style={styles.alreadyHaveTokenText}>
                    Already have a reset token? Enter it here
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // Stage 2: Token + Password Form
              <>
                {devTokenHint ? (
                  <View style={styles.devBanner}>
                    <Ionicons name="code-slash-outline" size={16} color={COLORS.warning} />
                    <View style={styles.devBannerTextContainer}>
                      <Text style={styles.devBannerTitle}>Development Token Hint:</Text>
                      <Text style={styles.devBannerToken} selectable>
                        {devTokenHint}
                      </Text>
                    </View>
                  </View>
                ) : null}

                <CustomInput
                  label="Reset Token"
                  value={resetToken}
                  onChangeText={(text) => {
                    setResetToken(text);
                    setErrors((prev) => ({ ...prev, token: null }));
                  }}
                  placeholder="Paste or enter reset token"
                  icon="key-outline"
                  autoCapitalize="none"
                  error={errors.token}
                  required
                />

                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setErrors((prev) => ({ ...prev, newPassword: null }));
                  }}
                  placeholder="At least 6 characters"
                  error={errors.newPassword}
                  required
                />

                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Re-enter new password"
                  error={errors.confirmPassword}
                  required
                />

                <PrimaryButton
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  style={styles.actionButton}
                />

                <TouchableOpacity
                  style={styles.switchStageButton}
                  onPress={() => setStage(1)}
                >
                  <Text style={styles.switchStageText}>
                    Change email or request new token
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.backToLoginText}>
                Remember your password? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  backButton: {
    marginBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 28,
    borderRadius: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  devBanner: {
    flexDirection: "row",
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  devBannerTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  devBannerTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.warning,
  },
  devBannerToken: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 2,
  },
  actionButton: {
    marginTop: 8,
  },
  alreadyHaveToken: {
    alignItems: "center",
    marginTop: 14,
  },
  alreadyHaveTokenText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  switchStageButton: {
    alignItems: "center",
    marginTop: 14,
  },
  switchStageText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  backToLogin: {
    alignItems: "center",
    marginTop: 18,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
