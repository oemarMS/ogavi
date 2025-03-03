import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Font from "expo-font";
import * as FileSystem from "expo-file-system";
import { FFmpegKit, ReturnCode, FFprobeKit } from "ffmpeg-kit-react-native";
import ViewShot from "react-native-view-shot";

// Cache helpers
const VIDEO_CACHE_DIR = `${FileSystem.cacheDirectory}video_cache/`;

interface TemplateVideoProps {
  title: string;
  needsPermission?: boolean;
}

interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
}

// Loading overlay component
const LoadingOverlay = ({ message = "" }: { message?: string }) => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="#6A1B9A" />
    {message ? <Text style={styles.loadingText}>{message}</Text> : null}
  </View>
);

const TemplateVideo: React.FC<TemplateVideoProps> = ({
  title,
  needsPermission = false,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string } | null>(null);
  const [captionText, setCaptionText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [tempFontSize, setTempFontSize] = useState(24);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [captionBackgroundHeight, setCaptionBackgroundHeight] = useState(0);
  const [captionPreviewWidth, setCaptionPreviewWidth] = useState(wp("90%"));
  const [actualTextSize, setActualTextSize] = useState(24); // Actual font size for final rendering
  
  // Cache state
  const [cacheInitialized, setCacheInitialized] = useState(false);
  
  const previewWidth = wp("90%");

  const videoRef = useRef(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const captionRef = useRef<View>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const previewShotRef = useRef<ViewShot>(null);

  // Initialize cache directory
  useEffect(() => {
    const initCache = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(VIDEO_CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(VIDEO_CACHE_DIR, { intermediates: true });
        }
        
        // Cleanup files yang lebih tua dari 24 jam dengan timestamp di nama file
        const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
        const now = new Date().getTime();
        
        for (const file of files) {
          try {
            // Extract timestamp dari nama file (format: cache_1234567890_keyname.mp4)
            const timestamp = parseInt(file.split('_')[1]);
            if (timestamp && now - timestamp > 24 * 60 * 60 * 1000) {
              await FileSystem.deleteAsync(`${VIDEO_CACHE_DIR}${file}`);
            }
          } catch (err) {
            console.log(`Error processing file ${file}:`, err);
          }
        }
        
        setCacheInitialized(true);
      } catch (error) {
        console.log("Cache initialization error:", error);
      }
    };
    
    initCache();
  }, []);

  // Handle font loading
  const [fontsLoaded] = Font.useFonts({
    Roboto: require("../../assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("../../assets/fonts/Roboto-Bold.ttf"),
  });

  // Request permissions effect
  useEffect(() => {
    if (needsPermission) {
      const requestPermissions = async () => {
        const { status: mediaStatus } =
          await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== "granted") {
          Alert.alert(
            "Izin Ditolak",
            "Maaf, kami butuh izin untuk mengakses media!"
          );
        }
      };
      requestPermissions();
    }
  }, [needsPermission]);

  // Calculate actual font size based on preview/video dimensions ratio
  useEffect(() => {
    if (videoMetadata) {
      // Calculate the ratio between the actual video width and preview width
      const ratio = videoMetadata.width / previewWidth;
      // Scale the UI font size to match what it should be in the actual video
      setActualTextSize(fontSize * ratio);
    }
  }, [fontSize, videoMetadata, previewWidth]);

  // Cache helpers
  const getCacheKey = useCallback((videoUri: string, captionText: string, fontSize: number) => {
    // Bersihkan cache key dari karakter yang tidak valid untuk filename
    const safeText = captionText.substring(0, 10).replace(/[^a-z0-9]/gi, '_');
    return `${videoUri.split('/').pop()}_${safeText}_${fontSize}`;
  }, []);

  const checkVideoCache = useCallback(async (cacheKey: string) => {
    if (!cacheInitialized) return null;
    
    try {
      // Scan directory untuk mencari file yang cocok dengan cache key
      const files = await FileSystem.readDirectoryAsync(VIDEO_CACHE_DIR);
      const matchingFile = files.find(file => file.includes(cacheKey));
      
      if (matchingFile) {
        const cachePath = `${VIDEO_CACHE_DIR}${matchingFile}`;
        const fileInfo = await FileSystem.getInfoAsync(cachePath);
        if (fileInfo.exists) {
          return cachePath;
        }
      }
    } catch (err) {
      console.log("Cache check error:", err);
    }
    return null;
  }, [cacheInitialized]);

  const saveToCache = useCallback(async (tempPath: string, cacheKey: string) => {
    if (!cacheInitialized) return;
    
    const timestamp = new Date().getTime();
    const cachePath = `${VIDEO_CACHE_DIR}cache_${timestamp}_${cacheKey}.mp4`;
    try {
      await FileSystem.copyAsync({
        from: tempPath,
        to: cachePath
      });
      return cachePath;
    } catch (err) {
      console.log("Save to cache error:", err);
      return null;
    }
  }, [cacheInitialized]);

  // Handle caption layout changes
  const handleCaptionLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setCaptionBackgroundHeight(height);
  }, []);

  // Text change handler dengan debounce
  const handleTextChange = useCallback((text: string) => {
    setCaptionText(text);

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Focus handler
  const handleFocus = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.measureInWindow((_, y) => {
        scrollViewRef.current?.scrollTo({
          y: y,
          animated: true,
        });
      });
    }, 100);
  }, []);

  // Get video metadata with memo
  const getVideoMetadata = useCallback(async (videoUri: string): Promise<VideoMetadata> => {
    try {
      // Run FFprobe to get video information
      const session = await FFprobeKit.execute(`-v error -select_streams v:0 -show_entries stream=width,height,duration -of json "${videoUri}"`);
      const output = await session.getOutput();
      
      // Parse the JSON output
      const data = JSON.parse(output);
      const stream = data.streams[0];
      
      return {
        width: parseInt(stream.width, 10),
        height: parseInt(stream.height, 10),
        duration: parseFloat(stream.duration || "0"),
      };
    } catch (error) {
      console.error("Error getting video metadata:", error);
      // Return default values if there's an error
      return { width: 1080, height: 1080, duration: 0 };
    }
  }, []);

  const pickVideo = useCallback(async () => {
    setIsLoading(true);
    setProcessingStatus("Mengambil video...");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "videos",
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const originalUri = result.assets[0].uri;
        
        setProcessingStatus("Membaca metadata video...");
        // Get video metadata
        const metadata = await getVideoMetadata(originalUri);
        setVideoMetadata(metadata);
        
        // Calculate caption preview width based on video aspect ratio
        setCaptionPreviewWidth(previewWidth);
        
        // Use original video for preview
        setSelectedVideo({ uri: originalUri });
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Ada masalah saat memilih video");
    } finally {
      setIsLoading(false);
      setProcessingStatus("");
    }
  }, [getVideoMetadata, previewWidth]);

  // Capture the VISIBLE caption preview with error handling
  const captureCaptionAsImage = useCallback(async () => {
    if (!previewShotRef.current || !videoMetadata) {
      throw new Error("PreviewShot ref or video metadata not available");
    }

    try {
      // Capture with timeout handling
      const capturePromise = new Promise(async (resolve, reject) => {
        try {
          const currentRef = previewShotRef.current;
          if (currentRef && typeof currentRef.capture === "function") {
            const result = await currentRef.capture();
            
            // Verify the capture
            const fileInfo = await FileSystem.getInfoAsync(result);
            if (!fileInfo.exists || fileInfo.size === 0) {
              reject(new Error("Caption image is invalid"));
              return;
            }
            
            resolve(result);
          } else {
            reject(new Error("PreviewShot capture method is not available"));
          }
        } catch (err) {
          reject(err);
        }
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Caption capture timeout")), 5000);
      });
      
      return await Promise.race([capturePromise, timeoutPromise]);
    } catch (error) {
      console.error("Error capturing caption preview:", error);
      throw error;
    }
  }, [videoMetadata]);

  // Create a red background image for the caption - Existing code, no changes
  const createRedBackgroundImage = useCallback(async (width: number, height: number): Promise<string> => {
    const tempDir = FileSystem.cacheDirectory || "";
    const redImagePath = `${tempDir}red_bg_${Date.now()}.png`;
  
    // Ensure dimensions are integers
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
  
    // Generate a solid red image with the specified dimensions
    const command = `-f lavfi -i color=c=red:s=${roundedWidth}x${roundedHeight} -frames:v 1 "${redImagePath}"`;
    console.log("FFmpeg Red Background Create Command:", command);
  
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();
  
    if (ReturnCode.isSuccess(returnCode)) {
      return redImagePath;
    } else {
      const log = await session.getLogs();
      const output = await session.getOutput();
      console.error("FFmpeg Red Background Create Error Log:", log);
      console.error("FFmpeg Red Background Create Output:", output);
      throw new Error("Failed to create red background image");
    }
  }, []);

  // Main video processing function - KEEPING THE ORIGINAL CORE LOGIC
  const processVideo = useCallback(async () => {
    if (!selectedVideo) {
      Alert.alert("Pilih video dulu sebelum disimpan 🔥");
      return;
    }
  
    if (!captionText.trim()) {
      Alert.alert("Masukkan caption terlebih dahulu");
      return;
    }
  
    setIsLoading(true);
    setProcessingStatus("Menyiapkan proses...");
    
    try {
      // NEW: Check cache first
      const cacheKey = getCacheKey(selectedVideo.uri, captionText, fontSize);
      const cachedVideoPath = await checkVideoCache(cacheKey);
      
      if (cachedVideoPath) {
        setProcessingStatus("Menggunakan video dari cache...");
        // Save cached video to gallery
        const asset = await MediaLibrary.createAssetAsync(cachedVideoPath);
        await MediaLibrary.createAlbumAsync("MyApp", asset, false);
        Alert.alert("🔥 Video berhasil tersimpan di galeri (dari cache)");
        setIsLoading(false);
        setProcessingStatus("");
        return;
      }
      
      // ORIGINAL PROCESSING CODE STARTS HERE - MINIMAL CHANGES
      
      // 1. Capture the VISIBLE caption preview that user sees
      setProcessingStatus("Menyiapkan caption...");
      const captionImageUri = await captureCaptionAsImage();
      console.log("Caption image captured at:", captionImageUri);
      
      // 2. Get video dimensions for proper scaling
      const videoWidth = videoMetadata?.width || 1080;
      const videoHeight = videoMetadata?.height || 1920;
      
      // Calculate precise caption height maintaining the same aspect ratio as preview
      const captionPreviewAspectRatio = captionBackgroundHeight / captionPreviewWidth;
      const videoCaptionHeight = Math.round(videoWidth * captionPreviewAspectRatio);
      
      console.log("DEBUG - Video dimensions:", { videoWidth, videoHeight });
      console.log("DEBUG - Caption dimensions:", { 
        previewWidth: captionPreviewWidth, 
        previewHeight: captionBackgroundHeight,
        calculatedHeight: videoCaptionHeight,
        aspectRatio: captionPreviewAspectRatio
      });
      
      // 3. Process the video with FFmpeg using precise overlay positioning
      const tempDir = FileSystem.cacheDirectory || "";
      const tempVideoName = `temp_video_${Date.now()}.mp4`;
      const tempWithRedName = `temp_with_red_${Date.now()}.mp4`;
      const outputFileName = `final_${Date.now()}.mp4`;
      const tempVideoPath = `${tempDir}${tempVideoName}`;
      const tempWithRedPath = `${tempDir}${tempWithRedName}`;
      const outputPath = `${tempDir}${outputFileName}`;
  
      // Step 1: Create a version of the video with padding at the bottom for caption
      setProcessingStatus("Menambahkan padding ke video...");
      const paddingCommand = `-i "${selectedVideo.uri}" -vf "pad=iw:ih+${videoCaptionHeight}:0:0:black" -c:a copy "${tempVideoPath}"`;
      console.log("FFmpeg Padding Command:", paddingCommand);
      
      const paddingSession = await FFmpegKit.execute(paddingCommand);
      const paddingReturnCode = await paddingSession.getReturnCode();
      
      if (!ReturnCode.isSuccess(paddingReturnCode)) {
        const log = await paddingSession.getLogs();
        console.error("FFmpeg Padding Error Log:", log);
        throw new Error("Failed to add padding to video");
      }
      
      // Step 2: Create a red background image that exactly matches caption dimensions
      setProcessingStatus("Membuat background merah...");
      const redBackgroundPath = await createRedBackgroundImage(videoWidth, videoCaptionHeight);
      console.log("Red background created at:", redBackgroundPath);
      
      // Step 3: Overlay the red background at the bottom of the padded video
      setProcessingStatus("Menambahkan background merah ke video...");
      const overlayCommand = `-i "${tempVideoPath}" -i "${redBackgroundPath}" -filter_complex "[0:v][1:v]overlay=0:H-h" -c:a copy "${tempWithRedPath}"`;
      console.log("FFmpeg Red Background Overlay Command:", overlayCommand);
      
      const overlaySession = await FFmpegKit.execute(overlayCommand);
      const overlayReturnCode = await overlaySession.getReturnCode();
      
      if (!ReturnCode.isSuccess(overlayReturnCode)) {
        const log = await overlaySession.getLogs();
        console.error("FFmpeg Overlay Error Log:", log);
        throw new Error("Failed to overlay red background");
      }
      
      // Step 4: Resize caption image to exactly match the size needed for the video
      setProcessingStatus("Menyesuaikan ukuran caption...");
      const captionResizedPath = `${tempDir}caption_resized_${Date.now()}.png`;
      const resizeCommand = `-i "${captionImageUri}" -vf "scale=${videoWidth}:${videoCaptionHeight}" "${captionResizedPath}"`;
      console.log("FFmpeg Caption Resize Command:", resizeCommand);
      
      const resizeSession = await FFmpegKit.execute(resizeCommand);
      const resizeReturnCode = await resizeSession.getReturnCode();
      
      if (!ReturnCode.isSuccess(resizeReturnCode)) {
        const log = await resizeSession.getLogs();
        console.error("FFmpeg Resize Error Log:", log);
        throw new Error("Failed to resize caption image");
      }
      
      // Step 5: Final composition - overlay the properly sized caption on top of the red background
      setProcessingStatus("Menggabungkan caption dengan video...");
      const finalCommand = `-i "${tempWithRedPath}" -i "${captionResizedPath}" -filter_complex "[0:v][1:v]overlay=0:H-h" -c:a copy "${outputPath}"`;
      console.log("FFmpeg Final Composition Command:", finalCommand);
      
      const finalSession = await FFmpegKit.execute(finalCommand);
      const finalReturnCode = await finalSession.getReturnCode();
      
      if (ReturnCode.isSuccess(finalReturnCode)) {
        // NEW: Save to cache
        setProcessingStatus("Menyimpan ke cache...");
        await saveToCache(outputPath, cacheKey);
        
        // Save to gallery
        setProcessingStatus("Menyimpan ke galeri...");
        const asset = await MediaLibrary.createAssetAsync(outputPath);
        await MediaLibrary.createAlbumAsync("MyApp", asset, false);
        Alert.alert("🔥 Video berhasil tersimpan di galeri");
        
        // Clean up temporary files
        try {
          await FileSystem.deleteAsync(tempVideoPath);
          await FileSystem.deleteAsync(captionResizedPath);
          await FileSystem.deleteAsync(redBackgroundPath);
          await FileSystem.deleteAsync(tempWithRedPath);
          await FileSystem.deleteAsync(outputPath);
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      } else {
        const log = await finalSession.getLogs();
        console.error("FFmpeg Final Error Log:", log);
        throw new Error("Failed to create final video");
      }
    } catch (error) {
      console.error("Error processing video:", error);
      Alert.alert("Error", `Gagal memproses video: ${error}`);
    } finally {
      setIsLoading(false);
      setProcessingStatus("");
    }
  }, [
    selectedVideo, 
    captionText, 
    fontSize, 
    videoMetadata, 
    captionBackgroundHeight, 
    captionPreviewWidth, 
    captureCaptionAsImage,
    createRedBackgroundImage,
    getCacheKey,
    checkVideoCache,
    saveToCache
  ]);

  // Calculate video preview dimensions with better performance
  const getPreviewDimensions = useMemo(() => {
    if (!videoMetadata) {
      return { width: previewWidth, height: previewWidth };
    }
    
    const { width, height } = videoMetadata;
    // Safe check for aspect ratio
    const aspectRatio = width && height ? width / height : 16/9;
    
    // Constrain to container width
    const previewHeight = previewWidth / aspectRatio;
    
    return {
      width: previewWidth,
      height: previewHeight,
    };
  }, [videoMetadata, previewWidth]);

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
        <LoadingOverlay message={processingStatus} />
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
                <View>
                  <Video
                    ref={videoRef}
                    style={{
                      width: getPreviewDimensions.width,
                      height: getPreviewDimensions.height,
                      alignSelf: "center",
                    }}
                    source={{ uri: selectedVideo.uri }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    shouldPlay={false} // Don't autoplay for better performance
                  />
                  
                  {/* Wrap caption preview with ViewShot untuk di-capture */}
                  <ViewShot
                    ref={previewShotRef}
                    options={{
                      format: "png",
                      quality: 1,
                      result: "tmpfile",
                    }}
                  >
                    <View
                      ref={captionRef}
                      style={[
                        styles.captionPreview,
                        {
                          width: captionPreviewWidth,
                        },
                      ]}
                      onLayout={handleCaptionLayout}
                    >
                      <Text
                        style={[
                          styles.captionPreviewText,
                          {
                            fontSize: fontSize,
                          },
                        ]}
                      >
                        {captionText}
                      </Text>
                    </View>
                  </ViewShot>
                </View>
              ) : (
                <View style={[styles.placeholder, { aspectRatio: 1 }]}>
                  <Text style={styles.placeholderText}>
                    Pilih Video dari Galeri
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.controlsContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.caption, { fontSize }]}
                value={captionText}
                onChangeText={handleTextChange}
                placeholder="Tuliskan keterangan video di sini..."
                multiline={true}
                textAlignVertical="center"
                textAlign="center"
                submitBehavior="blurAndSubmit"
                onBlur={() => Keyboard.dismiss()}
                onFocus={handleFocus}
              />
              
              <View style={styles.fontSizeControl}>
                <Text style={styles.fontSizeText}>
                  Ukuran Font: {tempFontSize}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={60}
                  step={1}
                  value={fontSize}
                  onValueChange={(value) => setTempFontSize(value)}
                  onSlidingComplete={(value) => setFontSize(value)}
                />
              </View>
              
              <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <Text style={styles.buttonText}>PILIH VIDEO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={processVideo}>
                <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
              </TouchableOpacity>
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
  videoContainer: {
    width: wp("90%"),
    borderColor: "#ccc",
    padding: wp("1%"),
    backgroundColor: "#fff",
    flexDirection: "column",
    alignItems: "center",
  },
  controlsContainer: {
    width: wp("90%"),
    alignItems: "center",
    marginTop: hp("2%"),
  },
  placeholder: {
    width: wp("88%"),
    height: wp("88%"),
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  placeholderText: {
    fontFamily: "Roboto",
    fontSize: RFValue(16, 812),
    color: "#666",
    textAlign: "center",
  },
  captionPreview: {
    backgroundColor: "red",
    padding: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    minHeight: hp("6%"),
  },
  captionPreviewText: {
    fontFamily: "RobotoBold",
    color: "white",
    textAlign: "center",
    paddingHorizontal: wp("2%"),
  },
  caption: {
    fontFamily: "RobotoBold",
    padding: wp("2%"),
    textAlign: "center",
    textAlignVertical: "center",
    width: wp("88%"),
    minHeight: hp("8%"),
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: hp("2%"),
  },
  button: {
    marginTop: hp("2%"),
    padding: wp("3%"),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#6A1B9A",
    alignItems: "center",
    width: wp("50%"),
  },
  buttonText: {
    fontFamily: "RobotoBold",
    color: "#6A1B9A",
    fontSize: RFValue(16, 812),
  },
  saveButton: {
    marginTop: hp("1%"),
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
    width: wp("80%"),
    alignItems: "center",
    marginVertical: hp("1%"),
  },
  fontSizeText: {
    fontFamily: "Roboto",
    fontSize: RFValue(16, 812),
  },
  slider: {
    width: wp("80%"),
    height: 40,
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    fontWeight: "500",
    fontSize: RFValue(16, 812),
    color: "#6A1B9A",
    marginTop: 12,
  },
});

export default TemplateVideo;