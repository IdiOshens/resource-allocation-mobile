import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import { fetchEquipment } from "../../services/api/auth";
import { COLORS } from "../../constants/colors";
import NotificationBell from "../../components/ui/NotificationBell";

const EQUIPMENT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "In Use", value: "in_use" },
  { label: "Maintenance", value: "maintenance" },
];

export default function EquipmentScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const loadEquipment = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchEquipment(token);

      if (result.success) {
        setEquipment(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

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
          <Ionicons name="battery-half-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}> Battery: {item.battery_health}%</Text>
        </View>
      )}

      {item.current_location && (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}> {item.current_location}</Text>
        </View>
      )}

      {item.department_name && (
        <View style={styles.metaRow}>
          <Ionicons name="business-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}> {item.department_name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      String(item.equipment_name ?? "").toLowerCase().includes(normalizedSearch) ||
      String(item.equipment_type ?? "").toLowerCase().includes(normalizedSearch);
    const normalizedStatus = String(item.status ?? "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const matchesStatus =
      activeFilter === "all" ||
      (activeFilter === "in_use"
        ? normalizedStatus === "in_use" || normalizedStatus === "inuse"
        : activeFilter === "maintenance"
          ? normalizedStatus.includes("maintenance")
          : normalizedStatus === activeFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading equipment…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Equipment</Text>
            <Text style={styles.subtitle}>{filteredEquipment.length} items</Text>
          </View>
          <NotificationBell />
        </View>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search equipment or type"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
            accessibilityLabel="Search equipment"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => setSearch("")}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={19} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {EQUIPMENT_FILTERS.map((filter) => {
            const selected = activeFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setActiveFilter(filter.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredEquipment}
        keyExtractor={(item) => String(item.equipment_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              {normalizedSearch || activeFilter !== "all"
                ? "No results found"
                : "No equipment found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  filters: { paddingBottom: 8 },
  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },
  chipSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: "600" },
  chipTextSelected: { color: COLORS.surface },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.surface,
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
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusAvailable: { backgroundColor: COLORS.successBg },
  statusOther: { backgroundColor: COLORS.neutralBg },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  type: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  metaText: { fontSize: 13, color: COLORS.textSecondary },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  errorText: {
    marginTop: 12,
    color: COLORS.danger,
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryText: { color: COLORS.surface, fontWeight: "600" },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
