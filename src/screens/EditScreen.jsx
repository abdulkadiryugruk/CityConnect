<<<<<<< HEAD
import React, {useState, useEffect} from 'react';
import CustomTextInput from '../components/CustomTextInput';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CityRow = React.memo(
  ({
    city,
    expandedCities,
    toggleCity,
    handleClearCityPeople,
    selectedPeoples,
    handleSelectPerson,
  }) => {
    const sortedPeople = city.people.sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );

    return (
      <View style={styles.cityContainer}>
        <TouchableOpacity
          style={styles.cityHeader}
          onPress={() => toggleCity(city.name)}
          onLongPress={() => {
            Alert.alert(
              'Şehir Kişilerini Temizle',
              `${city.name} şehrindeki tüm kişileri silmek istiyor musunuz?`,
              [
                {text: 'İptal', style: 'cancel'},
                {text: 'Evet', onPress: () => handleClearCityPeople(city.name)},
              ],
            );
          }}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Icon
            name={
              expandedCities[city.name]
                ? 'keyboard-arrow-down'
                : 'keyboard-arrow-left'
            }
            size={24}
            color="tomato"
          />
        </TouchableOpacity>

        {expandedCities[city.name] && (
          <FlatList
            data={sortedPeople}
            keyExtractor={(person, index) => `${city.name}-${index}`}
            renderItem={({item}) => (
              <PersonRow
                person={item}
                onSelect={() => handleSelectPerson(item)}
                selectedPeoples={selectedPeoples}
              />
            )}
          />
        )}
      </View>
    );
  },
);

