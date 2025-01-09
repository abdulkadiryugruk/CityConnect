import BackgroundService from 'react-native-background-actions';
import PushNotification from 'react-native-push-notification';

// Background task options
const options = {
  taskName: 'Notification Service',
  taskTitle: 'Bildirim Servisi',
  taskDesc: 'Bildirimleri kontrol ediliyor',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: 'red',
  parameters: {
    delay: 15 * 1000
  },
  // Silent bildirimi tamamen gizlemek için
  foregroundServiceSettings: {
    notificationTitle: '', // Boş başlık
    notificationText: '',  // Boş metin
    notificationImportance: 0, // En düşük öncelik
    foregroundServiceNotificationId: 888,
    channelId: "silent-service-channel", // Silent servis için özel kanal
    visibility: 'secret', // Bildirimi gizle
  }
};

// Background'da çalışacak görev
const backgroundTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  
  await new Promise(async () => {
    while (BackgroundService.isRunning()) {
      PushNotification.localNotification({
        channelId: "background-notification-channel",
        id: 999,
        title: "Yeni Bildirim",
        message: "Background'dan gelen bildirim",
        autoCancel: true,
        priority: "high",
        importance: "high",
        vibrate: true,
        visibility: "public",
        ignoreInForeground: false,
      });

      await sleep(delay);
    }
  });
};

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

// Silent servis için özel kanal
PushNotification.createChannel(
  {
    channelId: "silent-service-channel",
    channelName: "Silent Service",
    channelDescription: "Silent channel for background service",
    playSound: false,
    importance: 0, // En düşük öncelik
    vibrate: false,
    visibility: "secret",
    showBadge: false,
  },
  (created) => console.log(`Silent service channel created: ${created}`)
);

// Normal bildirimler için kanal
PushNotification.createChannel(
  {
    channelId: "background-notification-channel",
    channelName: "Background Notifications",
    channelDescription: "Channel for background notifications",
    playSound: true,
    soundName: "default",
    importance: 4,
    vibrate: true,
    visibility: "public",
    showBadge: false,
  },
  (created) => console.log(`Notification channel created: ${created}`)
);

const startBackgroundService = async () => {
  try {
    await BackgroundService.start(backgroundTask, options);
  } catch (error) {
    console.log('Background service error:', error);
  }
};

const stopBackgroundService = async () => {
  await BackgroundService.stop();
};

export { startBackgroundService, stopBackgroundService };