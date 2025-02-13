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
import Slider from '@react-native-community/slider';
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Font from 'expo-font';

// Props interface buat customization
interface TemplateBaseProps {
  aspectRatio: number;     // Buat ngatur ratio image (e.g., 4/3, 3/4, 16/9)
  title: string;          // Title template (e.g., "Template 4:3")
  needsPermission?: boolean; // Optional permission check
}

const TemplateBase: React.FC<TemplateBaseProps> = ({
  aspectRatio,
  title,
  needsPermission = false
}) => {
  // State management
  const [selectedImage, setSelectedImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  
  // Font loading
  const [fontsLoaded] = Font.useFonts({
    'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
  });

  // Refs setup
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);

  // Permission check (kalo needsPermission = true)
  useEffect(() => {
    if (needsPermission) {
      const requestPermission = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Maaf, kami butuh izin untuk bisa menyimpan gambar ke galeri!');
        }
      };
      requestPermission();
    }
  }, [needsPermission]);

  // Handlers
  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.measureInWindow((x, y, width, height) => {
        scrollViewRef.current?.scrollTo({
          y: y,
          animated: true
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

  const pickImage = async () => {
    setIsLoading(true);
    try {
      // Kalo aspect ratio 4:3, array-nya harus [4, 3]
      // Kalo 3:4, array-nya harus [3, 4]
      // Kalo 16:9, array-nya harus [16, 9]
      const [width, height] = aspectRatio > 1 
        ? [Math.round(aspectRatio * 10), 10]  // untuk ratio > 1 (misal 4:3)
        : [10, Math.round((1/aspectRatio) * 10)];  // untuk ratio < 1 (misal 3:4)
  
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [width, height],  // 👈 Fix aspect ratio disini
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Ups!", "Ada masalah pas ambil foto nih");
    } finally {
      setIsLoading(false);
    }
  };

  const saveToGallery = async () => {
    try {
      if (!selectedImage) {
        Alert.alert("Eh!", "Pilih foto dulu dong sebelum simpan 😅");
        return;
      }

      if (needsPermission) {
        const { status } = await MediaLibrary.getPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Maaf, aplikasi butuh izin untuk bisa menyimpan gambar ke galeri!');
          return;
        }
      }

      if (viewShotRef.current && typeof viewShotRef.current.capture === "function") {
        setIsLoading(true);
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("🎉 Mantap!", "Foto lu udah kesimpen di galeri!");
      }
    } catch (error) {
      console.log("Error pas nyimpen:", error);
      Alert.alert("Waduh!", "Sorry nih, ada error pas nyimpen. Coba lagi ya!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
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
              <View style={styles.imageContainer}>
                {selectedImage ? (
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    style={[styles.placeholder, { aspectRatio }]} 
                  />
                ) : (
                  <View style={[styles.placeholder, { aspectRatio }]}>
                    <Text style={styles.placeholderText}>Pilih Gambar dari Galeri</Text>
                  </View>
                )}
                <TextInput
                  ref={inputRef}
                  style={[styles.caption, { fontSize: fontSize }]}
                  value={captionText}
                  onChangeText={handleTextChange}
                  placeholder="Ketik keterangan gambar di sini..."
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

            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>+ PILIH GAMBAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
            </TouchableOpacity>

            <View style={styles.fontSizeControl}>
              <Text style={styles.fontSizeText}>Ukuran Font: {tempFontSize}</Text>
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
    justifyContent: 'space-between',
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp('2%'),
    paddingBottom: hp('2%'),
  },
  header: {
    fontSize: RFValue(24),
    fontFamily: 'Roboto',
    fontWeight: "bold",
    color: "#6A1B9A",
    marginBottom: hp('2%'),
  },
  imageContainer: {
    width: wp('90%'),
    borderWidth: 1,
    borderColor: '#ccc',
    padding: wp('1%'),
    backgroundColor: '#fff',
  },
  placeholder: {
    width: wp('88%'),
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: 'center',
  },
  placeholderText: {
    fontFamily: 'Roboto',
    fontSize: RFValue(14),
    color: '#666',
  },
  caption: {
    marginTop: hp('0.5%'),
    padding: wp('2%'),
    backgroundColor: "red",
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "bold",
    fontFamily: 'Roboto',
    maxHeight: hp('20%'),
    textAlignVertical: 'center',
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  button: {
    marginTop: hp('2%'),
    padding: wp('3%'),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp('50%'),
  },
  buttonText: {
    color: "#6A1B9A",
    fontSize: RFValue(16),
    fontFamily: 'Roboto',
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: hp('1%'),
    backgroundColor: "#6A1B9A",
    padding: wp('3%'),
    borderRadius: 100,
    alignItems: "center",
    width: wp('50%'),
  },
  saveButtonText: {
    color: "white",
    fontSize: RFValue(16),
    fontFamily: 'Roboto',
    fontWeight: "bold",
  },
  fontSizeControl: {
    marginTop: hp('2%'),
    width: wp('80%'),
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fontSizeText: {
    fontSize: RFValue(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  slider: {
    width: wp('80%'),
    height: 40,
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontWeight: '500',
    fontSize: RFValue(16),
    color: '#6A1B9A',
  },
});

export default TemplateBase;