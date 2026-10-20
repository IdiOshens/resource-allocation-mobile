import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function ProgressIndicator({ currentStep, totalSteps = 2 }) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepWrapper}>
            <View
              style={[
                styles.stepDot,
                index < currentStep && styles.stepDotCompleted,
                index === currentStep - 1 && styles.stepDotActive,
              ]}
            >
              {index < currentStep && <Text style={styles.stepCheck}>✓</Text>}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep - 1 && styles.stepLineCompleted,
                ]}
              />
            )}
          </View>
        ))}
      </View>
      <View style={styles.labelsContainer}>
        <Text style={[styles.label, currentStep === 1 && styles.labelActive]}>
          Account
        </Text>
        <Text style={[styles.label, currentStep === 2 && styles.labelActive]}>
          Profile
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepDotActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepCheck: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "bold",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.success,
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});
