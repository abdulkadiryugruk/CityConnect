import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {requestLocationPermission} from './permissions/LocationPermission';
import { NativeModules } from 'react-native';


const YourCityScreen = () => {
  const [peopleList, setPeopleList] = useState([]);
  const [currentCity, setCurrentCity] = useState('');
  const [personCount, setPersonCount] = useState(0);
  const navigation = useNavigation();

  // Başlangıçta şehri yükleme
  useEffect(() => {
    const fetchStoredCity = async () => {
      try {
        const storedCity = await NativeModules.SharedPreferencesModule.getString('CityPrefs', 'last_known_city');
        setCurrentCity(storedCity);
      } catch (error) {
        console.error('Şehir yüklenirken hata:', error);
      }
    };

    fetchStoredCity();
  }, []);

  // Kişileri yükleme fonksiyonu
  const loadCityContacts = useCallback(async () => {
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
  }, [currentCity]);
  
  // Şehir değiştiğinde kişileri yükle
  useEffect(() => {
    if (currentCity) {
      loadCityContacts();
    }
  }, [currentCity, loadCityContacts]);

  const renderItem = ({item}) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>
        {typeof item === 'string'
          ? item
          : item.fullName || JSON.stringify(item)}
      </Text>
    </View>
  );

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
          <View style={styles.rightIcon} />
        </View>
      </View>
      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          {personCount === 0 ? (
            <Text style={styles.noResultText}>Kişi bulunamadı!</Text>
          ) : (
            <FlatList
            showsVerticalScrollIndicator={false}
              data={peopleList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
            />
          )}
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
});
