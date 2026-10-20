import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionCard from "../../../components/ui/ActionCard";
import ResourceScreenHeader from "../../../components/adminResources/ResourceScreenHeader";
import { COLORS } from "../../../constants/colors";

export default function AdminResourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ResourceScreenHeader title="Manage Resources" />
      <ScrollView contentContainerStyle={styles.content}>
        <ActionCard
          title="Manage Classrooms"
          icon="business-outline"
          onPress={() => router.push("/(tabs)/admin-resources/classrooms")}
        />
        <ActionCard
          title="Manage Equipment"
          icon="construct-outline"
          onPress={() => router.push("/(tabs)/admin-resources/equipment")}
        />
        <ActionCard
          title="Manage Departments"
          icon="library-outline"
          onPress={() => router.push("/(tabs)/admin-resources/departments")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
});
