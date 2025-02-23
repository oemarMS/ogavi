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
  Dimensions,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TemplateImgDualProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

const TemplateImgDual: React.FC<TemplateImgDualProps> = ({
  aspectRatio,
  title,
  needsPermission = false,
}) => {
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
  const [leftCaption, setLeftCaption] = useState("");
  const [rightCaption, setRightCaption] = useState("");
  const [mainFontSize, setMainFontSize] = useState(14);
  const [imageFontSize, setImageFontSize] = useState(14);
  const [tempMainFontSize, setTempMainFontSize] = useState(14);
  const [tempImageFontSize, setTempImageFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const responsiveFontSize = (size: number) => {
    return RFValue(size, SCREEN_HEIGHT);
  };

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
      keyboardVerticalOffset={Platform.OS === "ios" ? hp("10%") : 0}
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
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>{title}</Text>
            <ViewShot
              ref={viewShotRef}
              options={{ format: "jpg", quality: 1 }}
              style={styles.viewShot}
            >
              <View style={styles.dualImageContainer}>
                <TextInput
                  ref={inputRef}
                  style={[styles.caption, { fontSize: mainFontSize }]}
                  value={captionText}
                  onChangeText={handleTextChange}
                  placeholder="Tuliskan keterangan utama di sini..."
                  placeholderTextColor="maroon"
                  multiline={true}
                  textAlignVertical="center"
                  textAlign="center"
                  blurOnSubmit={false}
                  returnKeyType= "default"
                  onBlur={() => Keyboard.dismiss()}
                  onFocus={handleFocus}
                />

                <View style={styles.imagesRow}>
                  {/* Left Image Container */}
                  <View style={styles.imageWrapper}>
                    {leftImage ? (
                      <Image
                        source={{ uri: leftImage.uri }}
                        style={[styles.image, { aspectRatio }]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.placeholder, { aspectRatio }]}>
                        <Text style={styles.placeholderText}>
                          Pilih Gambar Kiri
                        </Text>
                      </View>
                    )}
                    <TextInput
                      style={[styles.imageCaption, { fontSize: imageFontSize }]}
                      value={leftCaption}
                      onChangeText={setLeftCaption}
                      placeholder="Caption kiri..."
                      placeholderTextColor="maroon"
                      multiline={true}
                      textAlignVertical="center"
                      textAlign="center"
                      blurOnSubmit={true}
                      returnKeyType="default"
                      onBlur={() => Keyboard.dismiss()}
                      onFocus={handleFocus}
                    />
                  </View>

                  {/* Right Image Container */}
                  <View style={styles.imageWrapper}>
                    {rightImage ? (
                      <Image
                        source={{ uri: rightImage.uri }}
                        style={[styles.image, { aspectRatio }]}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.placeholder, { aspectRatio }]}>
                        <Text style={styles.placeholderText}>
                          Pilih Gambar Kanan
                        </Text>
                      </View>
                    )}
                    <TextInput
                      style={[styles.imageCaption, { fontSize: imageFontSize }]}
                      value={rightCaption}
                      onChangeText={setRightCaption}
                      placeholder="Caption kanan..."
                      placeholderTextColor="maroon"
                      multiline={true}
                      textAlignVertical="center"
                      textAlign="center"
                      blurOnSubmit={true}
                      returnKeyType="default"
                      onBlur={() => Keyboard.dismiss()}
                      onFocus={handleFocus}
                    />
                  </View>
                </View>
              </View>
            </ViewShot>

            <View style={styles.controlsContainer}>
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

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveToGallery}
              >
                <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
              </TouchableOpacity>

              <View style={styles.fontSizeControl}>
                <View style={styles.sliderContainer}>
                  <Text style={styles.fontSizeText}>
                    Ukuran Font Caption Utama: {tempMainFontSize}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={60}
                    step={1}
                    value={mainFontSize}
                    onValueChange={setTempMainFontSize}
                    onSlidingComplete={setMainFontSize}
                  />
                </View>

                <View style={styles.sliderContainer}>
                  <Text style={styles.fontSizeText}>
                    Ukuran Font Caption Gambar: {tempImageFontSize}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={10}
                    maximumValue={60}
                    step={1}
                    value={imageFontSize}
                    onValueChange={setTempImageFontSize}
                    onSlidingComplete={setImageFontSize}
                  />
                </View>
              </View>
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
    paddingTop: Platform.OS === "ios" ? hp("5%") : hp("2%"),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: wp("2%"),
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingVertical: hp("2%"),
  },
  header: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(24, 812),
    color: "#6A1B9A",
    marginBottom: hp("2%"),
    textAlign: "center",
    paddingHorizontal: wp("2%"),
  },
  viewShot: {
    width: wp("95%"),
  },
  dualImageContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    padding: wp("2%"),
    backgroundColor: "#2e3c45",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: hp("1%"),
  },
  imageWrapper: {
    width: "48%",
  },
  image: {
    width: "100%",
    height: undefined,
  },
  placeholder: {
    width: "100%",
    height: undefined,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    minHeight: hp("15%"),
  },
  controlsContainer: {
    width: wp("95%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hp("2%"),
  },
  button: {
    padding: wp("3%"),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: "48%",
  },
  buttonText: {
    fontFamily: "RobotoBold",
    color: "#6A1B9A",
    fontSize: RFValue(12, 812),
  },
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(12, 812),
    color: "#666",
  },
  caption: {
    fontFamily: "RobotoBold",
    padding: wp("2%"),
    backgroundColor: "white",
    color: "maroon",
    width: "100%",
    marginBottom: hp("1%"),
    minHeight: hp("5%"),
  },
  imageCaption: {
    fontFamily: "RobotoBold",
    padding: wp("2%"),
    backgroundColor: "white",
    color: "maroon",
    width: "100%",
    marginTop: hp("1%"),
    minHeight: hp("4%"),
    flexGrow: 1,
  },
  saveButton: {
    backgroundColor: "#6A1B9A",
    padding: wp("3%"),
    borderRadius: 100,
    alignItems: "center",
    width: "60%",
    marginBottom: hp("2%"),
  },
  saveButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(16, 812),
  },
  fontSizeControl: {
    width: "100%",
    alignItems: "center",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: hp("2%"),
    alignItems: "center",
  },
  fontSizeText: {
    fontFamily: "Roboto",
    fontSize: RFValue(16, 812),
    marginBottom: hp("1%"),
  },
  slider: {
    width: "100%",
    height: hp("4%"),
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
    fontFamily: "Roboto",
    fontSize: RFValue(16, 812),
    color: "#6A1B9A",
  },
});

export default TemplateImgDual;
