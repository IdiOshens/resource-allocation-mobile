import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchMyBookings } from "../../services/api/bookings";
import { fetchEquipment } from "../../services/api/equipment";
import ActionCard from "../ui/ActionCard";
import StatTile from "../ui/StatTile";
import {
  DashboardLayout,
  DashboardSection,
  DashboardStatRow,
} from "./DashboardPrimitives";

function countUpcomingBookings(bookings) {
  const now = new Date();
  return bookings.filter((booking) => {
    if (booking.status !== "pending" && booking.status !== "approved") return false;
    const endAt = new Date(`${booking.allocation_date}T${booking.end_time}`);
    return !Number.isNaN(endAt.getTime()) && endAt >= now;
  }).length;
}

export default function StaffDashboard() {
  const router = useRouter();
  const { token } = useAuth();
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [equipmentCount, setEquipmentCount] = useState(0);
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
      const [bookingsResult, equipmentResult] = await Promise.all([
        fetchMyBookings(token),
        fetchEquipment(token),
      ]);
      if (!bookingsResult.success || !Array.isArray(bookingsResult.data)) {
        throw new Error(bookingsResult.message || "Could not load your bookings.");
      }
      if (!equipmentResult.success || !Array.isArray(equipmentResult.data)) {
        throw new Error(equipmentResult.message || "Could not load equipment.");
      }
      setUpcomingCount(countUpcomingBookings(bookingsResult.data));
      setEquipmentCount(
        equipmentResult.data.filter((item) => item.status === "available").length,
      );
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
            icon="calendar-outline"
            label="My Upcoming Bookings"
            value={upcomingCount}
          />
          <StatTile
            icon="cube-outline"
            label="Equipment Available"
            value={equipmentCount}
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
      </DashboardSection>
    </DashboardLayout>
  );
}
