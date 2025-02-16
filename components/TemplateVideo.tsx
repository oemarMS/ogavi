import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
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
import { Video, ResizeMode } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import Slider from '@react-native-community/slider';
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Font from 'expo-font';

interface TemplateVideoProps {
  aspectRatio: number;
  title: string;
  needsPermission?: boolean;
}

const TemplateVideo: React.FC<TemplateVideoProps> = ({
  aspectRatio,
  title,
  needsPermission = false
}) => {
  // State management
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({});
  const videoRef = useRef(null);

  // Refs setup
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (needsPermission) {
      const requestPermissions = async () => {
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert('Izin Ditolak', 'Maaf, kami butuh izin untuk mengakses media!');
        }
      };
      requestPermissions();
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

  const handleTextChange = (text: string) => {
    setCaptionText(text);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickVideo = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [aspectRatio > 1 ? 16 : 9, aspectRatio > 1 ? 9 : 16],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedVideo({ uri: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Ada masalah saat memilih video");
    } finally {
      setIsLoading(false);
    }
  };

  const processVideo = async () => {
    if (!selectedVideo) {
      Alert.alert("Pilih video dulu sebelum disimpan 😅");
      return;
    }

    setIsLoading(true);
    try {
      // Di sini Anda perlu mengimplementasikan logika untuk menggabungkan
      // video dengan caption menggunakan FFmpeg atau library video processing lainnya
      
      // Contoh pseudo-code:
      // const processedUri = await processVideoWithCaption(selectedVideo.uri, captionText);
      // await MediaLibrary.saveToLibraryAsync(processedUri);
      
      Alert.alert("🎉 Video berhasil tersimpan di galeri");
    } catch (error) {
      console.log("Error saat memproses video:", error);
      Alert.alert("Error", "Gagal memproses video");
    } finally {
      setIsLoading(false);
    }
  };

  const [fontsLoaded] = Font.useFonts({
    'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
    'RobotoBold': require('../assets/fonts/Roboto-Bold.ttf'),
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
            <View style={styles.videoContainer}>
              {selectedVideo ? (
                <Video
                  ref={videoRef}
                  style={[styles.video, { aspectRatio }]}
                  source={{ uri: selectedVideo.uri }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={status => setStatus(() => status)}
                />
              ) : (
                <View style={[styles.placeholder, { aspectRatio }]}>
                  <Text style={styles.placeholderText}>Pilih Video dari Galeri</Text>
                </View>
              )}
              <TextInput
                ref={inputRef}
                style={[styles.caption, { fontSize: fontSize }]}
                value={captionText}
                onChangeText={handleTextChange}
                placeholder="Tuliskan keterangan video di sini..."
                placeholderTextColor="#ffffff80"
                multiline={true}
                textAlignVertical="top"
                textAlign="center"
                blurOnSubmit={true}
                onBlur={() => Keyboard.dismiss()}
                onFocus={handleFocus}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={pickVideo}>
              <Text style={styles.buttonText}>PILIH VIDEO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={processVideo}>
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

// Styles sama seperti sebelumnya, tambahkan style untuk video
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
      buttonText: {
        fontFamily: 'RobotoBold',
        color: "#6A1B9A",
        fontSize: RFValue(16),
      },
      placeholderText: {
       fontFamily: 'Roboto',
        fontSize: RFValue(14),
        color: '#666',
      },
      caption: {
        fontFamily: 'RobotoBold',
        // Force Roboto di semua platform
        ...Platform.select({
          ios: {
            fontFamily: 'RobotoBold',
          },
          android: {
            fontFamily: 'RobotoBold',
          }
        }),
        marginTop: hp('0.5%'),
        padding: wp('2%'),
        backgroundColor: "red",
        color: "white",
        fontSize: RFValue(12),
        fontStyle: 'normal',
        maxHeight: hp('20%'),
        textAlign: 'center',
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
      saveButton: {
        marginTop: hp('1%'),
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
        width: wp('80%'),
        alignItems: 'center',
        paddingHorizontal: 20,
      },
      fontSizeText: {
        fontFamily: 'Roboto',
        fontSize: RFValue(16),
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
  video: {
    width: wp('88%'),
    alignSelf: 'center',
  },
  videoContainer: {
    width: wp('90%'),
    borderWidth: 1,
    borderColor: '#ccc',
    padding: wp('1%'),
    backgroundColor: '#fff',
  },
});

export default TemplateVideo;
