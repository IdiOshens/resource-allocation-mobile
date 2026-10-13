import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { fetchMyBookings } from "../../services/api/auth";

const STATUS_COLORS = {
  pending: { bg: "#FFF4E5", fg: "#B7700B" },
  approved: { bg: "#E8F8F0", fg: "#1E8449" },
  rejected: { bg: "#FDEDEC", fg: "#B03A2E" },
  cancelled: { bg: "#F0F0F0", fg: "#666666" },
  completed: { bg: "#EAF2F8", fg: "#21618C" },
};

/**
 * Returns true if the booking's end date+time is in the past.
 * A booking on 2026-10-03, 14:00–16:00 becomes "past" at 16:00 that day.
 */
function isPastBooking(booking) {
  const endDateTime = new Date(
    `${booking.allocation_date}T${booking.end_time}`,
  );
  return endDateTime < new Date();
}

export default function MyBookingsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const result = await fetchMyBookings(token);

      if (result.success) {
        setBookings(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const upcoming = bookings.filter((b) => !isPastBooking(b));
  const past = bookings.filter((b) => isPastBooking(b));

  // What the FlatList actually renders
  const dataToShow = showHistory
    ? [
        ...(upcoming.length ? [{ __section: "Upcoming" }, ...upcoming] : []),
        ...(past.length ? [{ __section: "Past" }, ...past] : []),
      ]
    : upcoming;

  const renderItem = ({ item }) => {
    // Section header rows
    if (item.__section) {
      return <Text style={styles.sectionHeader}>{item.__section}</Text>;
    }

    const colors = STATUS_COLORS[item.status] ?? STATUS_COLORS.cancelled;
    const past = isPastBooking(item);

    return (
      <TouchableOpacity
        style={[styles.card, past && styles.cardPast]}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/booking-detail",
            params: { id: item.allocation_id, ts: Date.now() },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.resourceName, past && styles.textPast]}>
            {item.resource_name}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.fg }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={[styles.metaText, past && styles.textPast]}>
            {" "}
            {item.allocation_date}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={[styles.metaText, past && styles.textPast]}>
            {" "}
            {item.start_time} → {item.end_time}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="document-text-outline" size={14} color="#666" />
          <Text
            style={[styles.metaText, past && styles.textPast]}
            numberOfLines={2}
          >
            {" "}
            {item.purpose}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your bookings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>
            {upcoming.length} upcoming · {past.length} past
          </Text>
        </View>

        {past.length > 0 && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Ionicons
              name={showHistory ? "eye-off-outline" : "time-outline"}
              size={16}
              color="#4A90E2"
            />
            <Text style={styles.toggleText}>
              {showHistory ? "Hide" : "History"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dataToShow}
          keyExtractor={(item, index) =>
            item.__section
              ? `section-${item.__section}`
              : String(item.allocation_id)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="calendar-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                You have no upcoming bookings.
              </Text>
              <Text style={styles.emptySubtext}>
                Book a classroom or equipment to get started.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EEF4FB",
  },
  toggleText: { fontSize: 13, color: "#4A90E2", fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPast: { opacity: 0.65 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  textPast: { color: "#777" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  metaText: { fontSize: 13, color: "#555" },
  loadingText: { marginTop: 12, color: "#666" },
  errorText: {
    marginTop: 12,
    color: "#E74C3C",
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  emptyText: { color: "#666", fontSize: 15, marginTop: 12, fontWeight: "600" },
  emptySubtext: {
    color: "#999",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
});
