import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Font from "expo-font";

interface TemplateDualProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

const TemplateDual: React.FC<TemplateDualProps> = ({
  aspectRatio,
  title,
  needsPermission = false,
}) => {
  // State management
  const [leftImage, setLeftImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [rightImage, setRightImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);

  // Refs setup
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (needsPermission) {
      const requestPermission = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Izin Ditolak",
            "Maaf, kami butuh izin untuk bisa menyimpan gambar ke galeri!"
          );
        }
      };
      requestPermission();
    }
  }, [needsPermission]);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.measureInWindow((x, y, width, height) => {
        scrollViewRef.current?.scrollTo({
          y: y,
          animated: true,
        });
      });
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setCaptionText(text);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickImage = async (side: "left" | "right") => {
    setIsLoading(true);
    try {
      const [width, height] =
        aspectRatio > 1
          ? [Math.round(aspectRatio * 10), 10]
          : [10, Math.round((1 / aspectRatio) * 10)];

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [width, height],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        if (side === "left") {
          setLeftImage(result.assets[0]);
        } else {
          setRightImage(result.assets[0]);
        }
      }
    } catch (error) {
      Alert.alert("Ups!", "Ada masalah ketika mengambil foto");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async () => {
    try {
      if (!leftImage || !rightImage) {
        Alert.alert("Pilih kedua foto dulu sebelum disimpan 😅");
        return;
      }

      if (needsPermission) {
        const { status } = await MediaLibrary.getPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Izin Ditolak",
            "Maaf, aplikasi butuh izin untuk bisa menyimpan gambar ke galeri!"
          );
          return;
        }
      }

      if (
        viewShotRef.current &&
        typeof viewShotRef.current.capture === "function"
      ) {
        setIsLoading(true);
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("🎉 Foto berhasil tersimpan di galeri");
      }
    } catch (error) {
      console.log("Error ketika menyimpan:", error);
      Alert.alert("Maaf, ada error ketika menyimpan. Coba lagi ya!");
    } finally {
      setIsLoading(false);
    }
  };

  const [fontsLoaded] = Font.useFonts({
    Roboto: require("../../assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("../../assets/fonts/Roboto-Bold.ttf"),
  });

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Roboto: require("../../assets/fonts/Roboto-Regular.ttf"),
          RobotoBold: require("../../assets/fonts/Roboto-Bold.ttf"),
        });
      } catch (error) {
        console.log("Error loading fonts:", error);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6A1B9A" />
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>{title}</Text>
            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
              <View style={styles.dualImageContainer}>
                <View style={styles.imagesRow}>
                  {/* Left Image */}
                  <View style={styles.imageWrapper}>
                    {leftImage ? (
                      <Image
                        source={{ uri: leftImage.uri }}
                        style={[styles.placeholder, { aspectRatio }]}
                      />
                    ) : (
                      <View style={[styles.placeholder, { aspectRatio }]}>
                        <Text style={styles.placeholderText}>
                          Pilih Gambar Kiri
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Right Image */}
                  <View style={styles.imageWrapper}>
                    {rightImage ? (
                      <Image
                        source={{ uri: rightImage.uri }}
                        style={[styles.placeholder, { aspectRatio }]}
                      />
                    ) : (
                      <View style={[styles.placeholder, { aspectRatio }]}>
                        <Text style={styles.placeholderText}>
                          Pilih Gambar Kanan
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TextInput
                  ref={inputRef}
                  style={[styles.caption, { fontSize: fontSize }]}
                  value={captionText}
                  onChangeText={handleTextChange}
                  placeholder="Tuliskan keterangan gambar di sini..."
                  placeholderTextColor="#ffffff80"
                  multiline={true}
                  textAlignVertical="top"
                  textAlign="center"
                  blurOnSubmit={true}
                  onBlur={() => Keyboard.dismiss()}
                  onFocus={handleFocus}
                />
              </View>
            </ViewShot>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => pickImage("left")}
              >
                <Text style={styles.buttonText}>PILIH GAMBAR KIRI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => pickImage("right")}
              >
                <Text style={styles.buttonText}>PILIH GAMBAR KANAN</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
            </TouchableOpacity>

            <View style={styles.fontSizeControl}>
              <Text style={styles.fontSizeText}>
                Ukuran Font: {tempFontSize}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={30}
                step={1}
                value={fontSize}
                onValueChange={(value) => setTempFontSize(value)}
                onSlidingComplete={(value) => setFontSize(value)}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp("2%"),
    paddingBottom: hp("2%"),
  },
  header: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(24),
    color: "#6A1B9A",
    marginBottom: hp("2%"),
  },
  dualImageContainer: {
    width: wp("90%"),
    borderWidth: 1,
    borderColor: "#ccc",
    padding: wp("1%"),
    backgroundColor: "#fff",
    flexDirection: "column", // Changed to column
  },
  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  imageWrapper: {
    width: "49%", // Slightly less than 50% to account for spacing
  },
  placeholder: {
    width: "100%",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp("90%"),
    marginTop: hp("2%"),
  },
  button: {
    padding: wp("3%"),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp("43%"),
  },
  buttonText: {
    fontFamily: "RobotoBold",
    color: "#6A1B9A",
    fontSize: RFValue(12),
  },
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(12),
    color: "#666",
    textAlign: "center",
  },
  caption: {
    fontFamily: "RobotoBold",
    marginTop: hp("0.5%"), // Add margin top
    padding: wp("2%"),
    backgroundColor: "red",
    color: "white",
    fontSize: RFValue(12),
    fontStyle: "normal",
    maxHeight: hp("20%"),
    textAlign: "center",
  },
  saveButton: {
    marginTop: hp("2%"),
    backgroundColor: "#6A1B9A",
    padding: wp("3%"),
    borderRadius: 100,
    alignItems: "center",
    width: wp("50%"),
  },
  saveButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(16),
  },
  fontSizeControl: {
    marginTop: hp("2%"),
    width: wp("80%"),
    alignItems: "center",
  },
  fontSizeText: {
    fontFamily: "Roboto",
    fontSize: RFValue(16),
  },
  slider: {
    width: wp("80%"),
    height: 40,
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontWeight: "500",
    fontSize: RFValue(16),
    color: "#6A1B9A",
  },
});

export default TemplateDual;
