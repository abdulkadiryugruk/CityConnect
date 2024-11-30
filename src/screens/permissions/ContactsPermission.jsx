import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import Contacts from 'react-native-contacts';

export const requestContactPermission = async () => {
  if (Platform.OS === 'android') {
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
      Alert.alert(
        'Uyarı',
        'Rehber erişimi reddedildi. Lütfen izinleri açmak için ayarlara gidin.',
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Ayarlar',
            onPress: () => Linking.openSettings(), // Kullanıcıyı ayarlara yönlendiriyoruz
          },
        ],
      );
      return null;
    }
  } else {
    // iOS'ta izin isteme
    const permission = await Contacts.checkPermission();
    if (permission === 'undefined') {
      const response = await Contacts.requestPermission();
      if (response === 'authorized') {
        console.log('Rehber erişimi verildi');
        return getContacts();
      } else {
        console.log('Rehber erişimi reddedildi');
        Alert.alert('Uyarı', 'Rehber erişimi reddedildi.');
        return null;
      }
    } else if (permission === 'authorized') {
      console.log('Rehber erişimi verildi');
      return getContacts();
    } else {
      console.log('Rehber erişimi reddedildi');
      Alert.alert('Uyarı', 'Rehber erişimi reddedildi.');
      return null;
    }
  }
};

const getContacts = () => {
  return new Promise((resolve, reject) => {
    Contacts.getAll()
      .then(contacts => {
        // Sadece displayName almak
        const names = contacts.map(contact => ({
          fullName: contact.displayName, // Kişinin görüntülenen tam adı
        }));

        //   console.log(names);  TODO Tam isimleri konsola yazdır
        resolve(names); // Tam isimleri döndür
      })
      .catch(error => {
        console.log(error);
        reject('Rehber verisi alınamadı.');
      });
  });
};
