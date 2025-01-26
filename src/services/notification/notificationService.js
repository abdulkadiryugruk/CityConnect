import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { NavigationService } from '../navigation/NavigationService';
import RNFS from 'react-native-fs';

class NotificationService {
  static channelId = 'scheduled-channel';
  
  
  static init() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      
      onNotification:  (notification) => {
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
    if (Platform.OS === 'android') {
      PushNotification.channelExists(this.channelId, (exists) => {
        if (!exists) {
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
            (created) => console.log(`Kanal oluşturuldu: ${created ? 'Başarılı' : 'Başarısız'}`)
          );
        } else {
          console.log('Kanal zaten mevcut');
        }
      });
    }
  }

  static async scheduleNotification(options = {}) {
    try {
      const path = RNFS.DocumentDirectoryPath + '/UserCities.json';
      const fileExists = await RNFS.exists(path);
  
      if (fileExists) {
        const fileContent = await RNFS.readFile(path, 'utf8');
        const jsonData = JSON.parse(fileContent);
  
        const istanbulCity = jsonData.cities.find(city => city.name.trim() === 'Istanbul');
        const personCount = istanbulCity ? istanbulCity.people.length : 0;
  
        console.log('Güncel kişi sayısı:', personCount);
        
//TODO if else dongusu
        if (personCount === 0) {
          console.log('Istanbul şehrinde kimse yok. Bildirim gönderilmeyecek.');
        } else {
          PushNotification.localNotificationSchedule({
            channelId: this.channelId,
            title: options.title || 'Yeni Şehir Algılandı',
            message: `Istanbul Şehrinde ${personCount} kişi mevcut.`,
            date: options.date || new Date(Date.now() + 1 * 1000),
            allowWhileIdle: true,
            importance: 'high',
            autoCancel: true,
            invokeApp: true,
            userInfo: {
              screen: 'YourCityScreen',
              ...options.userInfo,
            },
          });
  
          console.log('Bildirim gönderildi. 1 dakika sonra tekrar kontrol edilecek.');
        }
  
        // Bir sonraki kontrolü 1 dakika sonrasına ayarla
        setTimeout(() => {
          this.scheduleNotification({
            title: 'Yeni Şehir Algılandı',
            message: `Istanbul Şehrinde ${personCount} kişi mevcut.`,
            date: new Date(Date.now() + 1 * 1000),
          });
        }, 60 * 1000); // 60 saniye sonra
      } else {
        console.error('UserCities.json dosyası bulunamadı.');
      }
    } catch (error) {
      console.error('Bildirim gönderilirken hata oluştu:', error);
    }
  }
  

  static cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default NotificationService;



