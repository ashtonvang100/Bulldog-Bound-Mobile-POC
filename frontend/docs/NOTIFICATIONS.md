# Notifications

Audit date: November 16, 2026. This audit inspected the current source and configuration for Expo SDK **58** (`expo ~58.0.25`, `expo-notifications ~58.1.9`). It did not build/install the app, inspect hosted credentials, or send a notification. Device behavior described below is expected from the code, not confirmed delivery. Lint and TypeScript checks passed.

## 1. Overview – How our notification system works

The app has a **remote push notification client**. It can ask permission, register a device with Expo, and handle a notification tap in an installed native app. There is no backend sender in this repository and no built-in local test notification.

- **Local notification:** the app asks the phone to display an alert now or later. Delivery does not use a server, Expo Push Service, Apple APNs, or Android FCM. This app does not currently create or schedule these alerts.
- **Remote push notification:** a server sends an alert over the internet. The current client is written for Expo Push Service, which passes messages to Apple's **APNs** (Apple Push Notification service) or Google's **FCM** (Firebase Cloud Messaging). See [Expo's notification types guide](https://docs.expo.dev/push-notifications/what-you-need-to-know/).
- **Expo Push Token:** an address identifying an app installation for Expo's delivery service. Permission alone is not a token, and a token alone does not prove delivery.

```text
Registration:
App -- asks OS permission; requests token --> Expo Push Service
App -- token + user/device identity --> Backend --> Token database
                                       ^             ^
                                       +-- missing --+

Remote delivery (requires credentials and a sender):
Backend --> Expo Push Service --> Apple APNs  --> iOS app/device
                             \-> Android FCM --> Android app/device
Backend <-- push tickets and receipts -- Expo Push Service

Local delivery (NOT implemented):
App --> phone's notification scheduler --> alert on the same device
```

The backend/database arrows show future work. Today the registration flow ends at a token held in app memory. A manual test sender can replace the backend for a remote test after credentials are ready.

## 2. Current Implementation – What has already been built

### Files inspected

| File | What it does |
| --- | --- |
| [package.json](../package.json), `package-lock.json` | Declare/install the SDK 58 notification dependencies, including `expo-dev-client`. This is an npm project; no `bun.lock` was found. |
| [app.json](../app.json) | Configures the notification plugin, app identifiers, scheme, owner, and EAS project ID. No separate `app.config.ts`/`.js` was found. |
| [eas.json](../eas.json) | Defines `development` (`developmentClient: true`, `distribution: internal`) and `production` (`{}`) build profiles. No iOS simulator profile is configured. |
| [NotificationsProvider.tsx](../src/notifications/NotificationsProvider.tsx) | Implements context, permissions, token registration, presentation policy, listeners, and navigation. |
| [notifications.tsx](../src/app/notifications.tsx) | Notification opt-in/status/settings screen; displays the token only when `__DEV__` is true. |
| [_layout.tsx](../src/app/_layout.tsx) | Wraps the router in the provider and declares the Notifications screen. |
| [Home](../src/app/(tabs)/index.tsx), [tab layout](../src/app/(tabs)/_layout.tsx), [Genie](../src/app/(tabs)/genie.tsx) | Home links to Notifications. Home and Genie are valid tap destinations; Genie embeds an external website. |
| [README.md](../README.md), [push-notifications.md](push-notifications.md) | Existing run instructions, manual remote test, and backend integration notes. |

The repository file inventory and source searches found no notification API endpoint, backend service, database, authenticated user session, or token upload call. External campus/login website links are not a notification backend integration.

### Configuration already present

- iOS bundle identifier: `edu.fresnostate.bulldogboundpoc`.
- Android package: `edu.fresnostate.bulldogboundpoc`.
- App URL scheme: `frontend`.
- Expo owner: `ashtonvang001`.
- EAS project ID: `38245c50-c8df-490c-b173-8e03ab5a9668`.
- `expo-notifications` plugin: default channel `default`, Android notification color `#c41230`.
- No custom notification sound or notification-specific icon is configured.
- No `android.googleServicesFile` or `google-services.json` was found. The checked configuration is incomplete for Android FCM registration.
- There are no `ios/` or `android/` source directories. Native configuration is generated at build time; no built binary or generated APNs entitlement was verified.

**Existing documentation discrepancy:** `push-notifications.md` says no project ID is committed and the project is not linked. That statement is outdated relative to `app.json`. An ID and owner are now configured, but account access, the hosted project's validity, successful builds, and uploaded APNs/FCM credentials remain unverified. This audit leaves the older file unchanged.

### Permission and registration flow

1. The provider marks **web and Expo Go unsupported** and skips loading native notification APIs there. This restriction applies on both iOS and Android.
2. In an installed native app, startup and returning to the foreground check permission without prompting. Android first creates the `default` channel, named **Bulldog Bound updates**, with HIGH importance and default sound.
3. Home → Notifications → **Enable notifications** requests permission only if permission is not granted and the OS allows asking again. iOS provisional authorization (limited permission) is treated as granted.
4. If permission is denied, the token is cleared from memory. The screen explains the denial and provides **Open device settings**. On return, the provider checks again.
5. If allowed, `getExpoPushTokenAsync` uses the configured EAS project ID, with `Constants.easConfig.projectId` as a fallback. The returned `result.data` is kept in React state. It is not saved to local storage or sent to a backend.
6. Registration errors appear on the screen. With permission granted but no token, **Retry connection** is offered. Startup/foreground checks and native push token changes also attempt registration. There is an overlapping-registration guard, but no scheduled network retry/backoff or explicit request timeout in the app.

The screen's “ready to receive push notifications” text means a token was obtained. It does not confirm credentials, a sender, or delivery to the phone. OS permission and registration can have different outcomes: permission can succeed while token registration fails.

### Display, listeners, and tap navigation

- The foreground handler requests a banner, notification-list entry, and sound, with no badge update. Android's channel uses the default sound. Actual presentation/sound still depends on the incoming message and device settings.
- After the root navigator is ready, `addNotificationResponseReceivedListener` handles the normal notification tap. `getLastNotificationResponse()` also checks for a tap that launched the app.
- `data.url === "/genie"` opens Bulldog Genie; `"/notifications"` opens Notifications. Everything else, including missing/unknown URLs, opens Home (`/`). Arbitrary external URLs are not opened by this handler.
- The handler ignores custom action identifiers, deduplicates the last handled notification ID within the listener's lifetime, and clears the saved response after handling. Subscriptions are removed on cleanup.
- `addPushTokenListener` re-registers using the changed native token. This currently updates memory only.
- There is no `addNotificationReceivedListener` for app-specific receipt processing, notification inbox/history, custom action buttons, background task, or badge-count management. Foreground display uses `setNotificationHandler`; it does not require an inbox listener.
- There is no local scheduling call (`scheduleNotificationAsync`), repeat schedule, cancel control, or **Send test notification** button.
- Preferences currently mean OS permission/settings only. No topic switches, backend subscription preference, or notification sign-out cleanup exists.

## 3. What I Can Test Right Now – Features that don't require external credentials

| Feature | Current credential-free testing |
| --- | --- |
| Home → Notifications navigation and screen layout | Preview in SDK 58-compatible Expo Go or on web. Expect the installed-app availability message. |
| Permission request/status and opening device settings | Code exists, but only runs in an installed custom native build. No push delivery credentials are needed for the permission operation itself. Creating/installing the build has separate requirements. |
| Denial and return-from-settings refresh | Can be exercised in that custom build. A later registration error does not mean permission failed. |
| Local notifications and scheduling | **Not implemented.** Installing `expo-notifications` does not create a test alert. |
| Notification banner, sound, and tap routing | Handler code exists, but there is no built-in credential-free alert trigger to exercise it end to end. |
| Remote push | Requires additional setup. The checked-in project ID is insufficient. |

**Personal iPhone without your own Apple Developer account:** you can preview the screen using compatible Expo Go today. You cannot test this implementation's actual notifications through Expo Go, because the provider disables those APIs there. The project's EAS physical-iPhone build path requires Apple signing setup; iOS remote push requires paid Apple Developer/APNs credentials. If a team already supplies a signed build installable on your registered phone, you can use that build without owning a separate developer membership. No such build was verified. See [Expo's push setup requirements](https://docs.expo.dev/push-notifications/push-notifications-setup/).

### Smallest proposed development-only addition — not implemented

Add a development-only **Schedule local test** control for an installed native build. It should ask permission/create the Android channel, then schedule one alert a few seconds later with a title, body, default sound, and `data: { "url": "/notifications" }`. Keep that path independent of Expo token registration so failed remote registration does not block a local test.

That would exercise presentation and the existing tap handler without APNs, Firebase, an Expo Push Token, or a backend. An Android development build or iOS simulator build avoids paid Apple device-signing requirements. Local support in Expo Go would additionally require changing the provider's current Expo Go guard and listener initialization; adding a button alone would not test this app's tap handler there. None of these changes were made. The [SDK 58 API reference](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) documents local scheduling and Expo Go's library-level local support.

## 4. How to Test – Exact commands and steps

Run commands from `frontend/`. These are instructions for the developer; the audit did not run builds or configure accounts.

### A. Preview today with no credentials

1. Install dependencies if needed, then explicitly select Expo Go (the project also includes `expo-dev-client`):

   ```bash
   npm ci
   npx expo start --go
   ```

2. Install/open Expo Go compatible with SDK 58 on the phone. Keep phone and computer on the same Wi-Fi. On iPhone, scan the terminal QR code with Camera; on Android, scan from Expo Go.
3. Open Home → **Notifications**. Expect **Stay connected** and “Push notifications are available in the installed iOS and Android app.” The permission, retry, settings, and token controls are hidden in this mode. No permission prompt or test notification should appear.
4. For a browser preview instead, run:

   ```bash
   npx expo start --web
   ```

   Expect the same notification availability message. This is UI testing, not local or remote notification delivery.

### B. Test permission in an existing custom development build

1. If you already have this project's compatible development build installed, run:

   ```bash
   npx expo start --dev-client
   ```

2. Open the installed Bulldog Bound app and connect to Metro (the development server). Open Home → Notifications → **Enable notifications**.
3. Accept or deny the OS prompt. A prompt may not appear if permission was previously decided or the OS cannot ask again. Use **Open device settings**, adjust notification permission, and return to the app to check the status refresh.
4. If registration fails after permission succeeds, expect the “Notifications are allowed” status, an error, and **Retry connection**. A token should appear under **Development push token** only if registration succeeds in development mode. Do not expect an alert from pressing Enable: it registers; it does not send.

If no build exists, local build commands are `npx expo run:android` (Android SDK/emulator or device required) and `npx expo run:ios` (macOS/Xcode; select an iOS simulator for a credential-free simulator build). These generate native directories and compile/install the app; they are not just Metro start commands. They were not run during this audit. Build/toolchain issues remain unverified. See [development build setup](https://docs.expo.dev/develop/development-builds/introduction/).

### C. Trigger a real remote test — only after push setup

There is **no in-app test trigger today**. Without delivery credentials, this is not a ready-to-run notification test. Once the relevant platform is configured and its development build installed:

1. Start Metro with `npx expo start --dev-client`, open the app, enable notifications, and copy the displayed development Expo Push Token.
2. Use the [Expo push notification tool](https://expo.dev/notifications) with that token, a title/body, default sound, and data `{"url":"/notifications"}`. Alternatively, send from a trusted terminal:

   ```bash
   curl https://exp.host/--/api/v2/push/send \
     -H 'Content-Type: application/json' \
     -d '{"to":"ExponentPushToken[REPLACE_WITH_DEVICE_TOKEN]","title":"Bulldog Bound test","body":"Tap to open Notifications.","sound":"default","channelId":"default","data":{"url":"/notifications"}}'
   ```

   Replace the entire example token with the exact copied token. If Expo push access-token security has been enabled for the project, the trusted sender also needs its authorization header; never embed that secret in the app. See [sending through Expo](https://docs.expo.dev/push-notifications/sending-notifications/).

3. With the app open, expect a banner/list entry and sound if OS settings permit. Put the app in the background, send another message, then tap it: expect the Notifications screen.
4. Repeat with `{"url":"/genie"}`: expect the Bulldog Genie tab (its website needs internet). Repeat with an unknown URL or no URL: expect Home. Manually opening a tab does not verify notification tap handling.
5. Close the app normally, send another notification, and tap it to check launch navigation. Reopen normally afterward and check that the old tap does not redirect again. Repeat on both platforms. Android force-stop from device settings is a separate case: reopen the app before testing delivery, as explained in [Expo's app-state guide](https://docs.expo.dev/push-notifications/what-you-need-to-know/).
6. Inspect the send result. A push **ticket** acknowledges Expo accepted/rejected the request; a later **receipt** reports its handoff to APNs/FCM. Neither proves the phone displayed it. Use the ticket ID to request a receipt:

   ```bash
   curl https://exp.host/--/api/v2/push/getReceipts \
     -H 'Content-Type: application/json' \
     -d '{"ids":["REPLACE_WITH_TICKET_ID"]}'
   ```

   Receipts can take time. Investigate errors rather than assuming a successful HTTP response proves delivery. See [Expo tickets and receipts](https://docs.expo.dev/push-notifications/sending-notifications/).

## 5. Platform Compatibility – iOS, Android, simulators, Expo Go, and web

This table separates library capability from what this app exposes. No runtime delivery was verified during the audit.

| Environment | Local notification testing | Real remote push with this client |
| --- | --- | --- |
| Physical iPhone, custom build | Native permission/presentation code is present; local scheduling/trigger is missing. Installing a signed build is a separate requirement. | Requires correct signed build, APNs credentials, EAS project/token, and a sender. |
| Physical Android, custom build | Permission/channel code is present; local trigger is missing. Local alerts do not need Firebase. | FCM client configuration is missing from checked config; FCM V1 sender credentials/project/token also required. |
| iOS simulator, custom build | Suitable for future local tests without a paid Apple account; trigger is missing. Existing EAS profile is not a simulator profile. | Current Expo docs support push on suitable simulators (Xcode 14+, macOS 13+, iOS 16+); still requires push configuration. Not verified here. |
| Android emulator, custom build | Suitable for future local tests; trigger is missing. | Supported by Expo on emulators with Google Play services, with FCM/project credentials configured. Not verified here. |
| Expo Go, either platform | The library supports local notifications, but **this app skips all notification APIs**, and has no local trigger. UI preview only. | Use an installed development or production build. This app disables remote registration/listeners in Expo Go. |
| Custom development build | Enables this app's existing native permission/listener paths. Does not add a local trigger or credentials automatically. | Intended development environment once credentials are configured. Token is visible while running development JS. |
| Installed production build | Same native notification paths; no local trigger. | Requires production signing/configuration and a sender; token display is hidden. Not verified by the empty production profile. |
| Web | Availability message only; no browser permission request or local notification implementation. | No web push/service worker implementation. |

Platform capability references: [SDK 58 Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [push device prerequisites](https://docs.expo.dev/push-notifications/push-notifications-setup/), and [iOS simulator builds](https://docs.expo.dev/build-reference/simulators/). Device/OS requirements for SDK 58 itself also apply; the push prerequisites are not a guarantee that this app runs on every older simulator OS.

## 6. Production Requirements – What accounts, credentials, and services will eventually be needed

### Expo project and builds

**Present:** project ID/owner, app identifiers, notification plugin, `expo-dev-client`, and development/production profiles.

**Still to verify:** authorized access to that exact Expo/EAS project and ownership of the POC identifiers. Do not create a replacement project just because the old guide says no ID exists. A developer with access can check:

```bash
npx eas-cli@latest login
npx eas-cli@latest project:info
```

Use `npx eas-cli@latest init` only if linking needs to be established/corrected after confirming the intended project. Confirm final iOS bundle identifier/Android package before registering credentials. The token request already supplies the project ID, but that value must resolve to the intended project. See [Expo project ID setup](https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid).

After platform setup, the existing cloud development profiles can be used:

```bash
npx eas-cli@latest build --profile development --platform ios
npx eas-cli@latest build --profile development --platform android
npx expo start --dev-client
```

Install the resulting build before connecting to Metro. For release validation, build with `--profile production` for each platform and test the actual release through the appropriate distribution path. Plugin/native configuration changes need a new binary, not only a JavaScript reload. A development success does not establish production signing or delivery. See [development builds](https://docs.expo.dev/develop/development-builds/introduction/).

### Apple / iOS

**Unverified:** paid Apple Developer team access, an App ID matching the bundle identifier, signing/provisioning with Push Notifications capability, and a valid APNs push key available to Expo's sender. The plugin declaration alone is not evidence that a signed binary has the correct entitlement. Register test devices for the current internal-distribution build path. Inspect/configure through:

```bash
npx eas-cli@latest credentials --platform ios
```

APNs is Apple's transport for remote delivery, including when the backend sends through Expo. Local alerts do not use APNs. Follow [Expo's iOS credential setup](https://docs.expo.dev/push-notifications/push-notifications-setup/#get-credentials-for-development-builds).

### Firebase / Android

**Missing from app config:** register the Android package in the intended Firebase project, obtain the matching `google-services.json`, and set `expo.android.googleServicesFile`. Rebuild afterward. This client config enables the app to register with FCM.

**Unverified hosted setup:** upload/configure a private FCM V1 service account key for Expo to send Android pushes:

```bash
npx eas-cli@latest credentials --platform android
```

The private service account key is a server credential: never ship it in the app or commit it. It differs from the client `google-services.json`, which contains project identifiers. Follow [Expo's FCM V1 credential guide](https://docs.expo.dev/push-notifications/fcm-credentials/). Firebase authentication or a Firebase database is not required just to use FCM transport.

### Backend, database, and account lifecycle

**Present:** token acquisition and refresh in `NotificationsProvider.tsx`.

**Missing:** an authenticated token registration/removal API and persistent token database. Integrate after `getExpoPushTokenAsync` returns `result.data`, including later registration/rotation. Associate tokens with a user/device, platform, project/app environment, preferences, and last update; support multiple devices per user. Choose an explicit installation-based model if guest notifications are desired. The current UI needs no signed-in user because no such integration exists yet.

Build a trusted backend sender for real events. It should select eligible recipients, send through Expo Push Service, record tickets, fetch receipts, retry temporary failures with backoff, and stop using invalid tokens such as `DeviceNotRegistered`. Report credential failures for investigation. Keep delivery credentials/access tokens on the server. See [Expo's server delivery guide](https://docs.expo.dev/push-notifications/sending-notifications/).

Add user preferences and enforce them before sending. OS permission alone does not represent topic choices or account consent. On sign-out/account switch, remove the previous user's association with the installation; clearing app state or hiding a token does not unsubscribe a server. Handle permission revocation and stale installations on the backend too. None of this lifecycle behavior exists in the current implementation. An authenticated user/database is a requirement for this proposed account-based delivery, not for local alerts or a manual one-device remote test.

## 7. Remaining Work – A checklist of incomplete tasks

- [ ] Verify access to the configured Expo project/owner and confirm final app identifiers.
- [ ] Verify Apple signing, APNs credentials, capabilities, and registered test devices.
- [ ] Add matching Android FCM client configuration and verify hosted FCM V1 credentials.
- [ ] Build/install custom clients and test permission grant, denial, settings return, and registration failures.
- [ ] If credential-free alert testing is wanted, add the development-only local test described above; it is not part of this audit's changes.
- [ ] Verify real foreground/background/launch delivery, sound, and every allowed/fallback tap destination on both platforms and release builds.
- [ ] Implement token upload/removal endpoints, persistent storage, identity association, and token refresh synchronization.
- [ ] Implement event-based backend sending, tickets/receipts, retry handling, and invalid-token removal.
- [ ] Implement server-enforced preferences and sign-out/account-switch cleanup.
- [ ] Reconcile the older guide's stale “no project ID” statement in a future documentation update.

## 8. Useful Resources – Official Expo documentation links

- [SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) and [notification API](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/).
- [Expo documentation index and current corrections](https://docs.expo.dev/llms.txt).
- [Local versus remote notification types and app states](https://docs.expo.dev/push-notifications/what-you-need-to-know/).
- [Push setup, project ID, and platform prerequisites](https://docs.expo.dev/push-notifications/push-notifications-setup/).
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/) and [iOS simulator builds](https://docs.expo.dev/build-reference/simulators/).
- [Android FCM V1 credentials](https://docs.expo.dev/push-notifications/fcm-credentials/).
- [Sending, tickets, receipts, and errors](https://docs.expo.dev/push-notifications/sending-notifications/).
- [Incoming notification handling](https://docs.expo.dev/push-notifications/receiving-notifications/) and [troubleshooting](https://docs.expo.dev/push-notifications/faq/).
- [Manual Expo push test tool](https://expo.dev/notifications).
