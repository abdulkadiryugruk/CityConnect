import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import CustomTextInput from '../../components/CustomTextInput';
import Contacts from 'react-native-contacts'; // Rehberdeki kişileri almak için
import { useRoute, useNavigation } from '@react-navigation/native'; // Parametre almak için

const CityandContactsScreen = () => {
  const route = useRoute(); // Ekrana gönderilen parametreyi al
  const navigation = useNavigation();
  const [peoples, setPeoples] = useState([]); // Rehberdeki kişiler
  const [unmatchedPeoples, setUnmatchedPeoples] = useState([]); // Eşleşmeyen kişiler
  const [search, setSearch] = useState('');
  const [citiesData, setCitiesData] = useState([]); // UserCities.json verisi
  const {cityName, cityId} = route.params; // Parametreleri destructuring ile alıyoruz

  useEffect(() => {
    const loadPeopleFromFile = async () => {
      try {
        // Rehberdeki kişileri almak için izin iste
        Contacts.requestPermission().then(permission => {
          if (permission === 'authorized') {
            Contacts.getAll().then(contacts => {
              // Rehberdeki kişileri set et
              setPeoples(contacts);
            });
          } else {
            console.log('Rehber izni verilmedi');
          }
        });

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
  }, []); // Sadece bir kez yükleme yapılacak

  useEffect(() => {
    // Rehberdeki kişilerle UserCities.json'daki kişileri karşılaştırarak eşleşmeyenleri ayıklıyoruz
    const unmatched = peoples.filter(person =>
      !citiesData.some(city =>
        city.people?.some(p => p.fullName === person.displayName),
      ),
    );
    setUnmatchedPeoples(unmatched);
  }, [peoples, citiesData]); // peoples veya citiesData değişirse eşleşmeyen kişileri güncelle

  const filteredUnmatchedPeoples = unmatchedPeoples.filter(people =>
    people.displayName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAddToCity = (person) => {
    // Burada manuel olarak şehre eklemek için bir işlem yapılacak
    console.log(`Kişi ${person.displayName} şehre eklenecek!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.cityTitle}>{cityName} Şehri</Text>
      <CustomTextInput
        placeholder={'Eşleşmeyen Kişi Ara'}
        value={search}
        onChangeText={text => setSearch(text)}
      />
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
                // TODO kisiyi sehre ekle dendiginde burdaki listeden kaybolacak ve konsolda yazsin eklenip eklenmedigini gorelim. ayrica islemler sagliklimi chatGPT ye sorulacak!!
                onPress={() => handleAddToCity(item)}>
                <Text style={styles.addButtonText}>Şehre Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default CityandContactsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  listStyle: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
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
    marginBottom:0,

  },
});
