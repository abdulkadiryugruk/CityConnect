import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomTextInput from '../../components/CustomTextInput';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import { useNavigation } from '@react-navigation/native'; // useNavigation hook'u eklendi

const SelectCityScreen = () => {
  const [cities, setCities] = useState([]); // UserCities.json'dan alınacak şehirler
  const [search, setSearch] = useState('');
  const navigation = useNavigation(); // navigation nesnesini hook ile alıyoruz

  useEffect(() => {
    const loadCitiesFromFile = async () => {
      try {
        const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) {
          const fileContent = await RNFS.readFile(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          setCities(jsonData.cities); // UserCities.json'daki şehirleri set et
        } else {
          console.log('UserCities.json bulunamadı!');
        }
      } catch (error) {
        console.error('Şehirler yüklenirken hata oluştu:', error);
      }
    };

    loadCitiesFromFile();
  }, []);

  const filteredCities = cities.filter(
    city =>
      city.name &&
      city.name.toLowerCase().includes(search?.toLowerCase() || '')
  );


  const renderCityItem = ({item, index}) => (
    <View style={styles.row}>
      <Text style={styles.number}>{index + 1}.</Text>
      <TouchableOpacity
  style={styles.cityItem}
  onPress={() => navigation.navigate('CityandContactsScreen', { cityName: item.name})}
>
  <Text style={styles.cityText}>{item.name.toUpperCase()}</Text>
</TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomTextInput
        placeholder={'Şehir Ara'}
        value={search}
        onChangeText={text => setSearch(text)}
      />

      {filteredCities.length === 0 ? (
        <Text style={styles.noResultText}>Şehir bulunamadı!</Text>
      ) : (
        <FlatList
          style={styles.listStyle}
          data={filteredCities}
          renderItem={renderCityItem}
          keyExtractor={item => item.name}
          initialNumToRender={11}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

export default SelectCityScreen;

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
    paddingRight: '10%',
  },
  number: {
    width: '20%',
    fontSize: 20,
    fontWeight: '600',
    color: 'gray',
  },
  cityItem: {
    padding: 15,
    backgroundColor: '#2cb9b0',
    borderRadius: 50,
    width:'70%',
    justifyContent: 'center',
  },
  cityText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
});
