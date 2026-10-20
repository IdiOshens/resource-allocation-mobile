import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../../components/adminResources/ResourceScreenHeader";
import { COLORS, RADIUS, SPACING } from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { deleteEquipment } from "../../../services/api/adminResources";
import { fetchEquipment } from "../../../services/api/equipment";

export default function AdminEquipmentScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadEquipment = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError(null);
      const result = await fetchEquipment(token);
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load equipment.");
      }
      setItems(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load equipment.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadEquipment();
    }, [loadEquipment]),
  );

  const openForm = (item) => {
    router.push({
      pathname: "/(tabs)/admin-resources/equipment-form",
      params: item
        ? {
            id: String(item.equipment_id),
            equipment_name: item.equipment_name ?? "",
            equipment_type: item.equipment_type ?? "",
            model: item.model ?? "",
            serial_number: item.serial_number ?? "",
            current_location: item.current_location ?? "",
            battery_health: item.battery_health == null ? "" : String(item.battery_health),
            safety_level: item.safety_level ?? "low",
            responsible_department_id:
              item.responsible_department_id == null
                ? ""
                : String(item.responsible_department_id),
          }
        : undefined,
    });
  };

  const confirmDelete = (item) => {
    Alert.alert("Delete Equipment", `Delete ${item.equipment_name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await deleteEquipment(token, item.equipment_id);
            if (!result.success) {
              throw new Error(result.message || "Could not delete equipment.");
            }
            await loadEquipment();
          } catch (deleteError) {
            Alert.alert("Delete Failed", deleteError.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.details}
        onPress={() => openForm(item)}
        activeOpacity={0.75}
      >
        <Text style={styles.name}>{item.equipment_name}</Text>
        <Text style={styles.meta}>
          {item.equipment_type}{item.model ? ` · ${item.model}` : ""}
        </Text>
        <Text style={styles.status}>
          {item.status?.replaceAll("_", " ")}{item.current_location ? ` · ${item.current_location}` : ""}
        </Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openForm(item)}
          accessibilityLabel="Edit equipment"
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => confirmDelete(item)}
          accessibilityLabel="Delete equipment"
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader
        title="Equipment"
        actionTitle="Add Equipment"
        onAction={() => openForm(null)}
        backTo="/(tabs)/admin-resources"
      />
      {loading && items.length === 0 ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading equipment…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadEquipment}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.equipment_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEquipment();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateText}>No equipment found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingHorizontal: 20, paddingBottom: SPACING.xl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  details: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "700" },
  meta: { marginTop: 5, color: COLORS.textSecondary, fontSize: 13 },
  status: { marginTop: 5, color: COLORS.textMuted, fontSize: 12, textTransform: "capitalize" },
  actions: { flexDirection: "row" },
  iconButton: { padding: 8 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textMuted },
  errorText: { color: COLORS.danger, textAlign: "center", marginBottom: SPACING.sm },
  retryText: { color: COLORS.primary, fontWeight: "700" },
});
