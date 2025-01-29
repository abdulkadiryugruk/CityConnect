import { createRef } from 'react';
import Geolocation from '@react-native-community/geolocation';

export const navigationRef = createRef();

const OPENCAGE_API_KEY = "bf4aca4de1f547e1a5102b7c8e932203";

class NavigationService {
  static navigate(name, params) {
    navigationRef.current?.navigate(name, params);
  }

  static async getCityFromLocation() {
    return new Promise((resolve, reject) => {
      const attemptFetchLocation = () => {
        Geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
              );
              const data = await response.json();
              const city =
                data.results[0]?.components.city ||
                data.results[0]?.components.town ||
                'Bilinmeyen Şehir';
              resolve(city);
            } catch (error) {
              console.error("OpenCage API hatası:", error);
              retryFetchLocation(error);
            }
          },
          (error) => {
            console.error("Konum alınırken hata oluştu:", error);
            if (error.code === 1) {
              console.error("Konum izni reddedildi.");
            } else if (error.code === 2) {
              console.log("Konum alınamadı. GPS kapalı olabilir.");
            } else if (error.code === 3) {
              console.error("Konum isteği zaman aşımına uğradı.");
            }
            retryFetchLocation(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      };

      const retryFetchLocation = (error) => {
        console.log("Konum alınamadı. 30 saniye sonra tekrar denenecek...");
        setTimeout(() => {
          attemptFetchLocation();
        }, 30 * 1000); // 30 saniye bekleme süresi
      };

      attemptFetchLocation();
    });
  }
}

export default NavigationService;
