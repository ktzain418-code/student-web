import type { CapacitorConfig } from "@capacitor/cli";

// Native Android shell configuration.
// The web app is bundled into the Android WebView; the `InstalledApps` plugin
// (see android-native/) is the only native capability App History uses.
const config: CapacitorConfig = {
  appId: "com.apphistory.tracker",
  appName: "App History",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
