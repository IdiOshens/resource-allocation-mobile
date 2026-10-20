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
import { deleteClassroom } from "../../../services/api/adminResources";
import { fetchClassrooms } from "../../../services/api/classrooms";

export default function AdminClassroomsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadClassrooms = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError(null);
      const result = await fetchClassrooms(token);
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load classrooms.");
      }
      setClassrooms(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load classrooms.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadClassrooms();
    }, [loadClassrooms]),
  );

  const confirmDelete = (classroom) => {
    Alert.alert(
      "Delete Classroom",
      `Delete ${classroom.room_number} in ${classroom.building}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteClassroom(token, classroom.classroom_id);
              if (!result.success) {
                throw new Error(result.message || "Could not delete classroom.");
              }
              await loadClassrooms();
            } catch (deleteError) {
              Alert.alert("Delete Failed", deleteError.message);
            }
          },
        },
      ],
    );
  };

  const openForm = (classroom) => {
    router.push({
      pathname: "/(tabs)/admin-resources/classroom-form",
      params: classroom
        ? {
            id: String(classroom.classroom_id),
            room_number: classroom.room_number ?? "",
            building: classroom.building ?? "",
            floor: String(classroom.floor ?? ""),
            campus_location: classroom.campus_location ?? "",
            capacity: String(classroom.capacity ?? ""),
            room_type: classroom.room_type ?? "",
            status: classroom.status ?? "available",
            responsible_department_id:
              classroom.responsible_department_id == null
                ? ""
                : String(classroom.responsible_department_id),
            has_projector: String(Number(classroom.has_projector)),
            has_smart_board: String(Number(classroom.has_smart_board)),
            has_computers: String(Number(classroom.has_computers)),
            number_of_computers: String(classroom.number_of_computers ?? 0),
            has_wifi: String(Number(classroom.has_wifi)),
            has_air_conditioning: String(Number(classroom.has_air_conditioning)),
          }
        : undefined,
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.details}
        onPress={() => openForm(item)}
        activeOpacity={0.75}
      >
        <Text style={styles.name}>{item.room_number} · {item.building}</Text>
        <Text style={styles.meta}>
          {item.room_type?.replaceAll("_", " ")} · Capacity {item.capacity}
        </Text>
        <Text style={styles.status}>{item.status}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => openForm(item)}
          accessibilityLabel="Edit classroom"
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => confirmDelete(item)}
          accessibilityLabel="Delete classroom"
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader
        title="Classrooms"
        actionTitle="Add Classroom"
        onAction={() => openForm(null)}
        backTo="/(tabs)/admin-resources"
      />
      {loading && classrooms.length === 0 ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading classrooms…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadClassrooms}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={classrooms}
          keyExtractor={(item) => String(item.classroom_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadClassrooms();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateText}>No classrooms found.</Text>
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
  meta: { marginTop: 5, color: COLORS.textSecondary, fontSize: 13, textTransform: "capitalize" },
  status: { marginTop: 5, color: COLORS.primary, fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  actions: { flexDirection: "row" },
  iconButton: { padding: 8 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textMuted },
  errorText: { color: COLORS.danger, textAlign: "center", marginBottom: SPACING.sm },
  retryText: { color: COLORS.primary, fontWeight: "700" },
});
