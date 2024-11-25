import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import CustomTextInput from '../../components/CustomTextInput';
import citiesData from '../../data/countries/Turkey/Cities.json';

const SelectCityScreen = () => {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCities(citiesData.cities);
  }, []);

  // Arama filtresi
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderCityItem = ({ item, index }) => (
    <View style={styles.row}>
      {/* Sıra numarası */}
      <Text style={styles.number}>{index + 1}.</Text>
      {/* Şehir ismi */}
      <TouchableOpacity style={styles.cityItem}>
        <Text style={styles.cityText}>{item.name.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomTextInput
        placeholder={'Şehir Ara'}
        value={search}
        onChangeText={(text) => setSearch(text)}
      />

      {filteredCities.length === 0 ? (
        <Text style={styles.noResultText}>Şehir bulunamadı!</Text>
      ) : (
        <FlatList
          style={styles.listStyle}
          data={filteredCities}
          renderItem={renderCityItem}
          keyExtractor={(item) => item.name}
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
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  listStyle: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
	paddingRight:'10%'
  },
  number: {
	width:'10%',
    fontSize: 20,
    fontWeight: "600",
    color: "gray",
  },
  cityItem: {
    flex: 1,
    padding: 15,
    backgroundColor: "#2196F3",
    borderRadius: 10,
    justifyContent: "center",
  },
  cityText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  noResultText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    textAlign: "center",
  },
});
