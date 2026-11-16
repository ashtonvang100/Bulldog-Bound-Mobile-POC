import { colors } from "@/constants/colors";
import { useNotifications } from "@/notifications/NotificationsProvider";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const {
    supported,
    busy,
    permission,
    token,
    error,
    enable,
    localTestSupported,
    localTestBusy,
    localTestError,
    localTestScheduled,
    sendLocalTest,
  } = useNotifications();
  const [settingsError, setSettingsError] = useState<string | null>(null);
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Stay connected
        </Text>
        <Text style={styles.body}>
          Allow notifications to receive Bulldog Bound updates on this device.
        </Text>
        {!supported ? (
          <Text style={styles.body}>
            Push notifications are available in the installed iOS and Android
            app.
          </Text>
        ) : (
          <>
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {token
                ? "This device is ready to receive push notifications."
                : permission === "granted"
                  ? "Notifications are allowed. Finish connecting this device to receive updates."
                  : permission === "denied"
                    ? "Notifications are blocked. Allow them in your device settings, then return here."
                    : "You can choose whether to allow notifications. You can change this in device settings anytime."}
            </Text>
            {!token && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy || localTestBusy }}
                disabled={busy || localTestBusy}
                onPress={() => {
                  void enable();
                }}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || busy || localTestBusy) && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {busy
                    ? "Connecting…"
                    : permission === "granted"
                      ? "Retry connection"
                      : "Enable notifications"}
                </Text>
              </Pressable>
            )}
            {busy && (
              <ActivityIndicator
                color={colors.red}
                accessibilityLabel="Connecting notifications"
              />
            )}
            {__DEV__ && token && (
              <>
                <Text style={styles.body}>Development push token</Text>
                <Text selectable style={styles.token}>
                  {token}
                </Text>
              </>
            )}
          </>
        )}
        {__DEV__ && localTestSupported && (
          <>
            <Text style={styles.body}>
              Development local test: schedules an alert in about five seconds.
              No push token or server is needed.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: localTestBusy }}
              disabled={localTestBusy}
              onPress={() => {
                void sendLocalTest();
              }}
              style={({ pressed }) => [
                styles.button,
                (pressed || localTestBusy) && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>
                {localTestBusy ? "Scheduling…" : "Send local test notification"}
              </Text>
            </Pressable>
            {localTestScheduled && (
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                Local test scheduled. Expect an alert in about five seconds;
                tap it to open Notifications.
              </Text>
            )}
            {localTestError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {localTestError}
              </Text>
            )}
          </>
        )}
        {(supported || localTestSupported) && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSettingsError(null);
              void Linking.openSettings().catch(() =>
                setSettingsError(
                  "Unable to open settings. Open your device settings to manage notifications.",
                ),
              );
            }}
            style={styles.settings}
          >
            <Text style={styles.settingsText}>Open device settings</Text>
          </Pressable>
        )}
        {(error || settingsError) && (
          <Text accessibilityRole="alert" style={styles.error}>
            {settingsError ?? error}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 24,
    gap: 20,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  title: { color: colors.navy, fontSize: 28, fontWeight: "700" },
  body: { color: colors.navy, fontSize: 16, lineHeight: 24 },
  button: {
    backgroundColor: colors.red,
    borderRadius: 8,
    padding: 16,
    minHeight: 48,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  pressed: { opacity: 0.65 },
  settings: { minHeight: 48, justifyContent: "center", alignItems: "center" },
  settingsText: {
    color: colors.red,
    fontSize: 16,
    textDecorationLine: "underline",
  },
  error: { color: colors.red, fontSize: 16, lineHeight: 24 },
  token: { color: colors.navy, fontSize: 13, lineHeight: 20 },
});
