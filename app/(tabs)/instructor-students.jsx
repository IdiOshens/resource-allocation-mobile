import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../components/adminResources/ResourceScreenHeader";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { fetchInstructorStudents } from "../../services/api/admin";

export default function InstructorStudentsScreen() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStudents = useCallback(async () => {
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchInstructorStudents(token);
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Could not load students.");
      }
      setStudents(result.data);
    } catch (loadError) {
      setError(loadError.message || "Could not load students.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const query = search.trim().toLowerCase();
  const filteredStudents = students.filter(
    (student) =>
      String(student.full_name ?? "").toLowerCase().includes(query) ||
      String(student.student_number ?? "").toLowerCase().includes(query),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader title="My Students" />
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or student number"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          accessibilityLabel="Search students"
        />
      </View>
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.stateText}>Loading students…</Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => String(item.student_id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Ionicons name="person-outline" size={21} color={COLORS.primary} />
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.number}>{item.student_number}</Text>
                <Text style={styles.meta}>
                  {item.program || "Program not specified"} · Year {item.year_of_study ?? "—"}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.state}>
              <Text style={styles.stateText}>
                {query ? "No results found." : "No students found."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: SPACING.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
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
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceAlt,
  },
  details: { flex: 1 },
  name: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "700" },
  number: { marginTop: 3, color: COLORS.primary, fontSize: 12, fontWeight: "600" },
  meta: { marginTop: 5, color: COLORS.textMuted, fontSize: 12 },
  state: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.lg },
  stateText: { marginTop: SPACING.sm, color: COLORS.textMuted },
  errorText: { color: COLORS.danger, textAlign: "center" },
});
