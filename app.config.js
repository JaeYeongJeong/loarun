// app.config.js
export default () => ({
  expo: {
    name: "Loarun",
    slug: "loarun",
    scheme: "loarun",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/images/loarunIcon-favicon-512.png",
    version: "1.0.0",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/loarunIcon-splash-2208.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      buildNumber: "1.0.0",
      supportsTablet: true
    },
    android: {
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/loarunIcon-adaptive-432.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.jaey0394.loarun"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/loarunIcon-favicon-512.png"
    },
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true
    },
    extra: {
      EXPO_LOSTARK_API_TOKEN: process.env.EXPO_LOSTARK_API_TOKEN,
      eas: {
        projectId: "4c38c770-e9bf-493a-bd93-10f47f51463f"
      }
    }
  }
});
