import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { navigationRef } from '../../../App'; // navigationRef'i import ediyoruz

// Bildirimleri yapılandır
const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      if (notification.userInteraction && notification.data?.screen) {
        // Navigation işlemi burada yapılacak
        navigationRef.current?.navigate(notification.data.screen);
      }
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Android için kanal oluştur
  PushNotification.createChannel(
    {
      channelId: "default-channel-id",
      channelName: "Default channel",
      channelDescription: "A default channel for notifications",
      soundName: "default",
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`Notification channel created: ${created}`)
  );
};

// Bildirim gönderme fonksiyonu
const showNotification = (
  title = "Şehir Bildirimi",
  message = "Şehir sayfasına gitmek için tıklayın"
) => {
  PushNotification.localNotification({
    channelId: "default-channel-id",
    title,
    message,
    playSound: true,
    soundName: 'default',
    data: {
      screen: 'YourCityScreen'
    },
    repeatType: 'time',
    repeatTime: 30000, // sure
  });
};

export { 
  configureNotifications, 
  showNotification, 
};