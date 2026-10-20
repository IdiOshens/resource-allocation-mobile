import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DatePickerField from "../../components/ui/DatePickerField";
import PrimaryButton from "../../components/ui/PrimaryButton";
import TimePickerField from "../../components/ui/TimePickerField";
import { COLORS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { rescheduleBooking } from "../../services/api/bookings";

function paramValue(value) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function RescheduleBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const allocationId = paramValue(params.id);
  const [date, setDate] = useState(paramValue(params.allocation_date));
  const [startTime, setStartTime] = useState(
    paramValue(params.start_time).slice(0, 5),
  );
  const [endTime, setEndTime] = useState(paramValue(params.end_time).slice(0, 5));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!date || !startTime || !endTime) {
      setError("Select a date, start time, and end time.");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await rescheduleBooking(
        token,
        allocationId,
        date,
        startTime,
        endTime,
      );
      if (!result.success) {
        throw new Error(result.message || "Could not reschedule booking.");
      }
      Alert.alert(
        "Booking Rescheduled",
        "Your booking has been rescheduled and is pending approval.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (submitError) {
      setError(submitError.message || "Could not reschedule booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back-outline" size={23} color={COLORS.primary} />
          <Text style={styles.backText}>Booking Details</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reschedule Booking</Text>
        <Text style={styles.subtitle}>Choose a new date and time.</Text>

        <DatePickerField
          label="New Date"
          value={date}
          onChange={setDate}
          required
          minimumDate={new Date()}
        />
        <TimePickerField
          label="New Start Time"
          value={startTime}
          onChange={setStartTime}
          required
        />
        <TimePickerField
          label="New End Time"
          value={endTime}
          onChange={setEndTime}
          required
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Save New Schedule"
          onPress={submit}
          loading={saving}
          style={styles.submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, padding: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  backText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: "700" },
  subtitle: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  error: { marginBottom: SPACING.sm, color: COLORS.danger, fontSize: 13 },
  submit: { marginTop: SPACING.sm },
});
