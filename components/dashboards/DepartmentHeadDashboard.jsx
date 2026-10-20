import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchDepartmentHeadDashboard } from "../../services/api/admin";
import ActionCard from "../ui/ActionCard";
import StatTile from "../ui/StatTile";
import {
  DashboardLayout,
  DashboardSection,
  DashboardStatRow,
} from "./DashboardPrimitives";

export default function DepartmentHeadDashboard({ departmentName }) {
  const router = useRouter();
  const { token, user } = useAuth();
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
      const result = await fetchDepartmentHeadDashboard(token);
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

  const resolvedDepartmentName =
    departmentName ||
    user?.department_name ||
    user?.department?.department_name ||
    (user?.department_id ? `Department ${user.department_id}` : "Department");

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      onRetry={loadStats}
    >
      <DashboardSection
        title="My Department"
        subtitle={resolvedDepartmentName}
      >
        <DashboardStatRow>
          <StatTile
            icon="people-outline"
            label="Students"
            value={stats?.dept_students_count}
          />
          <StatTile
            icon="school-outline"
            label="Instructors"
            value={stats?.dept_instructors_count}
          />
          <StatTile
            icon="briefcase-outline"
            label="Staff"
            value={stats?.dept_staff_count}
          />
        </DashboardStatRow>
      </DashboardSection>

      <DashboardSection title="Quick Actions">
        <ActionCard
          title="Review Approvals"
          icon="shield-checkmark-outline"
          onPress={() => router.push("/(tabs)/approvals")}
        />
        <ActionCard
          title="Department Analytics"
          icon="stats-chart-outline"
          onPress={() => router.push("/(tabs)/department-analytics")}
        />
      </DashboardSection>
    </DashboardLayout>
  );
}
