import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import TemplateDualCaption from "../components/TemplateDualCaption";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/app/components/useColorScheme";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

// Tipe data untuk opsi rasio aspek
type AspectRatioOption = "3:4" | "4:3" | "16:9";

const Template5: React.FC = () => {
  const colorScheme = useColorScheme();
  // Default rasio 3:4
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>("3:4");

  // Fungsi untuk konversi string rasio ke nilai numerik
  const getAspectRatio = (option: AspectRatioOption): number => {
    switch (option) {
      case "3:4": return 3 / 4;
      case "4:3": return 4 / 3;
      case "16:9": return 16 / 9;
      default: return 3 / 4;
    }
  };

  // Komponen Radio Button
  const RadioButton = ({ 
    label, 
    isSelected, 
    onSelect 
  }: { 
    label: AspectRatioOption; 
    isSelected: boolean; 
    onSelect: () => void 
  }) => (
    <TouchableOpacity 
      style={styles.radioButtonContainer} 
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[
        styles.radioButton,
        isSelected && styles.radioButtonSelected
      ]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={[
        styles.radioButtonLabel,
        { color: colorScheme === "dark" ? "#fff" : "#333" }
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      
      {/* Container untuk semua elemen */}
      <ScrollView style={styles.scrollView}>
        {/* Selector Rasio Aspek - ini akan jadi bagian normal yang ikut discroll */}
        <View style={[
          styles.ratioSelector,
          { backgroundColor: colorScheme === "dark" ? "#333" : "#fff" }
        ]}>
          <Text style={styles.ratioTitle}>Pilih Rasio Gambar:</Text>
          <View style={styles.radioGroup}>
            <RadioButton 
              label="3:4" 
              isSelected={selectedRatio === "3:4"} 
              onSelect={() => setSelectedRatio("3:4")} 
            />
            <RadioButton 
              label="4:3" 
              isSelected={selectedRatio === "4:3"} 
              onSelect={() => setSelectedRatio("4:3")} 
            />
            <RadioButton 
              label="16:9" 
              isSelected={selectedRatio === "16:9"} 
              onSelect={() => setSelectedRatio("16:9")} 
            />
          </View>
        </View>
        
        {/* Template DualCaption component - simpan dalam View untuk positioning */}
        <View style={styles.templateContainer}>
          <TemplateDualCaption
            aspectRatio={getAspectRatio(selectedRatio)}
            title={`Template Dual Caption (${selectedRatio})`}
            needsPermission={true}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  ratioSelector: {
    padding: wp("4%"),
    marginHorizontal: wp("2%"),
    marginTop: hp("1%"),
    marginBottom: hp("1%"),
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratioTitle: {
    fontFamily: "RobotoBold",
    fontSize: RFValue(16, 812),
    color: "#6A1B9A",
    marginBottom: hp("1%"),
  },
  radioGroup: {
    flexDirection: "row",
    width: wp("90%"),
    justifyContent: "space-around",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("0.7%"),
    paddingHorizontal: wp("2%"),
  },
  radioButton: {
    height: wp("6%"),
    width: wp("6%"),
    borderRadius: wp("3%"),
    borderWidth: 2,
    borderColor: "#6A1B9A",
    marginRight: wp("2%"),
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#6A1B9A",
  },
  radioButtonInner: {
    height: wp("3%"),
    width: wp("3%"),
    borderRadius: wp("1.5%"),
    backgroundColor: "#6A1B9A",
  },
  radioButtonLabel: {
    fontFamily: "Roboto",
    fontSize: RFValue(14, 812),
  },
  templateContainer: {
    flex: 1,
  }
});

export default Template5;