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
const localTestSupported = __DEV__ && Platform.OS !== "web";
const notificationsSupported = supported || localTestSupported;

type NotificationState = {
  supported: boolean;
  busy: boolean;
  permission: "unknown" | "granted" | "denied" | "undetermined";
  token: string | null;
  error: string | null;
  enable: () => Promise<void>;
  localTestSupported: boolean;
  localTestBusy: boolean;
  localTestError: string | null;
  localTestScheduled: boolean;
  sendLocalTest: () => Promise<void>;
};

const NotificationContext = createContext<NotificationState | null>(null);

// Web skips native APIs; Expo Go uses them only for development local tests.
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
  const [localTestBusy, setLocalTestBusy] = useState(false);
  const [localTestError, setLocalTestError] = useState<string | null>(null);
  const [localTestScheduled, setLocalTestScheduled] = useState(false);
  const registering = useRef(false);
  const scheduling = useRef(false);
  const navigation = useRootNavigationState();

  // Permission/channel setup is shared; it never requests a push token.
  const preparePermissions = useCallback(async (requestPermission: boolean) => {
    const api = await loadNotifications();
    if (Platform.OS === "android") {
      await api.setNotificationChannelAsync("default", {
        name: "Bulldog Bound updates",
        importance: api.AndroidImportance.HIGH,
        sound: "default",
      });
    }
    let permissions = await api.getPermissionsAsync();
    if (requestPermission && !permissions.granted && permissions.canAskAgain) {
      permissions = await api.requestPermissionsAsync();
    }
    const granted =
      permissions.granted ||
      permissions.ios?.status === api.IosAuthorizationStatus.PROVISIONAL;
    setPermission(granted ? "granted" : permissions.status);
    if (!granted) setToken(null);
    return { api, granted };
  }, []);

  const register = useCallback(
    async (
      requestPermission: boolean,
      devicePushToken?: Notifications.DevicePushToken,
    ) => {
      if (!supported || registering.current) return;
      registering.current = true;
      try {
        setBusy(true);
        setError(null);
        const { api, granted } = await preparePermissions(requestPermission);
        if (!granted) return;
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
    [preparePermissions],
  );

  const sendLocalTest = useCallback(async () => {
    if (!localTestSupported || scheduling.current) return;
    scheduling.current = true;
    setLocalTestBusy(true);
    setLocalTestError(null);
    setLocalTestScheduled(false);
    try {
      const { api, granted } = await preparePermissions(true);
      if (!granted) {
        setLocalTestError(
          "Notifications are blocked. Allow them in device settings, then try again.",
        );
        return;
      }
      await api.scheduleNotificationAsync({
        content: {
          title: "Bulldog Bound local test",
          body: "Tap to open Notifications. This alert was scheduled on your device.",
          sound: "default",
          data: { url: "/notifications" },
        },
        trigger: {
          type: api.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
          channelId: "default",
        },
      });
      setLocalTestScheduled(true);
    } catch (cause) {
      setLocalTestError(
        cause instanceof Error
          ? `Unable to schedule local notification: ${cause.message}`
          : "Unable to schedule local notification. Please try again.",
      );
    } finally {
      scheduling.current = false;
      setLocalTestBusy(false);
    }
  }, [preparePermissions]);

  useEffect(() => {
    if (!notificationsSupported) return;
    let disposed = false;
    const refresh = async () => {
      try {
        await loadNotifications();
        if (disposed) return;
        if (supported) await register(false);
        else await preparePermissions(false);
      } catch {
        if (!disposed) {
          setError(
            "Unable to initialize notifications. Please restart the app.",
          );
        }
      }
    };
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => {
      disposed = true;
      subscription.remove();
    };
  }, [preparePermissions, register]);

  useEffect(() => {
    if (!notificationsSupported || !navigation?.key) return;
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
          // Local and remote notifications share the same allowed destinations.
          router.push(url === "/genie" || url === "/notifications" ? url : "/");
          api.clearLastNotificationResponse();
        };
        subscriptions.push(
          api.addNotificationResponseReceivedListener(respond),
        );
        // Reuse the emitted token: requesting a native token here can re-trigger this listener.
        if (supported) {
          subscriptions.push(
            api.addPushTokenListener((deviceToken) => {
              void register(false, deviceToken);
            }),
          );
        }
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
      value={{
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
      }}
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
