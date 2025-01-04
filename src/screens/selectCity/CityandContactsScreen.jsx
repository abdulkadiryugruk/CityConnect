import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import CustomTextInput from '../../components/CustomTextInput';
import Contacts from 'react-native-contacts'; // Rehberdeki kişileri almak için
import {useRoute, useNavigation} from '@react-navigation/native'; // Parametre almak için
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için

const CityandContactsScreen = () => {
  const route = useRoute(); // Ekrana gönderilen parametreyi al
  const navigation = useNavigation();
  const [peoples, setPeoples] = useState([]); // Rehberdeki kişiler
  const [unmatchedPeoples, setUnmatchedPeoples] = useState([]); // Eşleşmeyen kişiler
  const [search, setSearch] = useState(''); // Arama metni
  const [citiesData, setCitiesData] = useState([]); // UserCities.json verisi
  const {cityName, cityId} = route.params; // Parametreleri destructuring ile alıyoruz

  useEffect(() => {
    const loadPeopleFromFile = async () => {
      try {
        // Rehberdeki kişileri almak için izin iste
        const permission = await Contacts.requestPermission();
        if (permission === 'authorized') {
          const contacts = await Contacts.getAll();
          // Alfabetik sıraya göre sırala
          const sortedContacts = contacts.sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
          );
          setPeoples(sortedContacts); // Sıralanmış listeyi state'e ata
        } else {
          console.log('Rehber izni verilmedi');
        }

        // UserCities.json dosyasındaki şehir ve kişileri yükle
        const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) {
          const fileContent = await RNFS.readFile(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          setCitiesData(jsonData.cities);
        } else {
          console.log('UserCities.json bulunamadı!');
        }
      } catch (error) {
        console.error('Kişiler yüklenirken hata oluştu:', error);
      }
    };
    loadPeopleFromFile();
  }, []); // Bu useEffect sadece component mount edildiğinde çalışacak

  useEffect(() => {
    // Rehberdeki kişilerle UserCities.json'daki kişileri karşılaştırarak eşleşmeyenleri ayıklıyoruz
    const unmatched = peoples.filter(
      people =>
        !citiesData.some(city =>
          city.people?.some(p => p.fullName === people.displayName),
        ),
    );
    setUnmatchedPeoples(unmatched);
  }, [peoples, citiesData]); // peoples ve citiesData değiştiğinde tekrar çalışacak

  const filteredUnmatchedPeoples = unmatchedPeoples.filter(
    people =>
      people.displayName &&
      people.displayName.toLowerCase().includes(search?.toLowerCase() || ''),
  );

  const handleAddToCity = async people => {
    try {
      // Şehirler listesine ekleme işlemi
      const updatedCitiesData = citiesData.map(city => {
        if (city.name === cityName) {
          // Seçilen şehirdeki kişilere ekleme
          return {
            ...city,
            people: [...(city.people || []), {fullName: people.displayName}],
          };
        }
        return city;
      });

      // Güncellenmiş şehirler verisini UserCities.json dosyasına kaydetme
      const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
      await RNFS.writeFile(
        filePath,
        JSON.stringify({cities: updatedCitiesData}),
        'utf8',
      );

      // Rehberdeki kişiyi eşleşen kişilerden çıkarma
      setUnmatchedPeoples(
        unmatchedPeoples.filter(p => p.displayName !== people.displayName),
      );

      // Güncellenmiş şehirler verisini state'e kaydetme
      setCitiesData(updatedCitiesData);

      console.log(`Kişi ${people.displayName} ${cityName} şehrine eklendi!`);
    } catch (error) {
      console.error('Şehre eklerken hata oluştu:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şehir Seç</Text>
        <TouchableOpacity style={styles.rightIcon}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

        <CustomTextInput
          placeholder={'Eşleşmeyen Kişi Ara'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          {filteredUnmatchedPeoples.length === 0 ? (
            <Text style={styles.noResultText}>Eşleşmeyen kişi bulunamadı!</Text>
          ) : (
            <FlatList
              style={styles.listStyle}
              data={filteredUnmatchedPeoples}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View style={styles.row}>
                  <Text style={styles.cityText}>{item.displayName}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCity(item)} // Kişi eklenince listeden kaybolacak
                  >
                    <Text style={styles.addButtonText}>Şehre Ekle</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default CityandContactsScreen;

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
  listStyle: {
    width: '100%',
  },
  row: {
    width: '72%',
    marginHorizontal: '14%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 85,
    justifyContent: 'space-between',
  },
  cityText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cityTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 0,
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
  },
});
