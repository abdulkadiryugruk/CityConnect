import { Platform, PermissionsAndroid, Alert,Linking } from "react-native";

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

                console.log('Rehber erişimi reddedildi');
                // İzin reddedildiğinde kullanıcıya daha açıklayıcı bir mesaj göster
                Alert.alert(
                  'Konum İzni Gerekli',
                  'Uygulamanın düzgün çalışması için konum erişimine ihtiyacımız var. Lütfen ayarlardan izin verin.',
                  [
                    {
                      text: 'İptal',
                      style: 'cancel',
                    },
                    {
                      text: 'Ayarlara Git',
                      onPress: () => Linking.openSettings(),
                    },
                  ],
                );
                return false;
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
