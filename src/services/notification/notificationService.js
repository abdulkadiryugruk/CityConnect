import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  static channelId = 'scheduled-channel';
  
  static init() {
    // PushNotification'ı yapılandır
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Android için kanal oluştur
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
      title: options.title || 'Bildirim',
      message: options.message || 'Bildirim mesajı',
      date: options.date || new Date(Date.now() + 20 * 1000),
      allowWhileIdle: true,
      repeatType: options.repeatType || 'minute',
      repeatTime: options.repeatTime || 1,
      importance: 'high',
      autoCancel: true,
      invokeApp: true,
    });
  }

  static cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default NotificationService;