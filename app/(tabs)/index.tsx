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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as Font from 'expo-font';

const Template1: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{ uri: string, width: number, height: number } | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [fontsLoaded] = Font.useFonts({
    'Roboto': require('../../assets/fonts/Roboto-Regular.ttf'),
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    // Kasih delay sedikit biar smooth
    setTimeout(() => {
      inputRef.current?.measureInWindow((x, y, width, height) => {
        scrollViewRef.current?.scrollTo({
          y: y,
          animated: true
        });
      });
    }, 100);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  if (!fontsLoaded) {
    return <View><Text>Loading fonts...</Text></View>;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.header}>Template 4:3</Text>
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
                style={styles.caption}
                value={captionText}
                onChangeText={setCaptionText}
                placeholder="Ketik caption keren lu di sini..."
                placeholderTextColor="#ffffff80"
                multiline={true}
                textAlignVertical="center"
                textAlign="center"
                blurOnSubmit={true}
                onBlur={() => Keyboard.dismiss()}
                onFocus={handleFocus} // Tambahin ini
              />
          </View>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>+ PILIH GAMBAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>SIMPAN KE GALERI</Text>
          </TouchableOpacity>
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
    aspectRatio: 4/3,
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
});

export default Template1;