# Notifications

Audit and local-test update: November 16, 2026. This guide covers Expo SDK **58** (`expo ~58.0.25`, `expo-notifications ~58.1.9`). A development-only local notification test has been added after the initial audit. No native build was installed, hosted credentials inspected, or notification delivered during this work. Device behavior below is expected from the code, not confirmed delivery. Lint and TypeScript checks passed.

## 1. Overview – How our notification system works

The app has a **remote push notification client** and a **development-only local notification test**. Remote registration remains limited to installed custom native apps. The local test also works through SDK 58-compatible Expo Go, without push credentials or a backend sender.

- **Local notification:** the app asks the phone to display an alert now or later. Delivery does not use a server, Expo Push Service, Apple APNs, or Android FCM. In development, **Send local test notification** schedules one alert about five seconds later.
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

Local delivery (development test):
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
| [NotificationsProvider.tsx](../src/notifications/NotificationsProvider.tsx) | Implements context, shared permissions/channel setup, local test scheduling, remote token registration, presentation policy, listeners, and navigation. |
| [notifications.tsx](../src/app/notifications.tsx) | Notification opt-in/status/settings screen; local test controls and token display are development-only (`__DEV__`). |
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

1. The provider skips native APIs on **web**. **Expo Go remains excluded from remote push registration and token listeners** on both platforms, but development local tests and the shared response listener are enabled there.
2. In a custom native app, and in development Expo Go, startup and returning to the foreground check permission without prompting. Android first creates the `default` channel, named **Bulldog Bound updates**, with HIGH importance and default sound.
3. Home → Notifications → **Enable notifications** requests permission only if permission is not granted and the OS allows asking again. iOS provisional authorization (limited permission) is treated as granted.
4. If permission is denied, the token is cleared from memory. The screen explains the denial and provides **Open device settings**. On return, the provider checks again.
5. If allowed, `getExpoPushTokenAsync` uses the configured EAS project ID, with `Constants.easConfig.projectId` as a fallback. The returned `result.data` is kept in React state. It is not saved to local storage or sent to a backend.
6. Registration errors appear on the screen. With permission granted but no token, **Retry connection** is offered. Startup/foreground checks and native push token changes also attempt registration. There is an overlapping-registration guard, but no scheduled network retry/backoff or explicit request timeout in the app.

Steps 3–6 describe remote opt-in in a custom build. The local test calls the same permission/channel setup directly, then schedules without requesting or checking an Expo Push Token. Its busy, error, and scheduled status are separate from remote registration. Custom builds still perform their existing automatic remote registration after permission is granted; those independent attempts can fail without blocking the local test. Expo Go never runs that registration path.

The screen's “ready to receive push notifications” text means a token was obtained. It does not confirm credentials, a sender, or delivery to the phone. OS permission and registration can have different outcomes: permission can succeed while token registration fails.

### Display, listeners, and tap navigation

- The foreground handler requests a banner, notification-list entry, and sound, with no badge update. Android's channel uses the default sound. Actual presentation/sound still depends on the incoming message and device settings.
- After the root navigator is ready, one `addNotificationResponseReceivedListener` handles normal taps from both local and remote notifications. `getLastNotificationResponse()` also checks for a tap that launched the app. Local testing does not add a second listener.
- `data.url === "/genie"` opens Bulldog Genie; `"/notifications"` opens Notifications. Everything else, including missing/unknown URLs, opens Home (`/`). Arbitrary external URLs are not opened by this handler.
- The handler ignores custom action identifiers, deduplicates the last handled notification ID within the listener's lifetime, and clears the saved response after handling. Subscriptions are removed on cleanup.
- `addPushTokenListener` re-registers using the changed native token. This currently updates memory only.
- There is no `addNotificationReceivedListener` for app-specific receipt processing, notification inbox/history, custom action buttons, background task, or badge-count management. Foreground display uses `setNotificationHandler`; it does not require an inbox listener.
- The development-only local test uses `scheduleNotificationAsync` with a non-repeating five-second interval, title **Bulldog Bound**, body **Your notification test was successful!**, default sound, and `data: { url: "/notifications" }`. Android uses the existing `default` channel. There is no repeat schedule or cancel control.
- Preferences currently mean OS permission/settings only. No topic switches, backend subscription preference, or notification sign-out cleanup exists.

