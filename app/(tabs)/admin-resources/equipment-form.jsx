import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import ResourceScreenHeader from "../../../components/adminResources/ResourceScreenHeader";
import SelectField from "../../../components/adminResources/SelectField";
import CustomInput from "../../../components/ui/CustomInput";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import { COLORS, SPACING } from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  createEquipment,
  fetchDepartments,
  updateEquipment,
} from "../../../services/api/adminResources";

const SAFETY_LEVELS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

function paramValue(value, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default function EquipmentFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const id = paramValue(params.id);
  const editing = Boolean(id);
  const [name, setName] = useState(paramValue(params.equipment_name));
  const [type, setType] = useState(paramValue(params.equipment_type));
  const [model, setModel] = useState(paramValue(params.model));
  const [serialNumber, setSerialNumber] = useState(paramValue(params.serial_number));
  const [location, setLocation] = useState(paramValue(params.current_location));
  const [batteryHealth, setBatteryHealth] = useState(
    paramValue(params.battery_health),
  );
  const [safetyLevel, setSafetyLevel] = useState(
    paramValue(params.safety_level, "low"),
  );
  const [departmentId, setDepartmentId] = useState(
    paramValue(params.responsible_department_id),
  );
  const [departments, setDepartments] = useState([]);
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
    if (!name.trim() || !type.trim()) {
      setError("Equipment Name and Type are required.");
      return;
    }
    const parsedBatteryHealth =
      batteryHealth.trim() === "" ? null : Number(batteryHealth);
    if (
      parsedBatteryHealth !== null &&
      (!Number.isInteger(parsedBatteryHealth) ||
        parsedBatteryHealth < 0 ||
        parsedBatteryHealth > 100)
    ) {
      setError("Battery health must be a whole number from 0 to 100.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data = {
        equipment_name: name.trim(),
        equipment_type: type.trim(),
        model: model.trim(),
        serial_number: serialNumber.trim(),
        current_location: location.trim(),
        battery_health: parsedBatteryHealth,
        safety_level: safetyLevel,
        responsible_department_id: departmentId ? Number(departmentId) : null,
      };
      const result = editing
        ? await updateEquipment(token, id, data)
        : await createEquipment(token, data);
      if (!result.success) {
        throw new Error(result.message || "Could not save equipment.");
      }
      Alert.alert("Saved", editing ? "Equipment updated." : "Equipment created.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/admin-resources/equipment"),
        },
      ]);
    } catch (saveError) {
      setError(saveError.message || "Could not save equipment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader
        title={editing ? "Edit Equipment" : "Add Equipment"}
        backTo="/(tabs)/admin-resources"
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <CustomInput
          label="Equipment Name"
          value={name}
          onChangeText={setName}
          placeholder="Equipment name"
          icon="construct-outline"
          required
        />
        <CustomInput
          label="Type"
          value={type}
          onChangeText={setType}
          placeholder="e.g. Projector"
          icon="pricetag-outline"
          required
        />
        <CustomInput
          label="Model"
          value={model}
          onChangeText={setModel}
          placeholder="Model"
          icon="hardware-chip-outline"
        />
        <CustomInput
          label="Serial Number"
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Serial number"
          icon="barcode-outline"
          autoCapitalize="characters"
        />
        <CustomInput
          label="Current Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Location"
          icon="location-outline"
        />
        <CustomInput
          label="Battery Health (0-100)"
          value={batteryHealth}
          onChangeText={setBatteryHealth}
          placeholder="e.g. 95"
          icon="battery-half-outline"
          keyboardType="number-pad"
        />
        <SelectField
          label="Safety Level"
          value={safetyLevel}
          options={SAFETY_LEVELS}
          onChange={setSafetyLevel}
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
          onChange={setDepartmentId}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title={editing ? "Save Changes" : "Create Equipment"}
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
  saveButton: { marginTop: SPACING.sm },
});
