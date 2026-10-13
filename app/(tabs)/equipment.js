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
import { fetchEquipment } from "../../services/api/auth";

export default function EquipmentScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadEquipment = async () => {
    try {
      setError(null);
      const result = await fetchEquipment(token);

      if (result.success) {
        setEquipment(result.data);
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
    loadEquipment();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEquipment();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/book-equipment",
          params: {
            equipmentId: item.equipment_id,
            equipmentLabel: item.equipment_name,
          },
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.equipment_name}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "available"
              ? styles.statusAvailable
              : styles.statusOther,
          ]}
        >
          <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
        </View>
      </View>

      <Text style={styles.type}>
        {item.equipment_type} · {item.manufacturer || "Unknown"}
      </Text>

      {item.battery_health !== null && (
        <View style={styles.metaRow}>
          <Ionicons name="battery-half-outline" size={14} color="#666" />
          <Text style={styles.metaText}> Battery: {item.battery_health}%</Text>
        </View>
      )}

      {item.current_location && (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.metaText}> {item.current_location}</Text>
        </View>
      )}

      {item.department_name && (
        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={14} color="#666" />
          <Text style={styles.metaText}> {item.department_name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading equipment…</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadEquipment}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipment</Text>
        <Text style={styles.subtitle}>{equipment.length} items</Text>
      </View>

      <FlatList
        data={equipment}
        keyExtractor={(item) => String(item.equipment_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No equipment found</Text>
          </View>
        }
      />
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
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusAvailable: { backgroundColor: "#E8F8F0" },
  statusOther: { backgroundColor: "#F0F0F0" },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  type: { fontSize: 13, color: "#666", marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  metaText: { fontSize: 13, color: "#666" },
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
});
