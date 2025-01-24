/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import CustomTextInput from '../components/CustomTextInput';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import RNFS from 'react-native-fs'; // Dosya işlemleri için
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için

const EditScreen = () => {
  const [cities, setCities] = useState([]);
  const [expandedCities, setExpandedCities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
  const navigation = useNavigation();

  // Uygulama başladığında dosyayı yükle veya oluştur
  useEffect(() => {
    const initializeData = async () => {
      try {
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) {
          const fileData = await RNFS.readFile(filePath, 'utf8');
          const parsedData = JSON.parse(fileData);
          setCities(parsedData.cities || []);

          // Varsayılan olarak tüm şehirleri açık hale getir
          const initialExpandedState = {};
          parsedData.cities.forEach(city => {
            initialExpandedState[city.name] = true;
          });
          setExpandedCities(initialExpandedState);
        } else {
          const defaultData = {cities: []};
          await RNFS.writeFile(filePath, JSON.stringify(defaultData), 'utf8');
          setCities(defaultData.cities);
        }
      } catch (error) {
        console.error('Dosya başlatma hatası:', error);
      }
    };

    initializeData();
  }, []);

  const filteredCities = cities
    .map(city => {
      const matchingPeople = city.people.filter(
        person =>
          person.fullName &&
          person.fullName
            .toLowerCase()
            .includes(searchQuery?.toLowerCase() || ''),
      );

      if (
        (city.name &&
          city.name.toLowerCase().includes(searchQuery?.toLowerCase() || '')) ||
        matchingPeople.length > 0
      ) {
        return {
          ...city,
          people: matchingPeople,
        };
      }

      return null;
    })
    .filter(city => city !== null);
  // null değerleri filtrele

  const toggleCity = cityName => {
    setExpandedCities(prev => ({
      ...prev,
      [cityName]: !prev[cityName],
    }));
  };

  const handleRemovePerson = (cityName, person) => {
    const updatedCities = cities.map(city => {
      if (city.name === cityName) {
        return {
          ...city,
          people: city.people.filter(p => p.fullName !== person.fullName),
        };
      }
      return city;
    });

    saveUpdatedCitiesToFile(updatedCities);
    setCities(updatedCities);
  };

  const saveUpdatedCitiesToFile = async updatedCities => {
    try {
      const jsonData = JSON.stringify({cities: updatedCities}, null, 2);
      await RNFS.writeFile(filePath, jsonData, 'utf8');
    } catch (error) {
      console.error('JSON dosyasına yazılamadı:', error);
    }
  };

  const CityRow = React.memo(({city}) => {
    return (
      <View style={styles.cityContainer}>
        <TouchableOpacity onPress={() => toggleCity(city.name)}>
          <Text style={styles.cityName}>{city.name}</Text>
        </TouchableOpacity>
        {expandedCities[city.name] && (
          <FlatList
            data={city.people}
            keyExtractor={(person, index) => `${city.name}-${index}`}
            renderItem={({item}) => (
              <PersonRow
                person={item}
                onRemove={() => handleRemovePerson(city.name, item)}
              />
            )}
          />
        )}
      </View>
    );
  });

  const PersonRow = React.memo(({person, onRemove}) => {
    return (
      <View style={styles.personRow}>
        <Text style={styles.personText}>{person.fullName}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>Çıkar</Text>
        </TouchableOpacity>
      </View>
    );
  });

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
        style={styles.searchBar}
        placeholder={'Şehir veya kisi Ara...'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
</View>

      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
      <FlatList
        data={filteredCities}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({item}) => <CityRow city={item} />}
        initialNumToRender={10}
        windowSize={5}
      />
      </View>
      </View>
    </View>
  );
};

export default EditScreen;

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
        padding: 10,
    backgroundColor:'#42c0b8',
    borderRadius:50,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  cityContainer: {
    width:'72%',
    marginHorizontal:'14%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'tomato'
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginVertical: 2,
  },
  personText: {
    fontSize: 16,
    color:'black',
    width:'80%'
  },
  removeButton: {
    backgroundColor: 'tomato',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
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
    width:'100%',
    height: '85%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
    paddingVertical:5,
  },
});
