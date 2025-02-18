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

interface TemplateImgQuadProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

const TemplateImgQuad: React.FC<TemplateImgQuadProps> = ({
  aspectRatio,
  title,
  needsPermission = false
}) => {
  const [topLeftImage, setTopLeftImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [topRightImage, setTopRightImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [bottomLeftImage, setBottomLeftImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [bottomRightImage, setBottomRightImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [topLeftCaption, setTopLeftCaption] = useState('');
  const [topRightCaption, setTopRightCaption] = useState('');
  const [bottomLeftCaption, setBottomLeftCaption] = useState('');
  const [bottomRightCaption, setBottomRightCaption] = useState('');
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
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Maaf, kami butuh izin untuk bisa menyimpan gambar ke galeri!');
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
          animated: true
        });
      });
    }, 100);
  };

  const pickImage = async (position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    setIsLoading(true);
    try {
      const [width, height] = aspectRatio > 1 
        ? [Math.round(aspectRatio * 10), 10]
        : [10, Math.round((1/aspectRatio) * 10)];

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [width, height],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        switch(position) {
          case 'topLeft':
            setTopLeftImage(result.assets[0]);
            break;
          case 'topRight':
            setTopRightImage(result.assets[0]);
            break;
          case 'bottomLeft':
            setBottomLeftImage(result.assets[0]);
            break;
          case 'bottomRight':
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
      if (!topLeftImage || !topRightImage || !bottomLeftImage || !bottomRightImage) {
        Alert.alert("Pilih semua foto dulu sebelum disimpan 😅");
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
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
    'RobotoBold': require('../../assets/fonts/Roboto-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

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
        placeholderTextColor='maroon'
        multiline={true}
        textAlignVertical="center"
        textAlign="center"
        blurOnSubmit={true}
      />
    </View>
  );

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
              <View style={styles.quadImageContainer}>
                <TextInput
                  ref={inputRef}
                  style={[styles.caption, { fontSize: mainFontSize }]}
                  value={captionText}
                  onChangeText={setCaptionText}
                  placeholder="Tuliskan keterangan utama di sini..."
                  placeholderTextColor='maroon'
                  multiline={true}
                  textAlignVertical="top"
                  textAlign="center"
                  blurOnSubmit={false}
                  onFocus={handleFocus}
                />

                <View style={styles.imagesGrid}>
                  <View style={styles.imageRow}>
                    {renderImageSection(topLeftImage, topLeftCaption, setTopLeftCaption, "Pilih Gambar Kiri Atas")}
                    {renderImageSection(topRightImage, topRightCaption, setTopRightCaption, "Pilih Gambar Kanan Atas")}
                  </View>
                  <View style={styles.imageRow}>
                    {renderImageSection(bottomLeftImage, bottomLeftCaption, setBottomLeftCaption, "Pilih Gambar Kiri Bawah")}
                    {renderImageSection(bottomRightImage, bottomRightCaption, setBottomRightCaption, "Pilih Gambar Kanan Bawah")}
                  </View>
                </View>
              </View>
            </ViewShot>

            <View style={styles.buttonGrid}>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('topLeft')}>
                  <Text style={styles.buttonText}>PILIH KIRI ATAS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('topRight')}>
                  <Text style={styles.buttonText}>PILIH KANAN ATAS</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('bottomLeft')}>
                  <Text style={styles.buttonText}>PILIH KIRI BAWAH</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => pickImage('bottomRight')}>
                  <Text style={styles.buttonText}>PILIH KANAN BAWAH</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveToGallery}>
              <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
            </TouchableOpacity>

            <View style={styles.fontSizeControl}>
              <View style={styles.sliderContainer}>
                <Text style={styles.fontSizeText}>Ukuran Font Caption Utama: {tempMainFontSize}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={30}
                  step={1}
                  value={mainFontSize}
                  onValueChange={setTempMainFontSize}
                  onSlidingComplete={setMainFontSize}
                />
              </View>
              
              <View style={styles.sliderContainer}>
                <Text style={styles.fontSizeText}>Ukuran Font Caption Gambar: {tempImageFontSize}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={30}
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
    fontFamily: 'RobotoBold',
    fontSize: RFValue(24),
    color: "#6A1B9A",
    marginBottom: hp('2%'),
  },
  quadImageContainer: {
    width: wp('95%'),
    borderWidth: 1,
    borderColor: '#000',
    paddingStart: wp('1%'),
    paddingEnd: wp('1%'),
    paddingTop: hp('0.5%'),
    //paddingBottom: hp('1%'),
    backgroundColor: '#2e3c45',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesGrid: {
    width: '100%',
    marginTop: hp('1%'),
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  imageWrapper: {
    width: '49%',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonGrid: {
    width: wp('90%'),
    marginTop: hp('2%'),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1%'),
  },
  button: {
    padding: wp('3%'),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp('43%'),
  },
  buttonText: {
    fontFamily: 'RobotoBold',
    color: "#6A1B9A",
    fontSize: RFValue(12),
  },
  placeholderText: {
    fontFamily: 'Roboto',
    fontSize: RFValue(12),
    color: '#666',
    textAlign: 'center',
  },
  caption: {
    fontFamily: 'RobotoBold',
    padding: wp('2%'),
    backgroundColor: "white",
    color: "maroon",
    fontSize: RFValue(12),
    textAlign: 'center',
    width: '100%',
    marginBottom: hp('2%'),
  },
  imageCaption: {
    fontFamily: 'RobotoBold',
    padding: wp('2%'),
    backgroundColor: 'white',
    color: 'maroon',
    fontSize: RFValue(12),
    textAlign: 'center',
    width: '100%',
    marginTop: hp('0.5%'),
    flexGrow: 1,
  },
  saveButton: {
    marginTop: hp('2%'),
    backgroundColor: "#6A1B9A",
    padding: wp('3%'),
    borderRadius: 100,
    alignItems: "center",
    width: wp('50%'),
  },
  saveButtonText: {
    fontFamily: 'RobotoBold',
    color: "white",
    fontSize: RFValue(16),
  },
  fontSizeControl: {
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    width: wp('80%'),
    alignItems: 'center',
  },
  sliderContainer: {
    width: '100%',
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
  fontSizeText: {
    fontFamily: 'Roboto',
    fontSize: RFValue(14),
    marginBottom: hp('1%'),
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
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

export default TemplateImgQuad;