// app.config.js
export default {
  expo: {
    name: "로아런",
    slug: "loarun",
    scheme: "loarun",

    orientation: "portrait",
    userInterfaceStyle: "automatic",

    version: "1.1.0",
    newArchEnabled: true,

    icon: "./assets/images/loarunIcon-1024-big-removebg.png",

    splash: {
      image: "./assets/images/loarunIcon-1024-big-removebg.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      bundleIdentifier: "com.jaey0394.loarun",
      supportsTablet: true,

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      orientation: "portrait",
      softwareKeyboardLayoutMode: "resize",

      adaptiveIcon: {
        foregroundImage:
          "./assets/images/loarunIcon-1024-removebg.png",
        backgroundColor: "#ffffff",
      },

      edgeToEdgeEnabled: true,
      package: "com.jaey0394.loarun",
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/loarunIcon-favicon-512.png",
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      EXPO_LOARUN_API_PROXY_URL:
        process.env.EXPO_LOARUN_API_PROXY_URL,

      eas: {
        projectId: "4c38c770-e9bf-493a-bd93-10f47f51463f",
      },
    },
  },
};