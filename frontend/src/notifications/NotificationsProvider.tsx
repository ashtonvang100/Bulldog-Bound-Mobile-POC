import Constants, { ExecutionEnvironment } from "expo-constants";
import type * as Notifications from "expo-notifications";
import { router, useRootNavigationState } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState, Platform } from "react-native";

const supported =
  Platform.OS !== "web" &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type NotificationState = {
  supported: boolean;
  busy: boolean;
  permission: "unknown" | "granted" | "denied" | "undetermined";
  token: string | null;
  error: string | null;
  enable: () => Promise<void>;
};

const NotificationContext = createContext<NotificationState | null>(null);

// Load native APIs only in an installed app, keeping web and Expo Go usable.
let notificationModule: Promise<typeof Notifications> | undefined;
function loadNotifications() {
  notificationModule ??= import("expo-notifications").then((api) => {
    api.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return api;
  });
  return notificationModule;
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const [permission, setPermission] =
    useState<NotificationState["permission"]>("unknown");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const registering = useRef(false);
  const navigation = useRootNavigationState();

  const register = useCallback(
    async (
      requestPermission: boolean,
      devicePushToken?: Notifications.DevicePushToken,
    ) => {
      if (!supported || registering.current) return;
      registering.current = true;
      try {
        const api = await loadNotifications();
        setBusy(true);
        setError(null);
        if (Platform.OS === "android") {
          await api.setNotificationChannelAsync("default", {
            name: "Bulldog Bound updates",
            importance: api.AndroidImportance.HIGH,
            sound: "default",
          });
        }
        let permissions = await api.getPermissionsAsync();
        if (
          requestPermission &&
          !permissions.granted &&
          permissions.canAskAgain
        ) {
          permissions = await api.requestPermissionsAsync();
        }
        const granted =
          permissions.granted ||
          permissions.ios?.status === api.IosAuthorizationStatus.PROVISIONAL;
        setPermission(granted ? "granted" : permissions.status);
        if (!granted) {
          setToken(null);
          return;
        }
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId)
          throw new Error(
            "Push notifications have not been configured for this app yet.",
          );
        const result = await api.getExpoPushTokenAsync({
          projectId,
          devicePushToken,
        });
        setToken(result.data);
      } catch (cause) {
        setToken(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to register for notifications. Please try again.",
        );
      } finally {
        registering.current = false;
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!supported) return;
    let disposed = false;
    void loadNotifications()
      .then(() => {
        if (!disposed) void register(false);
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Unable to initialize notifications. Please restart the app.",
          );
      });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void register(false);
    });
    return () => {
      disposed = true;
      subscription.remove();
    };
  }, [register]);

  useEffect(() => {
    if (!supported || !navigation?.key) return;
    let disposed = false;
    const subscriptions: { remove: () => void }[] = [];
    void loadNotifications()
      .then((api) => {
        if (disposed) return;
        let lastResponse: string | undefined;
        const respond = (response: Notifications.NotificationResponse) => {
          if (response.actionIdentifier !== api.DEFAULT_ACTION_IDENTIFIER)
            return;
          const id = response.notification.request.identifier;
          if (id === lastResponse) return;
          lastResponse = id;
          const url = response.notification.request.content.data?.url;
          // Only allow known app destinations from a remote payload.
          router.push(url === "/genie" || url === "/notifications" ? url : "/");
          api.clearLastNotificationResponse();
        };
        subscriptions.push(
          api.addNotificationResponseReceivedListener(respond),
        );
        // Reuse the emitted token: requesting a native token here can re-trigger this listener.
        subscriptions.push(
          api.addPushTokenListener((deviceToken) => {
            void register(false, deviceToken);
          }),
        );
        const response = api.getLastNotificationResponse();
        if (response) respond(response);
      })
      .catch(() => {
        if (!disposed)
          setError(
            "Unable to initialize notifications. Please restart the app.",
          );
      });
    return () => {
      disposed = true;
      subscriptions.forEach((subscription) => subscription.remove());
    };
  }, [navigation?.key, register]);

  const enable = useCallback(() => register(true), [register]);
  return (
    <NotificationContext.Provider
      value={{ supported, busy, permission, token, error, enable }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value)
    throw new Error("useNotifications requires NotificationsProvider");
  return value;
}
