import {Button, StyleSheet, Text, View, Alert} from 'react-native';
import React from 'react';
import CustomButton from '../components/CustomButton';
import {Dimensions} from 'react-native';
import RNFS from 'react-native-fs'; // RNFS'yi içe aktar
import {requestContactPermission} from './permissions/ContactsPermission';
import citiesData from '../data/countries/Turkey/Cities.json'; // Cities.json dosyası

const {width} = Dimensions.get('window');
const dynamicFontSize = width * 0.08;

// Dosya yazma fonksiyonu
const saveUpdatedCitiesToFile = (updatedCities, fileName) => {
  const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
  const jsonData = JSON.stringify({cities: updatedCities}, null, 2);

  RNFS.writeFile(filePath, jsonData, 'utf8')
    .then(() => {
      console.log(`${fileName} başarıyla kaydedildi.`);
    })
    .catch(error => {
      console.error(`${fileName} dosyasına yazılamadı:`, error);
    });
};

// Rehber kişilerini şehirlerle eşleştirme fonksiyonu
const assignContactsToCities = contacts => {
  const updatedCities = citiesData.cities.map(city => {
    const matchedContacts = contacts.filter(contact =>
      contact.fullName.toLowerCase().includes(city.name.toLowerCase()),
    );
    return {
      ...city,
      people: matchedContacts,
    };
  });

  return updatedCities;
};

// Rehberi tara butonunun işlevi
const handleScanContacts = async () => {
  try {
    const contacts = await requestContactPermission();
    if (contacts && contacts.length > 0) {
      const updatedCities = assignContactsToCities(contacts);
      saveUpdatedCitiesToFile(updatedCities, 'UserCities.json');
      Alert.alert('Başarılı', 'Rehber tarandı ve kişiler eklendi.');
    } else {
      Alert.alert('Bilgi', 'Rehberde şehir ismi içeren kişi bulunamadı.');
    }
  } catch (error) {
    console.error('Rehber tarama sırasında hata oluştu:', error);
    Alert.alert('Hata', 'Bir sorun oluştu, lütfen tekrar deneyin.');
  }
};

const HomeScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <CustomButton
        customStyle={{marginVertical: 30}}
        buttonText="Rehberi Tara"
        pressed={handleScanContacts}
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
            buttonText="Kisi Seç"
          />
        </View>
      </View>
      <CustomButton buttonText="Düzenle"
      pressed={() => navigation.navigate('EditScreen')}
      />
      <Button
        title="Go to Tutorial"
        onPress={() => navigation.navigate('Tutorial')}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
  },
  manuelAddContent: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