### Notifications screen layout

`/notifications` is a root-stack screen beside `(tabs)`, not a screen inside the tab navigator. The stack provides its header/top safe area. On iOS, the scroll view now uses automatic navigation insets to keep content clear of native navigation bars. Its viewport uses `flex: 1`, and its content can fill the viewport or scroll when it is longer. The existing safe-area wrapper protects the bottom and sides, with 24 points of content padding below the final item. There is no overlaid app tab bar on this route, so no guessed tab-bar height is added and the tab design is unchanged.

The scroll view also adjusts keyboard insets on iOS, dismisses the keyboard on drag, and lets buttons handle taps while a keyboard is visible. This screen has no text inputs; no global keyboard settings were changed. Check a small phone and enlarged text: the title should appear below the header, and the final settings/error text should be reachable by scrolling. Native visual verification on different devices remains outstanding. See [safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/) and [React Native ScrollView insets](https://reactnative.dev/docs/scrollview#contentinsetadjustmentbehavior).

## 3. What I Can Test Right Now – Features that don't require external credentials

| Feature | Current credential-free testing |
| --- | --- |
| Home → Notifications navigation and screen layout | Preview in SDK 58-compatible Expo Go or on web. Web has no local test control. |
| Permission request and opening device settings | Use the local test in development Expo Go or a custom development build. No push credentials are needed. In Expo Go, OS permission/settings belong to Expo Go. |
| Denial and return-from-settings refresh | Denial shows a local-test error with settings guidance; return and try again. In custom builds, remote registration may independently fail after permission succeeds. |
| Local notifications and scheduling | **Send local test notification** schedules one alert about five seconds after permission/setup completes. No Expo token, Firebase, APNs, FCM, or Expo Push Service needed. |
| Notification banner, sound, and tap routing | Local test exercises the existing presentation and response handler; tap should open `/notifications`. Sound/banner depend on OS settings. |
| Remote push | Requires additional setup. The checked-in project ID is insufficient. |

**Personal iPhone without your own Apple Developer account:** use compatible Expo Go to test local delivery and taps today. No Apple membership or APNs setup is needed for this local test. Remote push remains unavailable in Expo Go. The project's EAS physical-iPhone build path requires Apple signing setup; iOS remote push requires paid Apple Developer/APNs credentials. If a team supplies a signed build installable on your registered phone, you can use that build without owning a separate developer membership. No such build was verified. See [Expo's push setup requirements](https://docs.expo.dev/push-notifications/push-notifications-setup/).

### Local test boundaries

Both the button and scheduling action are guarded by development mode. Production builds expose no test control, and calling the action there does nothing. Web is excluded. Rapid overlapping presses are ignored while permission/scheduling is in progress; each later successful press schedules another one-time alert.

Successful scheduling means the OS accepted the request, not that an alert has already appeared. Permission denial and scheduling exceptions produce an on-screen error; no alert is scheduled when permission is denied. This test validates client behavior, not remote credentials or server delivery. The [SDK 58 API reference](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) documents local scheduling and local notification support in Expo Go.

## 4. How to Test – Exact commands and steps

Run commands from `frontend/`. These are instructions for the developer; no builds or accounts were configured during this work.

### A. Send a local test today with no credentials

1. Install dependencies if needed, then explicitly select Expo Go (the project also includes `expo-dev-client`):

   ```bash
   npm ci
   npx expo start --go
   ```

2. Install/open Expo Go compatible with SDK 58 on the phone. Keep phone and computer on the same Wi-Fi. On iPhone, scan the terminal QR code with Camera; on Android, scan from Expo Go.
3. Open Home → **Notifications** → **Send local test notification**. Allow the OS permission prompt if shown. Expo Go still shows the installed-app message for remote push; remote opt-in and token controls remain hidden.
4. Expect “Local test scheduled” after scheduling succeeds. About five seconds later, expect title **Bulldog Bound** and body **Your notification test was successful!** Default sound is requested; silent mode, Focus/Do Not Disturb, provisional permission, or notification/channel settings can silence or hide the banner. In Expo Go, the OS may also identify the host as Expo Go; this test does not change the installed app's name/icon. No push token should be requested in Expo Go. The library may show a general Expo Go support warning; that alone does not mean local scheduling failed.
5. To verify navigation, schedule another test and switch to Home before the five seconds pass. Tap the banner or its notification-center entry: expect the Notifications screen. Repeat by scheduling and immediately putting the app in the background, then tapping the delivered alert. Keep the Expo Go project/Metro session available for the initial tests; cold-launch routing through the Expo Go host should be verified separately in a custom build.
6. To test denial, deny the prompt or disable notifications in device settings. Press the test button: expect a blocked-permission error and no new alert. Use **Open device settings**, allow notifications, return, and press the test button again. In Expo Go, change Expo Go's notification permission; OS settings can affect other projects opened in that app.
7. For a browser preview instead, run:

   ```bash
   npx expo start --web
   ```

   Expect the notification availability message and no local test button. This is UI testing, not local or remote notification delivery.

### B. Test permission in an existing custom development build

1. If you already have this project's compatible development build installed, run:

   ```bash
   npx expo start --dev-client
   ```

2. Open the installed Bulldog Bound app and connect to Metro (the development server). Open Home → Notifications → **Enable notifications**.
3. Accept or deny the OS prompt. A prompt may not appear if permission was previously decided or the OS cannot ask again. Use **Open device settings**, adjust notification permission, and return to the app to check the status refresh.
4. If registration fails after permission succeeds, expect the “Notifications are allowed” status, an error, and **Retry connection**. A token should appear under **Development push token** only if registration succeeds in development mode. Do not expect an alert from pressing Enable: it registers; it does not send.
5. To test locally, press **Send local test notification** instead and follow steps A3–A6. It remains usable even with no token or while independent remote registration is busy/failing. You do not need to press Enable first. The local-test action does not call remote registration.

If no build exists, local build commands are `npx expo run:android` (Android SDK/emulator or device required) and `npx expo run:ios` (macOS/Xcode; select an iOS simulator for a credential-free simulator build). These generate native directories and compile/install the app; they are not just Metro start commands. They were not run during this audit. Build/toolchain issues remain unverified. See [development build setup](https://docs.expo.dev/develop/development-builds/introduction/).

### C. Trigger a real remote test — only after push setup

The local test does **not** send a remote push. Without delivery credentials, the following remote test is not ready to run. Once the relevant platform is configured and its development build installed:

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
| Physical iPhone, custom build | Local test button in development; no APNs required for local delivery. Installing a signed build is a separate requirement. | Requires correct signed build, APNs credentials, EAS project/token, and a sender. |
| Physical Android, custom build | Local test button in development; uses the default channel. Local alerts do not need Firebase. | FCM client configuration is missing from checked config; FCM V1 sender credentials/project/token also required. |
| iOS simulator, custom build | Local test in development without a paid Apple account. Existing EAS profile is not a simulator profile. | Current Expo docs support push on suitable simulators (Xcode 14+, macOS 13+, iOS 16+); still requires push configuration. Not verified here. |
| Android emulator, custom build | Local test in development; notification permission/settings still apply. | Supported by Expo on emulators with Google Play services, with FCM/project credentials configured. Not verified here. |
| Expo Go, either platform | Development local test, default sound request, and shared tap handling enabled. Requires compatible Expo Go and OS permission. | Remote token registration/token listener remain disabled. Use a custom build for remote push. |
| Custom development build | Local test and existing native permission/response paths enabled. | Intended development environment once credentials are configured. Token is visible while running development JS. |
| Installed production build | Local test hidden and scheduling action disabled by `__DEV__`. | Existing remote paths retained; requires production signing/configuration and a sender; token display is hidden. Not verified by the empty production profile. |
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
- [x] Add a development-only local test independent of remote registration, including Expo Go and shared tap handling.
- [ ] Verify local scheduling, sound, denial/recovery, and tap routing on iOS and Android devices; verify the button is absent in release builds.
- [ ] Visually verify Notifications header/safe-area spacing and scrolling to the last control on small phones and with enlarged text.
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
