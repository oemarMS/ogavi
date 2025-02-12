import React, { useState, useRef } from "react";
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
} from "react-native";
import Slider from '@react-native-community/slider';
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import ViewShot from "react-native-view-shot";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Font from 'expo-font';

const Template2: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [fontSize, setFontSize] = useState(14); // State untuk ukuran font
  const [fontsLoaded] = Font.useFonts({
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const viewShotRef = useRef<ViewShot>(null);

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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4], // Rasio 3:4 untuk gambar
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin diperlukan", "Izinkan akses ke galeri untuk menyimpan gambar.");
        return;
      }
  
      if (viewShotRef.current && typeof viewShotRef.current.capture === "function") {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Berhasil", "Gambar telah disimpan ke galeri!");
      } else {
        Alert.alert("Gagal", "Ref ViewShot tidak tersedia atau tidak memiliki metode capture.");
      }
    } catch (error) {
      console.log("Error saat menyimpan:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan gambar.");
    }
  };

  if (!fontsLoaded) {
    return <View><Text>Loading fonts...</Text></View>;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.header}>Template 3:4</Text>
            <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }}>
              <View style={styles.imageContainer}>
                {selectedImage ? (
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    style={[styles.placeholder, { resizeMode: 'contain' }]} 
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>Pilih Gambar dari Galeri</Text>
                  </View>
                )}
                <TextInput
                  ref={inputRef}
                  style={[styles.caption, { fontSize: fontSize }]} // Menyesuaikan ukuran font
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

            {/* Slider untuk mengubah ukuran font */}
            <View style={styles.fontSizeControl}>
              <Text style={styles.fontSizeText}>Ukuran Font: {fontSize}</Text>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={30}
                step={1}
                value={fontSize}
                onValueChange={(value) => setFontSize(value)} // Update ukuran font
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
    aspectRatio: 3/4, // Rasio 3:4
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
    backgroundColor: "red",
    color: "white",
    fontSize: RFValue(12),
    fontWeight: "bold",
    fontFamily: 'Roboto',
    minHeight: hp('5%'),
    maxHeight: hp('20%'),
    textAlignVertical: 'center',
    flexGrow: 1,
    flexWrap: 'wrap',
  },
  button: {
    marginTop: hp('2%'),
    padding: wp('3%'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp('80%'),
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
    borderRadius: 10,
    alignItems: "center",
    width: wp('80%'),
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
  },
  fontSizeText: {
    fontSize: RFValue(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  slider: {
    width: wp('80%'),
    height: hp('3%'),
  },
});

export default Template2;
