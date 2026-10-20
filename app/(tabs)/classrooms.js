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
import { fetchClassrooms } from "../../services/api/auth";
import { COLORS } from "../../constants/colors";
import NotificationBell from "../../components/ui/NotificationBell";

const CLASSROOM_FILTERS = [
  { label: "All", value: "all" },
  { label: "Has Projector", value: "has_projector" },
  { label: "Has Computers", value: "has_computers" },
  { label: "Has WiFi", value: "has_wifi" },
];

export default function ClassroomsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const loadClassrooms = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchClassrooms(token);

      if (result.success) {
        setClassrooms(result.data);
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
    loadClassrooms();
  }, [loadClassrooms]);

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
        <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
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

  const normalizedSearch = search.trim().toLowerCase();
  const filteredClassrooms = classrooms.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      String(item.room_number ?? "").toLowerCase().includes(normalizedSearch) ||
      String(item.building ?? "").toLowerCase().includes(normalizedSearch);
    const matchesFeature =
      activeFilter === "all" ||
      item[activeFilter] === true ||
      Number(item[activeFilter]) === 1;
    return matchesSearch && matchesFeature;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading classrooms…</Text>
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Classrooms</Text>
            <Text style={styles.subtitle}>
              {filteredClassrooms.length} rooms available
            </Text>
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
            placeholder="Search room or building"
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
            accessibilityLabel="Search classrooms"
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
          {CLASSROOM_FILTERS.map((filter) => {
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
        data={filteredClassrooms}
        keyExtractor={(item) => String(item.classroom_id)}
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
                : "No classrooms found"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Feature({ icon, label }) {
  return (
    <View style={styles.feature}>
      <Ionicons name={icon} size={13} color={COLORS.primary} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
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
  roomNumber: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusAvailable: { backgroundColor: COLORS.successBg },
  statusOther: { backgroundColor: COLORS.neutralBg },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  roomType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: "capitalize",
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  metaText: { fontSize: 13, color: COLORS.textSecondary },
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
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureLabel: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },
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

  busyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.warningBg,
  },
  busyText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.warning,
  },
});
