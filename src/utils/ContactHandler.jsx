// src/utils/ContactHandler.js

import RNFS from 'react-native-fs';
import { requestContactPermission } from './permissions/ContactsPermission'; // Rehber izni isteme
import citiesData from '../data/countries/Turkey/Cities.json'; // Şehir verisi

export const saveContactsToCitiesFile = async () => {
  try {
    // Rehber verisini al
    const contacts = await requestContactPermission();
    
    if (contacts) {
      // Şehirler ile kişileri entegre et
      const updatedCities = citiesData.cities.map(city => {
        // Şehir ismini kişilerin isimlerinde arıyoruz
        const matchedContacts = contacts.filter(contact =>
          contact.fullName.toLowerCase().includes(city.name.toLowerCase())
        );
        
        return {
          ...city, // Mevcut şehir bilgilerini koruyoruz
          people: matchedContacts // Şehre ait kişileri ekliyoruz
        };
      });

      // JSON formatına çevir
      const jsonData = JSON.stringify({ cities: updatedCities }, null, 2);

      // Dosya yolunu belirle
      const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;

      // Dosyaya yaz
      await RNFS.writeFile(filePath, jsonData, 'utf8');
      console.log('Şehirler ve kişilerin bilgileri başarıyla kaydedildi:', filePath);

      // Dosyanın içeriğini okuma (test amaçlı)
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      console.log('Dosya içeriği:', fileContent);
    } else {
      console.log('Rehber verisi alınamadı.');
    }
  } catch (error) {
    console.error('Hata oluştu:', error);
  }
};
