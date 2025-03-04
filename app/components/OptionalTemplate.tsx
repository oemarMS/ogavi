import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";

// Dimensi layar untuk responsivitas
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OptionalTemplateProps {
  navigation?: any;
}

interface ImageState {
  uri: string;
}

/**
 * Komponen Optional Template
 * 
 * Komponen ini memvisualisasikan pembuatan infografis 
 * dengan kemampuan memilih gambar dari galeri dan mengubah semua teks secara dinamis
 */
const OptionalTemplate: React.FC<OptionalTemplateProps> = ({ navigation }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk gambar-gambar
  const [logoOptional, setLogoOptional] = useState<ImageState | null>(null);
  const [optionalImage1, setOptionalImage1] = useState<ImageState | null>(null);
  const [optionalImage2, setOptionalImage2] = useState<ImageState | null>(null);
  const [optionalImage3, setOptionalImage3] = useState<ImageState | null>(null);
  const [optionalImage4, setOptionalImage4] = useState<ImageState | null>(null);
  
  // State untuk teks-teks yang bisa diedit
const [headerTitle1, setHeaderTitle1] = useState("LOREM IPSUM ODOR AMET, CONSECTETUER ADIPISCING ELIT. DAPIBUS SEMPER DUIS MAGNIS ET HABITANT. CLASS EGET ADIPISCING SED CONUBIA CURAE.");
  const [updateText, setUpdateText] = useState("UPDATE XX MAR 2025, PKL 18.00 WIB");
  
  // State untuk section EXSUM
  const [exsumText, setExsumText] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );
  
  // State untuk section 2
  const [sec2Title1, setSec2Title1] = useState("AKSI UNJUK RASA (AUR) OLEH XXXXXXXXX DENGAN TEMA XXXXX DI XXXXX");
  const [sec2Text, setSec2Text] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );
  
  // State untuk section 3
  const [sec3Title, setsec3Title] = useState("PATROLI SIBER");
  const [sec3Text, setsec3Text] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );
  
  // State untuk section 4
  const [sec4Title1, setsec4Title1] = useState("UPAYA ABUSE REPORT SITUS BLOG TERKAIT AKSI INDONESIA GELAP");
  const [sec4Text, setsec4Text] = useState(
    "Pada 3 Maret 2025, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  );
  
  // State untuk section Langkah Tindak
  const [langkahTitle, setLangkahTitle] = useState("LANGKAH TINDAK");
  const [langkahText1, setLangkahText1] = useState(
    "1. Lorem ipsum odor amet, consectetuer adipiscing elit. Dapibus semper duis magnis et habitant. Class eget adipiscing sed conubia curae."
  );
  const [langkahText2, setLangkahText2] = useState(
    "2. Lorem ipsum odor amet, consectetuer adipiscing elit. Dapibus semper duis magnis et habitant. Class eget adipiscing sed conubia curae."
  );
  const [langkahText3, setLangkahText3] = useState(
    "3. Lorem ipsum odor amet, consectetuer adipiscing elit. Dapibus semper duis magnis et habitant. Class eget adipiscing sed conubia curae."
  );
  
  // State untuk footer
  const [footerText, setFooterText] = useState("Merpati-08");

  /**
   * Fungsi untuk memilih gambar dari galeri
   * @param setter - State setter untuk menyimpan gambar yang dipilih
   * @param title - Judul untuk dialog pemilihan gambar
   */
  const pickImage = async (
    setter: React.Dispatch<React.SetStateAction<ImageState | null>>,
    title: string
  ) => {
    setIsLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setter({
          uri: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert("Error!", `Terjadi kesalahan saat memilih gambar: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fungsi untuk menyimpan infografis ke galeri
   */
  const saveToGallery = async () => {
    try {
      // Request permission first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi memerlukan izin untuk menyimpan ke galeri"
        );
        return;
      }
      
      // Dismiss keyboard before capture
      Keyboard.dismiss();
      
      // Wait a bit for keyboard to fully dismiss
      setTimeout(async () => {
        setIsLoading(true);
        
        if (viewShotRef.current && viewShotRef.current.capture) {
          const uri = await viewShotRef.current.capture();
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert("Berhasil", "Infografis telah disimpan ke galeri");
        } else {
          Alert.alert("Error", "ViewShot ref tidak tersedia");
        }
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.error("Error saving to gallery:", error);
      Alert.alert("Error", "Gagal menyimpan ke galeri");
      setIsLoading(false);
    }
  };

  // Function to handle text input focus and scroll adjustment
  const handleFocus = (y: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: y - hp("10%"), 
        animated: true
      });
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? hp("2%") : 0}
    >
      <StatusBar style="light" />
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F3D270" />
        </View>
      )}
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: "png", quality: 0.9 }}
            style={styles.viewShotContainer}
          >
            {/* Header Section */}
            <View style={styles.headerContainer}>
              <TouchableOpacity 
                style={styles.logoContainer}
                onPress={() => pickImage(setLogoOptional, "Pilih Logo Optional")}
              >
                {logoOptional ? (
                  <Image
                    source={{ uri: logoOptional.uri }}
                    style={styles.logoOptional}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>Logo</Text>
                    <Text style={styles.tapText}>Ketuk</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <TextInput
                  style={styles.headerTitleInput}
                  value={headerTitle1}
                  onChangeText={setHeaderTitle1}
                  multiline={true}
                  onFocus={() => handleFocus(0)}
                />
                <TextInput
                  style={styles.updateTextInput}
                  value={updateText}
                  onChangeText={setUpdateText}
                  multiline={true}
                  onFocus={() => handleFocus(150)}
                />
              </View>
            </View>

            {/* Section 01 - EXSUM */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.numberBadge}>
                  <Text style={styles.sectionNumber}>01</Text>
                </View>
                <Text style={styles.sectionTitle}>EXSUM</Text>
              </View>
              <TextInput
                style={styles.contentTextInput}
                value={exsumText}
                onChangeText={setExsumText}
                multiline={true}
                onFocus={() => handleFocus(250)}
              />
            </View>

            {/* Section 02 - AKSI UNJUK RASA */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.numberBadge, styles.orangeBadge]}>
                  <Text style={styles.sectionNumber}>02</Text>
                </View>
                <View style={styles.titleContainer}>
                  <TextInput
                    style={styles.sectionTitleInput}
                    value={sec2Title1}
                    onChangeText={setSec2Title1}
                    multiline={true}
                    onFocus={() => handleFocus(350)}
                  />
                </View>
              </View>
              
              <View style={styles.optImage1Container}>
                <TouchableOpacity 
                  style={styles.imagePickerContainer}
                  onPress={() => pickImage(setOptionalImage1, "opt Gambar 1")}
                >
                  {optionalImage1 ? (
                    <Image
                      source={{ uri: optionalImage1.uri }}
                      style={styles.optImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.optImagePlaceholder, styles.optImage]}>
                      <Text style={styles.placeholderText}>Gambar opt 1</Text>
                      <Text style={styles.tapText}>Ketuk untuk pilih</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TextInput
                  style={styles.sec2TextInput}
                  value={sec2Text}
                  onChangeText={setSec2Text}
                  multiline={true}
                  onFocus={() => handleFocus(500)}
                />
                
                <TouchableOpacity 
                  style={styles.imagePickerContainer}
                  onPress={() => pickImage(setOptionalImage2, "opt Gambar 2")}
                >
                  {optionalImage2 ? (
                    <Image
                      source={{ uri: optionalImage2.uri }}
                      style={styles.optImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.optImagePlaceholder, styles.optImage]}>
                      <Text style={styles.placeholderText}>Gambar opt 2</Text>
                      <Text style={styles.tapText}>Ketuk untuk pilih</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 03 - SECTION 3 */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.numberBadge, styles.orangeBadge]}>
                  <Text style={styles.sectionNumber}>03</Text>
                </View>
                <TextInput
                  style={styles.sectionTitleInput}
                  value={sec3Title}
                  onChangeText={setsec3Title}
                  multiline={true}
                  onFocus={() => handleFocus(700)}
                />
              </View>
              
              <View style={styles.sec3Container}>
                <View style={styles.sec3TextContainer}>
                  <TextInput
                    style={styles.contentTextInput}
                    value={sec3Text}
                    onChangeText={setsec3Text}
                    multiline={true}
                    onFocus={() => handleFocus(750)}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.sec3ImageContainer}
                  onPress={() => pickImage(setOptionalImage3, "Gambar Sec 3")}
                >
                  {optionalImage3 ? (
                    <Image
                      source={{ uri: optionalImage3.uri }}
                      style={styles.optionalImage3}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.imagePlaceholder, styles.optionalImage3]}>
                      <Text style={styles.placeholderText}>Sec 3</Text>
                      <Text style={styles.tapText}>Ketuk</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 04 - UPAYA Sec 4 */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.numberBadge, styles.orangeBadge]}>
                  <Text style={styles.sectionNumber}>04</Text>
                </View>
                <View style={styles.titleContainer}>
                  <TextInput
                    style={styles.sectionTitleInput}
                    value={sec4Title1}
                    onChangeText={setsec4Title1}
                    multiline={true}
                    onFocus={() => handleFocus(850)}
                  />
                </View>
              </View>
              
              <View style={styles.sec4Container}>
                <TouchableOpacity 
                  style={styles.sec4ImageContainer}
                  onPress={() => pickImage(setOptionalImage4, "Gambar Sec 4")}
                >
                  {optionalImage4 ? (
                    <Image
                      source={{ uri: optionalImage4.uri }}
                      style={styles.optionalImage4}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.imagePlaceholder, styles.optionalImage4]}>
                      <Text style={styles.placeholderText}>Sec 4</Text>
                      <Text style={styles.tapText}>Ketuk</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.sec4TextContainer}>
                  <TextInput
                    style={styles.contentTextInput}
                    value={sec4Text}
                    onChangeText={setsec4Text}
                    multiline={true}
                    onFocus={() => handleFocus(950)}
                  />
                </View>
              </View>
            </View>

            {/* Section 05 - LANGKAH TINDAK */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.numberBadge, styles.orangeBadge]}>
                  <Text style={styles.sectionNumber}>05</Text>
                </View>
                <TextInput
                  style={styles.sectionTitleInput}
                  value={langkahTitle}
                  onChangeText={setLangkahTitle}
                  multiline={true}
                  onFocus={() => handleFocus(1050)}
                />
              </View>
              
              <View style={styles.langkahContainer}>
                <TextInput
                  style={styles.langkahTextInput}
                  value={langkahText1}
                  onChangeText={setLangkahText1}
                  multiline={true}
                  onFocus={() => handleFocus(1100)}
                />
                <TextInput
                  style={styles.langkahTextInput}
                  value={langkahText2}
                  onChangeText={setLangkahText2}
                  multiline={true}
                  onFocus={() => handleFocus(1150)}
                />
                <TextInput
                  style={styles.langkahTextInput}
                  value={langkahText3}
                  onChangeText={setLangkahText3}
                  multiline={true}
                  onFocus={() => handleFocus(1200)}
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TextInput
                style={styles.footerTextInput}
                value={footerText}
                onChangeText={setFooterText}
                multiline={true}
                onFocus={() => handleFocus(1300)}
              />
            </View>
          </ViewShot>
          
          {/* Save Button - Outside ViewShot */}
          <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
            <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
          </TouchableOpacity>
          
          {/* Help text */}
          <Text style={styles.helpText}>
            Ketuk area gambar untuk memilih dari galeri.{"\n"}
            Ketuk teks untuk mengubah konten.
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A2E5A", // Warna biru gelap
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp("5%"),
  },
  viewShotContainer: {
    backgroundColor: "#1A2E5A",
    paddingHorizontal: wp("2%"),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp("2%"),
    paddingTop: hp("1%"),
  },
  logoContainer: {
    width: wp("18%"),
    height: wp("18%"),
    marginRight: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
  },
  logoOptional: {
    width: wp("18%"),
    height: wp("18%"),
    borderRadius: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitleInput: {
    color: "#F3D270", // Warna emas
    fontSize: RFValue(14, 812),
    fontFamily: "RobotoBold",
    marginVertical: hp("0.2%"),
    padding: wp("1%"),
    textAlign: "justify",
  },
  updateTextInput: {
    color: "#FFFFFF",
    fontSize: RFValue(11, 812),
    marginTop: hp("0.1%"),
    fontFamily: "Roboto",
    padding: wp("1%"),
  },
  imagePlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    width: wp("18%"),
    height: wp("18%"),
    borderWidth: 1,
    borderColor: "#F3D270",
    borderStyle: "dashed",
  },
  sectionContainer: {
    marginTop: hp("1.5%"),
    paddingHorizontal: wp("2%"),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp("0.5%"),
  },
  numberBadge: {
    width: wp("10%"),
    height: wp("10%"),
    backgroundColor: "#F3D270", // Warna emas
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("2%"),
  },
  orangeBadge: {
    backgroundColor: "#E75243", // Warna oranye/merah
  },
  sectionNumber: {
    color: "#FFFFFF",
    fontSize: RFValue(16, 812),
    fontFamily: "RobotoBold",
  },
  titleContainer: {
    flex: 1,
  },
  sectionTitle: {
    color: "#F3D270", // Warna emas
    fontSize: RFValue(14, 812),
    fontFamily: "RobotoBold",
  },
  sectionTitleInput: {
    color: "#F3D270", // Warna emas
    fontSize: RFValue(14, 812),
    fontFamily: "RobotoBold",
    padding: wp("1%"),
    textAlign: "justify",
  },
  contentTextInput: {
    color: "#FFFFFF",
    fontSize: RFValue(11, 812),
    marginTop: hp("0.5%"),
    textAlign: "justify",
    fontFamily: "Roboto",
    padding: wp("1%"),
  },
  optImage1Container: {
    marginTop: hp("0.5%"),
  },
  imagePickerContainer: {
    width: "100%",
    height: hp("18%"),
    marginVertical: hp("0.5%"),
  },
  optImage: {
    width: "100%",
    height: hp("18%"),
    borderRadius: 8,
  },
  optImagePlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3D270",
    borderStyle: "dashed",
  },
  placeholderText: {
    color: "#F3D270",
    fontSize: RFValue(12, 812),
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  tapText: {
    color: "#FFFFFF",
    fontSize: RFValue(9, 812),
    textAlign: "center",
    marginTop: hp("0.3%"),
    fontFamily: "Roboto",
  },
  sec2TextInput: {
    color: "#FFFFFF",
    fontSize: RFValue(11, 812),
    marginVertical: hp("0.5%"),
    textAlign: "justify",
    fontFamily: "Roboto",
    padding: wp("1%"),
  },
  sec3Container: {
    flexDirection: "row",
    marginTop: hp("0.5%"),
    alignItems: "center",
  },
  sec3TextContainer: {
    flex: 1,
    marginRight: wp("1%"),
  },
  sec3ImageContainer: {
    width: wp("28%"),
    height: hp("15%"),
  },
  optionalImage3: {
    width: wp("28%"),
    height: hp("15%"),
    borderRadius: 8,
  },
  sec4Container: {
    flexDirection: "row",
    marginTop: hp("0.5%"),
    alignItems: "center",
  },
  sec4TextContainer: {
    flex: 1,
    marginLeft: wp("1%"),
  },
  sec4ImageContainer: {
    width: wp("40%"),
    height: hp("18%"),
  },
  optionalImage4: {
    width: wp("40%"),
    height: hp("18%"),
    borderRadius: 8,
  },
  langkahContainer: {
    marginTop: hp("0.5%"),
  },
  langkahTextInput: {
    color: "#FFFFFF",
    fontSize: RFValue(11, 812),
    marginBottom: hp("0.5%"),
    textAlign: "justify",
    fontFamily: "Roboto",
    fontStyle: "italic",
    padding: wp("1%"),
  },
  footer: {
    alignItems: "center",
    marginTop: hp("3%"),
    marginBottom: hp("1%"),
  },
  footerTextInput: {
    color: "#FFFFFF",
    fontSize: RFValue(14, 812),
    backgroundColor: "#1A2E5A",
    paddingHorizontal: wp("10%"),
    paddingVertical: hp("0.5%"),
    borderRadius: 50,
    overflow: "hidden",
    fontFamily: "RobotoBold",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#F3D270",
    paddingVertical: hp("1.5%"),
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: wp("4%"),
    marginTop: hp("2%"),
  },
  saveButtonText: {
    fontFamily: "RobotoBold",
    color: "#1A2E5A",
    fontSize: RFValue(16, 812),
  },
  helpText: {
    color: "#F3D270",
    fontSize: RFValue(11, 812),
    textAlign: "center",
    marginTop: hp("1%"),
    fontFamily: "Roboto",
    padding: wp("2%"),
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    marginHorizontal: wp("4%"),
  },
});

export default OptionalTemplate;