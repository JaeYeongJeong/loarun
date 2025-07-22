export default {
  expo: {
    name: "로아런",
    slug: "loarun",
    scheme: "loarun",
    orientation: "portrait",
    "ios": {
      "supportsTablet": true // iPad 지원은 하되, 회전은 막음
    },
    "android": {
      "orientation": "portrait" // Android에서도 세로 고정
    },
    userInterfaceStyle: "automatic",
    icon: "./assets/images/loarunIcon-1024-big-removebg.png",
    version: "1.0.6",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/loarunIcon-1024-big-removebg.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.jaey0394.loarun",
      supportsTablet: true
    },
    android: {
      softwareKeyboardLayoutMode: 'resize',
      adaptiveIcon: {
        foregroundImage: "./assets/images/loarunIcon-1024-removebg.png",
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
      EXPO_LOARUN_API_PROXY_URL: process.env.EXPO_LOARUN_API_PROXY_URL,
      eas: {
        projectId: "4c38c770-e9bf-493a-bd93-10f47f51463f"
      }
    }
  }
};
