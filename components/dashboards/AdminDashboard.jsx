import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminDashboard } from "../../services/api/admin";
import ActionCard from "../ui/ActionCard";
import StatTile from "../ui/StatTile";
import {
  DashboardLayout,
  DashboardSection,
  DashboardStatRow,
} from "./DashboardPrimitives";

export default function AdminDashboard() {
  const router = useRouter();
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
      const result = await fetchAdminDashboard(token);
      if (!result.success || !result.data) {
        throw new Error(result.message || "Could not load dashboard statistics.");
      }
      setStats(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      onRetry={loadStats}
    >
      <DashboardSection title="System Overview">
        <DashboardStatRow>
          <StatTile
            icon="people-outline"
            label="Total Users"
            value={stats?.total_users}
          />
          <StatTile
            icon="time-outline"
            label="Pending Bookings"
            value={stats?.pending_bookings}
            onPress={() => router.push("/(tabs)/approvals")}
          />
        </DashboardStatRow>
        <DashboardStatRow>
          <StatTile
            icon="business-outline"
            label="Classrooms"
            value={stats?.total_classrooms}
          />
          <StatTile
            icon="construct-outline"
            label="Equipment"
            value={stats?.total_equipment}
          />
        </DashboardStatRow>
      </DashboardSection>

      <DashboardSection title="Quick Actions">
        <ActionCard
          title="Manage Users"
          icon="people-outline"
          onPress={() => router.push("/(tabs)/admin-users")}
        />
        <ActionCard
          title="Review Approvals"
          icon="shield-checkmark-outline"
          onPress={() => router.push("/(tabs)/approvals")}
        />
        <ActionCard
          title="Manage Resources"
          icon="construct-outline"
          onPress={() => router.push("/(tabs)/admin-resources")}
        />
        <ActionCard
          title="System Analytics"
          icon="stats-chart-outline"
          onPress={() => router.push("/(tabs)/admin-analytics")}
        />
      </DashboardSection>
    </DashboardLayout>
  );
}
