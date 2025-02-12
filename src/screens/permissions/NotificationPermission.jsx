import { PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

class NotificationPermissionManager {
  static async requestPermission() {
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
        return isGranted;
      } catch (error) {
        console.error('Bildirim izni hatası:', error);
        return false;
      }
    }
    return true;
  }

  static async checkPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        const hasPermission = await PermissionsAndroid.check(permission);
        
        if (!hasPermission) {
          return this.requestPermission();
        }
        return true;
      } catch (error) {
        console.error('İzin kontrol hatası:', error);
        return false;
      }
    }
    return true;
  }

  static configure() {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Bildirim alındı:', notification);
      },
      onRegistrationError: function(err) {
        console.error('Bildirim kayıt hatası:', err.message);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }
}


export default NotificationPermissionManager;