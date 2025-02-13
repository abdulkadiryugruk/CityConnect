import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

export class NotificationPermissionManager {
  static async requestPermission(setHasPermission) {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Bildirim İzni',
            message: 'Uygulamamızın size bildirim göndermesi için izin gerekiyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          }
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log(isGranted ? 'Bildirim izni verildi.' : 'Bildirim izni reddedildi.');
        setHasPermission(isGranted);  // Durumu güncelle
        return isGranted;
      } catch (error) {
        console.error('Bildirim izni hatası:', error);
        setHasPermission(false);
        return false;
      }
    }
    setHasPermission(true);
    return true;
  }

  static async checkPermission(setHasPermission) {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        const hasPermission = await PermissionsAndroid.check(permission);

        if (!hasPermission) {
          return this.requestPermission(setHasPermission);
        }
        setHasPermission(true);
        return true;
      } catch (error) {
        console.error('İzin kontrol hatası:', error);
        setHasPermission(false);
        return false;
      }
    }
    setHasPermission(true);
    return true;
  }
}