const PersonRow = React.memo(({person, onSelect, selectedPeoples}) => {
  return (
    <TouchableOpacity
      style={[
        styles.personRow,
        selectedPeoples.some(p => p.fullName === person.fullName) &&
          styles.selectedPerson,
      ]}
      onPress={onSelect}>
      <Text style={styles.personText}>{person.fullName}</Text>
      {selectedPeoples.some(p => p.fullName === person.fullName) && (
        <Icon name="check-circle" size={20} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );
});

const EditScreen = () => {
  const [cities, setCities] = useState([]);
  const [expandedCities, setExpandedCities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
  const navigation = useNavigation();
  const [selectedPeoples, setSelectedPeoples] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          const fileData = await RNFS.readFile(filePath, 'utf8');
          const parsedData = JSON.parse(fileData);
          setCities(parsedData.cities || []);
          // Varsayılan olarak tüm şehirler kapali
          const initialExpandedState = {};
          parsedData.cities.forEach(city => {
            initialExpandedState[city.name] = false;
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
  }, [filePath]);

  const filteredCities = cities
    .map(city => {
      const cityNameMatches =
        city.name &&
        city.name.toLowerCase().includes(searchQuery?.toLowerCase() || '');
      if (cityNameMatches && city.people.length > 0) {
        return {...city};
      }
      const matchingPeople = city.people.filter(
        person =>
          person.fullName &&
          person.fullName
            .toLowerCase()
            .includes(searchQuery?.toLowerCase() || ''),
      );
      if (matchingPeople.length > 0) {
        return {...city, people: matchingPeople};
      }
      return null;
    })
    .filter(city => city !== null);

  const toggleCity = cityName => {
    setExpandedCities(prev => ({...prev, [cityName]: !prev[cityName]}));
  };

  const handleClearCityPeople = cityName => {
    const updatedCities = cities.map(city => {
      if (city.name === cityName) {
        return {...city, people: []}; // Şehirdeki kişileri sıfırlama
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

  const handleSelectPerson = person => {
    setSelectedPeoples(prevSelected => {
      if (prevSelected.some(p => p.fullName === person.fullName)) {
        return prevSelected.filter(p => p.fullName !== person.fullName);
      } else {
        return [...prevSelected, person];
      }
    });
  };

  const handleMultiAddToCity = () => {
    if (selectedPeoples.length > 0) {
      Alert.alert(
        'Seçilen Kişiler Silinsin mi?',
        `${selectedPeoples.length} kişiyi manuel ekleme kısmından tekrar ekleyebilirsiniz.`,
        [
          {
            text: 'İptal',
            style: 'cancel',
          },
          {
            text: 'Evet',
            onPress: () => {
              const updatedCities = cities.map(city => ({
                ...city,
                people: city.people.filter(
                  person =>
                    !selectedPeoples.some(p => p.fullName === person.fullName),
                ),
              }));

              saveUpdatedCitiesToFile(updatedCities);

              setCities(updatedCities);
              setSelectedPeoples([]);

              ToastAndroid.show(
                `${selectedPeoples.length} kişi silindi`,
                ToastAndroid.SHORT,
              );
            },
          },
        ],
      );
    } else {
      ToastAndroid.show('Silinecek kişi yok', ToastAndroid.SHORT);
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
          <Text style={styles.headerTitle}>Duzenle</Text>
          {selectedPeoples.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleMultiAddToCity}>
              <Icon name="delete" size={27} color="white" />
              <Text style={styles.deleteButtonText}>
                {selectedPeoples.length}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.rightIcon}></View>
          )}
        </View>
        <CustomTextInput
          style={styles.searchBar}
          placeholder={'Şehir veya kişi Ara...'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          {filteredCities.length === 0 ? (
            <Text style={styles.noResultText}>Kayitli Kişi bulunamadı!</Text>
          ) : (
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => `${item.name}-${index}`}
              renderItem={({item}) => (
                <CityRow
                  city={item}
                  expandedCities={expandedCities}
                  toggleCity={toggleCity}
                  handleClearCityPeople={handleClearCityPeople}
                  selectedPeoples={selectedPeoples}
                  handleSelectPerson={handleSelectPerson}
                />
              )}
            />
          )}
        </View>
      </View>
    </View>
  );
=======
import React, { useState, useEffect } from 'react';
import CustomTextInput from '../components/CustomTextInput';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs'; // Dosya işlemleri için
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için

const CityRow = React.memo(({ city, expandedCities, toggleCity, handleClearCityPeople, selectedPeoples, handleSelectPerson }) => {
    const sortedPeople = city.people.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return (
        <View style={styles.cityContainer}>
            <TouchableOpacity
                style={styles.cityHeader}
                onPress={() => toggleCity(city.name)}
                onLongPress={() => {
                    Alert.alert(
                        "Şehir Kişilerini Temizle",
                        `${city.name} şehrindeki tüm kişileri silmek istiyor musunuz?`,
                        [
                            { text: "İptal", style: "cancel" },
                            { text: "Evet", onPress: () => handleClearCityPeople(city.name) }
                        ]
                    );
                }}
            >
                <Text style={styles.cityName}>{city.name}</Text>
                <Icon name={expandedCities[city.name] ? 'keyboard-arrow-down' : 'keyboard-arrow-left'} size={24} color="tomato" />
            </TouchableOpacity>

            {expandedCities[city.name] && (
                <FlatList
                    data={sortedPeople}
                    keyExtractor={(person, index) => `${city.name}-${index}`}
                    renderItem={({ item }) => (
                        <PersonRow person={item} onSelect={() => handleSelectPerson(item)} selectedPeoples={selectedPeoples} />
                    )}
                />
            )}
        </View>
    );
});

const PersonRow = React.memo(({ person, onSelect, selectedPeoples }) => {
    return (
        <TouchableOpacity
            style={[styles.personRow, selectedPeoples.some(p => p.fullName === person.fullName) && styles.selectedPerson]}
            onPress={onSelect}
        >
            <Text style={styles.personText}>{person.fullName}</Text>
            {selectedPeoples.some(p => p.fullName === person.fullName) && (
                <Icon name="check-circle" size={20} color="#4CAF50" />
            )}
        </TouchableOpacity>
    );
});

const EditScreen = () => {
    const [cities, setCities] = useState([]);
    const [expandedCities, setExpandedCities] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
    const navigation = useNavigation();
    const [selectedPeoples, setSelectedPeoples] = useState([]);

    // Uygulama başladığında dosyayı yükle veya oluştur
    useEffect(() => {
        const initializeData = async () => {
            try {
                const fileExists = await RNFS.exists(filePath);
                if (fileExists) {
                    const fileData = await RNFS.readFile(filePath, 'utf8');
                    const parsedData = JSON.parse(fileData);
                    setCities(parsedData.cities || []);
                    // Varsayılan olarak tüm şehirler kapali
                    const initialExpandedState = {};
                    parsedData.cities.forEach(city => {
                        initialExpandedState[city.name] = false;
                    });
                    setExpandedCities(initialExpandedState);
                } else {
                    const defaultData = { cities: [] };
                    await RNFS.writeFile(filePath, JSON.stringify(defaultData), 'utf8');
                    setCities(defaultData.cities);
                }
            } catch (error) {
                console.error('Dosya başlatma hatası:', error);
            }
        };
        initializeData();
    }, [filePath]);

    const filteredCities = cities
        .map(city => {
            const matchingPeople = city.people.filter(person =>
                person.fullName && person.fullName.toLowerCase().includes(searchQuery?.toLowerCase() || '')
            );
            if (city.people.length > 0 && ((city.name && city.name.toLowerCase().includes(searchQuery?.toLowerCase() || '')) || matchingPeople.length > 0)) {
                return { ...city, people: matchingPeople };
            }
            return null;
        })
        .filter(city => city !== null); // null değerleri filtrele

    const toggleCity = cityName => {
        setExpandedCities(prev => ({ ...prev, [cityName]: !prev[cityName] }));
    };

    const handleClearCityPeople = (cityName) => {
        const updatedCities = cities.map(city => {
            if (city.name === cityName) {
                return { ...city, people: [] }; // Şehirdeki tüm kişileri sıfırla
            }
            return city;
        });
        saveUpdatedCitiesToFile(updatedCities);
        setCities(updatedCities);
    };

    const saveUpdatedCitiesToFile = async updatedCities => {
        try {
            const jsonData = JSON.stringify({ cities: updatedCities }, null, 2);
            await RNFS.writeFile(filePath, jsonData, 'utf8');
        } catch (error) {
            console.error('JSON dosyasına yazılamadı:', error);
        }
    };

    const handleSelectPerson = (person) => {
        setSelectedPeoples(prevSelected => {
            if (prevSelected.some(p => p.fullName === person.fullName)) {
                return prevSelected.filter(p => p.fullName !== person.fullName); // Eğer kişi seçiliyse, çıkar
            } else {
                return [...prevSelected, person]; // Eğer kişi seçili değilse, ekle
            }
        });
    };

    const handleMultiAddToCity = () => {
        if (selectedPeoples.length > 0) {
            // Onay penceresini göster
            Alert.alert(
                "Seçilen Kişiler Silinsin mi?",
                `${selectedPeoples.length} kişiyi manuel ekleme kısmından tekrar ekleyebilirsiniz.`,
                [
                    {
                        text: "İptal", style: "cancel",
                    },
                    {
                        text: "Evet", onPress: () => {
                            // Kişileri silme işlemi
                            const updatedCities = cities.map(city => ({
                                ...city,
                                people: city.people.filter(person => !selectedPeoples.some(p => p.fullName === person.fullName)),
                            }));

                            // Güncellenen şehirleri dosyaya kaydet
                            saveUpdatedCitiesToFile(updatedCities);

                            // Kişi listesini temizle
                            setCities(updatedCities);
                            setSelectedPeoples([]); // Seçilen kişileri sıfırla

                            // Toast bildirimi göster
                            ToastAndroid.show(`${selectedPeoples.length} kişi silindi`, ToastAndroid.SHORT);
                        },
                    },
                ]
            );
        } else {
            ToastAndroid.show("Silinecek kişi yok", ToastAndroid.SHORT);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundTop}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Duzenle</Text>
                    {selectedPeoples.length > 0 ? (
                        <TouchableOpacity style={styles.clearButton} onPress={handleMultiAddToCity}>
                            <Icon name="delete" size={27} color="white" />
                            <Text style={styles.deleteButtonText}>{selectedPeoples.length}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.rightIcon}></View>
                    )}
                </View>
                <CustomTextInput
                    style={styles.searchBar}
                    placeholder={'Şehir veya kişi Ara...'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.backgroundBottom}>
                <View style={styles.backgroundTopRight}></View>
                <View style={styles.body}>
                    {filteredCities.length === 0 ? (
                        <Text style={styles.noResultText}>Kayitli Kişi bulunamadı!</Text>
                    ) : (
                        <FlatList
                            data={filteredCities}
                            keyExtractor={(item, index) => `${item.name}-${index}`}
                            renderItem={({ item }) => <CityRow city={item} expandedCities={expandedCities} toggleCity={toggleCity} handleClearCityPeople={handleClearCityPeople} selectedPeoples={selectedPeoples} handleSelectPerson={handleSelectPerson} />}
                        />
                    )}
                </View>
            </View>
        </View>
    );
>>>>>>> 9f2dc74ad2a8833bcd55715ece2784958229cebd
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
  clearButton: {
    padding: 10,
<<<<<<< HEAD
    backgroundColor: '#42c0b8',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
=======
   backgroundColor: '#42c0b8',
   borderRadius: 50,
   alignItems:'center',
   justifyContent:'center',
>>>>>>> 9f2dc74ad2a8833bcd55715ece2784958229cebd
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
<<<<<<< HEAD
    position: 'absolute',
    left: 3,
    top: 3,
=======
    position:'absolute',
    left:3,
    top:3,
>>>>>>> 9f2dc74ad2a8833bcd55715ece2784958229cebd
  },
  rightIcon: {
    padding: 25,
    borderRadius: 50,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  cityContainer: {
    width: '72%',
    marginHorizontal: '14%',
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
    color: 'tomato',
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedPerson: {
    backgroundColor: '#e0f7fa',
    borderColor: '#42c0b8', // Seçilen kişi için arka plan rengi
    borderWidth: 2,
  },
  personText: {
    fontSize: 16,
    color: 'black',
    width: '80%',
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
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
    paddingVertical: 5,
  },
  cityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
