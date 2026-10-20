import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomInput from "../../components/ui/CustomInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import {
  changePassword,
  fetchMyProfile,
  updateMyProfile,
} from "../../services/api/auth";

const PROFILE_FIELDS = {
  student: ["Student Number", "student_number"],
  instructor: ["Specialization", "specialization"],
  staff: ["Job Title", "job_title"],
};

const STATUS_STYLES = {
  active: { backgroundColor: COLORS.successBg, color: COLORS.success },
  pending: { backgroundColor: COLORS.warningBg, color: COLORS.warning },
  rejected: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
  suspended: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyProfile(token);
      if (!result.success || !result.data) {
        throw new Error(result.message || "Could not load your profile.");
      }
      setProfile(result.data);
      setFullName(result.data.full_name || "");
      setPhoneNumber(result.data.phone_number || "");
    } catch (loadError) {
      setError(loadError.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }
    if (!token) {
      Alert.alert("Session Unavailable", "Please sign in again.");
      return;
    }
    setSaving(true);
    try {
      const result = await updateMyProfile(token, {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });
      if (!result.success) {
        throw new Error(result.message || "Could not update your profile.");
      }
      setProfile((current) => ({
        ...current,
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      }));
      Alert.alert("Profile Updated", "Your changes have been saved.");
    } catch (saveError) {
      Alert.alert("Update Failed", saveError.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace("/login");
          } catch {
            Alert.alert("Log Out Failed", "Please try again.");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const pickProfilePicture = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Allow photo library access to choose a profile picture.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setProfilePicture(result.assets[0].uri);
      }
    } catch (pickerError) {
      Alert.alert(
        "Image Selection Failed",
        pickerError.message || "Could not open your photo library.",
      );
    }
  };

  const submitPasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Missing Information", "Complete all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Password Too Short", "Use at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Passwords Do Not Match", "Confirm your new password again.");
      return;
    }
    if (!token) {
      Alert.alert("Session Unavailable", "Please sign in again.");
      return;
    }

    setPasswordSaving(true);
    try {
      const result = await changePassword(
        token,
        currentPassword,
        newPassword,
        confirmNewPassword,
      );
      if (!result.success) {
        throw new Error(result.message || "Could not change your password.");
      }
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert(
        "Password Changed",
        result.message || "Please log in again with your new password.",
        [
          {
            text: "OK",
            onPress: async () => {
              await logout();
              router.replace("/login");
            },
          },
        ],
      );
    } catch (passwordError) {
      Alert.alert(
        "Password Change Failed",
        passwordError.message || "Please try again.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color={COLORS.danger} />
          <Text style={styles.errorText}>{error || "Profile not found."}</Text>
          <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle =
    STATUS_STYLES[profile.account_status] || {
      backgroundColor: COLORS.neutralBg,
      color: COLORS.textSecondary,
    };
  const profileField = PROFILE_FIELDS[profile.role];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your account information</Text>
        </View>

        <View style={[styles.section, styles.pictureSection]}>
          <View style={styles.avatar}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={70}
                color={COLORS.primary}
              />
            )}
          </View>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickProfilePicture}
            accessibilityRole="button"
          >
            <Ionicons name="image-outline" size={18} color={COLORS.primary} />
            <Text style={styles.uploadText}>Upload Profile Picture</Text>
          </TouchableOpacity>
          <Text style={styles.pictureNote}>Picture is currently saved on this device only.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editable Information</Text>
          <CustomInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            icon="person-outline"
            required
          />
          <CustomInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Your phone number"
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <PrimaryButton
            title="Save Changes"
            onPress={saveProfile}
            loading={saving}
            style={styles.saveButton}
          />
          <PrimaryButton
            title="Change Password"
            onPress={() => setPasswordModalVisible(true)}
            type="outline"
            style={styles.passwordButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <ReadOnlyField label="Email" value={profile.email} icon="mail-outline" />
          <ReadOnlyField label="Username" value={profile.username} icon="at-outline" />
          <View style={styles.badgeRow}>
            <Text style={styles.readOnlyLabel}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {String(profile.role || "").replaceAll("_", " ")}
              </Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <Text style={styles.readOnlyLabel}>Account Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {profile.account_status}
              </Text>
            </View>
          </View>
          {profile.department_name ? (
            <ReadOnlyField
              label="Department"
              value={profile.department_name}
              icon="business-outline"
            />
          ) : null}
          {profileField && profile[profileField[1]] ? (
            <ReadOnlyField
              label={profileField[0]}
              value={profile[profileField[1]]}
              icon="id-card-outline"
            />
          ) : null}
          {profile.role === "student" ? (
            <>
              <ReadOnlyField
                label="Program"
                value={profile.program}
                icon="book-outline"
              />
              <ReadOnlyField
                label="Year of Study"
                value={profile.year_of_study}
                icon="school-outline"
              />
            </>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.disabled]}
          onPress={confirmLogout}
          disabled={loggingOut}
          accessibilityRole="button"
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={COLORS.surface} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close change password dialog"
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <CustomInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              icon="lock-closed-outline"
              secureTextEntry
            />
            <CustomInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
              icon="key-outline"
              secureTextEntry
            />
            <CustomInput
              label="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirm new password"
              icon="key-outline"
              secureTextEntry
            />
            <PrimaryButton
              title="Update Password"
              onPress={submitPasswordChange}
              loading={passwordSaving}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ReadOnlyField({ label, value, icon }) {
  return (
    <View style={styles.readOnlyRow}>
      <Ionicons name={icon} size={19} color={COLORS.textMuted} />
      <View style={styles.readOnlyContent}>
        <Text style={styles.readOnlyLabel}>{label}</Text>
        <Text style={styles.readOnlyValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: SPACING.xl },
  header: { marginBottom: SPACING.md },
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: "700" },
  subtitle: { marginTop: 4, color: COLORS.textSecondary, fontSize: 14 },
  section: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  pictureSection: { alignItems: "center" },
  avatar: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: SPACING.sm,
    borderRadius: 44,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarImage: { width: "100%", height: "100%" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  uploadText: { color: COLORS.primary, fontSize: 13, fontWeight: "700" },
  pictureNote: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
  saveButton: { marginTop: SPACING.xs },
  passwordButton: { marginTop: SPACING.sm },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  readOnlyContent: { flex: 1, marginLeft: SPACING.sm },
  readOnlyLabel: { color: COLORS.textMuted, fontSize: 12 },
  readOnlyValue: {
    marginTop: 3,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  badgeRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  roleBadge: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusBadge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 14 },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  logoutButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.danger,
  },
  logoutText: { color: COLORS.surface, fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.65 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textSecondary },
  errorText: { marginTop: SPACING.sm, color: COLORS.danger, textAlign: "center" },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  retryText: { color: COLORS.surface, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.md,
    backgroundColor: "rgba(12, 31, 63, 0.5)",
  },
  passwordModal: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },
});
