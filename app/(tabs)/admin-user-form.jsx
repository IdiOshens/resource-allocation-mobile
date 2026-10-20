import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectField from "../../components/adminResources/SelectField";
import CustomInput from "../../components/ui/CustomInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { COLORS, SPACING } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { createAdminUser, updateAdminUser } from "../../services/api/adminUsers";

const ROLES = [
  { label: "Student", value: "student" },
  { label: "Instructor", value: "instructor" },
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
  { label: "Dept Head", value: "department_head" },
];

function paramValue(value, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

export default function AdminUserFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const id = paramValue(params.id);
  const editing = Boolean(id);
  const [fullName, setFullName] = useState(paramValue(params.full_name));
  const [email, setEmail] = useState(paramValue(params.email));
  const [username, setUsername] = useState(paramValue(params.username));
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(paramValue(params.role, "student"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFullName(paramValue(params.full_name));
    setEmail(paramValue(params.email));
    setUsername(paramValue(params.username));
    setRole(paramValue(params.role, "student"));
  }, [params.email, params.full_name, params.role, params.username]);

  const save = async () => {
    if (!fullName.trim() || !email.trim() || !username.trim() || (!editing && !password)) {
      setError(editing
        ? "Full Name, Email, and Username are required."
        : "Complete all required fields, including Password.");
      return;
    }
    if (!editing && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!token) {
      setError("Your session is unavailable. Please sign in again.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const data = {
        full_name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        role,
        ...(password ? { password } : {}),
      };
      const result = editing
        ? await updateAdminUser(token, id, data)
        : await createAdminUser(token, data);
      if (!result.success) {
        throw new Error(result.message || "Could not save user.");
      }

      Alert.alert("Saved", editing ? "User details updated." : "User created.", [
        {
          text: "OK",
          onPress: () =>
            router.replace(
              editing
                ? { pathname: "/(tabs)/admin-user-detail", params: { id } }
                : "/(tabs)/admin-users",
            ),
        },
      ]);
    } catch (saveError) {
      setError(saveError.message || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? "Edit User" : "Create User"}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          {editing ? "Update the account details below." : "Add a new account to the system."}
        </Text>
        <CustomInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          icon="person-outline"
          required
        />
        <CustomInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
        <CustomInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          icon="at-outline"
          autoCapitalize="none"
          required
        />
        <CustomInput
          label={editing ? "New Password (optional)" : "Password"}
          value={password}
          onChangeText={setPassword}
          placeholder={editing ? "Leave blank to keep current password" : "At least 6 characters"}
          icon="lock-closed-outline"
          secureTextEntry
          required={!editing}
        />
        <SelectField label="Role" value={role} options={ROLES} onChange={setRole} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title={editing ? "Save Changes" : "Create User"}
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
  content: { padding: 20, paddingBottom: SPACING.xl },
  subtitle: { marginTop: 6, marginBottom: SPACING.lg, color: COLORS.textMuted },
  error: { marginBottom: SPACING.sm, color: COLORS.danger, fontSize: 13 },
  saveButton: { marginTop: SPACING.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: SPACING.sm,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: { width: 40 },
});
