import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationsProvider } from "@/notifications/NotificationsProvider";
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <NotificationsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="web" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications"
            options={{ title: "Notifications" }}
          />
        </Stack>
        <StatusBar style="light" />
      </NotificationsProvider>
    </SafeAreaProvider>
  );
}
