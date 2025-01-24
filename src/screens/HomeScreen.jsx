import {Button, StyleSheet, Text, View, Alert, Image} from 'react-native';
import React, {useState, useCallback, useEffect} from 'react';
import CustomButton from '../components/CustomButton';
import {Dimensions} from 'react-native';
import RNFS from 'react-native-fs';
import citiesData from '../data/countries/Turkey/Cities.json';
import {requestContactPermission} from './permissions/ContactsPermission';
import NotificationPermissionManager  from './permissions/NotificationPermission';
import NotificationService from '../services/notification/notificationService';
import {requestLocationPermission  } from './permissions/LocationPermission'

const {width} = Dimensions.get('window');
const dynamicFontSize = width * 0.08;

// Dosya işlemleri için yardımcı fonksiyonlar
const FileOperations = {
  saveUpdatedCitiesToFile: async (updatedCities, fileName) => {
    const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    const jsonData = JSON.stringify({cities: updatedCities}, null, 2);

    try {
      await RNFS.writeFile(filePath, jsonData, 'utf8');
      console.log(`${fileName} başarıyla kaydedildi.`);
      return true;
    } catch (error) {
      console.error(`${fileName} dosyasına yazılamadı:`, error);
      return false;
    }
  },

  clearCache: async () => {
    const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
    try {
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) {
        await RNFS.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Önbellek temizlenirken hata oluştu:', error);
      throw error;
    }
  },
};

