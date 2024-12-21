import PushNotification from 'react-native-push-notification';

// export const sendLocationChangeNotification = (city) => {
//   PushNotification.localNotification({
//     channelId: 'location-change', // Kanal kimliği
//     title: 'Şehir Değişikliği', // Başlık
//     message: `Şu anda ${city}'dasınız.`, // Mesaj içeriği
//     playSound: true, // Ses çalma
//     soundName: 'default', // Varsayılan ses
//     vibrate: true, // Titreşim
//     importance: 'high', // Önem seviyesi
//   });
// };

PushNotification.localNotification({
  channelId: "location-change",
  title: "Test Bildirimi",
  message: "Bu bir test mesajıdır.",
});
