import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import {
    approveBooking,
    fetchPendingBookings,
    rejectBooking,
} from "../../services/api/auth";

export default function ApprovalsScreen() {
  const { token, role } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const result = await fetchPendingBookings(token);
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

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const result = await approveBooking(token, id);
      if (result.success) {
        setBookings((prev) => prev.filter((b) => b.allocation_id !== id));
        Alert.alert("Approved", "Booking approved.");
      } else {
        Alert.alert("Failed", result.message);
      }
    } catch {
      Alert.alert("Connection Error", "Could not reach the server.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (id) => {
    Alert.prompt
      ? Alert.prompt("Reject Booking", "Reason (optional)", async (notes) => {
          setProcessingId(id);
          try {
            const result = await rejectBooking(token, id, notes || "");
            if (result.success) {
              setBookings((prev) => prev.filter((b) => b.allocation_id !== id));
              Alert.alert("Rejected", "Booking rejected.");
            } else {
              Alert.alert("Failed", result.message);
            }
          } catch {
            Alert.alert("Connection Error", "Could not reach the server.");
          } finally {
            setProcessingId(null);
          }
        })
      : (async () => {
          setProcessingId(id);
          try {
            const result = await rejectBooking(token, id, "");
            if (result.success) {
              setBookings((prev) => prev.filter((b) => b.allocation_id !== id));
              Alert.alert("Rejected", "Booking rejected.");
            } else {
              Alert.alert("Failed", result.message);
            }
          } catch {
            Alert.alert("Connection Error", "Could not reach the server.");
          } finally {
            setProcessingId(null);
          }
        })();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading pending bookings…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.resourceName}>{item.resource_name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.priority}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        Booked by: {item.booked_by_name} ({item.booked_by_role})
      </Text>
      <Text style={styles.meta}>{item.booked_by_email}</Text>
      <Text style={styles.meta}>Date: {item.allocation_date}</Text>
      <Text style={styles.meta}>
        Time: {item.start_time} → {item.end_time}
      </Text>
      <Text style={styles.meta} numberOfLines={2}>
        Purpose: {item.purpose}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleApprove(item.allocation_id)}
          disabled={processingId === item.allocation_id}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleReject(item.allocation_id)}
          disabled={processingId === item.allocation_id}
        >
          <Ionicons name="close-circle-outline" size={18} color="#FFF" />
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Approvals</Text>
        <Text style={styles.subtitle}>{bookings.length} awaiting review</Text>
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
          data={bookings}
          keyExtractor={(item) => String(item.allocation_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                No pending bookings right now.
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
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 14, color: "#666", marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#EEF4FB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A90E2",
    textTransform: "uppercase",
  },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveBtn: { backgroundColor: "#2ECC71" },
  rejectBtn: { backgroundColor: "#E74C3C" },
  actionText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
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
  emptyText: { color: "#888", fontSize: 14 },
});
