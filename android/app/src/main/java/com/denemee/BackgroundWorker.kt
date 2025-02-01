package com.denemee

import android.content.Context
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.*
import android.util.Log
import org.json.JSONObject  // gson yerine Android'in kendi JSON parser'ını kullanalım
import java.io.File

class BackgroundWorker(
    private val context: Context, 
    workerParams: WorkerParameters
) : Worker(context, workerParams) {

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    override fun doWork(): Result {
        Log.d(TAG, "BackgroundWorker başladı")
        
        try {
            // UserCities.json dosyasını oku
            val file = File(context.filesDir, "UserCities.json")
            if (!file.exists()) {
                Log.e(TAG, "UserCities.json dosyası bulunamadı")
                return Result.failure()
            }

            val jsonContent = file.readText()
            val jsonObject = JSONObject(jsonContent)
            val citiesArray = jsonObject.getJSONArray("cities")
            
            // Konum kontrolü yap ve bildirim gönder
            sendLocationCheckNotification(citiesArray.length())
            
            return Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Hata oluştu: ${e.message}")
            return if (runAttemptCount < MAX_RETRY_COUNT) Result.retry() else Result.failure()
        }
    }

    private fun sendLocationCheckNotification(cityCount: Int) {
        // Bildirim kanalını oluştur
        createNotificationChannel()

        // Bildirim oluştur
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Şehir Kontrolü")
            .setContentText("Konumunuzdaki kişiler kontrol ediliyor...")
            .setSmallIcon(android.R.drawable.ic_dialog_info)  // varsayılan bir ikon kullanalım
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        // Bildirimi göster
        notificationManager.notify(NOTIFICATION_ID, notification)

        // Broadcast gönder
        val intent = Intent("com.denemee.LOCATION_CHECK")
        context.sendBroadcast(intent)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Background Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "15 dakikada bir konum kontrolü"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        private const val TAG = "BackgroundWorker"
        private const val MAX_RETRY_COUNT = 3
        private const val CHANNEL_ID = "background_notification_channel"
        private const val NOTIFICATION_ID = 1
    }
}