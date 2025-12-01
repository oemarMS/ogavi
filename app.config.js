/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Ogavi",
    slug: "Ogavi",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "rgba(102, 196, 250, 0.9)"
    },
    
    assetBundlePatterns: ["**/*"],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.oemarms.Ogavi"
    },
    
    android: {
      package: "com.oemarms.Ogavi",
      //versionCode: 15,
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#66C4FA"
      },
      permissions: [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO",
        "CAMERA"
      ]
    },
    
    web: {
      favicon: "./assets/images/icon.png",
      bundler: "metro"
    },
    
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            // INI BUAT 16KB PAGE SIZE! 🔥
            useLegacyPackaging: false,
            extraMavenRepos: [
              "https://maven.arthenica.com/releases",
              "https://repo1.maven.org/maven2",
              "https://www.jitpack.io"
            ],
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true
          }
        }
      ]
    ],
    
    experiments: {
      typedRoutes: true
    },
    
    extra: {
      eas: { 
        projectId: "7b1e5768-aeb4-4e12-8b16-29efa1fcdae9" 
      }
    }
  }
};