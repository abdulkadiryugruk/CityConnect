import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {requestLocationPermission} from './permissions/LocationPermission';
import NavigationService from '../services/navigation/NavigationService';

const STORED_CITY_KEY = '@stored_city';
const STORED_PEOPLE_KEY = '@stored_people';

const YourCityScreen = () => {
  const [peopleList, setPeopleList] = useState([]);
  const [currentCity, setCurrentCity] = useState('');
  const [personCount, setPersonCount] = useState(0);
  const navigation = useNavigation();

  // AsyncStorage'dan verileri yükleme
  useEffect(() => {
    loadStoredData();
  }, []);

  // Değişiklikleri AsyncStorage'a kaydetme
  useEffect(() => {
    if (currentCity) {
      saveStoredData();
    }
  }, [currentCity, peopleList]);

  const loadStoredData = async () => {
    try {
      const storedCity = await AsyncStorage.getItem(STORED_CITY_KEY);
      const storedPeople = await AsyncStorage.getItem(STORED_PEOPLE_KEY);
      
      if (storedCity) {
        setCurrentCity(storedCity);
      }
      
      if (storedPeople) {
        const parsedPeople = JSON.parse(storedPeople);
        setPeopleList(parsedPeople);
        setPersonCount(parsedPeople.length);
      }
    } catch (error) {
      console.error('Kayıtlı veriler yüklenirken hata:', error);
    }
  };

  const saveStoredData = async () => {
    try {
      await AsyncStorage.setItem(STORED_CITY_KEY, currentCity);
      await AsyncStorage.setItem(STORED_PEOPLE_KEY, JSON.stringify(peopleList));
    } catch (error) {
      console.error('Veriler kaydedilirken hata:', error);
    }
  };

  // Kişileri yükleme fonksiyonu
  const loadCityContacts = async () => {
    try {
      const path = RNFS.DocumentDirectoryPath + '/UserCities.json';
      const fileExists = await RNFS.exists(path);
  
      if (fileExists) {
        const fileContent = await RNFS.readFile(path, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const cityData = jsonData.cities.find(city => city.name.trim() === currentCity);
        const count = cityData ? cityData.people.length : 0;
        setPersonCount(count);
  
        if (cityData) {
          const sortedPeople = [...cityData.people].sort((a, b) => 
            (a.displayName || '').localeCompare(b.displayName || '')
          );
          setPeopleList(sortedPeople);
        }
      }
    } catch (error) {
      console.error('Kişiler yüklenirken hata:', error);
    }
  };

  // Şehir değiştiğinde kişileri yükle
  useEffect(() => {
    if (currentCity) {
      loadCityContacts();
    }
  }, [currentCity]);

  // Konum izni ve şehir bilgisini alma
  const handleButtonClick = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'İzin Reddedildi',
        'Konum izni verilmediği için işlem gerçekleştirilemiyor.',
      );
      return;
    }
    await getLocation();
  };

  // NavigationService üzerinden konum alma
  const getLocation = async () => {
    try {
      const city = await NavigationService.getCityFromLocation();
      if (city) {
        setCurrentCity(city);
      }
    } catch (error) {
      Alert.alert(
        'Konum alınamadı', 
        'Lütfen konumunuzun açık olduğundan emin olunuz ve izinlerinizi kontrol ediniz'
      );
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>
        {typeof item === 'string'
          ? item
          : item.fullName || JSON.stringify(item)}
      </Text>
    </View>
  );

  const clearStoredData = async () => {
    try {
      await AsyncStorage.removeItem(STORED_CITY_KEY);
      await AsyncStorage.removeItem(STORED_PEOPLE_KEY);
      setCurrentCity('');
      setPeopleList([]);
      setPersonCount(0);
      Alert.alert('Başarılı', 'Kayıtlı veriler temizlendi');
    } catch (error) {
      console.error('Veriler temizlenirken hata:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon
              name="trending-flat"
              size={24}
              color="#fff"
              style={{transform: [{rotate: '180deg'}]}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentCity} Kişileri</Text>
          <TouchableOpacity 
            onPress={clearStoredData}
            style={styles.clearButton}>
            <Icon name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          {personCount === 0 ? (
            <Text style={styles.noResultText}>Kişi bulunamadı!</Text>
          ) : (
            <FlatList
              data={peopleList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
            <Text style={styles.buttonText}>Şehri Göster</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCityText}>
            Şu anki konum: {currentCity || 'Henüz bir şehir seçilmedi'}
          </Text>
        </View>
      </View>
    </View>
  );
};


export default YourCityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '90%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: '3%',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#42c0b8',
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rightIcon: {
    padding: 25,
    borderRadius: 50,
  },
  clearButton: {
    padding: 10,
    backgroundColor: '#42c0b8',
    borderRadius: 50,
  },
  backgroundTop: {
    width: '100%',
    height: '22%',
    alignItems: 'center',
    borderBottomLeftRadius: 85,
    backgroundColor: '#2cb9b0',
    position: 'absolute',
    top: 0,
  },
  backgroundTopRight: {
    width: '20%',
    height: '50%',
    backgroundColor: '#2cb9b0',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backgroundBottom: {
    width: '100%',
    height: '78%',
    backgroundColor: '#0c0d34',
    bottom: 0,
    position: 'absolute',
  },
  body: {
    width: '100%',
    height: '85%',
    paddingHorizontal: '10%',
    backgroundColor: '#fff',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  listItem: {
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#42c0b8',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedCityText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
