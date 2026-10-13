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
import { fetchClassrooms } from "../../services/api/auth";

export default function ClassroomsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadClassrooms = async () => {
    try {
      setError(null);
      const result = await fetchClassrooms(token);

      if (result.success) {
        setClassrooms(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadClassrooms();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/book-classroom",
          params: {
            classroomId: item.classroom_id,
            roomLabel: `${item.room_number} · ${item.building}`,
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.roomNumber}>
          {item.room_number} · {item.building}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {item.is_busy_now && (
            <View style={styles.busyBadge}>
              <Text style={styles.busyText}>IN USE</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              item.status === "available"
                ? styles.statusAvailable
                : styles.statusOther,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.roomType}>{item.room_type.replace("_", " ")}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={14} color="#666" />
        <Text style={styles.metaText}> Capacity: {item.capacity}</Text>
      </View>

      <View style={styles.featuresRow}>
        {item.has_projector && (
          <Feature icon="videocam-outline" label="Projector" />
        )}
        {item.has_smart_board && (
          <Feature icon="easel-outline" label="Smart Board" />
        )}
        {item.has_computers && (
          <Feature
            icon="desktop-outline"
            label={`${item.number_of_computers} PCs`}
          />
        )}
        {item.has_air_conditioning && (
          <Feature icon="snow-outline" label="A/C" />
        )}
        {item.has_wifi && <Feature icon="wifi-outline" label="WiFi" />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading classrooms…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadClassrooms}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Classrooms</Text>
        <Text style={styles.subtitle}>{classrooms.length} rooms available</Text>
      </View>

      <FlatList
        data={classrooms}
        keyExtractor={(item) => String(item.classroom_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No classrooms found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Feature({ icon, label }) {
  return (
    <View style={styles.feature}>
      <Ionicons name={icon} size={13} color="#4A90E2" />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
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
    backgroundColor: "#FFFFFF",
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
  },
  roomNumber: { fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusAvailable: { backgroundColor: "#E8F8F0" },
  statusOther: { backgroundColor: "#F0F0F0" },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  roomType: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    textTransform: "capitalize",
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  metaText: { fontSize: 13, color: "#666" },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF4FB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureLabel: { fontSize: 11, color: "#4A90E2", fontWeight: "600" },
  loadingText: { marginTop: 12, color: "#666" },
  errorText: {
    marginTop: 12,
    color: "#E74C3C",
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: { color: "#FFF", fontWeight: "600" },
  emptyText: { color: "#888", fontSize: 14 },

  busyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFF4E5",
  },
  busyText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B7700B",
  },
});
