import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../components/adminResources/ResourceScreenHeader";
import StatTile from "../../components/ui/StatTile";
import { COLORS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminAnalytics } from "../../services/api/admin";

export default function AdminAnalyticsScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminAnalytics(token);
      if (!result.success || !result.data) {
        throw new Error(result.message || "Could not load system analytics.");
      }
      setStats(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load system analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader title="System Analytics" />
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading analytics…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.row}>
            <StatTile
              icon="people-outline"
              label="Total Users"
              value={stats.total_users}
            />
            <StatTile
              icon="today-outline"
              label="Bookings Today"
              value={stats.total_bookings_today}
            />
          </View>
          <View style={styles.row}>
            <StatTile
              icon="calendar-outline"
              label="Bookings This Week"
              value={stats.total_bookings_this_week}
            />
            <StatTile
              icon="business-outline"
              label="Classroom Utilization Rate"
              value={`${stats.utilization_rate}%`}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: SPACING.md, paddingBottom: SPACING.xl },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  row: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.sm },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textMuted },
  errorText: { color: COLORS.danger, textAlign: "center" },
});
