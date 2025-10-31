/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Ogavi",
    slug: "Ogavi",
    version: "1.0.1",
    android: {
      package: "com.oemarms.Ogavi",
      versionCode: 15,
    },
    plugins: [
      ["expo-build-properties", {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          extraMavenRepos: [
            "https://maven.arthenica.com/releases",
            "https://repo1.maven.org/maven2",
            "https://www.jitpack.io"
          ],
          // sementara off untuk isolasi error
          enableProguardInReleaseBuilds: false,
          enableShrinkResourcesInReleaseBuilds: false
        }
      }]
    ],
    extra: {
      eas: { projectId: "7b1e5768-aeb4-4e12-8b16-29efa1fcdae9" }
    }
  }
};
