import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminUser,
  updateAdminUserStatus,
} from "../../services/api/adminUsers";

const STATUS_STYLES = {
  active: { backgroundColor: COLORS.successBg, color: COLORS.success },
  pending: { backgroundColor: COLORS.warningBg, color: COLORS.warning },
  rejected: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
  suspended: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
};

const STATUS_ACTIONS = {
  pending: [
    { label: "Approve Account", status: "active", icon: "checkmark-circle-outline", tone: "success" },
    { label: "Reject Account", status: "rejected", icon: "close-circle-outline", tone: "danger" },
  ],
  active: [
    { label: "Suspend Account", status: "suspended", icon: "pause-circle-outline", tone: "danger" },
  ],
  suspended: [
    { label: "Reactivate Account", status: "active", icon: "checkmark-circle-outline", tone: "success" },
  ],
  rejected: [
    { label: "Reactivate Account", status: "active", icon: "checkmark-circle-outline", tone: "success" },
  ],
};

function ProfileField({ label, value }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{String(value)}</Text>
    </View>
  );
}

function getProfileFields(user) {
  const profile = user.profile || {};

  switch (user.role) {
    case "student":
      return [
        ["Student Number", profile.student_number],
        ["Program", profile.program],
        ["Year of Study", profile.year_of_study],
        ["Department", profile.department_name],
      ];
    case "instructor":
      return [
        ["Specialization", profile.specialization],
        ["Qualification", profile.qualification],
        ["Department", profile.department_name],
      ];
    case "staff":
      return [
        ["Job Title", profile.job_title],
        ["Department", profile.department_name],
      ];
    default:
      return [["Department ID", user.department_id]];
  }
}

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadUser = useCallback(async () => {
    const userId = Array.isArray(id) ? id[0] : id;
    if (!token || !userId) {
      setError("User details are unavailable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminUser(token, userId);
      if (!result.success || !result.data) {
        throw new Error(result.message || "Could not load user details.");
      }
      setUser(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load user details.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const confirmStatusChange = (action) => {
    Alert.alert(
      action.label,
      `Are you sure you want to ${action.status === "active" ? "activate" : action.status} this account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.label,
          style: action.tone === "danger" ? "destructive" : "default",
          onPress: async () => {
            if (!token || !user) return;

            setUpdating(true);
            try {
              const result = await updateAdminUserStatus(
                token,
                user.user_id,
                action.status,
              );
              if (!result.success) {
                throw new Error(result.message || "Could not update account status.");
              }
              await loadUser();
              Alert.alert("Status Updated", `${user.full_name}'s account is now ${action.status}.`);
            } catch (updateError) {
              Alert.alert(
                "Update Failed",
                updateError.message || "Could not update account status.",
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const statusStyle = user
    ? STATUS_STYLES[user.account_status] || {
        backgroundColor: COLORS.neutralBg,
        color: COLORS.textSecondary,
      }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/admin-user-form",
              params: {
                id: String(user?.user_id ?? ""),
                full_name: user?.full_name ?? "",
                email: user?.email ?? "",
                username: user?.username ?? "",
                phone_number: user?.phone_number ?? "",
                role: user?.role ?? "student",
              },
            })
          }
          disabled={!user || loading}
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={17} color={COLORS.surface} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading user details…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUser}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : user ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.profileHeading}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.full_name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.fullName}>{user.full_name}</Text>
                <Text style={styles.email}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.badges}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role?.replace("_", " ")}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {user.account_status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <ProfileField label="Username" value={user.username} />
            <ProfileField label="Phone" value={user.phone_number} />
            <ProfileField label="Email" value={user.email} />
            {getProfileFields(user).map(([label, value]) => (
              <ProfileField key={label} label={label} value={value} />
            ))}
          </View>

          <View style={styles.actions}>
            {(STATUS_ACTIONS[user.account_status] || []).map((action) => (
              <TouchableOpacity
                key={action.status + action.label}
                style={[
                  styles.actionButton,
                  action.tone === "success"
                    ? styles.successButton
                    : styles.dangerButton,
                  updating && styles.disabledButton,
                ]}
                onPress={() => confirmStatusChange(action)}
                disabled={updating}
                activeOpacity={0.8}
              >
                {updating ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <>
                    <Ionicons
                      name={action.icon}
                      size={20}
                      color={COLORS.surface}
                    />
                    <Text style={styles.actionText}>{action.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  editButton: {
    minWidth: 62,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: SPACING.xl,
  },
  profileCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeading: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  nameBlock: {
    flex: 1,
  },
  fullName: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  email: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  badges: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xl,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.border,
  },
  field: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  fieldValue: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    textTransform: "capitalize",
  },
  actions: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  successButton: {
    backgroundColor: COLORS.success,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "700",
  },
  state: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
  },
  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
