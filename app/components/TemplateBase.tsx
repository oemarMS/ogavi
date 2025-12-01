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

interface TemplateBaseProps {
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
  // Formula: (R * 299 + G * 587 + B * 114) / 1000
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Jika brightness > 128, background cenderung terang, gunakan teks gelap
  // Jika brightness <= 128, background cenderung gelap, gunakan teks terang
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

const TemplateBase: React.FC<TemplateBaseProps> = ({
  aspectRatio,
  title,
  needsPermission = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const [orientation, setOrientation] = useState(
    Dimensions.get("window").width < Dimensions.get("window").height
      ? "portrait"
      : "landscape"
  );
  // State untuk warna
  const [captionBackgroundColor, setCaptionBackgroundColor] =
    useState("#D30000"); // Default merah
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF"); // Default putih
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#D30000");

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const colorPickerRef = useRef(null);

  // Update text color ketika background color berubah
  useEffect(() => {
    setCaptionTextColor(getContrastColor(captionBackgroundColor));
  }, [captionBackgroundColor]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setOrientation(window.width < window.height ? "portrait" : "landscape");
    });

    return () => subscription?.remove();
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

  };

  const handleTextChange = (text: string) => {
    setCaptionText(text);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickImage = async () => {
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
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Ups!", "Ada masalah ketika mengambil foto");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async () => {
    try {
      if (!selectedImage) {
        Alert.alert("Pilih foto dulu sebelum disimpan 😅");
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

  const imageContainerStyle = {
    ...styles.imageContainer,
    width: orientation === "landscape" ? wp("70%") : wp("90%"),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
        keyboardDismissMode="on-drag"      // BARU - dismiss keyboard saat drag
        scrollEventThrottle={16}           // BARU - smooth scrolling
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>{title}</Text>
            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
              <View style={imageContainerStyle}>
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={[styles.placeholder, { aspectRatio }]}
                  />
                ) : (
                  <View style={[styles.placeholder, { aspectRatio }]}>
                    <Text style={styles.placeholderText}>
                      Pilih Gambar dari Galeri
                    </Text>
                  </View>
                )}
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.caption,
                    {
                      fontSize: fontSize,
                      backgroundColor: captionBackgroundColor,
                      color: captionTextColor,
                    },
                  ]}
                  value={captionText}
                  onChangeText={handleTextChange}
                  placeholder="Tuliskan keterangan gambar di sini..."
                  placeholderTextColor={`${captionTextColor}80`} // 50% opacity
                  multiline={true}
                  textAlignVertical="center"
                  textAlign="center"
                  submitBehavior="newline"
                  onBlur={() => Keyboard.dismiss()}
                  onFocus={handleFocus}
                />
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
                UBAH WARNA BACKGROUND
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

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>PILIH GAMBAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
            </TouchableOpacity>

            <View style={styles.fontSizeControl}>
              <Text style={styles.fontSizeText}>
                Ukuran Font: {tempFontSize}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={60}
                step={1}
                value={fontSize}
                onValueChange={(value) => setTempFontSize(value)}
                onSlidingComplete={(value) => setFontSize(value)}
              />
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
    //justifyContent: "space-between",
    paddingHorizontal: wp("2%"),
    paddingBottom: hp("5%"),  // BARU - extra padding buat keyboard
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp("2%"),
    paddingBottom: Platform.OS === "ios" ? hp("4%") : hp("2%"),
  },
  header: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(24, 812),
    color: "#6A1B9A",
    marginBottom: hp("2%"),
    textAlign: "center",
    paddingHorizontal: wp("2%"),
  },
  imageContainer: {
    maxWidth: 600,
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
  placeholder: {
    width: "100%",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    minHeight: hp("20%"),
  },
  buttonText: {
    fontFamily: "RobotoBold",
    color: "#6A1B9A",
    fontSize: RFValue(16, 812),
  },
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(14, 812),
    color: "#666",
  },
  caption: {
    fontFamily: "RobotoBold",
    marginTop: hp("0.5%"),
    padding: wp("2%"),
    fontStyle: "normal",
    maxHeight: hp("20%"),
    minHeight: hp("5%"),
    textAlign: "center",
  },
  // Color picker button styles
  colorPickerButton: {
    marginTop: hp("2%"),
    padding: wp("3%"),
    borderRadius: wp("100%"),
    alignItems: "center",
    width: wp("60%"),
    maxWidth: wp("100%"),
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
    maxWidth: wp("100%"),
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
  // Main buttons
  button: {
    marginTop: hp("2%"),
    padding: wp("3%"),
    borderRadius: wp("100%"),
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp("50%"),
    maxWidth: wp("100%"),
    minHeight: hp("6%"),
    justifyContent: "center",
  },
  saveButton: {
    marginTop: hp("1%"),
    backgroundColor: "#6A1B9A",
    padding: wp("3%"),
    borderRadius: wp("100%"),
    alignItems: "center",
    width: wp("50%"),
    maxWidth: wp("100%"),
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
    width: wp("80%"),
    maxWidth: wp("100%"),
    alignItems: "center",
    paddingHorizontal: wp("5%"),
  },
  fontSizeText: {
    fontFamily: "Roboto",
    fontSize: RFValue(16, 812),
  },
  slider: {
    width: wp("80%"),
    height: hp("5%"),
    marginTop: hp("1%"),
  },

  // Modal styles - revised to match screenshot
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
    width: wp("75%"),
    marginBottom: hp("1%"),
  },
  quickPickItem: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    borderWidth: 1,
    borderColor: "#ddd",
    margin: "1%",
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

export default TemplateBase;
