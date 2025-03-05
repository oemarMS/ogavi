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
const ASPECT_RATIO = SCREEN_HEIGHT / SCREEN_WIDTH;

// Interface untuk menyimpan informasi format teks
interface TextSegment {
  text: string;
  style: {
    color: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  };
}

interface TemplateImgQuadProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

const TemplateImgQuad: React.FC<TemplateImgQuadProps> = ({
  aspectRatio,
  title,
  needsPermission = false,
}) => {
  const [topLeftImage, setTopLeftImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [topRightImage, setTopRightImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [bottomLeftImage, setBottomLeftImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  const [bottomRightImage, setBottomRightImage] = useState<{
    uri: string;
    width: number;
    height: number;
  } | null>(null);
  
  // State untuk caption utama (plain text dan formatted)
  const [captionText, setCaptionText] = useState("");
  const [formattedCaption, setFormattedCaption] = useState<TextSegment[]>([
    { text: "", style: { color: "maroon", fontSize: 14 } }
  ]);
  
  // State untuk styling caption
  const [selectedLineIndex, setSelectedLineIndex] = useState(-1);
  const [currentColor, setCurrentColor] = useState("maroon");
  const [currentFontSize, setCurrentFontSize] = useState(14);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  
  const [topLeftCaption, setTopLeftCaption] = useState("");
  const [topRightCaption, setTopRightCaption] = useState("");
  const [bottomLeftCaption, setBottomLeftCaption] = useState("");
  const [bottomRightCaption, setBottomRightCaption] = useState("");
  const [mainFontSize, setMainFontSize] = useState(14);
  const [imageFontSize, setImageFontSize] = useState(14);
  const [tempMainFontSize, setTempMainFontSize] = useState(14);
  const [tempImageFontSize, setTempImageFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);

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
          y: y - hp("10%"),
          animated: true,
        });
      });
    }, 100);
  };

  // Fungsi untuk mengubah teks caption utama
  const handleTextChange = (text: string) => {
    setCaptionText(text);
    
    // Memecah teks berdasarkan baris baru
    const lines = text.split('\n');
    
    // Membuat formattedCaption baru berdasarkan teks yang baru
    const newFormattedCaption: TextSegment[] = lines.map((line, index) => {
      // Jika baris ini sudah ada sebelumnya, gunakan style yang sama
      if (index < formattedCaption.length) {
        return { ...formattedCaption[index], text: line };
      }
      // Jika baris baru, gunakan style default
      return { text: line, style: { color: "maroon", fontSize: mainFontSize } };
    });
    
    setFormattedCaption(newFormattedCaption);
  };

  // Fungsi untuk mengubah warna baris tertentu
  const setLineColor = (index: number, color: string) => {
    const newFormattedCaption = [...formattedCaption];
    if (index >= 0 && index < newFormattedCaption.length) {
      newFormattedCaption[index] = {
        ...newFormattedCaption[index],
        style: { ...newFormattedCaption[index].style, color }
      };
      setFormattedCaption(newFormattedCaption);
    }
  };
  
  // Fungsi untuk mengubah ukuran font baris tertentu
  const setLineFontSize = (index: number, fontSize: number) => {
    const newFormattedCaption = [...formattedCaption];
    if (index >= 0 && index < newFormattedCaption.length) {
      newFormattedCaption[index] = {
        ...newFormattedCaption[index],
        style: { ...newFormattedCaption[index].style, fontSize }
      };
      setFormattedCaption(newFormattedCaption);
    }
  };

  // Membuat rendered caption menggunakan komponen Text bersarang
  const renderFormattedCaption = () => {
    return (
      <Text style={styles.captionText}>
        {formattedCaption.map((segment, index) => (
          <Text 
            key={index} 
            style={segment.style}
            onPress={() => {
              setSelectedLineIndex(index);
              setCurrentColor(segment.style.color);
              setCurrentFontSize(segment.style.fontSize || mainFontSize);
              setShowFormatMenu(true);
            }}
          >
            {segment.text}
            {index < formattedCaption.length - 1 ? '\n' : ''}
          </Text>
        ))}
      </Text>
    );
  };

  // Komponen menu format untuk baris terpilih
  const FormatMenu = () => {
    return (
      <View style={styles.formatMenuContainer}>
        <Text style={styles.formatMenuTitle}>
          Format baris {selectedLineIndex + 1}:
        </Text>
        <View style={styles.formatOptions}>
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => {
              setShowColorPicker(true);
              setShowFontSizePicker(false);
            }}
          >
            <Text style={styles.formatButtonText}>Ubah Warna</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.formatButton}
            onPress={() => {
              setShowFontSizePicker(true);
              setShowColorPicker(false);
            }}
          >
            <Text style={styles.formatButtonText}>Ubah Ukuran Font</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowFormatMenu(false);
              setShowColorPicker(false);
              setShowFontSizePicker(false);
            }}
          >
            <Text style={styles.closeButtonText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Komponen pemilih warna sederhana
  const SimpleColorPicker = () => {
    const colors = ["maroon", "blue", "green", "purple", "orange", "black"];
    
    return (
      <View style={styles.colorPickerContainer}>
        <Text style={styles.colorPickerTitle}>
          Pilih warna untuk baris {selectedLineIndex + 1}:
        </Text>
        <View style={styles.colorOptions}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }]}
              onPress={() => {
                setCurrentColor(color);
                setLineColor(selectedLineIndex, color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      </View>
    );
  };
  
  // Komponen pemilih ukuran font
  const FontSizePicker = () => {
    const [tempSize, setTempSize] = useState(currentFontSize);
    const [previewSize, setPreviewSize] = useState(currentFontSize);
    
    return (
      <View style={styles.fontSizePickerContainer}>
        <Text style={styles.fontSizePickerTitle}>
          Ukuran font untuk baris {selectedLineIndex + 1}: {Math.round(previewSize)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={60}
          step={1}
          value={tempSize}
          onValueChange={(value) => {
            // Hanya update nilai preview, tidak mengubah text asli
            setPreviewSize(value);
          }}
          onSlidingComplete={(value) => {
            // Update nilai sebenarnya saat slider selesai
            setTempSize(value);
            setPreviewSize(value);
          }}
        />
        <View style={styles.fontSizeButtonsContainer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              // Terapkan perubahan hanya saat tombol Apply ditekan
              setCurrentFontSize(tempSize);
              setLineFontSize(selectedLineIndex, tempSize);
              setShowFontSizePicker(false);
            }}
          >
            <Text style={styles.applyButtonText}>Terapkan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              // Batalkan perubahan
              setShowFontSizePicker(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const pickImage = async (
    position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  ) => {
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
        switch (position) {
          case "topLeft":
            setTopLeftImage(result.assets[0]);
            break;
          case "topRight":
            setTopRightImage(result.assets[0]);
            break;
          case "bottomLeft":
            setBottomLeftImage(result.assets[0]);
            break;
          case "bottomRight":
            setBottomRightImage(result.assets[0]);
            break;
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
      if (
        !topLeftImage ||
        !topRightImage ||
        !bottomLeftImage ||
        !bottomRightImage
      ) {
        Alert.alert("Pilih semua foto dulu sebelum disimpan 😅");
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

  const renderImageSection = (
    image: any,
    caption: string,
    setCaption: (text: string) => void,
    placeholder: string
  ) => (
    <View style={styles.imageWrapper}>
      {image ? (
        <Image
          source={{ uri: image.uri }}
          style={[styles.placeholder, { aspectRatio }]}
        />
      ) : (
        <View style={[styles.placeholder, { aspectRatio }]}>
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      )}
      <TextInput
        style={[styles.imageCaption, { fontSize: imageFontSize }]}
        value={caption}
        onChangeText={setCaption}
        placeholder="Tambahkan caption..."
        placeholderTextColor="black"
        multiline={true}
        textAlignVertical="center"
        textAlign="center"
        submitBehavior="newline"
      />
    </View>
  );

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
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>{title}</Text>
            
            {/* Input untuk caption utama */}
            <View style={styles.captionInputContainer}>
              <Text style={styles.captionLabel}>Ketikan caption utama:</Text>
              <TextInput
                ref={inputRef}
                style={[styles.captionInput, { fontSize: mainFontSize }]}
                value={captionText}
                onChangeText={handleTextChange}
                placeholder="Tuliskan keterangan utama di sini..."
                placeholderTextColor="gray"
                multiline={true}
                textAlignVertical="center"
                submitBehavior="newline"
                returnKeyType="default"
                onBlur={() => Keyboard.dismiss()}
                onFocus={handleFocus}
              />
              <Text style={styles.captionInstructions}>
                Ketuk pada baris caption untuk mengubah warnanya/ukuran font
              </Text>
            </View>
            
            {/* Menu formatting dan picker */}
            {showFormatMenu && <FormatMenu />}
            {showColorPicker && <SimpleColorPicker />}
            {showFontSizePicker && <FontSizePicker />}
            
            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
              <View style={styles.quadImageContainer}>
                {/* Rendered formatted caption */}
                <View style={styles.captionContainer}>
                  {renderFormattedCaption()}
                </View>

                <View style={styles.imagesGrid}>
                  <View style={styles.imageRow}>
                    {renderImageSection(
                      topLeftImage,
                      topLeftCaption,
                      setTopLeftCaption,
                      "Pilih Gambar Kiri Atas"
                    )}
                    {renderImageSection(
                      topRightImage,
                      topRightCaption,
                      setTopRightCaption,
                      "Pilih Gambar Kanan Atas"
                    )}
                  </View>
                  <View style={styles.imageRow}>
                    {renderImageSection(
                      bottomLeftImage,
                      bottomLeftCaption,
                      setBottomLeftCaption,
                      "Pilih Gambar Kiri Bawah"
                    )}
                    {renderImageSection(
                      bottomRightImage,
                      bottomRightCaption,
                      setBottomRightCaption,
                      "Pilih Gambar Kanan Bawah"
                    )}
                  </View>
                </View>
              </View>
            </ViewShot>

            <View style={styles.buttonGrid}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => pickImage("topLeft")}
                >
                  <Text style={styles.buttonText}>PILIH KIRI ATAS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => pickImage("topRight")}
                >
                  <Text style={styles.buttonText}>PILIH KANAN ATAS</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => pickImage("bottomLeft")}
                >
                  <Text style={styles.buttonText}>PILIH KIRI BAWAH</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => pickImage("bottomRight")}
                >
                  <Text style={styles.buttonText}>PILIH KANAN BAWAH</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
            </TouchableOpacity>

            <View style={styles.fontSizeControl}>

              <View style={styles.sliderContainer}>
                <Text style={styles.fontSizeText}>
                  Ukuran Font Caption Gambar: {tempImageFontSize}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={60}
                  step={1}
                  value={imageFontSize}
                  onValueChange={setTempImageFontSize}
                  onSlidingComplete={setImageFontSize}
                />
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
    paddingTop: hp("2%"),
    paddingBottom: hp("2%"),
  },
  header: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(24, 812),
    color: "#6A1B9A",
    marginBottom: hp("2%"),
    textAlign: "center",
    paddingHorizontal: wp("2%")
  },
  captionInputContainer: {
    width: wp("95%"),
    marginBottom: hp("2%"),
  },
  captionLabel: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(14, 812),
    color: "#6A1B9A",
    marginBottom: hp("1%"),
  },
  captionInput: {
    fontFamily: "Roboto",
    padding: wp("2%"),
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    minHeight: hp("10%"),
    textAlignVertical: "top",
  },
  captionInstructions: {
    fontFamily: "Roboto",
    fontSize: RFValue(10, 812),
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  formatMenuContainer: {
    width: wp("95%"),
    padding: wp("3%"),
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: hp("2%"),
  },
  formatMenuTitle: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(14, 812),
    marginBottom: hp("1%"),
    color: "#333",
  },
  formatOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp("1%"),
  },
  formatButton: {
    backgroundColor: "#6A1B9A",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 20,
  },
  formatButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(12, 812),
  },
  closeButton: {
    backgroundColor: "#999",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("4%"),
    borderRadius: 20,
  },
  closeButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(12, 812),
  },
  colorPickerContainer: {
    width: wp("95%"),
    padding: wp("3%"),
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: hp("2%"),
  },
  colorPickerTitle: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(12, 812),
    marginBottom: hp("1%"),
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  colorOption: {
    width: wp("12%"),
    height: wp("12%"),
    borderRadius: wp("6%"),
    margin: wp("1%"),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fontSizePickerContainer: {
    width: wp("95%"),
    padding: wp("3%"),
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: hp("2%"),
  },
  fontSizePickerTitle: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(12, 812),
    marginBottom: hp("1%"),
  },
  fontSizeButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: "#6A1B9A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  applyButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(12, 812),
  },
  cancelButton: {
    backgroundColor: "#999",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  cancelButtonText: {
    fontFamily: "RobotoBold",
    color: "white",
    fontSize: RFValue(12, 812),
  },
  quadImageContainer: {
    width: wp("95%"),
    borderWidth: 1,
    borderColor: "#000",
    paddingStart: wp("1%"),
    paddingEnd: wp("1%"),
    paddingTop: hp("0.5%"),
    backgroundColor: "#2e3c45",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captionContainer: {
    backgroundColor: "white",
    padding: wp("2%"),
    width: "100%",
    marginBottom: hp("1%"),
  },
  captionText: {
    fontFamily: "RobotoBold",
    textAlign: "center",
  },
  imagesGrid: {
    width: "100%",
    marginTop: hp("1%"),
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  imageWrapper: {
    width: "49%",
    alignItems: "center",
  },
  placeholder: {
    width: "100%",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGrid: {
    width: wp("90%"),
    marginTop: hp("2%"),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
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
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(12, 812),
    color: "#666",
    textAlign: "center",
  },
  caption: {
    fontFamily: "RobotoBold",
    padding: wp("2%"),
    backgroundColor: "white",
    color: "maroon",
    textAlign: "center",
    width: "100%",
    marginBottom: hp("2%"),
  },
  imageCaption: {
    fontFamily: "RobotoBold",
    padding: wp("2%"),
    backgroundColor: "white",
    color: "black",
    fontSize: RFValue(12),
    textAlign: "center",
    width: "100%",
    marginTop: hp("0.5%"),
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "yellow",
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
    fontSize: RFValue(16, 812),
  },
  fontSizeControl: {
    marginTop: hp("2%"),
    marginBottom: hp("2%"),
    width: wp("80%"),
    alignItems: "center",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: hp("2%"),
    alignItems: "center",
  },
  fontSizeText: {
    fontFamily: "Roboto",
    fontSize: RFValue(14, 812),
    marginBottom: hp("1%"),
    textAlign: "center",
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

export default TemplateImgQuad;