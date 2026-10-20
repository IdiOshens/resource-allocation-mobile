import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../../components/adminResources/ResourceScreenHeader";
import SelectField from "../../../components/adminResources/SelectField";
import CustomInput from "../../../components/ui/CustomInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { COLORS, SPACING } from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  createClassroom,
  fetchDepartments,
  updateClassroom,
} from "../../../services/api/adminResources";

const ROOM_TYPES = [
  { label: "Classroom", value: "classroom" },
  { label: "Lecture Hall", value: "lecture_hall" },
  { label: "Laboratory", value: "laboratory" },
  { label: "Seminar Room", value: "seminar_room" },
  { label: "Conference Room", value: "conference_room" },
];
const STATUSES = [
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Maintenance", value: "maintenance" },
];
const FEATURE_FIELDS = [
  ["has_projector", "Projector"],
  ["has_smart_board", "Smart board"],
  ["has_computers", "Computers"],
  ["has_wifi", "Wi-Fi"],
  ["has_air_conditioning", "Air conditioning"],
];

function paramValue(value, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default function ClassroomFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const editing = Boolean(id);
  const [roomNumber, setRoomNumber] = useState(paramValue(params.room_number));
  const [building, setBuilding] = useState(paramValue(params.building));
  const [capacity, setCapacity] = useState(paramValue(params.capacity));
  const [departmentId, setDepartmentId] = useState(
    paramValue(params.responsible_department_id),
  );
  const [departments, setDepartments] = useState([]);
  const [roomType, setRoomType] = useState(paramValue(params.room_type));
  const [status, setStatus] = useState(paramValue(params.status, "available"));
  const [features, setFeatures] = useState(() =>
    Object.fromEntries(
      FEATURE_FIELDS.map(([field]) => [
        field,
        paramValue(params[field], "0") === "1",
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadDepartments = async () => {
      if (!token) return;
      try {
        const result = await fetchDepartments(token);
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Could not load departments.");
        }
        if (mounted) setDepartments(result.data);
      } catch (loadError) {
        if (mounted) setError(loadError.message || "Could not load departments.");
      }
    };
    loadDepartments();
    return () => {
      mounted = false;
    };
  }, [token]);

  const save = async () => {
    if (!roomNumber.trim() || !building.trim() || !capacity.trim() || !roomType) {
      setError("Complete all required fields.");
      return;
    }
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      setError("Capacity must be a positive whole number.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const selectedDepartment = departments.find(
        (department) => String(department.department_id) === departmentId,
      );
      if (departmentId && !selectedDepartment?.building?.trim()) {
        throw new Error("The selected department does not have a building configured.");
      }
      const data = {
        room_number: roomNumber.trim(),
        building: (selectedDepartment?.building || building).trim(),
        floor: Number(paramValue(params.floor, "0")),
        campus_location: paramValue(params.campus_location),
        capacity: parsedCapacity,
        room_type: roomType,
        status,
        ...Object.fromEntries(
          FEATURE_FIELDS.map(([field]) => [field, Number(features[field])]),
        ),
        number_of_computers: Number(paramValue(params.number_of_computers, "0")),
      };
      const result = editing
        ? await updateClassroom(token, id, data)
        : await createClassroom(token, data);
      if (!result.success) {
        throw new Error(result.message || "Could not save classroom.");
      }
      Alert.alert("Saved", editing ? "Classroom updated." : "Classroom created.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/admin-resources/classrooms"),
        },
      ]);
    } catch (saveError) {
      setError(saveError.message || "Could not save classroom.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader
        title={editing ? "Edit Classroom" : "Add Classroom"}
        backTo="/(tabs)/admin-resources"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CustomInput
          label="Room Number"
          value={roomNumber}
          onChangeText={setRoomNumber}
          placeholder="e.g. A101"
          icon="business-outline"
          required
        />
        <CustomInput
          label="Building"
          value={building}
          onChangeText={setBuilding}
          placeholder="Building name"
          icon="business-outline"
          required
        />
        <SelectField
          label="Department"
          value={departmentId}
          options={[
            { label: "Shared / Unassigned", value: "" },
            ...departments.map((department) => ({
              label: department.department_name,
              value: String(department.department_id),
            })),
          ]}
          onChange={(value) => {
            setDepartmentId(value);
            const selected = departments.find(
              (department) => String(department.department_id) === value,
            );
            setBuilding(selected?.building || "");
          }}
        />
        <Text style={styles.helpText}>
          Classroom ownership follows the department building.
        </Text>
        <CustomInput
          label="Capacity"
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Number of seats"
          icon="people-outline"
          keyboardType="number-pad"
          required
        />
        <SelectField
          label="Room Type"
          value={roomType}
          options={ROOM_TYPES}
          onChange={setRoomType}
        />
        <SelectField
          label="Status"
          value={status}
          options={STATUSES}
          onChange={setStatus}
        />
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Room Features</Text>
          {FEATURE_FIELDS.map(([field, label]) => (
            <View key={field} style={styles.featureRow}>
              <Text style={styles.featureLabel}>{label}</Text>
              <Switch
                value={features[field]}
                onValueChange={(value) =>
                  setFeatures((current) => ({ ...current, [field]: value }))
                }
                trackColor={{ false: COLORS.border, true: COLORS.lightBlue }}
                thumbColor={features[field] ? COLORS.primary : COLORS.surface}
                accessibilityLabel={label}
              />
            </View>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title={editing ? "Save Changes" : "Create Classroom"}
          onPress={save}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingBottom: SPACING.xl },
  error: { marginBottom: SPACING.sm, color: COLORS.danger, fontSize: 13 },
  helpText: { marginTop: -SPACING.sm, marginBottom: SPACING.md, color: COLORS.textMuted, fontSize: 12 },
  saveButton: { marginTop: SPACING.sm },
  features: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  featuresTitle: {
    paddingTop: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  featureRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceAlt,
  },
  featureLabel: { color: COLORS.textSecondary, fontSize: 14 },
});
