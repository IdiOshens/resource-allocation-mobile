import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../contexts/AuthContext";
import {
    cancelApprovedBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    fetchBooking,
} from "../../services/api/auth";
import { COLORS } from "../../constants/colors";

const STATUS_COLORS = {
  pending: { bg: COLORS.warningBg, fg: COLORS.warning },
  approved: { bg: COLORS.successBg, fg: COLORS.success },
  rejected: { bg: COLORS.dangerBg, fg: COLORS.danger },
  cancelled: { bg: COLORS.neutralBg, fg: COLORS.textSecondary },
  completed: { bg: COLORS.surfaceAlt, fg: COLORS.primary },
};

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();

  const bookingId = params.id ? Number(params.id) : 0;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchBooking(token, bookingId);
      if (result.success) {
        setBooking(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, token]);

  useFocusEffect(
    useCallback(() => {
      setBooking(null);
      setLoading(true);
      setError(null);
      load();
    }, [load]),
  );

  const doAction = (actionLabel, actionFn, successMessage) => {
    Alert.alert(
      actionLabel,
      `Are you sure you want to ${actionLabel.toLowerCase()}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            setBusy(true);
            try {
              const result = await actionFn();
              setBusy(false);

              if (result.success) {
                Alert.alert("Success", successMessage, [
                  { text: "OK", onPress: () => load() },
                ]);
              } else {
                Alert.alert("Failed", result.message || "Please try again.");
              }
            } catch {
              setBusy(false);
              Alert.alert("Connection Error", "Could not reach the server.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading booking…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error ?? "Booking not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const colors = STATUS_COLORS[booking.status] ?? STATUS_COLORS.cancelled;

  // Which buttons to show, based on the booking's state
  const canCancelPending = booking.status === "pending";
  const canCancelApproved =
    booking.status === "approved" && !booking.checked_in_at;
  const canCheckIn = booking.status === "approved" && !booking.checked_in_at;
  const canReschedule =
    ["pending", "approved"].includes(booking.status) && !booking.checked_in_at;
  const canCheckOut =
    booking.status === "approved" &&
    booking.checked_in_at &&
    !booking.checked_out_at;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Booking Details</Text>
        <Text style={styles.subtitle}>#{booking.allocation_id}</Text>

        <View
          style={[
            styles.badge,
            { backgroundColor: colors.bg, alignSelf: "flex-start" },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.fg }]}>
            {booking.status}
          </Text>
        </View>

        <View style={styles.card}>
          <Detail
            label="Resource"
            value={booking.resource_name}
            icon="business-outline"
          />
          <Detail
            label="Type"
            value={booking.resource_type}
            icon="pricetag-outline"
          />
          <Detail
            label="Date"
            value={booking.allocation_date}
            icon="calendar-outline"
          />
          <Detail
            label="Time"
            value={`${booking.start_time} → ${booking.end_time}`}
            icon="time-outline"
          />
          <Detail
            label="Priority"
            value={booking.priority}
            icon="flag-outline"
          />
          <Detail
            label="Purpose"
            value={booking.purpose}
            icon="document-text-outline"
          />
          {booking.checked_in_at && (
            <Detail
              label="Checked in"
              value={booking.checked_in_at}
              icon="log-in-outline"
            />
          )}
          {booking.checked_out_at && (
            <Detail
              label="Checked out"
              value={booking.checked_out_at}
              icon="log-out-outline"
            />
          )}
          {booking.cancellation_reason && (
            <Detail
              label="Cancellation reason"
              value={booking.cancellation_reason}
              icon="close-circle-outline"
            />
          )}
        </View>

        {/* Action buttons */}

        {canReschedule && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.primaryBtn,
              busy && styles.disabled,
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/reschedule-booking",
                params: {
                  id: String(booking.allocation_id),
                  allocation_date: booking.allocation_date,
                  start_time: booking.start_time,
                  end_time: booking.end_time,
                },
              })
            }
            disabled={busy}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.surface} />
            <Text style={styles.actionText}>Reschedule</Text>
          </TouchableOpacity>
        )}

        {canCheckIn && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.primaryBtn,
              busy && styles.disabled,
            ]}
            onPress={() =>
              doAction(
                "Check In",
                () => checkInBooking(token, bookingId),
                "You have been checked in.",
              )
            }
            disabled={busy}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.surface} />
            <Text style={styles.actionText}>Check In</Text>
          </TouchableOpacity>
        )}

        {canCheckOut && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.successBtn,
              busy && styles.disabled,
            ]}
            onPress={() =>
              doAction(
                "Check Out",
                () => checkOutBooking(token, bookingId),
                "Booking completed. Thanks!",
              )
            }
            disabled={busy}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.surface} />
            <Text style={styles.actionText}>Check Out & Complete</Text>
          </TouchableOpacity>
        )}

        {canCancelPending && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.dangerBtn,
              busy && styles.disabled,
            ]}
            onPress={() =>
              doAction(
                "Cancel Booking",
                () => cancelBooking(token, bookingId, "Cancelled by user"),
                "Your booking has been cancelled.",
              )
            }
            disabled={busy}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.surface} />
            <Text style={styles.actionText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}

        {canCancelApproved && (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.dangerBtn,
              busy && styles.disabled,
            ]}
            onPress={() =>
              doAction(
                "Cancel Approved Booking",
                () =>
                  cancelApprovedBooking(token, bookingId, "Cancelled by user"),
                "Your booking has been cancelled.",
              )
            }
            disabled={busy}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.surface} />
            <Text style={styles.actionText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Detail({ label, value, icon }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon}
        size={16}
        color={COLORS.textSecondary}
        style={{ marginRight: 8, marginTop: 2 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, marginLeft: 4 },
  title: { fontSize: 26, fontWeight: "bold", color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, marginBottom: 16 },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  detailRow: { flexDirection: "row", paddingVertical: 8 },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  primaryBtn: { backgroundColor: COLORS.primary },
  successBtn: { backgroundColor: COLORS.success },
  dangerBtn: { backgroundColor: COLORS.danger },
  actionText: { color: COLORS.surface, fontSize: 15, fontWeight: "700" },
  disabled: { opacity: 0.6 },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  errorText: {
    marginTop: 12,
    color: COLORS.danger,
    fontSize: 15,
    textAlign: "center",
  },
});
