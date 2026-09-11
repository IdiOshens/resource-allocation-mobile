import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from '../../components/ui/CustomInput';
import PrimaryButton from '../../components/ui/PrimaryButton';
import ProgressIndicator from '../../components/ui/ProgressIndicator';

const ROLES = ["Student", "Instructor", "Staff"];
const DEPARTMENTS = [
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Studies",
  "Building and Civil Engineering",
  "Agriculture",
];

export default function Step2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState("Student");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCreateAccount = () => {
    const newErrors = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (phoneNumber.length < 10) {
      newErrors.phoneNumber = "Enter a valid phone number";
    }

    if (!selectedDepartment) {
      newErrors.department = "Please select a department";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push("/success");
      }, 1500);
    }
  };

  const renderDepartmentOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedDepartment === item && styles.dropdownItemSelected,
      ]}
      onPress={() => {
        setSelectedDepartment(item);
        setShowDepartmentDropdown(false);
        setErrors({ ...errors, department: null });
      }}
    >
      <Text
        style={[
          styles.dropdownItemText,
          selectedDepartment === item && styles.dropdownItemTextSelected,
        ]}
      >
        {item}
      </Text>
      {selectedDepartment === item && (
        <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressIndicator currentStep={2} totalSteps={2} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#4A90E2" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us a little about yourself</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              icon="call-outline"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              required
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      selectedRole === role && styles.roleOptionSelected,
                    ]}
                    onPress={() => setSelectedRole(role)}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        selectedRole === role && styles.roleTextSelected,
                      ]}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Department
                <Text style={styles.required}> *</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdownTrigger,
                  errors.department && styles.inputError,
                ]}
                onPress={() => setShowDepartmentDropdown(true)}
              >
                <Text
                  style={[
                    styles.dropdownTriggerText,
                    !selectedDepartment && styles.dropdownPlaceholder,
                  ]}
                >
                  {selectedDepartment || "Select department"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#888" />
              </TouchableOpacity>
              {errors.department && (
                <Text style={styles.errorText}>{errors.department}</Text>
              )}
            </View>

            <PrimaryButton
              title="Create Account"
              onPress={handleCreateAccount}
              loading={isLoading}
              type="secondary"
              style={styles.createButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showDepartmentDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepartmentDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDepartmentDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Department</Text>
              <TouchableOpacity
                onPress={() => setShowDepartmentDropdown(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DEPARTMENTS}
              renderItem={renderDepartmentOption}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#4A90E2",
    marginLeft: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
  },
  required: {
    color: "#E74C3C",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  roleOptionSelected: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  roleText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  roleTextSelected: {
    color: "#FFFFFF",
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#FAFAFA",
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  dropdownPlaceholder: {
    color: "#999999",
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginTop: 4,
  },
  createButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dropdownItemSelected: {
    backgroundColor: "#F0F7FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333333",
  },
  dropdownItemTextSelected: {
    color: "#4A90E2",
    fontWeight: "600",
  },
});
