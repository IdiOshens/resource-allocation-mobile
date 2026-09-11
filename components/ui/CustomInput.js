import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
  required = false,
  secureTextEntry = false,
  editable = true,
}) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && (
          <Ionicons name={icon} size={20} color="#888" style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, !icon && styles.inputWithoutIcon]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    color: "#333333",
    marginBottom: 6,
  },
  required: {
    color: "#E74C3C",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1A1A1A",
  },
  inputWithoutIcon: {
    paddingLeft: 0,
  },
  inputError: {
    borderColor: "#E74C3C",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    marginTop: 4,
  },
});
