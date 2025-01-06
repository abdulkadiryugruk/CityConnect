import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs'; // Dosya işlemleri için
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const YourCityScreen = () => {
  const [peopleList, setPeopleList] = useState([]);
  const navigation = useNavigation();
  

  useEffect(() => {
    const loadIstanbulContacts = async () => {
      try {
        // JSON dosyasını oku
        const path = RNFS.DocumentDirectoryPath + '/UserCities.json';
        const fileExists = await RNFS.exists(path);

        if (fileExists) {
          const fileContent = await RNFS.readFile(path, 'utf8');
          const jsonData = JSON.parse(fileContent);

          // Istanbul şehrini bul ve onun kişilerini al
          const istanbulCity = jsonData.cities.find(city => city.name.trim() === 'Istanbul');
          if (istanbulCity) {
			const sortedPeople = [...istanbulCity.people].sort((a, b) =>
			  a.fullName.localeCompare(b.fullName, 'tr', { sensitivity: 'base' }) // Türkçe harf sıralaması için
			);
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
    <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/>
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
    paddingHorizontal:'10%',
    backgroundColor: '#fff',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
  },
  listItem: {
    width:'100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems:'center',
    
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
  },
});
