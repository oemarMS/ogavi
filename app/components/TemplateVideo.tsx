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
  LayoutChangeEvent,
} from "react-native";
import { Video, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Font from 'expo-font';
import * as FileSystem from 'expo-file-system';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import ViewShot, { captureRef } from "react-native-view-shot";

interface ViewShotRef {
  capture: () => Promise<string>;
}

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
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [tempFontSize, setTempFontSize] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({});
  const [captionHeight, setCaptionHeight] = useState(100);
  const [captionWidth, setCaptionWidth] = useState(100);

  const videoRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  // Tambahkan state untuk menyimpan jumlah baris dan style teks
  const viewShotRef = useRef<ViewShot>(null);
  const [textLines, setTextLines] = useState<string[]>([]);

  const handleCaptionLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    const { width } = event.nativeEvent.layout;
    setCaptionHeight(height);
    setCaptionWidth(width);
  };

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

  // Update handleTextChange untuk better line management
const handleTextChange = (text: string) => {
  setCaptionText(text);
  // Split berdasarkan line break dan filter empty lines
  const lines = text.split('\n').filter(line => line.trim() !== '');
  setTextLines(lines);
  
  setTimeout(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, 100);
};

  const pickVideo = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        aspect: [16, 9], // Fix aspect ratio to 4:3
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Step 1: Create temporary video with correct aspect ratio
        const tempDir = FileSystem.cacheDirectory;
        const tempFileName = `temp_${Date.now()}.mp4`;
        const tempPath = `${tempDir}${tempFileName}`;
  
        // Command to force aspect ratio to 4:3
        const command = `-i "${result.assets[0].uri}" -vf "scale=1920:1080:force_original_aspect_ratio=1" -c:v mpeg4 -c:a copy "${tempPath}"`;
  
        console.log('FFmpeg command:', command);
        const session = await FFmpegKit.execute(command);
        const returnCode = await session.getReturnCode();
  
        if (ReturnCode.isSuccess(returnCode)) {
          setSelectedVideo({ uri: tempPath });
        } else {
          throw new Error('Failed to process video aspect ratio');
        }
      }
    } catch (error) {
      console.error("Error:", error);
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

    if (!captionText.trim()) {
      Alert.alert("Masukkan caption terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      // Generate text image dengan capture
      const textImage = await captureRef(viewShotRef, {
        format: "png",
        quality: 1
      });
      
      if (!textImage) {
        throw new Error('Failed to generate text image');
      }

      const tempDir = FileSystem.cacheDirectory;
      const tempVideoName = `temp_${Date.now()}.mp4`;
      const outputFileName = `final_${Date.now()}.mp4`;
      const tempVideoPath = `${tempDir}${tempVideoName}`;
      const outputPath = `${tempDir}${outputFileName}`;

      // Step 1: Bikin video dengan area merah full width
      const command1 = `-i "${selectedVideo.uri}" -vf "pad=iw:ih+${captionHeight * 3.5}:0:0[padded]" -c:v mpeg4 -c:a copy "${tempVideoPath}"`;

      console.log('FFmpeg command 1:', command1);
      const session1 = await FFmpegKit.execute(command1);
      const returnCode1 = await session1.getReturnCode();

      if (!ReturnCode.isSuccess(returnCode1)) {
        throw new Error('Failed to create video with red box');
      }

      // Step 2: Update command buat text overlay yang full width
      const command2 = `-i "${tempVideoPath}" -i "${textImage}" -filter_complex "[0:v][1:v]overlay=(W-w)/2:H-${captionHeight * 3}" -c:v mpeg4 -c:a copy "${outputPath}"`;

      console.log('FFmpeg command 2:', command2);
      const session2 = await FFmpegKit.execute(command2);
      const returnCode2 = await session2.getReturnCode();

      if (ReturnCode.isSuccess(returnCode2)) {
        const asset = await MediaLibrary.createAssetAsync(outputPath);
        await MediaLibrary.createAlbumAsync('MyApp', asset, false);
        Alert.alert("🎉 Video berhasil tersimpan di galeri");
      } else {
        throw new Error('Failed to add text overlay');
      }

      // Cleanup
      await FileSystem.deleteAsync(tempVideoPath);
      await FileSystem.deleteAsync(outputPath);

    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", `Gagal memproses video`);
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
            
            {/* Hidden ViewShot component for text capture */}
            <ViewShot
  ref={viewShotRef}
  options={{
    format: "png",
    quality: 1.0,
    width: wp('100%'),
    height: captionHeight
  }}
  style={[styles.hiddenViewShot, { 
    height: captionHeight,
    width: wp('100%')
  }]}
>
  <View 
    style={[styles.textContainer, { 
      height: 'auto',
      width: '100%'
    }]}
    onLayout={handleCaptionLayout}
  >
    <Text 
      style={[
        styles.captionText, 
        { 
          fontSize: fontSize,
          // Hapus lineHeight biar font ga gepeng
          width: '92%',
          //flexWrap: 'wrap', // Nambahin ini biar text bisa shrink dengan proporsional
        }
      ]}
      // Hapus adjustsFontSizeToFit karena ini yang bikin masalah
      // Hapus minimumFontScale karena udah ga dipake
      
      numberOfLines={3} // Kasih maksimal 3 baris aja biar readable
    >
      {captionText}
    </Text>
  </View>
</ViewShot>

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
                style={[styles.caption, { fontSize }]}
                value={captionText}
                onChangeText={handleTextChange}
                placeholder="Tuliskan keterangan video di sini..."
                placeholderTextColor="#ffffff80"
                multiline={true}
                textAlignVertical="center"
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
    hiddenViewShot: {
      position: 'absolute',
      top: -9999,
      left: -9999,
      backgroundColor: 'red',
      // width diset di inline style
    },
    textContainer: {
      width: '100%',
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 60,
      overflow: 'visible' // Tambah ini biar text ga kepotong
    },
    captionText: {
      color: 'white',
      fontFamily: 'RobotoBold',
      textAlign: 'center',
      width: '100%',
      //includeFontPadding: false,
      paddingHorizontal: hp('2%'), // Kurangin padding biar space lebih gede
      
    },
    videoContainer: {
        width: wp('90%'),
        borderWidth: 1,
        borderColor: '#ccc',
        padding: wp('1%'),
        backgroundColor: '#fff',
        flexDirection: 'column',
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
      marginTop: hp('0.5%'),
      padding: wp('2%'),
      backgroundColor: "red",
      color: "white",
      fontSize: RFValue(12),
      fontStyle: 'normal',
      //minHeight: hp('10%'), // Ganti maxHeight jadi minHeight
      textAlign: 'center',
      textAlignVertical: 'center', // Tambahan untuk alignment vertikal
      width: wp('88%'),
    alignSelf: 'center',
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
});

export default TemplateVideo;