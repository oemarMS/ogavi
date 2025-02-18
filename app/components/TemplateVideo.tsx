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

  const videoRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  // Tambahkan state untuk menyimpan jumlah baris dan style teks
  const viewShotRef = useRef<ViewShot>(null);
  const [textLines, setTextLines] = useState<string[]>([]);

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

  // Update handleTextChange untuk memproses teks menjadi array baris
const handleTextChange = (text: string) => {
  setCaptionText(text);
  setTextLines(text.split('\n')); // Pisahkan teks berdasarkan line break
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
        aspect: [3, 4], // Fix aspect ratio to 3:4
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        // Step 1: Create temporary video with correct aspect ratio
        const tempDir = FileSystem.cacheDirectory;
        const tempFileName = `temp_${Date.now()}.mp4`;
        const tempPath = `${tempDir}${tempFileName}`;
  
        // Command to force aspect ratio to 3:4
        const command = `-i "${result.assets[0].uri}" -vf "scale=720:960:force_original_aspect_ratio=decrease,pad=720:960:(ow-iw)/2:(oh-ih)/2" -c:v mpeg4 -c:a copy "${tempPath}"`;
  
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

      // Step 1: Create video with red box (yang sudah berhasil)
      const command1 = `-i "${selectedVideo.uri}" -vf "split[main][tmp];[tmp]scale=iw:100,geq=r=255:b=0:g=0:a=1[text];[main]pad=iw:ih+100:0:0:red[base];[base][text]overlay=0:H-h" -c:v mpeg4 -c:a copy "${tempVideoPath}"`;

      console.log('FFmpeg command 1:', command1);
      const session1 = await FFmpegKit.execute(command1);
      const returnCode1 = await session1.getReturnCode();

      if (!ReturnCode.isSuccess(returnCode1)) {
        throw new Error('Failed to create video with red box');
      }

      // Step 2: Add text image overlay
      const command2 = `-i "${tempVideoPath}" -i "${textImage}" -filter_complex "[1:v]scale=w=${wp('90%')}:h=100[txt];[0:v][txt]overlay=(W-w)/2:H-h" -c:v mpeg4 -c:a copy "${outputPath}"`;

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
                width: wp('90%'), // Sesuaikan dengan lebar video
                height: 500 // Sesuai tinggi area merah
              }}
              style={styles.hiddenViewShot}
            >
              <View style={styles.textContainer}>
    <Text 
      style={[
        styles.captionText, 
        { 
          fontSize: fontSize * 2,
          lineHeight: fontSize * 2.5
        }
      ]}
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
      backgroundColor: 'red', // Pastikan background merah
      width: wp('90%'),
      height: 100,
    },
    textContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'red',
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp('2%'),
    },
    captionText: {
      color: 'white',
      fontFamily: 'RobotoBold',
      textAlign: 'center',
      flexWrap: 'wrap',
      width: '100%',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    videoContainer: {
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
});

export default TemplateVideo;