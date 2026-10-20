import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminUsers } from "../../services/api/adminUsers";

const ROLE_FILTERS = [
  { label: "All", value: null },
  { label: "Students", value: "student" },
  { label: "Instructors", value: "instructor" },
  { label: "Staff", value: "staff" },
  { label: "Admins", value: "admin" },
  { label: "Dept Heads", value: "department_head" },
];

const STATUS_STYLES = {
  active: { backgroundColor: COLORS.successBg, color: COLORS.success },
  pending: { backgroundColor: COLORS.warningBg, color: COLORS.warning },
  rejected: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
  suspended: { backgroundColor: COLORS.dangerBg, color: COLORS.danger },
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [role, setRole] = useState(null);
  const [pendingOnly, setPendingOnly] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    if (!token) {
      setUsers([]);
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null);
    try {
      const result = await fetchAdminUsers(token, {
        role: role || undefined,
        status: pendingOnly ? "pending" : undefined,
      });
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load users.");
      }
      setUsers(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pendingOnly, role, token]);

  useEffect(() => {
    setLoading(true);
    loadUsers();
  }, [loadUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const renderUser = ({ item }) => {
    const status = STATUS_STYLES[item.account_status] || {
      backgroundColor: COLORS.neutralBg,
      color: COLORS.textSecondary,
    };

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.75}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/admin-user-detail",
            params: { id: String(item.user_id) },
          })
        }
      >
        <View style={styles.userDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.full_name}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
          <View style={styles.badges}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{item.role?.replace("_", " ")}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {item.account_status}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Users</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(tabs)/admin-user-form")}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={19} color={COLORS.surface} />
          <Text style={styles.createButtonText}>Create User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {ROLE_FILTERS.map((filter) => {
          const selected = role === filter.value;
          return (
            <TouchableOpacity
              key={filter.label}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => setRole(filter.value)}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.filterChip, pendingOnly && styles.pendingChipSelected]}
          onPress={() => setPendingOnly((current) => !current)}
          accessibilityRole="switch"
          accessibilityState={{ checked: pendingOnly }}
        >
          <Ionicons
            name={pendingOnly ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={pendingOnly ? COLORS.surface : COLORS.warning}
          />
          <Text style={[styles.filterText, pendingOnly && styles.filterTextSelected]}>
            Pending Only
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadUsers}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={renderUser}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.state}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.stateText}>Loading users…</Text>
            </View>
          ) : !error ? (
            <View style={styles.state}>
              <Ionicons
                name="people-outline"
                size={44}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.stateText}>
                Try changing the selected filters.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  createButton: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  filters: {
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  filterChip: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pendingChipSelected: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextSelected: {
    color: COLORS.surface,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  userDetails: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  userEmail: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: RADIUS.xl,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  errorBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: {
    flex: 1,
    marginRight: SPACING.sm,
    color: COLORS.danger,
    fontSize: 13,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  state: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  stateText: {
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  emptyTitle: {
    marginTop: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
