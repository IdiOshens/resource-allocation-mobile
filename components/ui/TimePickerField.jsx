import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

/**
 * Formats Date to 24-hour HH:MM
 */
function formatTimeToHHMM(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function parseInitialTime(timeString) {
  const d = new Date();
  if (timeString && /^\d{1,2}:\d{2}$/.test(timeString)) {
    const [h, m] = timeString.split(":");
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  }
  return d;
}

export default function TimePickerField({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = "Select time",
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(parseInitialTime(value));

  const handleOpen = () => {
    setTempDate(parseInitialTime(value));
    setShowPicker(true);
  };

  const handleAndroidChange = (event, selectedDate) => {
    setShowPicker(false);
    if (event.type === "set" && selectedDate) {
      onChange(formatTimeToHHMM(selectedDate));
    }
  };

  const handleIosConfirm = () => {
    onChange(formatTimeToHHMM(tempDate));
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.inputWrapper, error && styles.inputError]}
        onPress={handleOpen}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={COLORS.textMuted}
          style={styles.icon}
        />
        <Text style={[styles.text, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android: Native dialog */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={parseInitialTime(value)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS: Modal bottom-sheet picker */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={styles.headerButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label || "Select Time"}</Text>
                <TouchableOpacity
                  onPress={handleIosConfirm}
                  style={styles.headerButton}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
                style={styles.iosPicker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceAlt,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textMuted,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  iosPicker: {
    height: 200,
  },
});
