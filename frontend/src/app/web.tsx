import { colors } from "@/constants/colors";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

function isHttpsUrl(url: string | undefined): url is `https://${string}` {
  try {
    return (
      !!url && url.startsWith("https://") && new URL(url).protocol === "https:"
    );
  } catch {
    return false;
  }
}

export default function WebScreen() {
  const params = useLocalSearchParams<{
    url?: string | string[];
    title?: string | string[];
  }>();
  const url = Array.isArray(params.url) ? params.url[0] : params.url;
  const title =
    (Array.isArray(params.title) ? params.title[0] : params.title) || "Website";
  const webView = useRef<WebView>(null);
  const validUrl = isHttpsUrl(url);

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title,
          headerStyle: { backgroundColor: colors.red },
          headerTintColor: "#fff",
        }}
      />
      {!validUrl || !url ? (
        <View style={styles.message}>
          <Text>This page needs a valid HTTPS link.</Text>
        </View>
      ) : Platform.OS === "web" ? (
        <View style={styles.message}>
          <Text>Continue to {title}:</Text>
          <Link href={url} style={styles.link}>
            Open {title}
          </Link>
        </View>
      ) : (
        <WebView
          key={url}
          ref={webView}
          style={styles.screen}
          source={{ uri: url }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.message}>
              <ActivityIndicator size="large" color={colors.red} />
              <Text>Loading {title}…</Text>
            </View>
          )}
          renderError={() => (
            <View style={styles.message}>
              <Text>Unable to load this page. Please try again.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => webView.current?.reload()}
              >
                <Text style={styles.link}>Try Again</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  link: { color: colors.link, padding: 12, textDecorationLine: "underline" },
});
