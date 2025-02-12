import { NativeModules, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { XiaomiSettings } = NativeModules;
const XIAOMI_SETTINGS_KEY = 'xiaomi_autostart_shown';

export const openXiaomiAutoStartSettings = async () => {
  if (Platform.OS === 'android') {
      try {
          const hasShown = await AsyncStorage.getItem(XIAOMI_SETTINGS_KEY);
          if (hasShown === 'true') {
              return { status: 'already_shown' }; // Daha önce gösterilmiş
          }

      return new Promise((resolve) => {
        Alert.alert(
          'Arka Planda Çalışma İzni',
          'Uygulamanın arka planda düzgün çalışabilmesi için otomatik başlatma iznini vermeniz gerekmektedir. Şimdi ayarlara giderek bu izni verebilirsiniz.\n\n' +
          'Ayarlar sayfasında şu adımları takip edin:\n' +
          '• Arka planda otomatik başlatma listesini bulun\n' +
          '• Listeden uygulamamızı bulun\n' +
          '• Yanındaki anahtarı aktif hale getirin',
          [
            {
                text: 'Şimdi Değil',
                style: 'cancel',
                onPress: async () => {
                    await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'false');
                    resolve({ status: 'cancelled' });
                }
            },
            {
                text: 'Ayarlara Git',
                onPress: async () => {
                    try {
                        await XiaomiSettings.openAutoStartSettings();
                        await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'true');
                        resolve({ status: 'success' });
                    } catch (error) {
                        console.error('Ayarlar açılırken hata:', error);
                        resolve({ status: 'error' });
                    }
                }
            }
        ],
        { cancelable: false }
    );
      });
    } catch (error) {
      console.error('AsyncStorage hatası:', error);
      return { status: 'error', error };
    }
  }
  return { status: 'not_android' };
};

  export const handleOpenSettings = async () => {
    const result = await openXiaomiAutoStartSettings();

    if (result.status === 'error') {
        Alert.alert(
            'Bilgi',
            'Ayarlar sayfası açılamadı. Lütfen manuel olarak:\n' +
            'Ayarlar > Uygulamalar > İzinler > Arka planda otomatik başlatma\n' +
            'yolunu takip ediniz.'
        );
    }
};