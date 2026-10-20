import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DatePickerField from "../../components/ui/DatePickerField";
import TimePickerField from "../../components/ui/TimePickerField";
import { useAuth } from "../../contexts/AuthContext";
import { createBooking } from "../../services/api/auth";
import { COLORS } from "../../constants/colors";

export default function BookEquipmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const equipmentId = params.equipmentId ? Number(params.equipmentId) : 0;
  const equipmentLabel = params.equipmentLabel ?? "Equipment";

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      e.date = "Please select a date";
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      e.startTime = "Please select start time";
    }
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      e.endTime = "Please select end time";
    }
    if (startTime && endTime && startTime >= endTime) {
      e.endTime = "End time must be after start time";
    }
    if (purpose.trim().length < 5) {
      e.purpose = "Please describe the purpose (min 5 chars)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await createBooking(token, {
        resource_type: "equipment",
        resource_id: equipmentId,
        allocation_date: date,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose.trim(),
        priority,
      });

      setIsLoading(false);

      if (result.success) {
        Alert.alert(
          "Booking Submitted",
          'Your equipment booking is pending approval. Check "My Bookings" for updates.',
          [{ text: "OK", onPress: () => router.replace("/(tabs)/my-bookings") }],
        );
      } else {
        Alert.alert("Booking Failed", result.message || "Please try again.");
      }
    } catch {
      setIsLoading(false);
      Alert.alert("Connection Error", "Could not reach the server.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Book Equipment</Text>
          <Text style={styles.subtitle}>{equipmentLabel}</Text>

          <DatePickerField
            label="Date"
            value={date}
            onChange={(val) => {
              setDate(val);
              setErrors((prev) => ({ ...prev, date: null }));
            }}
            placeholder="Select date"
            error={errors.date}
            required
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <TimePickerField
                label="Start Time"
                value={startTime}
                onChange={(val) => {
                  setStartTime(val);
                  setErrors((prev) => ({ ...prev, startTime: null }));
                }}
                placeholder="09:00"
                error={errors.startTime}
                required
              />
            </View>
            <View style={styles.half}>
              <TimePickerField
                label="End Time"
                value={endTime}
                onChange={(val) => {
                  setEndTime(val);
                  setErrors((prev) => ({ ...prev, endTime: null }));
                }}
                placeholder="11:00"
                error={errors.endTime}
                required
              />
            </View>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={[styles.textArea, errors.purpose && styles.inputError]}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Why do you need this equipment?"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
            {errors.purpose && (
              <Text style={styles.errorText}>{errors.purpose}</Text>
            )}
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.row}>
              {["low", "medium", "high"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    priority === p && styles.priorityBtnActive,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submit, isLoading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitText}>
              {isLoading ? "Submitting…" : "Submit Booking"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1, backgroundColor: COLORS.surface },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, marginLeft: 4 },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4, marginBottom: 24 },
  group: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceAlt,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.textPrimary },
  textArea: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceAlt,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    color: COLORS.textPrimary,
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
  },
  priorityBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  priorityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priorityTextActive: { color: COLORS.surface },
  submit: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: COLORS.surface, fontSize: 16, fontWeight: "600" },
});
