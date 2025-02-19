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

  static handleBackgroundTask(event) {
    if (event.type === 'LOCATION_CHECK') {
      this.scheduleNotification();
    }
  }

  static init() {
    // Uygulama kapalıyken bildirimleri yönetmek için
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);

        // Bildirime tıklandığında
        if (notification.userInteraction) {
          // Uygulama kapalıyken bildirime tıklanırsa
          if (!notification.foreground) {
            // Uygulamayı başlat ve ekrana git
            NavigationService.navigate('YourCityScreen');
          }
        }
      },

      // Uygulama kapalıyken alınan bildirimleri göster
      popInitialNotification: true,

      // iOS için izinler
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Android için
      requestPermissions: Platform.OS === 'ios',

      // Bildirim önceliği
      priority: 'high',
    });

    if (Platform.OS === 'android') {
      this.createChannel();
    }

    // Broadcast'i dinle
    eventEmitter.addListener('locationCheck', (event) => {
      this.handleBackgroundTask(event);
    });
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
              importance: 4, // Yüksek önem
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
        } else {
          const lastCity = await this.getLastCity();

          if (lastCity === currentCity) {
            console.log(`Şehir önceki şehir ile aynı. Bildirim gönderilmeyecek.`);
            return; // Bildirim göndermeyi burada durduruyoruz.
          } else {
            await this.setLastCity(currentCity);
            console.log(`Son şehir güncellendi: ${currentCity}`);

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
          }
        }
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

  static async getLastCity() {
    try {
      const lastCity = await AsyncStorage.getItem(LAST_CITY_KEY);
      return lastCity;
    } catch (error) {
      console.error('Son şehir alınırken hata oluştu:', error);
      return null;
    }
  }

  static async setLastCity(city) {
    try {
      await AsyncStorage.setItem(LAST_CITY_KEY, city);
    } catch (error) {
      console.error('Son şehir kaydedilirken hata oluştu:', error);
    }
  }
}

export default NotificationService;