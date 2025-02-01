import PushNotification from 'react-native-push-notification';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationService from '../navigation/NavigationService';
import RNFS from 'react-native-fs';

const { WorkManagerModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(WorkManagerModule);

const LAST_CITY_KEY = '@last_visited_city';

class NotificationService {
  static channelId = 'scheduled-channel';
  static isWorkManagerStarted = false;

  static handleBackgroundTask(event) {
    if (event.type === 'LOCATION_CHECK') {
      this.scheduleNotification();
    }
  }

  static init() {
    // WorkManager'ı başlat
    if (Platform.OS === 'android') {
      WorkManagerModule.startBackgroundService((error, result) => {
          if (error) {
              console.error('WorkManager başlatılırken hata:', error);
          } else {
              console.log('WorkManager başarıyla başlatıldı:', result);
          }
      });
  }

    // Push Notification konfigürasyonu
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);

        if (notification.userInteraction && !notification.foreground) {
          NavigationService.navigate('YourCityScreen');
        }
      },

      popInitialNotification: true,
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: Platform.OS === 'ios',
      priority: 'high',
    });

    if (Platform.OS === 'android') {
      this.createChannel();
    }

    // Broadcast dinleyicisi
    eventEmitter.addListener('locationCheck', (event) => {
      this.handleBackgroundTask(event);
    });
  }

  static startWorkManager() {
    if (!this.isWorkManagerStarted) {
      WorkManagerModule.startBackgroundService((error, result) => {
        if (error) {
          console.error('WorkManager başlatılırken hata:', error);
        } else {
          console.log('WorkManager başarıyla başlatıldı:', result);
          this.isWorkManagerStarted = true;
        }
      });
    }
  }

  // static stopWorkManager() {
  //   if (this.isWorkManagerStarted) {
  //     WorkManagerModule.stopBackgroundService((error, result) => {
  //       if (error) {
  //         console.error('WorkManager durdurulurken hata:', error);
  //       } else {
  //         console.log('WorkManager başarıyla durduruldu:', result);
  //         this.isWorkManagerStarted = false;
  //       }
  //     });
  //   }
  // }

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
        }
      });
    }
  }

  static async scheduleNotification(options = {}) {
    try {
      const currentCity = await NavigationService.getCityFromLocation();
      if (!currentCity) {
        console.error('Konum bilgisi alınamadı.');
        return;
      }

      const path = RNFS.DocumentDirectoryPath + '/UserCities.json';
      const fileExists = await RNFS.exists(path);

      if (fileExists) {
        const fileContent = await RNFS.readFile(path, 'utf8');
        const jsonData = JSON.parse(fileContent);

        const cityData = jsonData.cities.find(city => city.name.trim() === currentCity);
        const personCount = cityData ? cityData.people.length : 0;

        console.log('Güncel kişi sayısı:', personCount);

        if (personCount === 0) {
          console.log(`${currentCity} şehrinde kimse yok. Bildirim gönderilmeyecek.`);
          return;
        }

        PushNotification.localNotificationSchedule({
          channelId: this.channelId,
          title: options.title || 'Yeni Şehir Algılandı',
          message: `${currentCity} Şehrinde ${personCount} kişi mevcut.`,
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

        console.log('Bildirim gönderildi.');
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