import {StyleSheet, Text, View, FlatList} from 'react-native';
import React, {useState, useEffect} from 'react';
import RNFS from 'react-native-fs';
import CustomTextInput from '../components/CustomTextInput';

const EditScreen = () => {
  const [peoples, setPeoples] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadPeopleFromFile = async () => {
      try {
        const filePath = RNFS.DocumentDirectoryPath + '/UserCities.json';
        const fileExists = await RNFS.exists(filePath);

        if (fileExists) {
          // TODO burada UserCities.json dosyasi degil rehberdeki kisiler yazdirilacak
          const fileContent = await RNFS.readFile(filePath, 'utf8');
          const jsonData = JSON.parse(fileContent);
          const allPeople = jsonData.cities.flatMap(city => city.people || []);
          setPeoples(allPeople);
        } else {
          console.log('UserCities.json bulunamadı!');
        }
      } catch (error) {
        console.error('Kişiler yüklenirken hata oluştu:', error);
      }
    };

    loadPeopleFromFile();
  }, []);

  const filteredPeoples = peoples.filter(people =>
    people.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <CustomTextInput
        placeholder={'Kişi Ara'}
        value={search}
        onChangeText={text => setSearch(text)}
      />
      {filteredPeoples.length === 0 ? (
        <Text style={styles.noResultText}>Kişi bulunamadı!</Text>
      ) : (
        <FlatList
          style={styles.listStyle}
          data={filteredPeoples}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.row}>
              <Text style={styles.cityText}>{item.fullName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default EditScreen;

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
});
