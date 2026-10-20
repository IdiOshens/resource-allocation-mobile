import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS } from "../../constants/colors";

export default function TabsLayout() {
  const { role } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="classrooms"
        options={{
          title: "Rooms",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="equipment"
        options={{
          title: "Equipment",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden routes — reachable via router.push() but not shown in the tab bar */}

      <Tabs.Screen name="profile" options={{ href: null }} />

      <Tabs.Screen name="book-classroom" options={{ href: null }} />
      
      <Tabs.Screen name="book-equipment" options={{ href: null }} />

      <Tabs.Screen name="booking-detail" options={{ href: null }} />

      <Tabs.Screen name="reschedule-booking" options={{ href: null }} />

      <Tabs.Screen name="notifications" options={{ href: null }} />

      <Tabs.Screen name="admin-users" options={{ href: null }} />

      <Tabs.Screen name="admin-user-form" options={{ href: null }} />

      <Tabs.Screen name="admin-user-detail" options={{ href: null }} />

      <Tabs.Screen name="instructor-students" options={{ href: null }} />

      <Tabs.Screen name="department-analytics" options={{ href: null }} />

      <Tabs.Screen name="admin-analytics" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/index" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/classrooms" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/classroom-form" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/equipment" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/equipment-form" options={{ href: null }} />

      <Tabs.Screen name="admin-resources/departments" options={{ href: null }} />

      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          href: role === "admin" ? "/(tabs)/approvals" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="shield-checkmark-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
