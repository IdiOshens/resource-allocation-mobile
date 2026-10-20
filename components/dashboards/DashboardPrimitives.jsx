import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "../ui/DashboardHeader";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";

export function DashboardLayout({
  loading = false,
  error = null,
  onRetry,
  children,
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader />
        <View style={styles.content}>
          {loading ? (
            <View style={styles.state}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.stateText}>Loading dashboard…</Text>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <Text style={styles.errorText}>{error}</Text>
              {onRetry ? (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            children
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function DashboardSection({ title, subtitle, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function DashboardStatRow({ children }) {
  return <View style={styles.statRow}>{children}</View>;
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
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: SPACING.xl,
  },
  state: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
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
  section: {
    marginTop: SPACING.md,
  },
  statRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
