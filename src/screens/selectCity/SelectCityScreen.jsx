import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomTextInput from '../../components/CustomTextInput';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import {useNavigation} from '@react-navigation/native'; // useNavigation hook'u eklendi
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için


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
      city.name.toLowerCase().includes(search?.toLowerCase() || ''),
  );

  const renderCityItem = ({item}) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.cityItem}
        onPress={() =>
          navigation.navigate('CityandContactsScreen', {cityName: item.name})
        }>
        <Text style={styles.cityText}>{item.name.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>


      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şehir Seç</Text>
        <View style={styles.rightIcon} />
      </View>


        <CustomTextInput
          placeholder={'Şehir Ara'}
          value={search} 
          onChangeText={text => setSearch(text)}
        />
      </View>



      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
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
      </View>
    </View>
  );
};

export default SelectCityScreen;

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
    padding: 10,
    backgroundColor:'#42c0b8',
    borderRadius:50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  rightIcon: {
    padding: 25,
    borderRadius:50,
  },
  listStyle: {
    width: '100%',
  },
  row: {
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: '5%',
  },
  cityItem: {
    padding: 10,
    backgroundColor: '#2cb9b0',
    borderRadius: 50,
    width: '60%',
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
