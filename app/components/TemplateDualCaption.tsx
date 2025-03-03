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
  Modal,
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
import ColorPicker from "react-native-wheel-color-picker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ASPECT_RATIO = SCREEN_HEIGHT / SCREEN_WIDTH;

interface TemplateDualCaptionProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

// Menentukan warna teks berdasarkan kecerahan background
const getContrastColor = (hexColor: string): string => {
  // Hapus # jika ada
  const color = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Menghitung kecerahan menggunakan rumus YIQ
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Jika brightness > 128, background cenderung terang, gunakan teks gelap
  return brightness > 128 ? "#000000" : "#ffffff";
};

// Daftar warna preset untuk quick selection
const PRESET_COLORS = [
  "#000000", // Black
  "#808080", // Gray
  "#FF0000", // Red
  "#800080", // Purple
  "#0000FF", // Blue
  "#00FFFF", // Cyan
  "#008000", // Green
  "#FFFF00", // Yellow
  "#FFA500", // Orange
  "#FFFFFF", // White
];

const TemplateDualCaption: React.FC<TemplateDualCaptionProps> = ({
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
  const [leftCaptionText, setLeftCaptionText] = useState("");
  const [rightCaptionText, setRightCaptionText] = useState("");
  const [fontSize, setFontSize] = useState(RFValue(14));
  const [tempFontSize, setTempFontSize] = useState(RFValue(14));
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [captionBackgroundColor, setCaptionBackgroundColor] =
    useState("#D30000"); // Default merah
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF"); // Default putih
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#D30000");

  // Refs setup
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const colorPickerRef = useRef(null);

  // Update text color ketika background color berubah
  useEffect(() => {
    setCaptionTextColor(getContrastColor(captionBackgroundColor));
  }, [captionBackgroundColor]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
          y: y - hp("10%"),
          animated: true,
        });
      });
    }, 100);
  };

  const handleTextChange = (text: string, side: "left" | "right") => {
    if (side === "left") {
      setLeftCaptionText(text);
    } else {
      setRightCaptionText(text);
    }
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

  // Handler untuk color picker
  const onColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const applyColor = () => {
    setCaptionBackgroundColor(currentColor);
    setShowColorPicker(false);
  };

  const toggleColorPicker = () => {
    setCurrentColor(captionBackgroundColor);
    setShowColorPicker(!showColorPicker);
  };

  const selectPresetColor = (color: string) => {
    setCaptionBackgroundColor(color);
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
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? hp("10%") : 0}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6A1B9A" />
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer,
          keyboardVisible && styles.scrollContainerWithKeyboard,
        ]}
        keyboardShouldPersistTaps="handled"
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
                <View style={styles.imagesRow}>
                  {/* Left Image with Caption */}
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
                      style={[
                        styles.caption,
                        {
                          fontSize: fontSize,
                          backgroundColor: captionBackgroundColor,
                          color: captionTextColor,
                        },
                        Platform.select({
                          ios: { paddingVertical: hp("1%") },
                        }),
                      ]}
                      value={leftCaptionText}
                      onChangeText={(text) => handleTextChange(text, "left")}
                      placeholder="Caption kiri..."
                      placeholderTextColor={`${captionTextColor}80`} // 50% opacity
                      multiline={true}
                      textAlignVertical="center"
                      textAlign="center"
                      blurOnSubmit={true}
                      onBlur={() => Keyboard.dismiss()}
                      onFocus={handleFocus}
                      ref={inputRef}
                    />
                  </View>

                  {/* Right Image with Caption */}
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
                      style={[
                        styles.caption,
                        {
                          fontSize: fontSize,
                          backgroundColor: captionBackgroundColor,
                          color: captionTextColor,
                        },
                        Platform.select({
                          ios: { paddingVertical: hp("1%") },
                        }),
                      ]}
                      value={rightCaptionText}
                      onChangeText={(text) => handleTextChange(text, "right")}
                      placeholder="Caption kanan..."
                      placeholderTextColor={`${captionTextColor}80`} // 50% opacity
                      multiline={true}
                      textAlignVertical="center"
                      textAlign="center"
                      blurOnSubmit={true}
                      onBlur={() => Keyboard.dismiss()}
                      onFocus={handleFocus}
                    />
                  </View>
                </View>
              </View>
            </ViewShot>

            {/* Color Picker Button */}
            <TouchableOpacity
              style={[
                styles.colorPickerButton,
                { backgroundColor: captionBackgroundColor },
              ]}
              onPress={toggleColorPicker}
            >
              <Text
                style={[styles.colorPickerText, { color: captionTextColor }]}
              >
                UBAH WARNA CAPTION
              </Text>
            </TouchableOpacity>

            {/* Quick Select Colors */}
            <View style={styles.presetColorsContainer}>
              <Text style={styles.presetColorsTitle}>Warna Cepat:</Text>
              <View style={styles.presetColorsGrid}>
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.presetColorItem,
                      {
                        backgroundColor: color,
                        borderWidth: captionBackgroundColor === color ? 3 : 1,
                        borderColor:
                          captionBackgroundColor === color ? "#6A1B9A" : "#ddd",
                      },
                    ]}
                    onPress={() => selectPresetColor(color)}
                  />
                ))}
              </View>
            </View>

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
                <Text style={styles.fontSizeText}>
                  Ukuran Font: {Math.round(tempFontSize)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={60}
                  step={1}
                  value={fontSize}
                  onValueChange={setTempFontSize}
                  onSlidingComplete={setFontSize}
                />
              </View>
            </View>
            {/* Advanced Color Picker Modal */}
            <Modal
              visible={showColorPicker}
              transparent={true}
              animationType="fade"
              statusBarTranslucent={true}
              onRequestClose={() => setShowColorPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Pilih Warna Caption</Text>

                    {/* Color Preview */}
                    <View
                      style={[
                        styles.colorSample,
                        { backgroundColor: currentColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.colorHexCode,
                          { color: getContrastColor(currentColor) },
                        ]}
                      >
                        {currentColor.toUpperCase()}
                      </Text>
                    </View>

                    {/* Color Wheel */}
                    <View style={styles.colorPickerContainer}>
                      <ColorPicker
                        ref={colorPickerRef}
                        color={currentColor}
                        onColorChange={onColorChange}
                        thumbSize={30}
                        sliderSize={30}
                        noSnap={true}
                        row={false}
                        swatchesLast={false}
                        swatches={false}
                        discrete={false}
                      />
                    </View>

                    {/* Bottom Color Quick Picks */}
                    <View style={styles.quickPickContainer}>
                      {PRESET_COLORS.slice(0, 5).map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.quickPickItem,
                            { backgroundColor: color },
                          ]}
                          onPress={() => onColorChange(color)}
                        />
                      ))}
                    </View>
                    <View style={styles.quickPickContainer}>
                      {PRESET_COLORS.slice(5, 10).map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.quickPickItem,
                            { backgroundColor: color },
                          ]}
                          onPress={() => onColorChange(color)}
                        />
                      ))}
                    </View>

                    {/* Buttons */}
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowColorPicker(false)}
                      >
                        <Text style={styles.cancelButtonText}>BATAL</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={applyColor}
                      >
                        <Text style={styles.applyButtonText}>TERAPKAN</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </Modal>
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
  scrollContainerWithKeyboard: {
    paddingBottom: hp("20%"),
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
    width: wp("90%"),
  },
  dualImageContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: wp("1%"),
    backgroundColor: "#fff",
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
  },
  imageWrapper: {
    width: "48.5%",
    marginHorizontal: wp("0.5%"),
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
  },
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(14, 812),
    color: "#666",
    textAlign: "center",
  },
  caption: {
    fontFamily: "RobotoBold",
    marginTop: hp("0.5%"),
    padding: wp("2%"),
    backgroundColor: "red",
    color: "white",
    textAlign: "center",
    width: "100%",
    minHeight: hp("5%"),
    flexGrow: 1,
  },
  controlsContainer: {
    width: wp("90%"),
    marginTop: hp("2%"),
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
    fontSize: RFValue(12, 812),
  },
  saveButton: {
    marginTop: hp("2%"),
    backgroundColor: "#6A1B9A",
    padding: wp("3%"),
    borderRadius: 100,
    alignItems: "center",
    width: wp("50%"),
    maxWidth: 300,
    minHeight: hp("6%"),
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(16, 812),
  },
  fontSizeControl: {
    marginTop: hp("2%"),
    width: "100%",
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
  // Color picker button styles
  colorPickerButton: {
    marginTop: hp("2%"),
    padding: wp("3%"),
    borderRadius: 100,
    alignItems: "center",
    width: wp("60%"),
    maxWidth: 300,
    minHeight: hp("6%"),
    justifyContent: "center",
  },
  colorPickerText: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(14, 812),
  },
  // Preset colors styles
  presetColorsContainer: {
    width: wp("90%"),
    maxWidth: 600,
    marginTop: hp("1%"),
    alignItems: "center",
  },
  presetColorsTitle: {
    fontFamily: "Roboto",
    fontSize: RFValue(14, 812),
    marginBottom: hp("0.5%"),
  },
  presetColorsGrid: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: hp("1%"),
  },
  presetColorItem: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    margin: wp("1%"),
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: wp("85%"),
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: wp("5%"),
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(18, 812),
    color: "#6A1B9A",
    marginBottom: hp("1.5%"),
  },
  colorSample: {
    width: wp("40%"),
    height: hp("4%"),
    borderRadius: 10,
    marginBottom: hp("2%"),
    alignItems: "center",
    justifyContent: "center",
  },
  colorHexCode: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(14, 812),
  },
  colorPickerContainer: {
    width: wp("70%"),
    height: hp("26%"),
    marginBottom: hp("6%"),
  },
  quickPickContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: hp("1%"),
  },
  quickPickItem: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 2,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: hp("1%"),
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    borderRadius: 50,
    padding: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("2%"),
  },
  cancelButtonText: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(16, 812),
    color: "#6A1B9A",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#6A1B9A",
    borderRadius: 50,
    padding: hp("1.5%"),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wp("2%"),
  },
  applyButtonText: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(16, 812),
    color: "#FFFFFF",
  },
});

export default TemplateDualCaption;
