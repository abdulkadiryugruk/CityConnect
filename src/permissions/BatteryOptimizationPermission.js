import { BatteryOptEnabled, RequestOptimizations, OpenOptimizationSettings, } from "react-native-battery-optimization-check";
import { Alert, Linking, Platform } from "react-native";

const requestBatteryOptimizationPermission = async () => {
  if (Platform.OS !== "android") return;

  try {
    const isOptimized = await BatteryOptEnabled();

    if (isOptimized) {
      Alert.alert(
        "Pil Optimizasyonu",
        "Uygulamanın arka planda düzgün çalışması için pil optimizasyonunu devre dışı bırakmanız önerilir. Şimdi ayarlara gitmek ister misiniz?",
        [
          { text: "Hayır", style: "cancel" },
          {
            text: "Evet",
            onPress: async () => {
              try {
                await RequestOptimizations(); // 📌 Pil optimizasyonu ayarlarını 
              } catch (error) {
                // console.error("Pil optimizasyonu açma hatası:", error);
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }
  } catch (error) {
    console.error("Pil optimizasyonu kontrolü hatası:", error);
  }
};

export default requestBatteryOptimizationPermission;
