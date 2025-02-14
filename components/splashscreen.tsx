import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const SplashScreen: React.FC = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'Roboto': require('../assets/fonts/Roboto-Regular.ttf'),
    'RobotoBold': require('../assets/fonts/Roboto-Bold.ttf'),
  });

  useEffect(() => {
    const navigateToHome = async () => {
      if (fontsLoaded) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 2000);
      }
    };

    navigateToHome();
  }, [fontsLoaded, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require('../assets/images/appicon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(102, 196, 250, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontFamily: 'RobotoBold',
    marginTop: 20,
    color: '#6A1B9A',
  },
});

export default SplashScreen;