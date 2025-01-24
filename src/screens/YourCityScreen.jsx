import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import RNFS from 'react-native-fs'; // Dosya işlemleri için
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestLocationPermission } from './permissions/LocationPermission';
import Geolocation from '@react-native-community/geolocation';

const YourCityScreen = () => {
  const [peopleList, setPeopleList] = useState([]);
  const [currentCity, setCurrentCity] = useState("");
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();
  const OPENCAGE_API_KEY = "bf4aca4de1f547e1a5102b7c8e932203"; // OpenCage API anahtarınız

  // İstanbul'daki kişileri yüklemek
  useEffect(() => {
    const loadIstanbulContacts = async () => {
      try {
        const path = RNFS.DocumentDirectoryPath + '/UserCities.json';
        const fileExists = await RNFS.exists(path);

        if (fileExists) {
          const fileContent = await RNFS.readFile(path, 'utf8');
          const jsonData = JSON.parse(fileContent);

          const istanbulCity = jsonData.cities.find(city => city.name.trim() === 'Istanbul');
          if (istanbulCity) {
            const sortedPeople = [...istanbulCity.people].sort((a, b) =>{
              // displayName geçerli değilse, sıralama yapma
              if (!a.displayName) return 1; 
              if (!b.displayName) return -1;
              return a.displayName.localeCompare(b.displayName);
            });
            setPeopleList(sortedPeople);
          } else {
            console.log('Istanbul şehri bulunamadı!');
          }
        } else {
          console.log('UserCities.json dosyası bulunamadı!');
        }
      } catch (error) {
        console.error('Istanbul kişileri yüklenirken hata oluştu:', error);
      }
    };

    loadIstanbulContacts();
  }, []);

  // Konum izni ve şehir bilgisini alma işlemi
  const handleButtonClick = async () => {
    const hasPermission = await requestLocationPermission(); // Konum izni kontrolü
    if (!hasPermission) {
      Alert.alert("İzin Reddedildi", "Konum izni verilmediği için işlem gerçekleştirilemiyor.");
      return;
    }

    // Konum alındıktan sonra şehir bilgisini almak
    await getLocation(); // location state'ini güncelle
  };

  // Kullanıcıdan konum alma
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      async (position) => {
        setLocation(position.coords);
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=${OPENCAGE_API_KEY}`
        );
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          const city = data.results[0].components.city || "Şehir bulunamadı";
          setCurrentCity(city); // Şehir bilgisi durumu güncelleniyor
        } else {
          Alert.alert("Hata", "Şehir bilgisi alınamadı.");
        }
      },
      (error) => {
        console.error(error);
        Alert.alert('Konum alınamadı', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>
        {typeof item === 'string' ? item : item.fullName || JSON.stringify(item)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Istanbul'daki Kişiler</Text>
          <TouchableOpacity style={styles.rightIcon}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          <FlatList
            data={peopleList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
          <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
            <Text style={styles.buttonText}>Şehri Göster</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCityText}>
            Şu anki konum: {currentCity || "Henüz bir şehir seçilmedi"}
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
