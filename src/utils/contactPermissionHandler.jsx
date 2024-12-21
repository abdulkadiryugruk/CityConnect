import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Contacts from 'react-native-contacts';

// Rehber erişim izni kontrolü
export const requestContactPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Rehber Erişimi',
          message: 'Rehberinize erişebilmemiz için izin vermeniz gerekiyor.',
          buttonNeutral: 'Sonra',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Android izin isteği başarısız oldu:', error);
      return false;
    }
  } else {
    try {
      const permission = await Contacts.checkPermission();
      if (permission === 'undefined') {
        const response = await Contacts.requestPermission();
        return response === 'authorized';
      }
      return permission === 'authorized';
    } catch (error) {
      console.error('iOS izin kontrolü başarısız oldu:', error);
      return false;
    }
  }
};

// Rehberden veri alma
export const getContacts = () => {
  return new Promise((resolve, reject) => {
    Contacts.getAll()
      .then(contacts => {
        const names = contacts.map(contact => ({
          fullName: contact.displayName,
        }));
        resolve(names);
      })
      .catch(error => {
        console.error('Rehber verisi alınamadı:', error);
        reject('Rehber verisi alınamadı.');
      });
  });
};

// İzinleri kontrol et ve rehberden veri al
export const requestAndFetchContacts = async () => {
  const hasPermission = await requestContactPermission();
  if (hasPermission) {
    return await getContacts();
  } else {
    Alert.alert(
      'Uyarı',
      'Rehber erişimi reddedildi. Lütfen ayarlardan izin verin.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayarlar', onPress: () => Linking.openSettings() },
      ],
    );
    return [];
  }
};
