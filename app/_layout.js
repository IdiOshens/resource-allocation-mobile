import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="(auth)/step1" />
        <Stack.Screen name="(auth)/step2" />
        <Stack.Screen name="(auth)/success" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
