import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchMyBookings } from "../../services/api/bookings";
import ActionCard from "../ui/ActionCard";
import StatTile from "../ui/StatTile";
import {
  DashboardLayout,
  DashboardSection,
  DashboardStatRow,
} from "./DashboardPrimitives";

function countUpcomingBookings(bookings, statuses) {
  const now = new Date();
  return bookings.filter((booking) => {
    if (!statuses.includes(booking.status)) return false;
    const endAt = new Date(`${booking.allocation_date}T${booking.end_time}`);
    return !Number.isNaN(endAt.getTime()) && endAt >= now;
  }).length;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyBookings(token);
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load your bookings.");
      }
      setBookings(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <DashboardLayout
      loading={loading}
      error={error}
      onRetry={loadBookings}
    >
      <DashboardSection title="Overview">
        <DashboardStatRow>
          <StatTile
            icon="calendar-check-outline"
            label="My Active Bookings"
            value={countUpcomingBookings(bookings, ["approved"])}
          />
          <StatTile
            icon="time-outline"
            label="Pending Bookings"
            value={bookings.filter((booking) => booking.status === "pending").length}
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
          title="Book Equipment"
          icon="construct-outline"
          onPress={() => router.push("/(tabs)/equipment")}
        />
        <ActionCard
          title="View Bookings"
          icon="calendar-outline"
          onPress={() => router.push("/(tabs)/my-bookings")}
        />
      </DashboardSection>
    </DashboardLayout>
  );
}
