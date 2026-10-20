import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";

export default function SelectField({ label, value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label || `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.options}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {option.value === value ? (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  field: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceAlt,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.lg,
    backgroundColor: "rgba(12, 31, 63, 0.45)",
  },
  options: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceAlt,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
});