const HomeScreen = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
//TODO IZINLER
useEffect(() => {
  const getPermission = async () => {
    // Rehber izni
    await requestContactPermission();

    // Bildirim izni
    await checkPermissionAndStartNotifications();

    // Konum izni (foreground ve background için)
    const isLocationGranted = await requestLocationPermission();
    if (isLocationGranted) {
      console.log("Konum izni verildi!");
    } else {
      Alert.alert("Uyarı", "Konum izni alınamadı.");
    }
  };

  getPermission();
}, []);



  const checkPermissionAndStartNotifications = async () => {
    try {
      // Bildirim izinlerini kontrol et
      const permission = await NotificationPermissionManager.checkPermission();
      setHasPermission(permission);

      if (permission) {
        // İzin varsa bildirimleri başlat
        startHourlyNotifications();
      } else {
        // İzin yoksa kullanıcıdan iste
        const granted = await NotificationPermissionManager.requestPermission();
        setHasPermission(granted);
        
        if (granted) {
          startHourlyNotifications();
        } else {
          Alert.alert(
            'Bildirim İzni Gerekli',
            'Uygulamanın düzgün çalışması için bildirim izni gereklidir.',
            [{ text: 'Tamam' }]
          );
        }
      }
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
    }
  };

  const startHourlyNotifications = async () => {
    try {
      // Mevcut bildirimleri temizle
      NotificationService.cancelAllNotifications();

      // Yeni saatlik bildirimleri planla
      NotificationService.scheduleNotification();

      console.log('Saatlik bildirimler başlatıldı');
    } catch (error) {
      console.error('Bildirim başlatma hatası:', error);
    }
  };
  
  const assignContactsToCities = (contacts, citiesData) => {
    return citiesData.cities.map(city => {
      const matchedContacts = contacts.filter(
        contact =>
          contact.fullName &&
          city.name &&
          contact.fullName.toLowerCase().includes(city.name.toLowerCase()),
      );
  
      // Yeni kişilerle mevcut kişileri birleştir (tekrar edenler hariç)
      const mergedPeople = [
        ...city.people,
        ...matchedContacts.filter(
          newPerson =>
            !city.people.some(
              existingPerson => existingPerson.fullName === newPerson.fullName,
            ),
        ),
      ];
  
      return {
        ...city,
        people: mergedPeople,
      };
    });
  };
  
  const handleScanContacts = useCallback(async () => {
    if (isScanning) return;
  
    setIsScanning(true);
    try {
      // Rehber erişimi izni iste
      const contacts = await requestContactPermission();
      if (!contacts) {
        Alert.alert(
          'İzin Gerekli',
          'Rehbere erişim izni olmadan bu işlemi gerçekleştiremeyiz.',
          [
            {
              text: 'Tamam',
              onPress: () => setIsScanning(false),
            },
          ],
        );
        return;
      }
  
      if (contacts.length === 0) {
        Alert.alert('Bilgi', 'Rehberinizde kayıtlı kişi bulunamadı.');
        return;
      }
  
      // Mevcut JSON dosyasını oku
      const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
      const fileExists = await RNFS.exists(filePath);
      let citiesData = { cities: [] };
  
      if (fileExists) {
        const fileContent = await RNFS.readFile(filePath, 'utf8');
        citiesData = JSON.parse(fileContent);
      } else {
        // Eğer dosya yoksa, varsayılan bir yapı başlat
        citiesData = { cities: [] };
      }
  
      // Şehirlerle kişileri eşleştir
      const updatedCities = assignContactsToCities(contacts, citiesData);
  
      // Güncellenmiş şehirleri JSON dosyasına kaydet
      const saveSuccess = await FileOperations.saveUpdatedCitiesToFile(
        updatedCities,
        'UserCities.json',
      );
  
      if (saveSuccess) {
        Alert.alert('Başarılı', 'Rehber tarandı ve kişiler eklendi.');
      } else {
        Alert.alert('Hata', 'Veriler kaydedilirken bir sorun oluştu.');
      }
    } catch (error) {
      console.error('Rehber tarama sırasında hata oluştu:', error);
      Alert.alert('Hata', 'Bir sorun oluştu, lütfen tekrar deneyin.');
    } finally {
      setIsScanning(false);
    }
  }, [isScanning]);
  

  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImg}
        source={require('../images/HomeBackground.png')}
      />
      <View style={styles.lacivert}>
        <View style={styles.containerBox}>
          <CustomButton
            customStyle={{marginVertical: 30}}
            buttonText={isScanning ? 'Taranıyor...' : 'Rehberi Tara'}
            pressed={handleScanContacts}
            disabled={isScanning}
          />

          <View style={styles.manuelAddContainer}>
            <View style={styles.manuelAddLabel}>
              <Text style={styles.labelText}>Manuel Ekleme</Text>
            </View>
            <View style={styles.manuelAddContent}>
              <CustomButton
                customStyle={{height: 40, marginVertical: 25}}
                textStyle={{fontSize: 20}}
                buttonText="Şehir Seç"
                pressed={() => navigation.navigate('SelectCityScreen')}
              />
              <CustomButton
                customStyle={{height: 40, marginBottom: 20, marginVertical: 0}}
                textStyle={{fontSize: 20}}
                buttonText="Kişi Seç"
                pressed={() => navigation.navigate('SelectContactScreen')}
              />
            </View>
          </View>

          <CustomButton
            buttonText="Düzenle"
            pressed={() => navigation.navigate('EditScreen')}
          />
          <CustomButton
            buttonText="sehir"
            pressed={() => navigation.navigate('YourCityScreen')}
          />
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImg: {
    width: '100%',
    height: '22%',
    borderBottomLeftRadius: 85,
  },
  lacivert: {
    width: '100%',
    height: '78%',
    backgroundColor: '#0c0d34',
    bottom: 0,
    position: 'absolute',
  },
  containerBox: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
  },
  manuelAddContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginVertical: 20,
    borderWidth: 5,
    borderRadius: 20,
    borderColor: 'tomato',
    fontSize: 20,
    position: 'relative',
  },
  manuelAddLabel: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'white',
    paddingHorizontal: 5,
  },
  labelText: {
    fontSize: dynamicFontSize,
    fontWeight: '600',
    color: 'black',
  },
  manuelAddContent: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
