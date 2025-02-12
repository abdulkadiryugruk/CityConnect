
import React, {useState, useCallback, useEffect} from 'react';
import {Alert,Linking} from 'react-native';
import RNFS from 'react-native-fs';
import { requestContactPermission } from '../screens/permissions/ContactsPermission'; 
import citiesData from '../data/countries/Turkey/Cities.json'; // Şehir verisi
import FileOperations from './FileOperations';

export const handleScanContacts = async (setIsScanning, isScanning) => {
  if (isScanning) return;

  setIsScanning(true);
  try {
    const contacts = await requestContactPermission();
    if (!contacts) {
      Alert.alert('İzin Gerekli', 'Rehbere erişim izni olmadan bu işlemi gerçekleştiremeyiz.', [
        { text: 'Tamam', onPress: () => setIsScanning(false) },
      ]);
      return;
    }
    if (contacts.length === 0) {
      Alert.alert('Bilgi', 'Rehberinizde kayıtlı kişi bulunamadı.');
      return;
    }

    const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
    const fileExists = await RNFS.exists(filePath);
    let citiesData = { cities: [] };

    if (fileExists) {
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      citiesData = JSON.parse(fileContent);
    }

    const updatedCities = assignContactsToCities(contacts, citiesData);
    const saveSuccess = await FileOperations.saveUpdatedCitiesToFile(updatedCities, 'UserCities.json');

    if (saveSuccess) {
      Alert.alert('Başarılı ✅', 'Rehber tarandı ve kişiler eklendi.', [{ text: 'Tamam', style: 'default' }]);
    } else {
      Alert.alert('Hata', 'Veriler kaydedilirken bir sorun oluştu.');
    }
  } catch (error) {
    console.error('Rehber tarama sırasında hata oluştu:', error);
    Alert.alert('Hata', 'Bir sorun oluştu, lütfen tekrar deneyin.');
  } finally {
    setIsScanning(false);
  }
};

const assignContactsToCities = (contacts, citiesData) =>
  citiesData.cities.map(city => ({
    ...city,
    people: [
      ...city.people,
      ...contacts.filter(
        contact =>
          contact.fullName &&
          city.name &&
          contact.fullName.toLowerCase().includes(city.name.toLowerCase()) &&
          !city.people.some(existing => existing.fullName === contact.fullName)
      ),
    ],
  }));