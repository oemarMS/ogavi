import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Image,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Text, View } from "@/app/components/Themed";

export default function AboutScreen() {
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#1c1c1c" : "#fff" },
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <Text
        style={[
          styles.appbar,
          { color: colorScheme === "dark" ? "#B39DDB" : "#6A1B9A" },
        ]}
      >
        Tentang Aplikasi
      </Text>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
        />
        <Text
          style={[
            styles.subtitle,
            { color: colorScheme === "dark" ? "#e0e0e0" : "#555" },
          ]}
        >
          Aplikasi Pengeditan Foto dengan Caption
        </Text>

        <View
          style={styles.separator}
          lightColor="#eee"
          darkColor="rgba(255,255,255,0.1)"
        />

        <Text
          style={[
            styles.description,
            { color: colorScheme === "dark" ? "#e0e0e0" : "#000" },
          ]}
        >
          Ogavi adalah sebuah aplikasi pengeditan foto yang memungkinkan
          pengguna untuk dengan mudah menambahkan caption atau keterangan pada
          foto-foto mereka. Dengan Ogavi, Anda dapat mengambil foto dari galeri
          perangkat, menuliskan caption yang diinginkan pada kotak teks yang
          tersedia di bawah foto, dan menyimpan foto tersebut kembali ke galeri
          dengan caption yang telah terintegrasi secara permanen.
        </Text>

        <Text
          style={[
            styles.description,
            { color: colorScheme === "dark" ? "#e0e0e0" : "#000" },
          ]}
        >
          Aplikasi ini sangat cocok bagi pengguna yang ingin memberikan judul,
          deskripsi, atau keterangan tambahan pada foto-foto mereka, baik itu
          foto liburan, makanan, momen spesial, atau foto lainnya yang ingin
          dibagikan dengan caption yang menarik.
        </Text>

        <View style={styles.screenshotContainer}>
          <Image
            source={require("@/assets/images/ss1.jpg")}
            style={styles.screenshot}
            resizeMode="contain"
          />
          <Image
            source={require("@/assets/images/ss2.jpg")}
            style={styles.screenshot}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  appbar: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
  },
  separator: {
    marginVertical: 20,
    height: 2,
    width: "80%",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 20,
  },
  screenshotContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  screenshot: {
    width: "45%",
    height: 400,
  },
});
