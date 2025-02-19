import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import Contacts from 'react-native-contacts';

export const requestContactPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Önce mevcut izin durumunu kontrol et
      const existingPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );
      
      if (existingPermission) {
        console.log('İzin zaten verilmiş');
        return getContacts();
      }

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
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Rehber erişimi verildi');
        return getContacts();
      } else {
        console.log('Rehber erişimi reddedildi');
        // İzin reddedildiğinde kullanıcıya daha açıklayıcı bir mesaj göster
        Alert.alert(
          'Rehber İzni Gerekli',
          'Uygulamanın düzgün çalışması için rehber erişimine ihtiyacımız var. Lütfen ayarlardan izin verin.',
          [
            {
              text: 'İptal',
              style: 'cancel',
            },
            {
              text: 'Ayarlara Git',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return null;
      }
    } catch (err) {
      console.warn(err);
      return null;
    }
  }
  return null;
};

const getContacts = () => {
  return new Promise((resolve, reject) => {
    Contacts.getAll()
      .then(contacts => {
        const names = contacts.map(contact => ({
          fullName: contact.displayName || `${contact.givenName} ${contact.familyName}`.trim(),
        }));
        resolve(names);
      })
      .catch(error => {
        console.error('Rehber okuma hatası:', error);
        reject('Rehber verisi alınamadı.');
      });
  });
}