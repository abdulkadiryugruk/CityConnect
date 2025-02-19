import {NativeModules, Platform, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {XiaomiSettings} = NativeModules;
const XIAOMI_SETTINGS_KEY = 'xiaomi_autostart_shown';

export const checkAndHandleAutoStartPermission = async () => {
  if (Platform.OS !== 'android') return;

  try {
    const hasAskedBefore = await AsyncStorage.getItem(XIAOMI_SETTINGS_KEY);
    if (hasAskedBefore === 'true') {
      console.log('Daha önce izin verildi, tekrar sormaya gerek yok.');
      return;
    }

    if (XiaomiSettings.checkAutoStartPermission) {
      const isPermissionGranted = await XiaomiSettings.checkAutoStartPermission();
      if (isPermissionGranted) {
        console.log('İzin zaten verilmiş, AsyncStorage güncelleniyor.');
        await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'true');
        return;
      }
    }

    console.log('İzin verilmemiş, kullanıcıya sorulacak.');
    await handleOpenSettings();
  } catch (error) {
    console.error('İzin kontrolü sırasında hata:', error);
  }
};

export const handleOpenSettings = async () => {
  if (Platform.OS === 'android') {
    try {
      try {
        if (XiaomiSettings.checkAutoStartPermission) {
            const isPermissionGranted = await XiaomiSettings.checkAutoStartPermission();
            if (isPermissionGranted) {
                await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'true');
                return { status: 'permission_granted' };
            }
        } else {
            console.log('checkAutoStartPermission metodu bulunamadı');
        }
    } catch (error) {
        console.error('İzin kontrolü hatası:', error);
    }

      return new Promise(resolve => {
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
              onPress: () => {
                resolve({status: 'cancelled'});
              },
            },
            {
              text: 'Ayarlara Git',
              onPress: async () => {
                try {
                  await XiaomiSettings.openAutoStartSettings();

                  setTimeout(async () => {
                    try {
                      const isPermissionGranted =
                        await XiaomiSettings.checkAutoStartPermission();
                      if (isPermissionGranted) {
                        await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'true');
                        resolve({status: 'success'});
                      } else {
                        Alert.alert(
                          'İzin Onayı',
                          'Otomatik başlatma iznini verdiniz mi?',
                          [
                            {
                              text: 'Hayır',
                              style: 'cancel',
                              onPress: () =>
                                resolve({status: 'permission_denied'}),
                            },
                            {
                              text: 'Evet',
                              onPress: async () => {
                                console.log('Kullanıcı "Evet" dedi, AsyncStorage güncelleniyor.');
                                await AsyncStorage.setItem(XIAOMI_SETTINGS_KEY, 'true');
                                resolve({status: 'success'});
                              },
                            },
                          ],
                        );
                      }
                    } catch (error) {
                      console.error('İzin kontrolü hatası:', error);
                      resolve({status: 'error'});
                    }
                  }, 1000);
                } catch (error) {
                  console.error('Ayarlar açılırken hata:', error);
                  resolve({status: 'error'});
                }
              },
            },
          ],
          {cancelable: false},
        );
      });
    } catch (error) {
      console.error('İşlem hatası:', error);
      return {status: 'error', error};
    }
  }
  return {status: 'not_android'};
  
};

export const openXiaomiAutoStartSettings = async () => {
  const result = await handleOpenSettings();

  if (result.status === 'error') {
    Alert.alert(
      'Bilgi',
      'Ayarlar sayfası açılamadı. Lütfen manuel olarak:\n' +
        'Ayarlar > Uygulamalar > İzinler > Arka planda otomatik başlatma\n' +
        'yolunu takip ediniz.',
    );
  }
};
