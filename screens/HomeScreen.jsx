import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "../components/CustomButton";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const dynamicFontSize = width * 0.08;

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomButton 
        customStyle={{ marginVertical: 30 }}
        buttonText="Rehberi Tara"
        // pressed={} //TODO Rehber Taranacak
      />
      <View style={styles.manuelAddContainer}>
        <View style={styles.manuelAddLabel}>
          <Text style={styles.labelText}>Manuel Ekleme</Text>
        </View>
        <View style={styles.manuelAddContent}>
          <CustomButton
            customStyle={{ height: 40, marginVertical: 25 }}
            textStyle={{ fontSize: 20 }}
            buttonText="Şehir Seç"
            pressed={() => navigation.navigate("SelectCityScreen")}
          />
          <CustomButton
            customStyle={{ height: 40, marginBottom: 20, marginVertical: 0 }}
            textStyle={{ fontSize: 20 }}
            buttonText="Kisi Seç"
            // pressed={}
          />
        </View>
      </View>
      <CustomButton
        buttonText="Düzenle"
        // pressed={}
      />
      <Button
        title="Go to Tutorial"
        onPress={() => navigation.navigate("Tutorial")}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  manuelAddContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    marginVertical: 20,
    borderWidth: 5,
    borderRadius: 20,
    borderColor: "tomato",
    fontSize: 20,
    position: "relative",
  },
  manuelAddLabel: {
    position: "absolute",
    top: -25,
    backgroundColor: "white",
    paddingHorizontal: 5,
  },
  labelText: {
    fontSize: dynamicFontSize,
    fontWeight: "600",
  },
  manuelAddContent: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
