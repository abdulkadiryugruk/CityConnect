// import { createRef } from 'react';
// import Geolocation from '@react-native-community/geolocation';

// export const navigationRef = createRef();

// class NavigationService {
//     static navigate(name, params) {
//         navigationRef.current?.navigate(name, params);
//     }

//     static async getCityFromLocation() {
//         return new Promise((resolve, reject) => {
//             const attemptFetchLocation = () => {
//                 Geolocation.getCurrentPosition(
//                     async (position) => {
//                         try {
//                             const { latitude, longitude } = position.coords;

//                             const response = await fetch(
//                                 `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`
//                             );
//                             const data = await response.json();

//                             const city =
//                                 data.features[0]?.properties.state ||
//                                 data.features[0]?.properties.city ||
//                                 'Bilinmeyen Şehir';

//                             resolve(city);
//                         } catch (error) {
//                             console.error("Photon API hatası:", error);
//                             retryFetchLocation(error);
//                         }
//                     },
//                     (error) => {
//                         console.error("Konum alınırken hata oluştu:", error);
//                         if (error.code === 1) {
//                             console.error("Konum izni reddedildi.");
//                         } else if (error.code === 2) {
//                             console.log("Konum alınamadı. GPS kapalı olabilir.");
//                         } else if (error.code === 3) {
//                             console.error("Konum isteği zaman aşımına uğradı.");
//                         }
//                         retryFetchLocation(error);
//                     },
//                     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//                 );
//             };

//             const retryFetchLocation = (error) => {
//                 console.log("Konum alınamadı. 30 saniye sonra tekrar denenecek...");
//                 setTimeout(() => {
//                     attemptFetchLocation();
//                 }, 60 * 1000);
//             };

//             attemptFetchLocation();
//         });
//     }
// }

// export default NavigationService;
