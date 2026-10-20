import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SPACING } from "../../constants/colors";

export default function ResourceScreenHeader({
  title,
  actionTitle,
  onAction,
  backTo,
}) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          backTo ? router.push(backTo) : router.back()
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {actionTitle ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={20} color={COLORS.surface} />
          <Text style={styles.actionText}>{actionTitle}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push("/(tabs)/profile")}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <Ionicons
          name="person-circle-outline"
          size={27}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 36,
    height: 40,
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  actionText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  spacer: {
    width: 36,
  },
  profileButton: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.xs,
  },
});
