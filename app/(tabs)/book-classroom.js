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

import { useAuth } from "../../contexts/AuthContext";
import { createBooking } from "../../services/api/auth";

export default function BookClassroomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const classroomId = params.classroomId ? Number(params.classroomId) : 0;
  const roomLabel = params.roomLabel ?? "Classroom";

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
      e.date = "Use format YYYY-MM-DD (e.g. 2026-10-15)";
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      e.startTime = "Use format HH:MM (e.g. 09:00)";
    }
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      e.endTime = "Use format HH:MM (e.g. 11:00)";
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
        resource_type: "classroom",
        resource_id: classroomId,
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
          'Your booking is pending approval. You can view it under "My Bookings".',
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/my-bookings"),
            },
          ],
        );
      } else {
        Alert.alert("Booking Failed", result.message || "Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      console.log("BOOKING ERROR:", err);
      console.log("BOOKING ERROR MESSAGE:", err.message);
      console.log("BOOKING ERROR STACK:", err.stack);
      Alert.alert("Connection Error", String(err.message || err));
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
            <Ionicons name="arrow-back-outline" size={24} color="#4A90E2" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Book Classroom</Text>
          <Text style={styles.subtitle}>{roomLabel}</Text>

          <Field
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-15"
            error={errors.date}
            icon="calendar-outline"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Field
                label="Start (HH:MM)"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="09:00"
                error={errors.startTime}
                icon="time-outline"
              />
            </View>
            <View style={styles.half}>
              <Field
                label="End (HH:MM)"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="11:00"
                error={errors.endTime}
                icon="time-outline"
              />
            </View>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={[styles.textArea, errors.purpose && styles.inputError]}
              value={purpose}
              onChangeText={setPurpose}
              placeholder="Why do you need this room?"
              placeholderTextColor="#999"
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

function Field({ label, value, onChangeText, placeholder, error, icon }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <Ionicons
          name={icon}
          size={18}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { fontSize: 16, color: "#4A90E2", marginLeft: 4 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1A1A1A" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 4, marginBottom: 24 },
  group: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#1A1A1A" },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#1A1A1A",
  },
  inputError: { borderColor: "#E74C3C" },
  errorText: { color: "#E74C3C", fontSize: 12, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  priorityBtnActive: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  priorityText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priorityTextActive: { color: "#FFF" },
  submit: {
    marginTop: 16,
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});
