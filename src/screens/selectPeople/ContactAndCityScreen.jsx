import {StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ToastAndroid} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomTextInput from '../../components/CustomTextInput';
import RNFS from 'react-native-fs'; // Dosya sistemi için
import {useNavigation, useRoute, useIsFocused} from '@react-navigation/native'; // useNavigation hook'u eklendi
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için



const ContactAndCityScreen = () => {
  const route = useRoute();
  const isFocused = useIsFocused(); // Odaklanma kontrolü
  const {peopleName} = route.params;
  const [cities, setCities] = useState([]); // UserCities.json'dan alınacak şehirler
  const [search, setSearch] = useState(''); // Arama metni
  const navigation = useNavigation(); // navigation nesnesini hook ile alıyoruz

  // useEffect(() => {
  //   navigation.setOptions({
  //     removeMatchedPerson: (name) => {
  //       console.log(`${name} başarıyla kaldırıldı.`);
  //       // Burada removeMatchedPerson fonksiyonunu istediğiniz gibi kullanabilirsiniz
  //     },
  //   });
  // }, [navigation]);

  useEffect(() => {
    if (isFocused){
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
  }
  }, [isFocused]);

  const filteredCities = cities.filter(
    city =>
      city.name &&
      city.name.toLowerCase().includes(search?.toLowerCase() || '')
  );

const handleAddToPeople = async (city) => {
  Alert.alert(
    'Kişi Ekleme',
    `${peopleName} kişisini ${city.name} şehrine eklemek istediğinize emin misiniz?`,
    [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Evet, Ekle',
        onPress: async () => {
          try {
            const updatedCities = cities.map((item) => {
              if (item.name === city.name) {
                return {
                  ...item,
                  people: [...(item.people || []), { fullName: peopleName }],
                };
              }
              return item;
            });

            const updatedData = { cities: updatedCities };
            const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
            await RNFS.writeFile(filePath, JSON.stringify(updatedData), 'utf8');

            setCities(updatedCities);

            // navigation.getParent()?.removeMatchedPerson?.(peopleName);
            navigation.getParent()?.getState()?.routes?.find(
              route => route.name === 'SelectContactScreen'
            )?.options?.removeMatchedPerson?.(peopleName);

            ToastAndroid.showWithGravityAndOffset(
              `${peopleName}, ${city.name} şehrine eklendi!`,
              ToastAndroid.LONG,
              ToastAndroid.BOTTOM,
              25,
              50
            );
            navigation.goBack();
          } catch (error) {
            console.error('Kişi eklenirken hata oluştu:', error);
          }
        },
      },
    ]
  );
};

  const renderCityItem = ({ item, index }) => (
    <View style={styles.row}>
      <View style={styles.cityContainer}>
        <Text style={styles.cityText}>{item.name.toLocaleUpperCase("tr-TR")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToPeople(item)} // Kişi eklenince listeden kaybolacak
        >
          <Text style={styles.addButtonText}>Şehre Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{peopleName}</Text>
        <TouchableOpacity style={styles.rightIcon}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <CustomTextInput
        placeholder={'Şehir Ara'}
        value={search}
        onChangeText={text => setSearch(text)}
        style={styles.searchInput}
      />
      </View>

      <View style={styles.backgroundBottom}>
<View style={styles.backgroundTopRight}></View>

<View style={styles.body}>
      {filteredCities.length === 0 ? (
        <Text style={styles.noResultText}>Şehir bulunamadı!</Text>
      ) : (
        <FlatList
        showsVerticalScrollIndicator={false}
          style={styles.listStyle}
          data={filteredCities}
          renderItem={renderCityItem}
          keyExtractor={(item, index) => index.toString()}
          initialNumToRender={11}
          removeClippedSubviews={true}
        />
      )}
      </View>
      </View>
    </View>
  );
};

export default ContactAndCityScreen;

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
  listStyle: {
    width: '100%',
  },
  row: {
    width:'72%',
    marginHorizontal:'14%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 85,
    justifyContent: 'space-between',
  },
  number: {
    width: '10%',
    fontSize: 20,
    fontWeight: '600',
    color: 'gray',
  },
  cityContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    textAlign: 'left',
    flex: 1,
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
    paddingVertical:5,
  },
});

