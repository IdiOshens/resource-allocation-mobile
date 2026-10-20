import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchInstructorDashboard } from "../../services/api/admin";
import ActionCard from "../ui/ActionCard";
import StatTile from "../ui/StatTile";
import {
  DashboardLayout,
  DashboardSection,
  DashboardStatRow,
} from "./DashboardPrimitives";

export default function InstructorDashboard() {
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
      const result = await fetchInstructorDashboard(token);
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
      <DashboardSection title="Overview">
        <DashboardStatRow>
          <StatTile
            icon="calendar-outline"
            label="Upcoming Bookings"
            value={stats?.my_upcoming_bookings_count}
          />
          <StatTile
            icon="time-outline"
            label="Pending Requests"
            value={stats?.my_pending_bookings_count}
          />
        </DashboardStatRow>
      </DashboardSection>

      <DashboardSection title="Quick Actions">
        <ActionCard
          title="Book a Room"
          icon="business-outline"
          onPress={() => router.push("/(tabs)/classrooms")}
        />
        <ActionCard
          title="My Students"
          icon="people-outline"
          onPress={() => router.push("/(tabs)/instructor-students")}
        />
      </DashboardSection>
    </DashboardLayout>
  );
}
