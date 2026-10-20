import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../../components/adminResources/ResourceScreenHeader";
import { COLORS, RADIUS, SPACING } from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchDepartments } from "../../../services/api/adminResources";

export default function AdminDepartmentsScreen() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDepartments = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError(null);
      const result = await fetchDepartments(token);
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load departments.");
      }
      setDepartments(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load departments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader title="Departments" />
      {loading && departments.length === 0 ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading departments…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => String(item.department_id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadDepartments();
              }}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.icon}>
                <Ionicons name="business-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{item.department_name}</Text>
                <Text style={styles.code}>{item.department_code}</Text>
                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateText}>No departments found.</Text>
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
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  details: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "700" },
  code: { marginTop: 3, color: COLORS.primary, fontSize: 12, fontWeight: "700" },
  description: { marginTop: 5, color: COLORS.textMuted, fontSize: 12 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textMuted },
  errorText: { color: COLORS.danger, textAlign: "center" },
});
