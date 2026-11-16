# Bulldog Bound dashboard prototype

An Expo SDK 58 / React Native / TypeScript recreation of the Fresno State ModoLabs guest dashboard, using native components and local media. The notification client uses Expo Push Service; a backend sender is not included.

Reference: https://fresnosandbox-prod.modolabs.net/default/dashboardtesting/_/bb_guest_dash

## Run on a physical device

From this directory:

```bash
npm ci
npx expo start --go
```

Install/open Expo Go compatible with SDK 58 to preview the dashboard. Push notifications require an installed development or production build; the Notifications screen explains availability in Expo Go and on web. Connect the phone and computer to the same Wi-Fi. On iPhone, scan the terminal QR code with Camera and open in Expo Go. On Android, scan it from Expo Go. Metro serves the application to your device.

If LAN connectivity is blocked, use `npx expo start --go --tunnel` (Expo may prompt to install its tunnel helper).

## Organization

For push credentials, development builds, a remote test, and the backend integration point, see [Push notifications](docs/push-notifications.md).

- `src/app/(tabs)/index.tsx`: dashboard composition and local interaction state.
- `src/app/notifications.tsx`: opt-in notification controls and development-only push token.
- `src/notifications/NotificationsProvider.tsx`: permissions, registration, foreground presentation, token refresh, and tap navigation.
- `src/app/_layout.tsx`: Expo Router stack, safe-area provider, and status bar.
- `src/components/dashboard/`: Header, ActionRow, ProgramGrid, MediaPlaceholder, and PreviewModal.
- `src/data/dashboard.ts`: original introduction, menu labels, grade tiles, shared colors, and preview types.
- `assets/dashboard/`: downloaded original media; `sources.json` records each public source URL.

The reference HTML and stylesheet supplied the section order, text, navy panel (`#13284c`), navigation red (`#c41230`), action red (`#b42b36`), 220-point video frame, and 84-point grade badge sizing. The original photo, header logo and icons, four grade badges, and YouTube thumbnail are bundled locally. There are no fabricated university logos.

## Interactions and remaining differences

User and navigation menus open and close. Menu search filters local destinations. Registration, website, grade tiles, QR test, and video open labeled local previews. Header home buttons scroll to the top. Android back dismisses an open modal. All destinations are local; no sign-in, registration submission, camera scanning, or video streaming occurs.

Video playback and destination content remain placeholders by design. Menus use full-screen native modals rather than web dropdowns. System fonts are used (Roboto on Android, platform font on iOS). Layout follows the retrieved mobile stylesheet, with bounded widths for larger displays. Browser automation could not provide a reliable rendered comparison; pixel fidelity, physical-device rendering, and tap behavior still need an Expo Go review.

## Validate

```bash
npx expo lint
npx tsc --noEmit
npx expo export --platform all --output-dir /tmp/bulldog-bound-export
```

Device review: scroll through all sections, tap each grade and action, dismiss previews, open both menus, search for Campus Map, try an unmatched search, and tap the home logo after scrolling. Check a narrow screen and enlarged text for clipping.
