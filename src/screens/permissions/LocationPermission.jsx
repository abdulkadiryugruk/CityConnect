import { Platform, PermissionsAndroid, Alert } from "react-native";

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === "android") {
      // Foreground (ACCESS_FINE_LOCATION) ve Background (ACCESS_BACKGROUND_LOCATION) izinlerini kontrol et
      const hasForegroundPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const hasBackgroundPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );

      if (hasForegroundPermission && hasBackgroundPermission) {
        return true; // Her iki izin de verilmiş
      }

      // Foreground iznini iste
      const grantedForeground = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (grantedForeground !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("İzin Reddedildi", "Konum izni gerekli.");
        return false; // Foreground izni verilmedi
      }

      // Background iznini iste
      const grantedBackground = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );

      if (grantedBackground === PermissionsAndroid.RESULTS.GRANTED) {
        return true; // Background izni de verildi
      } else {
        Alert.alert("İzin Reddedildi", "Arka plan konum izni gerekli.");
        return false; // Background izni verilmedi
      }
    } else {
      // iOS için varsayılan
      return true;
    }
  } catch (error) {
    console.error("Konum izni alınırken bir hata oluştu:", error);
    return false;
  }
};
