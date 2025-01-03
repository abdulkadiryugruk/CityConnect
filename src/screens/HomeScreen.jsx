import {Button, StyleSheet, Text, View, Alert, Image} from 'react-native';
import React, {useState, useCallback} from 'react';
import CustomButton from '../components/CustomButton';
import {Dimensions} from 'react-native';
import RNFS from 'react-native-fs';
import {requestContactPermission} from './permissions/ContactsPermission';
import citiesData from '../data/countries/Turkey/Cities.json';

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

  // Rehber tarama işlemi
  const handleScanContacts = useCallback(async () => {
    if (isScanning) return; // Çift tıklama engelleme

    setIsScanning(true);
    try {
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

      // Şehirlerle eşleştirme
      const updatedCities = citiesData.cities.map(city => ({
        ...city,
        people: contacts.filter(
          contact =>
            contact.fullName &&
            city.name &&
            contact.fullName.toLowerCase().includes(city.name.toLowerCase()),
        ),
      }));

      // Dosyaya kaydetme
      const saveSuccess = await FileOperations.saveUpdatedCitiesToFile(
        updatedCities,
        'UserCities.json',
      );

      if (contacts.length === 0) {
        Alert.alert('Bilgi', 'Rehberinizde kayıtlı kişi bulunamadı.');
        return;
      }
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

  // Önbellek temizleme
  const handleClearCache = useCallback(async () => {
    try {
      const cleared = await FileOperations.clearCache();
      if (cleared) {
        Alert.alert('Başarılı', 'Önbellek temizlendi.');
      } else {
        Alert.alert('Bilgi', 'Önbellek dosyası bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Önbellek temizlenirken bir hata oluştu.');
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* kaldirilacak */}
      {/* <Button
        title="Önbelleği Temizle"
        onPress={handleClearCache}
      /> */}
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
      </View>
      </View>
      {/* kaldirilacak */}
      {/* <Button
        title="Go to Tutorial"
        onPress={() => navigation.navigate('Tutorial')}
      />
      <Button
        title="TutorialBackground"
        onPress={() => navigation.navigate('TutorialBackground')}
      /> */}
    </View> 
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImg:{
    width:'100%',
    height:'22%',
    borderBottomLeftRadius:85,
  },
  lacivert:{
    width:'100%',
    height:'78%',
    backgroundColor: '#0c0d34',
    bottom:0,
    position:'absolute',
  },
  containerBox: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top:0,
    borderRadius: 85,
    borderTopLeftRadius:0,
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
