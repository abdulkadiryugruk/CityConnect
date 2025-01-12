import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { NavigationService } from '../navigation/NavigationService';

class NotificationService {
  static channelId = 'scheduled-channel';
  
  static init() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Bildirime tıklandığında
        if (notification.userInteraction) {
          // YourCityScreen'e yönlendir
          NavigationService.navigate('YourCityScreen');
        }
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      this.createChannel();
    }
  }

  static createChannel() {
    PushNotification.createChannel(
      {
        channelId: this.channelId,
        channelName: 'Scheduled Notifications',
        channelDescription: 'Saatlik bildirimler için kanal',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Kanal oluşturuldu: ${created}`)
    );
  }

  static scheduleNotification(options = {}) {
    PushNotification.localNotificationSchedule({
      channelId: this.channelId,
      title: options.title || 'Yeni Sehir algilandi',
      message: options.message || 'Istanbul Sehrinde X kisi mevcut.',
      date: options.date || new Date(Date.now() + 20 * 1000),
      allowWhileIdle: true,
      repeatType: options.repeatType || 'minute',
      repeatTime: options.repeatTime || 1,
      importance: 'high',
      autoCancel: true,
      invokeApp: true,
      // Bildirim verilerini ekle
      userInfo: {
        screen: 'YourCityScreen',
        ...options.userInfo
      }
    });
  }

  static cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default NotificationService;



//TODO flase donuyor onu kontrol et. tiklaninca yourcityscreen aciliyor