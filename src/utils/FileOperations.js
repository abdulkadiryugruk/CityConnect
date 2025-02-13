import RNFS from 'react-native-fs';
import citiesData from '../data/countries/Turkey/Cities.json';


const FileOperations = {
	saveUpdatedCitiesToFile: async (updatedCities, fileName) => {
	  const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
	  const jsonData = JSON.stringify({cities: updatedCities}, null, 2);
  
	  try {
		await RNFS.writeFile(filePath, jsonData, 'utf8');
		console.log(`${fileName} başarıyla kaydedildi.`);
		console.log()
		return true;
	  } catch (error) {
		console.error(`${fileName} dosyasına yazılamadı:`, error);
		return false;
	  }
	},
	initializeCitiesFile: async () => {
	  const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
	  try {
		const fileExists = await RNFS.exists(filePath);
  
		if (!fileExists) {
		  // Dosya yoksa, şehir verileriyle oluştur
		  const jsonData = JSON.stringify({cities: citiesData.cities}, null, 2);
		  await RNFS.writeFile(filePath, jsonData, 'utf8');
		  console.log('UserCities.json başarıyla oluşturuldu.');
		} else {
		  console.log('UserCities.json zaten mevcut, yeniden oluşturulmadı.');
		}
	  } catch (error) {
		console.error('JSON dosyası oluşturulurken hata oluştu:', error);
	  }
	},
  
	clearCache: async () => {
	  const filePath = `${RNFS.DocumentDirectoryPath}/UserCities.json`;
	  try {
		const fileExists = await RNFS.exists(filePath);
		if (fileExists) {
		  await RNFS.unlink(filePath);
		  return true;
		}
		return false;
	  } catch (error) {
		console.error('Önbellek temizlenirken hata oluştu:', error);
		throw error;
	  }
	},
	
  };

export default FileOperations;
