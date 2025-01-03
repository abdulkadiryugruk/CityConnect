import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import CustomTextInput from '../../components/CustomTextInput';
import Contacts from 'react-native-contacts'; // Rehberdeki kişileri almak için
import {useRoute, useNavigation} from '@react-navigation/native'; // Parametre almak için
import Icon from 'react-native-vector-icons/Ionicons';

const SelectContactScreen = () => {
  const route = useRoute(); // Ekrana gönderilen parametreyi al
  const navigation = useNavigation();
  const [peoples, setPeoples] = useState([]); // Rehberdeki kişiler
  const [unmatchedPeoples, setUnmatchedPeoples] = useState([]); // Eşleşmeyen kişiler
  const [search, setSearch] = useState(''); // Arama metni
  const [citiesData, setCitiesData] = useState([]); // UserCities.json verisi

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
      person =>
        !citiesData.some(city =>
          city.people?.some(p => p.fullName === person.displayName),
        ),
    );
    setUnmatchedPeoples(unmatched);
  }, [peoples, citiesData]); // peoples ve citiesData değiştiğinde tekrar çalışacak

  const filteredUnmatchedPeoples = unmatchedPeoples.filter(
    person =>
      person.displayName &&
      person.displayName.toLowerCase().includes(search?.toLowerCase() || ''),
  );
  const removeMatchedPerson = personName => {
    setUnmatchedPeoples(prev =>
      prev.filter(person => person.displayName !== personName),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
        <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Şehir Seç</Text>
                <TouchableOpacity style={styles.rightIcon}>
                  <Icon name="cart-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
        <CustomTextInput
          placeholder={'Kişi Ara'}
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
                  <TouchableOpacity
                    style={styles.peopleItem}
                    onPress={() =>
                      navigation.navigate('ContactAndCityScreen', {
                        peopleName: item.displayName,
                        removeMatchedPerson,
                      })
                    }>
                    <Text style={styles.cityText}>{item.displayName}</Text>
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

export default SelectContactScreen;

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
    marginVertical:'3%',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rightIcon: {
    padding: 5,
  },
  listStyle: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal:'10%',
  },
  peopleItem:{
    padding: 15,
    backgroundColor: '#f3f3f5',
    borderRadius: 50,
    justifyContent: 'center',
    width:'100%',
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
    paddingHorizontal:'5%'
  },
});
