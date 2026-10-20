import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, RADIUS, SPACING } from "../../constants/colors";
import NotificationBell from "./NotificationBell";

export default function DashboardHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch {
            Alert.alert("Log Out Failed", "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(50, insets.top + 12) }]}>
      <View style={styles.content}>
        <View style={styles.greeting}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.name} numberOfLines={1}>
            {user?.full_name || "User"}
          </Text>
        </View>
        <View style={styles.controls}>
          <NotificationBell color={COLORS.surface} />
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Ionicons
              name="person-circle-outline"
              size={29}
              color={COLORS.surface}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={confirmLogout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: SPACING.md,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.lightBlue,
  },
  name: {
    marginTop: SPACING.xs,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.surface,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  logoutButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  profileButton: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
