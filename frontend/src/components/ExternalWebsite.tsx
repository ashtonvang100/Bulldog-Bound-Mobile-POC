import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewProps } from "react-native-webview";

function isHttpsUrl(url: string | undefined): url is `https://${string}` {
  try {
    return (
      !!url && url.startsWith("https://") && new URL(url).protocol === "https:"
    );
  } catch {
    return false;
  }
}

export function ExternalWebsite({
  url,
  title,
  embedded = false,
}: {
  url?: string;
  title: string;
  embedded?: boolean;
}) {
  // WebView 14's default generic is undefined, which narrows its props to never.
  const webView = useRef<WebView<WebViewProps>>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const returnToMoc = useCallback(() => {
    if (embedded) {
      router.navigate("/");
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      // A deep link may open this screen without an app navigation history.
      router.replace("/");
    }
  }, [embedded]);

  const goBack = useCallback(() => {
    if (canGoBack && webView.current) {
      webView.current.goBack();
    } else {
      returnToMoc();
    }
  }, [canGoBack, returnToMoc]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          goBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [goBack]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {!embedded && (
        <Stack.Screen
          options={{
            headerShown: false,
            // Let WebView swipes handle website history before app swipe-to-pop.
            gestureEnabled: !canGoBack,
          }}
        />
      )}
      <View style={styles.header}>
        {embedded && !canGoBack ? (
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              canGoBack ? "Go back in website" : "Back to MOC"
            }
            accessibilityHint={
              canGoBack
                ? "Opens the previous page in this website"
                : "Returns to the previous MOC screen or home"
            }
            onPress={goBack}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.buttonText}>
              {canGoBack ? "Back" : "Back to MOC"}
            </Text>
          </Pressable>
        )}
        {canGoBack && !embedded && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to MOC"
            accessibilityHint="Leaves the website and returns to MOC"
            onPress={returnToMoc}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Back to MOC</Text>
          </Pressable>
        )}
      </View>
      <SafeAreaView style={styles.content} edges={embedded ? [] : ["bottom"]}>
        {!isHttpsUrl(url) ? (
          <View style={styles.message}>
            <Text>This page needs a valid HTTPS link.</Text>
          </View>
        ) : Platform.OS === "web" ? (
          embedded ? (
            <View style={styles.content}>
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Open {title} in a new tab
              </Link>
              <iframe
                title={title}
                src={url}
                style={{ flex: 1, width: "100%", border: 0, minHeight: 0 }}
              />
            </View>
          ) : (
            <View style={styles.message}>
              <Text>Continue to {title}:</Text>
              <Link href={url} style={styles.link}>
                Open {title}
              </Link>
            </View>
          )
        ) : (
          <WebView<WebViewProps>
            ref={webView}
            style={styles.content}
            source={{ uri: url }}
            onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
            allowsBackForwardNavigationGestures
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.red },
  content: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 48,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    minHeight: 48,
    minWidth: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  title: { color: "white", fontSize: 18, fontWeight: "600", padding: 12 },
  pressed: { backgroundColor: "#940e24" },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  link: { color: colors.link, padding: 12, textDecorationLine: "underline" },
});
